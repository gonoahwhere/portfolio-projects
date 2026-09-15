const { SlashCommandBuilder, ContainerBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const { stripIndents } = require("common-tags");

module.exports = {
  devOnly: true,
  data: new SlashCommandBuilder()
    .setName('todo')
    .setDescription('View the latest list of tasks to do!'),

  async execute(interaction) {
    let reply = "<:reply:1419441877022933113>";
    let replyAgain = "<:replyagain:1424859106019377232>";

    const container = new ContainerBuilder()
      .addTextDisplayComponents(td => td.setContent(`### 🥖 Toasted and Ready: Tasks Ahead`))
      .addSeparatorComponents(s => s)
      .addTextDisplayComponents(td => td.setContent(stripIndents`
        -# **Fix weekly quests**
        -# ${replyAgain} rewards not counting for games or votes
        -# ${reply} quest labels and descriptions incorrect

        -# **Notifications system**
        -# ${replyAgain} weekly quest reminders
        -# ${replyAgain} daily puzzle reminders
        -# ${reply} vote reminders?
        
        -# **Blocking system**
        -# ${replyAgain} block users from joining my multiplayer games
        -# ${replyAgain} private message with list of blocked users
        -# ${replyAgain} unblock users from joining my multiplayer games
        -# ${reply} allow use of user IDs or mentions, privately state if blocked/unblocked
      `));

      return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 })
  }
};
