const { MessageFlags } = require('discord-api-types/v10');
const { games } = require('../../../utils/games.js');
const mongoose = require('mongoose');
const SudokuGame = require('../../../models/sudokuGame');
const logFinishedGame = require('../../../utils/gameHistory.js');
const Profile = require('../../../models/userProfile');
const BigNumber = require('bignumber.js');
const { updateWeeklyQuestsFromGame } = require("../../../utils/updateQuests");
const sudokuCommand = require('../../commands/global/sudoku.js');

module.exports = async function handleEndOldGame(interaction) {
    if (!interaction.customId.startsWith('end_old_game_')) return;

    const withoutPrefix = interaction.customId.replace('end_old_game_', '');
    const [mongoId, newDifficulty, newTheme, newMode] = withoutPrefix.split('__');
    const shouldRestart = !!(newDifficulty && newTheme && newMode);
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

    const options = {
        solved: false,
        daily: gameState.mode === 'daily' ? 1 : 0,
        toastEarned: 0,
        expEarned: 0,
        hintsCollected: 0,
        hintsUsed: 0,
        customThemesCompleted: 0,
        endedEarly: true,
    };

    if (gameState.mode === 'daily') {
        await updateWeeklyQuestsFromGame(interaction.user.id, gameState, options, interaction.user);
    } else {
        await updateWeeklyQuestsFromGame(interaction.user.id, gameState, options, interaction.channel);
    }

    games.delete(gameId);
    await SudokuGame.deleteOne({ gameId });
    await Profile.findOneAndUpdate(
        { userId: hostId },
        { $inc: { 'games.abandoned': 1 } },
        { upsert: true }
    );

    if (!shouldRestart) {
        return interaction.reply({ content: 'Your old game has ended. You can now start a new one!', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await interaction.editReply({ content: 'Your old game has ended! Starting your new game...' });

    let newGameMessage = null;
    
    const fakeInteraction = {
        _autoStart: true,
        user: interaction.user,
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        channel: interaction.channel,
        fetchReply: () => newGameMessage,
        followUp: async (...args) => {
            newGameMessage = await interaction.followUp(...args);
            return newGameMessage;
        },
        reply: async (...args) => {
            newGameMessage = await interaction.followUp(...args);
            return newGameMessage;
        },
        editReply: (...args) => interaction.editReply(...args),
        deferReply: (...args) => interaction.deferReply(...args),
        options: {
            getSubcommand: () => 'play',
            getString: (key) => {
                if (key === 'difficulty') return newDifficulty;
                if (key === 'theme') return newTheme;
                if (key === 'mode') return newMode;
                return null;
            },
        },
    };

    await sudokuCommand.execute(fakeInteraction);
}