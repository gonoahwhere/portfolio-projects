import { MessageFlags, ButtonInteraction } from 'discord.js';
import { getLobbyById, deleteLobby } from '../../utils/lobbies.js';

export default async function handleCloseLobby(interaction: ButtonInteraction) {
  if (!interaction.customId.startsWith('lobby_close:')) return;

  const lobbyId = interaction.customId.split(':')[1];
  if (!lobbyId) return;
  const lobby = getLobbyById(interaction.guildId!, lobbyId);

  if (!lobby) {
    return interaction.reply({ 
        content: 'No active lobby found.', 
        flags: MessageFlags.Ephemeral 
    });
  }

  if (interaction.user.id !== lobby.hostId) {
    return interaction.reply({ 
        content: 'Only the host can close the lobby.', 
        flags: MessageFlags.Ephemeral 
    });
  }

  await deleteLobby(interaction.guildId!, lobbyId);

  await interaction.update({
    content: 'Lobby has been closed.',
    components: []
  });

  return true;
}