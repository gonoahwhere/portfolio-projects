const UserGameHistory = require('../models/userGameHistory.js');
const fl = require("fluident");

async function logFinishedGame(gameState, completed) {
  const lastGame = await UserGameHistory.findOne({ userId: gameState.hostId })
    .sort({ gameIndex: -1 });

  const newIndex = (lastGame?.gameIndex ?? 0) + 1;
  
  const history = new UserGameHistory({
    userId: gameState.hostId,
    gameId: gameState.gameId,
    type: gameState.mode,
    difficulty: gameState.difficulty,
    completed,
    puzzle: gameState.puzzle,
    solved: gameState.originalPuzzle,
    prefilledSet: Array.from(gameState.prefilledSet),
    theme: gameState.theme,
    notes: gameState.notes.map(s => Array.from(s)),
    gameIndex: newIndex,
  });

  await history.save();

  const excessGames = await UserGameHistory.find({ userId: gameState.hostId })
    .sort({ date: -1 })
    .skip(10);

  if (excessGames.length) {
    const idsToDelete = excessGames.map(g => g._id);
    await UserGameHistory.deleteMany({ _id: { $in: idsToDelete } });
    console.log(fl.gray('[CLEAN UP]: Old Log History Deleted.'));
  }
}

module.exports = logFinishedGame;
