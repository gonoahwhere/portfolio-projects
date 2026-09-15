import { MessageFlags, ButtonInteraction, AttachmentBuilder } from 'discord.js';
import { buildLobbyButtons, getLobbyById, saveLobbyToDB, userLobbyMap } from '../../utils/lobbies.js';
import { renderLobbyCard } from '../../utils/renderLobbyCard.js';

export default async function handleLeaveLobby(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith('lobby_leave:')) return;

    const lobbyId = interaction.customId.split(':')[1];
    if (!lobbyId) return;

    const lobby = getLobbyById(interaction.guildId!, lobbyId);

    if (!lobby) {
        return interaction.reply({ content: 'No active lobby found.', flags: MessageFlags.Ephemeral });
    }

    const userId = interaction.user.id;

    if (!lobby.players.some(p => p.id === userId)) {
        return interaction.reply({ content: "You're not in this lobby.", flags: MessageFlags.Ephemeral });
    }

    if (userId === lobby.hostId) {
        return interaction.reply({ content: 'The host must close the lobby instead of leaving.', flags: MessageFlags.Ephemeral });
    }

    const updatedPlayers = lobby.players.filter(p => p.id !== userId);

    try {
        const buffer = await renderLobbyCard({ ...lobby, players: updatedPlayers });
        const attachment = new AttachmentBuilder(buffer, { name: 'lobby.png' });

        lobby.players = updatedPlayers;
        userLobbyMap.delete(userId);
        await saveLobbyToDB(lobby);

        return await interaction.update({
            files: [attachment],
            components: [buildLobbyButtons(lobby)],
        });
    } catch (err) {
        console.error('Failed to leave lobby:', err);
        return interaction.reply({
            content: 'Something went wrong while leaving. Please try again.',
            flags: MessageFlags.Ephemeral,
        });
    }

    return true;
}