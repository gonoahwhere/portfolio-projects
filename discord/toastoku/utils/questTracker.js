const crypto = require('crypto');
const questItems = require('../bot/jsons/quests.json');

function getWeekNumber() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = Math.floor((now - startOfYear) / 86400000);
  return Math.ceil((pastDays - startOfYear.getDay() + 1) / 7);
}

function getWeeklyQuests() {
  const week = getWeekNumber();
  const seed = crypto.createHash("md5").update(String(week)).digest("hex");
  let rngIndex = 0;

  function seededRandom() {
    const x = Math.sin(parseInt(seed.slice(rngIndex, rngIndex + 8), 16)) * 10000;
    rngIndex = (rngIndex + 8) % seed.length;
    return x - Math.floor(x);
  }

  const shuffled = [...questItems].sort(() => 0.5 - seededRandom());
  return shuffled.slice(0, 3); // only 3 quests per week
}

function getProgressBar(current, total, length = 10) {
  const filledLength = Math.round((current / total) * length);
  const emptyLength = length - filledLength;
  return '■'.repeat(filledLength) + '□'.repeat(emptyLength) + ` ${current}/${total}`;
}

module.exports = { getWeekNumber, getWeeklyQuests, getProgressBar };