const { ContainerBuilder, SeparatorBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const mongoose = require('mongoose');
const Profile = require('../../../models/userProfile');
const emojis = require('../../../config/emojis');

module.exports = async function handleSettingsToggle(interaction) {
    if (!interaction.customId.startsWith('settings_toggle_')) return;

    const settingKey = interaction.customId.replace('settings_toggle_', '');
    let enabledEmoji = emojis.approve
    let disabledEmoji = emojis.deny
    let repliedEmoji = emojis.reply

    let profile = await Profile.findOne({ userId: interaction.user.id });
    if (!profile) {
        profile = new Profile({ _id: new mongoose.Types.ObjectId(), userId: interaction.user.id });
        await profile.save();
    }

    profile[settingKey] = !profile[settingKey];
    await profile.save();

    const settingsList = [
        { key: 'anonymous', label: 'Anonymous Mode', description: 'Hide your username on leaderboards', value: profile.anonymous },
    ];

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
    return interaction.update({ components: [container] });
}