const { ContainerBuilder } = require("discord.js");
const { MessageFlags } = require('discord-api-types/v10');
const mongoose = require('mongoose');
const SudokuGame = require('../../../models/sudokuGame');

module.exports = async function handleEndGameLobby(interaction) {
    if (interaction.customId !== 'end_game_lobby') return;

    const multiplayerGame = await SudokuGame.findOne({ messageId: interaction.message.id });

    if (!multiplayerGame) {
        return interaction.reply({
            content: 'You are not hosting any game in this channel!',
            flags: MessageFlags.Ephemeral
        });
    }

    const userId = interaction.user.id;
    const hostId = multiplayerGame.hostId;

    if (userId !== hostId) {
        return interaction.reply({ content: 'Only the host can end the lobby!', flags: MessageFlags.Ephemeral });
    }

    await SudokuGame.deleteOne({ gameId: multiplayerGame.gameId });

    const container = new ContainerBuilder()
        .addTextDisplayComponents(td => td.setContent(`The host has ended the lobby. The game is closed.`));

    return interaction.update({ components: [container], files: [] });
}