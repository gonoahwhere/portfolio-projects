const Giveaway = require('../../../models/giveaway');
const { ContainerBuilder } = require('discord.js');
const { stripIndents } = require('common-tags');

function formatDateTime(date) {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user, bot) {
    if (user.bot) return;

    if (reaction.emoji.name !== '🎉') return;

    // Fetch the giveaway from Mongo
    const giveaway = await Giveaway.findOne({ messageId: reaction.message.id, ended: false });
    if (!giveaway) return;

    // Add user if not already entered
    if (!giveaway.entries.includes(user.id)) {
      giveaway.entries.push(user.id);
      await giveaway.save();
    }

    // Always rebuild the embed from the DB to ensure accurate entry count
    const container = new ContainerBuilder()
      .addTextDisplayComponents(td => td.setContent(`### ${giveaway.title}`))
      .addSeparatorComponents(s => s)
      .addTextDisplayComponents(td => td.setContent(stripIndents`
        ${giveaway.description}\n
        Ends In: <t:${Math.floor(giveaway.endTime.getTime() / 1000)}:F> (<t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>)
        Hosted By: <@${giveaway.hostedBy}>
        Entries: **${giveaway.entries.length}**
        Winners: **${giveaway.winnersCount}**
        
        -# ${formatDateTime(giveaway.endTime)}`));

    await reaction.message.edit({ components: [container] });
  },
};
