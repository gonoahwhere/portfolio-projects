const { SlashCommandBuilder, ContainerBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const { stripIndents } = require('common-tags');
const Giveaway = require('../../../models/giveaway');

function parseDuration(input) {
  const regex = /(\d+)\s*(y|yr|yrs|year|years|mo|month|months|w|week|weeks|d|day|days|h|hr|hrs|hour|hours|m|min|mins|minute|minutes|s|sec|secs|second|seconds)/gi;
  let match;
  let totalMs = 0;

  const unitMap = {
    y: 365 * 24 * 60 * 60 * 1000,
    yr: 365 * 24 * 60 * 60 * 1000,
    yrs: 365 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
    years: 365 * 24 * 60 * 60 * 1000,
    mo: 30 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    hr: 60 * 60 * 1000,
    hrs: 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    m: 60 * 1000,
    min: 60 * 1000,
    mins: 60 * 1000,
    minute: 60 * 1000,
    minutes: 60 * 1000,
    s: 1000,
    sec: 1000,
    secs: 1000,
    second: 1000,
    seconds: 1000,
  };

  while ((match = regex.exec(input)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unitMap[unit]) totalMs += value * unitMap[unit];
  }

  if (totalMs === 0) return null;

  // Max duration: 1 year (~31536000000 ms)
  const MAX_DURATION_MS = 365 * 24 * 60 * 60 * 1000;
  if (totalMs > MAX_DURATION_MS) return 'TOO_LONG';

  return new Date(Date.now() + totalMs);
}

function formatDateTime(date) {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

module.exports = async function giveawayModal(interaction) {
  if (interaction.customId !== 'giveaway_create_modal') return;

  const heading = interaction.fields.getTextInputValue('title');
  const description = interaction.fields.getTextInputValue('description');
  const winners = parseInt(interaction.fields.getTextInputValue('winners'), 10);
  const endInput = interaction.fields.getTextInputValue('endtime');
  const hostedBy = interaction.user.id;

  // Validate winners
  if (isNaN(winners) || winners < 1 || winners > 50) {
    return interaction.reply({
      content: 'Number of winners must be a valid number between 1 and 50.',
      flags: MessageFlags.Ephemeral
    });
  }

  // Parse duration
  const endTime = parseDuration(endInput);
  if (!endTime) {
    return interaction.reply({ 
      content: `Invalid time format.\nExamples: \`7d\`, \`3w 2d 4h\`, \`1mo 2w\``,
      flags: MessageFlags.Ephemeral 
    });
  }

  if (endTime === 'TOO_LONG') {
    return interaction.reply({
      content: 'The maximum giveaway duration is 1 year. Please enter a shorter time.',
      flags: MessageFlags.Ephemeral
    });
  }

  if (endTime <= new Date()) {
    return interaction.reply({ 
      content: `End time must be in the future.`,
      flags: MessageFlags.Ephemeral 
    });
  }

  const endTimestamp = Math.floor(endTime.getTime() / 1000);
  const endString = `<t:${endTimestamp}:F> (<t:${endTimestamp}:R>)`;
  const endDateString = formatDateTime(endTime);

  const container = new ContainerBuilder()
    .addTextDisplayComponents(td => td.setContent(`### ${heading}`))
    .addSeparatorComponents(s => s)
    .addTextDisplayComponents(td => td.setContent(stripIndents`
      ${description}\n
      Ends In: ${endString}
      Hosted By: <@${hostedBy}>
      Entries: **0**
      Winners: **${winners}**
      
      -# ${endDateString}`));

  const msg = await interaction.reply({
    components: [container],
    fetchReply: true,
    flags: MessageFlags.IsComponentsV2
  });

  // Save giveaway in Mongo
  await Giveaway.create({
    messageId: msg.id,
    channelId: msg.channel.id,
    guildId: msg.guild.id,
    title: heading,
    description,
    winnersCount: winners,
    hostedBy,
    endTime,
    entries: [],
    ended: false
  });

  await msg.react('🎉');
};
