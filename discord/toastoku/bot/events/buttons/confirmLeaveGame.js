const { ContainerBuilder, MediaGalleryItemBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ActionRowBuilder } = require("discord.js");
const { titleCase, createGridButtons, getTurnEmbedFields, drawSudokuGrid } = require('../../commands/global/sudoku');
const { MessageFlags } = require('discord-api-types/v10');
const { games } = require('../../../utils/games.js');
const mongoose = require('mongoose');
const SudokuGame = require('../../../models/sudokuGame');
const logFinishedGame = require('../../../utils/gameHistory.js');
const Profile = require('../../../models/userProfile');
const BigNumber = require('bignumber.js');
const emojis = require('../../../config/emojis');

module.exports = async function handleConfirmLeaveGame(interaction) {
    const isConfirm = interaction.customId.startsWith('confirm_leave_game_');
    const isCancel = interaction.customId.startsWith('cancel_leave_game_');
    if (!isConfirm && !isCancel) return;

    if (isCancel) {
        return interaction.update({ content: `${emojis.approve} Glad you\'re staying! Keep playing.`, components: [] });
    }

    const gameId = interaction.customId.replace('confirm_leave_game_', '');
    const hostId = interaction.user.id;

    let gameState = games.get(gameId);
    if (!gameState) {
        const savedGame = await SudokuGame.findOne({ gameId });
        if (!savedGame) {
            return interaction.update({ content: 'No active Sudoku game found!', components: [] });
        }
        gameState = {
            ...savedGame.toObject(),
            prefilledSet: new Set(savedGame.prefilledSet),
            conflictSet: new Set(savedGame.conflictSet),
            pencilMode: savedGame.pencilMode || false,
            notes: savedGame.notes ? savedGame.notes.map(arr => new Set(arr)) : Array.from({ length: 81 }, () => new Set()),
        };
        games.set(gameId, gameState);
    }

    let channelId = gameState.channelId;
    if (!channelId && gameId.startsWith('sudoku-') && !gameId.startsWith('sudoku-daily-') && !gameId.startsWith('sudoku-user-')) {
        channelId = gameId.split('-')[1];
    }

    const messageId = gameState.messageId;

    const leavingIndex = gameState.joinedPlayers.indexOf(interaction.user.id);
    if (leavingIndex === -1) {
        return interaction.update({ content: 'You are not part of this game!', components: [] });
    }

    gameState.joinedPlayers.splice(leavingIndex, 1);

    if (gameState.currentTurnIndex >= gameState.joinedPlayers.length) {
        gameState.currentTurnIndex = 0;
    }

    if (gameState.joinedPlayers.length === 0) {
        await logFinishedGame(gameState, false);
        let profileData = await Profile.findOne({ userId: interaction.user.id });
        if (!profileData) {
            profileData = new Profile({ _id: new mongoose.Types.ObjectId(), userId: interaction.user.id });
            await profileData.save();
        }

        let gamesPlayed = new BigNumber(profileData.misc.gamesPlayed || "0");
        gamesPlayed = gamesPlayed.plus(1);
        profileData.misc.gamesPlayed = gamesPlayed.toString();
        await profileData.save();
        games.delete(gameId);
        await SudokuGame.deleteOne({ gameId });

        const gameChannel = await interaction.client.channels.fetch(channelId).catch(() => null);
        const gameMessage = await gameChannel?.messages.fetch(messageId).catch(() => null);
        if (gameMessage) {
            const filledCells = gameState.puzzle.filter(n => n !== null).length;
            const percent = Math.floor((filledCells / 81) * 100);
            const buffer = await drawSudokuGrid(gameState.puzzle, gameState.prefilledSet, gameState.theme, null, null, null, gameState.conflictSet, gameState.notes.map(s => Array.from(s)), hostId);
            const attachment = new AttachmentBuilder(buffer, { name: 'sudoku.png' });
            const container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### ${titleCase(gameState.theme)} Sudoku ∘ ${titleCase(gameState.difficulty)} [${percent}%]\n\nAll players have left. The game has ended.`))
                .addMediaGalleryComponents(g => g.addItems(new MediaGalleryItemBuilder().setURL(`attachment://${attachment.name}`)));
            await gameMessage.edit({ components: [container], files: [attachment], flags: MessageFlags.IsComponentsV2 });
        }

        return interaction.update({ content: 'You have left. The game has ended.', components: [] });
    }

    games.set(gameId, gameState);
    await SudokuGame.updateOne({ gameId }, { joinedPlayers: gameState.joinedPlayers, currentTurnIndex: gameState.currentTurnIndex, lastUpdated: Date.now() });
    games.delete(gameId);

    const filledCells = gameState.puzzle.filter(n => n !== null).length;
    const percent = Math.floor((filledCells / 81) * 100);
    const fields = getTurnEmbedFields(gameState);
    const buffer = await drawSudokuGrid(gameState.puzzle, gameState.prefilledSet, gameState.theme, null, null, null, gameState.conflictSet, gameState.notes.map(s => Array.from(s)), hostId);
    const attachment = new AttachmentBuilder(buffer, { name: 'sudoku.png' });

    let buttonRows;
    if (gameState.joinedPlayers.length > 1) {
        buttonRows = createGridButtons(gameState, gameState.joinedPlayers[gameState.currentTurnIndex]);
    } else {
        buttonRows = [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('end_game')
                    .setLabel('End Game')
                    .setStyle(ButtonStyle.Danger)
            )
        ];
    }

    const container = new ContainerBuilder()
        .addTextDisplayComponents(td => td.setContent(`### ${titleCase(gameState.theme)} Sudoku ∘ ${titleCase(gameState.difficulty)} [${percent}%]`))
        .addMediaGalleryComponents(g => g.addItems(new MediaGalleryItemBuilder().setURL(`attachment://${attachment.name}`)))
        .addSeparatorComponents(s => s)
        .addTextDisplayComponents(td => td.setContent(fields.map(f => `${f.name}: ${f.value}`).join('\n')))
        .addActionRowComponents(...buttonRows.filter(Boolean));

    const gameChannel = await interaction.client.channels.fetch(channelId).catch(() => null);
    const gameMessage = await gameChannel?.messages.fetch(messageId).catch(() => null);
    if (gameMessage) {
        await gameMessage.edit({ components: [container], files: [attachment], flags: MessageFlags.IsComponentsV2 });
    }

    return interaction.update({ content: `${emojis.approve} You have left the game.`, components: [] });
}