const { SlashCommandBuilder, ContainerBuilder, SeparatorBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { MessageFlags } = require('discord-api-types/v10');
const ServerSettings = require('../../../models/serverSettings');
const Profile = require('../../../models/userProfile');
const mongoose = require('mongoose');

module.exports = {
  devOnly: true,
  data: new SlashCommandBuilder()
    .setName('server-settings')
    .setDescription('View or edit your server settings here!')
    .addSubcommand(sub =>
      sub.setName('view').setDescription('View your server settings')
    )
    .addSubcommand(sub =>
      sub.setName('edit').setDescription('Edit your server settings')
    ),

  async execute(interaction) {
    const member = interaction.user;
    const subcommand = interaction.options.getSubcommand();

    let serverData = await ServerSettings.findOne({ guildId: interaction.guildId });
    if (!serverData) {
      serverData = new ServerSettings({ _id: new mongoose.Types.ObjectId(), guildId: interaction.guildId, hintsEnabled: false });
      await serverData.save();
    }

    const settingsList = [
      { key: 'hintsEnabled', label: 'Server Hints', description: 'Enable or disable hints for this server', value: serverData.hintsEnabled }
    ];

    const enabledEmoji = '<:approve:1419442985594126568>';
    const disabledEmoji = '<:deny:1419442956347379783>';
    const repliedEmoji = '<:reply:1419441877022933113>';

    if (subcommand === 'view') {
        const container = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent('### ⚙️ Toastoku Settings – Only Toast Masters Allowed!'))
            .addSeparatorComponents(new SeparatorBuilder())
        
        for (const setting of settingsList) {
            const emoji = setting.value ? enabledEmoji : disabledEmoji;
            container.addTextDisplayComponents(td => td.setContent(`${emoji} \`${setting.label}\`\n-# ${repliedEmoji} ${setting.description}`))
        }

        return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    if (subcommand === 'edit') {
        const container = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent('### ⚙️ Toastoku Settings – Only Toast Masters Allowed!'))
            .addSeparatorComponents(new SeparatorBuilder());

        for (const setting of settingsList) {
            const emoji = setting.value ? enabledEmoji : disabledEmoji;
            container.addTextDisplayComponents(td => 
                td.setContent(`${emoji} \`${setting.label}\`\n-# ${repliedEmoji} ${setting.description}`)
            );
        }

        const buttonRows = settingsList.map(setting =>
            new ButtonBuilder()
                .setCustomId(`server_settings_toggle_${setting.key}`)
                .setLabel(setting.label)
                .setStyle(setting.value ? ButtonStyle.Success : ButtonStyle.Danger)
        );

        const actionRows = buttonRows.map(btn => new ActionRowBuilder().addComponents(btn));

        container.addActionRowComponents(...actionRows);

        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  }
};
