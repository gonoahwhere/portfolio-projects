const fl = require("fluident");
const WeeklyQuestProgress = require('./models/weeklyQuests.js');

function getWeekNumber() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = Math.floor((now - startOfYear) / 86400000);
  return Math.ceil((pastDays - startOfYear.getDay() + 1) / 7);
}

async function cleanOldWeeklyQuests() {
  try {
    const currentWeek = getWeekNumber();
    const totalDocs = await WeeklyQuestProgress.countDocuments();
    const staleCount = await WeeklyQuestProgress.countDocuments({ week: { $lt: currentWeek } });

    console.log(`[CLEAN UP] Current week: ${currentWeek}`);
    console.log(`[CLEAN UP] Total quest docs: ${totalDocs}`);
    console.log(`[CLEAN UP] Stale docs to delete: ${staleCount}`);

    const result = await WeeklyQuestProgress.deleteMany({ week: { $lt: currentWeek } });
    console.log(fl.gray(`[CLEAN UP]: Deleted ${result.deletedCount} old weekly quest entries.`));
  } catch (err) {
    console.error(fl.red('[CLEAN UP ERROR]: Failed to clean up old weekly quests.'), err);
  }
}

module.exports = { cleanOldWeeklyQuests };