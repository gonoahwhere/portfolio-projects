import { ButtonBuilder, ButtonStyle, ActionRowBuilder, ButtonInteraction, MessageFlags, AttachmentBuilder } from 'discord.js';
import ServerSettings from '../../models/serverSettings.js';
import { renderServerSettings } from '../../utils/renderServerSettings.js';
import GuildInfo from "../../models/guildInfo.js";

export default async function handleServerSettingsToggle(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith('serversettings_toggle_')) return;

    const customIdParts = interaction.customId.split('_');
    const originalUserId = customIdParts[customIdParts.length - 1];

    if (interaction.user.id !== originalUserId) {
        await interaction.reply({ content: "Only the user who ran the command can use these buttons!", flags: MessageFlags.Ephemeral });
        return;
    }

    await interaction.deferUpdate();
    const settingKey = customIdParts[2];
    if (!settingKey) {
        await interaction.followUp({ content: "Invalid button interaction.", flags: MessageFlags.Ephemeral });
        return;
    }

    const settingsList = [
        { key: 'theme', options: ['dark', 'light'] as const },
        { key: 'lb', options: [false, true] as const },
    ] as const;

    let settings = await ServerSettings.findOne({ guildId: interaction.guildId });
    if (!settings) {
        await interaction.followUp({ content: "Server settings not found.", flags: MessageFlags.Ephemeral });
        return;
    }

    const setting = settingsList.find(s => s.key === settingKey);

    if (setting) {
        const currentValue = settings[settingKey as keyof typeof settings];
        const currentIndex = setting.options.findIndex(option => option === currentValue);
        const nextIndex = (currentIndex + 1) % setting.options.length;
        (settings as any)[settingKey] = setting.options[nextIndex];
    }

    await settings.save();

    if (settingKey === 'lb' && settings.lb) {
        await GuildInfo.findOneAndUpdate(
            { guildId: interaction.guildId },
            { $setOnInsert: { guildId: interaction.guildId, completedGames: 0, }, },
            { upsert: true, returnDocument: 'after', }
        );
    }

    const renderSettings = {
        guildId: interaction.guildId!,
        guildName: interaction.guild?.name!,
        theme: (settings.theme ?? 'dark') as 'light' | 'dark',
        lb: (settings.lb ?? false) as true | false,
        // add more settings here as your schema grows
    };

    const imageBuffer = await renderServerSettings(renderSettings);
    const attachment  = new AttachmentBuilder(imageBuffer, { name: 'server-settings.png' });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(`serversettings_toggle_theme_${interaction.user.id}`)
            .setLabel('Toggle Theme')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`serversettings_toggle_lb_${interaction.user.id}`)
            .setLabel('Opt-In Global Leaderboard')
            .setStyle(ButtonStyle.Primary),
        // add more buttons here as your schema grows
    );

    await interaction.editReply({ files: [attachment], components: [row] });
}