const { ContainerBuilder, MediaGalleryItemBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ActionRowBuilder } = require("discord.js");
const { titleCase, createGridButtons, getTurnEmbedFields, drawSudokuGrid } = require('../../commands/global/sudoku');
const { MessageFlags } = require('discord-api-types/v10');
const { games } = require('../../../utils/games.js');
const mongoose = require('mongoose');
const SudokuGame = require('../../../models/sudokuGame');
const logFinishedGame = require('../../../utils/gameHistory.js');
const Profile = require('../../../models/userProfile');
const BigNumber = require('bignumber.js');

module.exports = async function handleLeaveOldGame(interaction) {
    if (!interaction.customId.startsWith('leave_old_game_')) return;

    const mongoId = interaction.customId.replace('leave_old_game_', '');
    const hostId = interaction.user.id;

    const savedGame = await SudokuGame.findById(mongoId);
    if (!savedGame) {
        return interaction.reply({ content: 'No active Sudoku game found!', flags: MessageFlags.Ephemeral });
    }

    if (savedGame.hostId !== hostId && !savedGame.joinedPlayers.includes(hostId)) {
        return interaction.reply({ content: 'You are not part of this game!', flags: MessageFlags.Ephemeral });
    }

    const gameId = savedGame.gameId;
    let gameState = games.get(gameId) || {
        ...savedGame.toObject(),
        prefilledSet: new Set(savedGame.prefilledSet),
        conflictSet: new Set(savedGame.conflictSet),
        pencilMode: savedGame.pencilMode || false,
        notes: savedGame.notes ? savedGame.notes.map(arr => new Set(arr)) : Array.from({ length: 81 }, () => new Set()),
    };
    games.set(gameId, gameState);

    if (gameState.messageId && interaction.message.id !== gameState.messageId) {
        return interaction.reply({ content: "This interaction does not belong to your game!", flags: MessageFlags.Ephemeral });
    }

    const leavingIndex = gameState.joinedPlayers.indexOf(interaction.user.id);
    if (leavingIndex === -1) {
        return interaction.reply({ content: 'You are not part of this game!', flags: MessageFlags.Ephemeral });
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
        return interaction.reply({ content: 'All players have left. The game has ended.', flags: MessageFlags.Ephemeral });
    }

    games.set(gameId, gameState);
    await SudokuGame.updateOne({ gameId }, { joinedPlayers: gameState.joinedPlayers, currentTurnIndex: gameState.currentTurnIndex, lastUpdated: Date.now() });

    const filledCells = gameState.puzzle.filter(n => n !== null).length;
    const percent = Math.floor((filledCells / 81) * 100);
    const fields = getTurnEmbedFields(gameState);
    const buffer = await drawSudokuGrid(gameState.puzzle, gameState.prefilledSet, gameState.theme, null, null, null, gameState.conflictSet, gameState.notes.map(s => Array.from(s)), interaction.user.id);
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

    return interaction.update({ components: [container], files: [attachment] });
}