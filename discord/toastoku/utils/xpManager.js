const BigNumber = require('bignumber.js');
const Profile = require('../models/userProfile');

function xpForLevel(level) {
  return new BigNumber(50).multipliedBy(level).multipliedBy(level).plus(new BigNumber(50).multipliedBy(level));
}

function totalXpForLevel(level) {
    const n = new BigNumber(level);
    const sumSquares = n.multipliedBy(n.plus(1)).multipliedBy(n.multipliedBy(2).plus(1)).div(6);
    const sumLinear = n.multipliedBy(n.plus(1)).div(2);
    return sumSquares.multipliedBy(50).plus(sumLinear.multipliedBy(50));
}

async function addXP(userId, xpGained) {
  const profile = await Profile.findOne({ userId }) || new Profile({ userId });

  let exp = new BigNumber(profile.rank?.exp || 0);
  exp = exp.plus(xpGained);

  let oldLevel = parseInt(profile.rank?.level || 0, 10);
  let newLevel = oldLevel;

  while (exp.gte(totalXpForLevel(newLevel + 1))) {
    newLevel += 1;
  }

  profile.rank = {
    exp: exp.toString(),
    level: newLevel
  };

  await profile.save();

  return {
    leveledUp: newLevel > oldLevel,
    newLevel,
    totalXP: exp.toString()
  };
}

module.exports = { addXP, xpForLevel, totalXpForLevel };
