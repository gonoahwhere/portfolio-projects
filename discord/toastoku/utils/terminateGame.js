const mongoose = require('mongoose');
const SudokuGame = require('../models/sudokuGame');
const logFinishedGame = require('./gameHistory.js');
const Profile = require('../models/userProfile');
const BigNumber = require('bignumber.js');
const { updateWeeklyQuestsFromGame } = require("./updateQuests");
const { games } = require('./games.js');

async function terminateGame(gameState, userId, interaction) {
    await logFinishedGame(gameState, false);

    let profileData = await Profile.findOne({ userId });
    if (!profileData) {
        profileData = new Profile({ _id: new mongoose.Types.ObjectId(), userId });
        await profileData.save();
    }

    let gamesPlayed = new BigNumber(profileData.misc.gamesPlayed || "0");
    profileData.misc.gamesPlayed = gamesPlayed.plus(1).toString();
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
        await updateWeeklyQuestsFromGame(userId, gameState, options, interaction.user);
    } else {
        await updateWeeklyQuestsFromGame(userId, gameState, options, interaction.channel);
    }

    games.delete(gameState.gameId);
    await SudokuGame.deleteOne({ gameId: gameState.gameId });
}

module.exports = { terminateGame };