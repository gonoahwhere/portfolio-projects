import { ChatInputCommandInteraction, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import type { BotClient } from '../../../types/Client.js';
import { renderGuide } from '../../../utils/renderGuide.js';

export default {
    data: new SlashCommandBuilder()
        .setName('guide')
        .setDescription('Learn how to play UNOAH'),

    async execute(interaction: ChatInputCommandInteraction, bot: BotClient) {
        await interaction.deferReply();

        try {
            const buffer = await renderGuide();
            const attachment = new AttachmentBuilder(buffer, { name: 'guide.png' });
            await interaction.editReply({ files: [attachment] });
        } catch (error) {
            console.error('Guide command error:', error);
            await interaction.editReply({
                content: 'Something went wrong rendering the guide.',
            });
        }
    },
};