const { addXP } = require('./xpManager');
const Profile = require('../models/userProfile');
const BigNumber = require('bignumber.js');

async function grantGameRewards(userId, guildId) {
  const normalMinXp = 5;
  const normalMaxXp = 15;
  const supportMinXp = 15;
  const supportMaxXp = 30;
  const dailyMinXp = 10;
  const dailyMaxXp = 20;

  const normalMinToasts = 1;
  const normalMaxToasts = 5;
  const supportMinToasts = 5;
  const supportMaxToasts = 10;
  const dailyMinToasts = 3;
  const dailyMaxToasts = 6;

  const isSupportServer = guildId === '1368328067369533511';
  const isDailyDM = !guildId;

  let minXp, maxXp;
  if (isSupportServer) {
    minXp = supportMinXp;
    maxXp = supportMaxXp;
  } else if (isDailyDM) {
    minXp = dailyMinXp;
    maxXp = dailyMaxXp;
  } else {
    minXp = normalMinXp;
    maxXp = normalMaxXp;
  }

  const xpGained = new BigNumber(
    Math.floor(Math.random() * (maxXp - minXp + 1)) + minXp
  );

  let minToasts, maxToasts;
  if (isSupportServer) {
    minToasts = supportMinToasts;
    maxToasts = supportMaxToasts;
  } else if (isDailyDM) {
    minToasts = dailyMinToasts;
    maxToasts = dailyMaxToasts;
  } else {
    minToasts = normalMinToasts;
    maxToasts = normalMaxToasts;
  }

  const toastsGained = Math.floor(Math.random() * (maxToasts - minToasts + 1)) + minToasts;
  
  const hintsGained = isDailyDM ? 1 : 0;

  const xpResult = await addXP(userId, xpGained);
  const profile = await Profile.findOne({ userId }) || new Profile({ userId });
  profile.balance = profile.balance || {};
  profile.misc = profile.misc || {};
  profile.balance.currentToasts = new BigNumber(profile.balance.currentToasts || 0).plus(toastsGained).toString();

  if (hintsGained > 0) {
    profile.misc.hints = new BigNumber(profile.misc.hints || 0).plus(hintsGained).toString();
  }

  await profile.save();

  return {
    ...xpResult,
    xpGained,
    toastsGained,
    hintsGained
  };
}

module.exports = { grantGameRewards };
