import { SlashCommandBuilder, MessageFlags, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import type { BotClient } from '../../../types/Client.js';
import { createLobby, commitLobby, buildLobbyButtons } from '../../../utils/lobbies.js';
import { renderLobbyCard } from '../../../utils/renderLobbyCard.js';

export default {
    data: new SlashCommandBuilder()
        .setName('create-lobby')
        .setDescription('Create a lobby for an UNOAH game.')
        .addIntegerOption(option =>
            option
                .setName('players')
                .setDescription('Maximum number of players (2, 3 or 4)')
                .setRequired(true)
                .addChoices(
                    { name: '2 Players', value: 2 },
                    { name: '3 Players', value: 3 },
                    { name: '4 Players', value: 4 }
                )
        ),

    async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
        const guildId = interaction.guildId!;
        const maxPlayers = interaction.options.getInteger('players', true);
        const { lobby, error } = await createLobby(guildId, interaction.user.id, interaction.user.username, maxPlayers);

        if (error) {
            return interaction.reply({
                content: `${error}`,
                flags: MessageFlags.Ephemeral,
            });
        }

        if (!lobby) {
            return interaction.reply({
                content: 'Failed to create lobby.',
                flags: MessageFlags.Ephemeral,
            });
        }

        try {
            const buffer = await renderLobbyCard(lobby);
            const attachment = new AttachmentBuilder(buffer, { name: 'lobby.png' });
            const response = await interaction.reply({
                files: [attachment],
                components: [buildLobbyButtons(lobby)],
                withResponse: true,
            });

            const messageId = response.resource?.message?.id;
            if (!messageId) {
                return;
            }

            lobby.messageId = messageId;
            await commitLobby(lobby);
        } catch (err) {
            console.error("Failed to create lobby message:", err);
            try {
                await interaction.reply({
                    content: 'Failed to send lobby message. Please try again.',
                    flags: MessageFlags.Ephemeral,
                });
            } catch {}
        }
    }
}