const { ContainerBuilder, MediaGalleryItemBuilder, AttachmentBuilder } = require("discord.js");
const { MessageFlags } = require('discord-api-types/v10');
const { games } = require('../../../utils/games.js');
const SudokuGame = require('../../../models/sudokuGame');
const { terminateGame } = require('../../../utils/terminateGame.js');
const { titleCase, drawSudokuGrid } = require('../../commands/global/sudoku');
const emojis = require('../../../config/emojis');

module.exports = async function handleConfirmEndGame(interaction) {
    const isConfirm = interaction.customId.startsWith('confirm_end_game_');
    const isCancel = interaction.customId.startsWith('cancel_end_game_');
    if (!isConfirm && !isCancel) return;

    if (isCancel) {
        return interaction.update({ content: `${emojis.approve} Go finish your game!`, components: [], flags: MessageFlags.Ephemeral });
    }

    const gameId = interaction.customId.replace('confirm_end_game_', '');
    const hostId = interaction.user.id;

    let gameState = games.get(gameId);
    if (!gameState) {
        const savedGame = await SudokuGame.findOne({ gameId });
        if (!savedGame) {
            return interaction.update({ content: 'No active Sudoku game found!', components: [], flags: MessageFlags.Ephemeral });
        }
        gameState = {
            ...savedGame.toObject(),
            prefilledSet: new Set(savedGame.prefilledSet),
            conflictSet: new Set(savedGame.conflictSet),
            pencilMode: savedGame.pencilMode || false,
            notes: savedGame.notes ? savedGame.notes.map(arr => new Set(arr)) : Array.from({ length: 81 }, () => new Set()),
        };
    }

    let channelId = gameState.channelId;

    // 👇 fallback: extract from gameId if not stored directly
    if (!channelId && gameId.startsWith('sudoku-') && !gameId.startsWith('sudoku-daily-') && !gameId.startsWith('sudoku-user-')) {
        channelId = gameId.split('-')[1];
    }

    const messageId = gameState.messageId;
    await terminateGame(gameState, hostId, interaction);

    const filledCells = gameState.puzzle.filter(n => n !== null).length;
    const percent = Math.floor((filledCells / 81) * 100);
    const buffer = await drawSudokuGrid(gameState.puzzle, gameState.prefilledSet, gameState.theme, null, null, null, gameState.conflictSet, gameState.notes.map(s => Array.from(s)), hostId);
    const attachment = new AttachmentBuilder(buffer, { name: 'sudoku.png' });

    const container = new ContainerBuilder()
        .addTextDisplayComponents(td => td.setContent(`### ${gameId.startsWith('sudoku-daily-') ? 'Daily' : titleCase(gameState.theme)} Sudoku ∘ ${titleCase(gameState.difficulty)} [${percent}%]\n\nThe game has been terminated by the final player.`))
        .addMediaGalleryComponents(g => g.addItems(new MediaGalleryItemBuilder().setURL(`attachment://${attachment.name}`)));

    // 👇 fetch the original game message and edit it directly
    const gameChannel = await interaction.client.channels.fetch(channelId).catch(() => null);
    const gameMessage = await gameChannel?.messages.fetch(messageId).catch(() => null);

    if (gameMessage) {
        await gameMessage.edit({ components: [container], files: [attachment], flags: MessageFlags.IsComponentsV2 });
    } else {
        console.log('gameMessage not found - channelId:', channelId, 'messageId:', messageId);
    }

    // 👇 dismiss the ephemeral confirmation
    return interaction.update({ content: `${emojis.deny} Game ended.`, components: [] });
}