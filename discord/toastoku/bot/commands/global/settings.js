const { SlashCommandBuilder, ContainerBuilder, SeparatorBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { MessageFlags } = require('discord-api-types/v10');
const Profile = require('../../../models/userSettings');
const mongoose = require('mongoose');
const emojis = require('../../../config/emojis');

module.exports = {
  devOnly: true,
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('View or edit your bot settings here!')
    .addSubcommand(sub =>
        sub.setName('view').setDescription('View your current bot settings')
    )
    .addSubcommand(sub =>
        sub.setName('edit').setDescription('Edit your current bot settings')
    ),
  async execute(interaction) {
    const member = interaction.user;
    let subcommand = interaction.options.getSubcommand();
    
    let profileData = await Profile.findOne({ userId: member.id });
    if (!profileData) {
      profileData = new Profile({ _id: new mongoose.Types.ObjectId(), userId: member.id });
      await profileData.save();
    }

    const settingsList = [
      { key: 'anonymous', label: 'Anonymous Mode', description: 'Hide your username on leaderboards', value: profileData.anonymous },
      { key: 'vote_reminder', label: 'Vote Reminders', description: 'Receive a DM when you can vote for Toastoku', value: profileData.reminders.vote.enabled },
      { key: 'wq_reminder', label: 'Weekly Quest Reminders', description: 'Receive a DM when weekly quests reset', value: profileData.reminders.wquest.enabled },
      { key: 'dp_reminder', label: 'Daily Puzzle Reminders', description: 'Receive a DM when you can play the daily puzzle again', value: profileData.reminders.dpuzzle.enabled },
    ];

    let enabledEmoji = emojis.approve
    let disabledEmoji = emojis.deny
    let repliedEmoji = emojis.reply

    if (subcommand === 'view') {
        const container = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent('### ⚙️ Toastoku Settings – Manage Your Toasty Life!'))
            .addSeparatorComponents(new SeparatorBuilder())
        
        for (const setting of settingsList) {
            const emoji = setting.value ? enabledEmoji : disabledEmoji;
            container.addTextDisplayComponents(td => td.setContent(`${emoji} \`${setting.label}\`\n-# ${repliedEmoji} ${setting.description}`))
        }

        return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    if (subcommand === 'edit') {
        const container = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent('### ⚙️ Toastoku Settings – Manage Your Toasty Life!'))
            .addSeparatorComponents(new SeparatorBuilder());

        for (const setting of settingsList) {
            const emoji = setting.value ? enabledEmoji : disabledEmoji;
            container.addTextDisplayComponents(td => 
                td.setContent(`${emoji} \`${setting.label}\`\n-# ${repliedEmoji} ${setting.description}`)
            );
        }

        const buttonRows = settingsList.map(setting =>
            new ButtonBuilder()
                .setCustomId(`settings_toggle_${setting.key}`)
                .setLabel(setting.label)
                .setStyle(setting.value ? ButtonStyle.Success : ButtonStyle.Danger)
        );

        const actionRows = buttonRows.map(btn => new ActionRowBuilder().addComponents(btn));

        container.addActionRowComponents(...actionRows);

        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  }
};