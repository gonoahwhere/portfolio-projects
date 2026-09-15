const WeeklyQuestProgress = require('../models/weeklyQuests');
const Profile = require('../models/userProfile');
const { getWeekNumber, getWeeklyQuests } = require('./questTracker');
const BigNumber = require('bignumber.js');
const emojis = require('../config/emojis');

const difficultyQuests = [
  'quests.solve25veryeasy','quests.solve25easy','quests.solve25medium',
  'quests.solve25hard','quests.solve25veryhard','quests.solve25expert'
];

const themeQuests = [
  'quests.solve5themestoastie','quests.solve25themestoastie','quests.solve50themestoastie','quests.solve100themestoastie',
  'quests.solve15themesfaces','quests.solve15themescolourblind','quests.solve15themesanimals','quests.solve15themestransport',
  'quests.solve30themesfaces','quests.solve30themescolourblind','quests.solve30themesanimals','quests.solve30themestransport',
  'quests.solve45themesfaces','quests.solve45themescolourblind','quests.solve45themesanimals','quests.solve45themestransport'
];

const allCustomThemes = ['faces','toastie','colourblind','animals','transport'];

/**
 * Updates weekly quests and grants rewards.
 * @param {string} userId 
 * @param {object} gameState 
 * @param {object} options 
 * @param {TextChannel|DMChannel|null} channel 
 */
async function updateWeeklyQuestsFromGame(userId, gameState, options = {}, channel = null) {
  const weekNumber = getWeekNumber();
  const weeklyQuests = getWeeklyQuests();

  let userData = await WeeklyQuestProgress.findOne({ userId });
  if (!userData || userData.week !== weekNumber) {
    const questMap = {};
    weeklyQuests.forEach(q => questMap[q.itemId] = 0);
    if (weeklyQuests.some(q => q.itemId === 'quests.custom5')) questMap['custom5Themes'] = [];
    userData = new WeeklyQuestProgress({ userId, week: weekNumber, quests: questMap });
    await userData.save();
  }

  const completedQuests = [];
  let updated = false;
  let rewardsToGrant = { toasts: 0, hints: 0, xp: new BigNumber(0) };

  for (const quest of weeklyQuests) {
    const id = quest.itemId;
    const total = quest.total ?? 1;
    const current = userData.quests[id] || 0;
    let increment = 0;

    // --- Quest type checks ---
    if (['quests.solve50','quests.solve100'].includes(id) && options.solved) increment = 1;
    if (difficultyQuests.includes(id) && options.solved && gameState.difficulty) {
      const diffKey = id.replace('quests.solve25', '').toLowerCase();
      const diffNorm = gameState.difficulty.toLowerCase().replace(/[\s-]/g, '');
      if (diffNorm === diffKey) increment = 1;
    }
    if (themeQuests.includes(id) && options.solved && gameState.theme) {
      const themeKey = id.match(/themes(.+)/i)[1].toLowerCase();
      if (gameState.theme.toLowerCase().includes(themeKey)) increment = 1;
    }
    if (['quests.daily1','quests.daily3','quests.dailyallweek'].includes(id) && options.daily) increment = Number(options.daily);
    if (['quests.earn1000toast','quests.earn5000toast'].includes(id) && options.toastEarned) increment = Number(options.toastEarned);
    if (['quests.earn500exp'].includes(id) && options.expEarned) increment = Number(options.expEarned);
    if (['quests.collect10hints','quests.collect25hints'].includes(id) && options.hintsCollected) increment = Number(options.hintsCollected);
    if (['quests.solve15hints'].includes(id) && options.solved && options.hintsUsed >= 1) increment = Number(options.hintsUsed);
    if (['quests.endearly5'].includes(id) && options.endedEarly) increment = 1;

    if (id === 'quests.custom5' && options.solved && gameState.theme) {
      const theme = gameState.theme.toLowerCase();
      if (allCustomThemes.includes(theme)) {
        userData.quests['custom5Themes'] = userData.quests['custom5Themes'] || [];
        if (!userData.quests['custom5Themes'].includes(theme)) {
          userData.quests['custom5Themes'].push(theme);
          increment = userData.quests['custom5Themes'].length - current;
        }
      }
    }

    if (increment > 0 && !userData.quests[`${id}_claimed`]) {
      userData.quests[id] = Math.min(current + increment, total);
      updated = true;

      if (userData.quests[id] >= total) {
        const rewards = quest.reward || '';
        const questRewards = { toasts: 0, hints: 0, xp: new BigNumber(0) };

        const rewardRegex = /(\d+)x\s*<:(toast|hints|expadd):\d+>/gi;
        let match;
        while ((match = rewardRegex.exec(rewards)) !== null) {
          const amount = Number(match[1]);
          const type = match[2].toLowerCase();

          if (type === 'toast') questRewards.toasts += amount;
          else if (type === 'hints') questRewards.hints += amount;
          else if (type === 'expadd') questRewards.xp = questRewards.xp.plus(amount);
        }

        rewardsToGrant.toasts += questRewards.toasts;
        rewardsToGrant.hints += questRewards.hints;
        rewardsToGrant.xp = rewardsToGrant.xp.plus(questRewards.xp);

        userData.quests[`${id}_claimed`] = true;
        completedQuests.push({ name: quest.name, rewards: questRewards });
      }
    }

  }

  if (updated) {
    userData.markModified('quests');
    await userData.save();

    // Grant rewards
    if (rewardsToGrant.toasts || rewardsToGrant.hints || rewardsToGrant.xp.gt(0)) {
      const profile = await Profile.findOne({ userId }) || new Profile({ userId });
      profile.balance = profile.balance || {};
      profile.misc = profile.misc || {};
      profile.balance.currentToasts = new BigNumber(profile.balance.currentToasts || 0)
        .plus(rewardsToGrant.toasts).toString();
      profile.misc.hints = new BigNumber(profile.misc.hints || 0)
        .plus(rewardsToGrant.hints).toString();
      profile.misc.xp = new BigNumber(profile.misc.xp || 0)
        .plus(rewardsToGrant.xp).toString();

      profile.questsCompleted = (profile.questsCompleted || 0) + completedQuests.length;
      await profile.save();

      // Send reward message
      if (channel && completedQuests.length > 0) {
        const lines = completedQuests.map(q =>
          `✅ **${q.name}** completed!\n` +
          `${q.rewards.toasts ? `${emojis.toast} Toasts: ${q.rewards.toasts}   ` : ''}` +
          `${q.rewards.hints ? `${emojis.hints} Hints: ${q.rewards.hints}   ` : ''}` +
          `${q.rewards.xp.gt(0) ? `${emojis.expadd} XP: ${q.rewards.xp.toString()}` : ''}`
        );

        await channel.send({
          content: `🎉 <@${userId}> completed the following quest(s):\n\n${lines.join('\n\n')}`
        });
      }
    }
  }
}

module.exports = { updateWeeklyQuestsFromGame };