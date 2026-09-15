import { MessageFlags, ButtonInteraction, AttachmentBuilder } from 'discord.js';
import { buildLobbyButtons, getLobbyById, saveLobbyToDB, userLobbyMap } from '../../utils/lobbies.js';
import { renderLobbyCard } from '../../utils/renderLobbyCard.js';

export default async function handleJoinLobby(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith('lobby_join:')) return;

    const lobbyId = interaction.customId.split(':')[1];
    if (!lobbyId) return;

    const lobby = getLobbyById(interaction.guildId!, lobbyId);

    if (!lobby) {
        return interaction.reply({ content: 'No active lobby found.', flags: MessageFlags.Ephemeral });
    }

    const userId = interaction.user.id;

    if (lobby.players.some(p => p.id === userId)) {
        return interaction.reply({ content: 'You are already in this lobby.', flags: MessageFlags.Ephemeral });
    }

    if (lobby.players.length >= lobby.maxPlayers) {
        return interaction.reply({ content: 'This lobby is full.', flags: MessageFlags.Ephemeral });
    }

    const nextPlayers = [...lobby.players, { id: userId, username: interaction.user.username }];

    try {
        const buffer = await renderLobbyCard({ ...lobby, players: nextPlayers });
        const attachment = new AttachmentBuilder(buffer, { name: 'lobby.png' });

        lobby.players = nextPlayers;
        userLobbyMap.set(userId, lobby.id);
        await saveLobbyToDB(lobby);

        return await interaction.update({ files: [attachment], components: [buildLobbyButtons(lobby)], });
    } catch (err) {
        console.error('Failed to join lobby:', err);
        return interaction.reply({ content: 'Something went wrong while joining. Please try again.', flags: MessageFlags.Ephemeral });
    }

    return true;
}