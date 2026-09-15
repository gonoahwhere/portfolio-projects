const fl = require("fluident");
const DailyCompletion = require('./models/dailyCompletion.js')
const DailyPuzzle = require('./models/dailyPuzzle.js')

async function cleanOldCompletions() {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    await DailyCompletion.deleteMany({ date: { $lt: todayStr } });
    await DailyPuzzle.deleteMany({ date: { $lt: todayStr } });

    console.log(fl.gray('[CLEAN UP]: Old Daily Completions Deleted.'));
    console.log(fl.gray('[CLEAN UP]: Old Daily Puzzles Deleted.'));
  } catch (err) {
    console.error(fl.red('[CLEAN UP ERROR]: Failed to clean up old completions/puzzles.'), err);
  }
}

module.exports = { cleanOldCompletions };