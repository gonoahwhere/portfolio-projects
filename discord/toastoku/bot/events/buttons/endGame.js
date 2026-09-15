const { ContainerBuilder, MediaGalleryItemBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { titleCase, drawSudokuGrid } = require('../../commands/global/sudoku');
const { MessageFlags } = require('discord-api-types/v10');
const { games } = require('../../../utils/games.js');
const mongoose = require('mongoose');
const SudokuGame = require('../../../models/sudokuGame');
const Profile = require('../../../models/userProfile');
const { terminateGame } = require('../../../utils/terminateGame.js');

module.exports = async function handleEndGame(interaction) {
    if (interaction.customId !== 'end_game') return;

    const today = new Date().toISOString().split('T')[0];
    const hostId = interaction.user.id;

    let gameId;
    if (interaction.channel?.type === 'DM') {
        gameId = `sudoku-user-${hostId}`;
    } else {
        const possibleDailyId = `sudoku-daily-${today}-${hostId}`;
        const savedDailyGame = await SudokuGame.findOne({ gameId: possibleDailyId });
        if (savedDailyGame) {
            gameId = possibleDailyId;
        } else {
            const byMessage = await SudokuGame.findOne({ messageId: interaction.message.id });
            if (byMessage) {
                gameId = byMessage.gameId;
            } else {
                gameId = `sudoku-${interaction.channelId}-${hostId}`;
            }
        }
    }

    let gameState = games.get(gameId);

    if (!gameState) {
        const savedGame = await SudokuGame.findOne({ gameId });
        if (!savedGame) {
            return interaction.reply({ content: 'No active Sudoku game found!', flags: MessageFlags.Ephemeral });
        }

        const isParticipant = savedGame.hostId === hostId || savedGame.joinedPlayers.includes(hostId);
        if (!isParticipant) {
            return interaction.reply({ 
                content: 'You are not part of this game!', 
                flags: MessageFlags.Ephemeral 
            });
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

    if (gameState.messageId && interaction.message.id !== gameState.messageId) {
        return interaction.reply({ content: "This interaction does not belong to your game!", flags: MessageFlags.Ephemeral });
    }

    // 👇 CHECK FIRST before any termination logic
    const filledCells = gameState.puzzle.filter(n => n !== null).length;
    const percent = Math.floor((filledCells / 81) * 100);

    if (percent >= 70) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`confirm_end_game_${gameId}`)
                .setLabel("Yes, End Game")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`cancel_end_game_${gameId}`)
                .setLabel("Keep Playing")
                .setStyle(ButtonStyle.Secondary)
        );

        return interaction.reply({ 
            content: `⚠️ Your game is **${percent}%** complete... Are you sure you want to end it?`, 
            components: [row], 
            flags: MessageFlags.Ephemeral 
        });
    }

    // Only runs if < 70%
    await terminateGame(gameState, hostId, interaction);
    games.delete(gameId);
    await SudokuGame.deleteOne({ gameId });
    await Profile.findOneAndUpdate(
        { userId: hostId },
        { $inc: { 'games.abandoned': 1 } },
        { upsert: true }
    );

    const buffer = await drawSudokuGrid(gameState.puzzle, gameState.prefilledSet, gameState.theme, null, null, null, gameState.conflictSet, gameState.notes.map(s => Array.from(s)), hostId);
    const attachment = new AttachmentBuilder(buffer, { name: 'sudoku.png' });

    const container = new ContainerBuilder()
        .addTextDisplayComponents(td => td.setContent(`### ${gameId.startsWith('sudoku-daily-') ? 'Daily' : titleCase(gameState.theme)} Sudoku ∘ ${titleCase(gameState.difficulty)} [${percent}%]\n\nThe game has been terminated by the final player.`))
        .addMediaGalleryComponents(g => g.addItems(new MediaGalleryItemBuilder().setURL(`attachment://${attachment.name}`)));

    return interaction.update({ components: [container], files: [attachment] });
}