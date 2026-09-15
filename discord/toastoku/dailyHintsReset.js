const fl = require("fluident");
const UserProfile = require('./models/userProfile.js');

async function resetDailyHints() {
  try {
    await UserProfile.updateMany({}, { $set: { "misc.dailyHints": "5" } });
    console.log(fl.gray('[DAILY HJINT]: Daily hints reset to 5 for all users.'));
  } catch (err) {
    console.error(fl.red('[DAILY HINT ERROR]: Failed to reset daily hints:'), err);
  }
}

module.exports = { resetDailyHints };
