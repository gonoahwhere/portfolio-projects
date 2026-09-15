import { ChatInputCommandInteraction, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import type { BotClient } from '../../../types/Client.js';
import { renderCreators } from '../../../utils/renderCreators.js';

const CREATORS = {
    null: {
        tag: 'null8626',
        id: '661200758510977084',
    },
    noah: {
        tag: 'gonoahwhere',
        id: '372456601266683914',
    },
};

export default {
    data: new SlashCommandBuilder()
        .setName('creators')
        .setDescription('Meet the developers behind UNOAH'),

    async execute(interaction: ChatInputCommandInteraction, bot: BotClient) {
        await interaction.deferReply();

        try {
            const [noahUser, nullUser] = await Promise.all([
                interaction.client.users.fetch(CREATORS.noah.id),
                interaction.client.users.fetch(CREATORS.null.id),
            ]);

            const getAvatarUrl = (user: typeof noahUser) => {
                const hash = user.avatar;
                if (!hash) return undefined;
                const ext = hash.startsWith('a_') ? 'gif' : 'png';
                return `https://cdn.discordapp.com/avatars/${user.id}/${hash}.${ext}?size=512`;
            };

            const noahAvatarUrl = getAvatarUrl(noahUser);
            const nullAvatarUrl = getAvatarUrl(nullUser);

            const buffer = await renderCreators(noahAvatarUrl, nullAvatarUrl);
            const attachment = new AttachmentBuilder(buffer, { name: 'creators.png' });

            await interaction.editReply({ files: [attachment] });
        } catch (error) {
            console.error('Creators command error:', error);
            await interaction.editReply({
                content: 'Something went wrong rendering the creators card.',
            });
        }
    },
};