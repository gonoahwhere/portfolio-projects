const { ContainerBuilder, MediaGalleryItemBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ActionRowBuilder } = require("discord.js");
const { titleCase, createLobbyButtons, getTurnEmbedFields, drawSudokuGrid } = require('../../commands/global/sudoku');
const { MessageFlags } = require('discord-api-types/v10');
const { games } = require('../../../utils/games.js');
const mongoose = require('mongoose');
const SudokuGame = require('../../../models/sudokuGame');

module.exports = async function handleLeaveGameLobby(interaction) {
    if (interaction.customId !== 'leave_game_lobby') return;

    let userId = interaction.user.id;
    const today = new Date().toISOString().split('T')[0];
    const hostId = interaction.user.id;

    let gameId;
    if (interaction.channel?.type === 'DM') {
        gameId = `sudoku-user-${hostId}`;
    } else {
        const possibleDailyId = `sudoku-daily-${today}-${hostId}`;
        const savedDailyGame = await SudokuGame.findOne({ gameId: possibleDailyId });
        if (savedDailyGame) {
            gameId = possibleDailyId;
        } else {
            const byMessage = await SudokuGame.findOne({ messageId: interaction.message.id });
            if (byMessage) {
                gameId = byMessage.gameId;
            } else {
                gameId = `sudoku-${interaction.channelId}-${hostId}`;
            }
        }
    }

    let gameState = games.get(gameId);

    if (!gameState) {
        const savedGame = await SudokuGame.findOne({ gameId });
        if (!savedGame) {
            return interaction.reply({ content: 'No active Sudoku game found!', flags: MessageFlags.Ephemeral });
        }

        if (savedGame.mode !== 'daily' &&
            savedGame.hostId !== hostId &&
            !savedGame.joinedPlayers.includes(hostId)
        ) {
            return interaction.reply({ content: 'You are not part of this game!', flags: MessageFlags.Ephemeral });
        }

        gameState = {
            ...savedGame.toObject(),
            prefilledSet: new Set(savedGame.prefilledSet),
            conflictSet: new Set(savedGame.conflictSet),
            pencilMode: savedGame.pencilMode || false,
            notes: savedGame.notes ? savedGame.notes.map(arr => new Set(arr)) : Array.from({ length: 81 }, () => new Set()),
        };
        games.set(gameId, gameState);
    }

    if (gameState.messageId && interaction.message.id !== gameState.messageId) {
        return interaction.reply({ content: "This interaction does not belong to your game!", flags: MessageFlags.Ephemeral });
    }

    // Host cannot leave
    if (userId === gameState.hostId) {
        return interaction.reply({
            content: 'The host cannot leave the lobby. Use "End Game" instead.',
            flags: MessageFlags.Ephemeral
        });
    }

    // Remove user from joinedPlayers
    gameState.joinedPlayers = gameState.joinedPlayers.filter(id => id !== userId);
    await SudokuGame.updateOne({ gameId }, { joinedPlayers: gameState.joinedPlayers, lastUpdated: Date.now() });
    games.set(gameId, gameState);

    // Update lobby message UI
    const fields = getTurnEmbedFields(gameState);
    const percent = Math.floor(gameState.puzzle.filter(n => n !== null).length / 81 * 100);
    const buffer = await drawSudokuGrid(gameState.puzzle, new Set(gameState.prefilledSet), gameState.theme, null, null, null, gameState.conflictSet, userId);
    const attachment = new AttachmentBuilder(buffer, { name: 'sudoku.png' });
    let buttonRows = createLobbyButtons(gameState, userId);

    // Add "End Game" button if only host remains
    if (gameState.joinedPlayers.length === 1 && gameState.joinedPlayers[0] === gameState.hostId) {
        if (buttonRows.length === 0) buttonRows.push(new ActionRowBuilder());
        buttonRows[buttonRows.length - 1].addComponents(
            new ButtonBuilder()
                .setCustomId('end_game_lobby')
                .setLabel('End Game')
                .setStyle(ButtonStyle.Danger)
        );
    }

    const container = new ContainerBuilder()
        .addTextDisplayComponents(td => td.setContent(`### ${titleCase(gameState.theme)} Sudoku ∘ ${titleCase(gameState.difficulty)} [${percent}%]`))
        .addMediaGalleryComponents(g => g.addItems(
            new MediaGalleryItemBuilder().setURL(`attachment://${attachment.name}`)
        ));

    if (gameState.mode === 'multi') {
        const turnInfo = fields.map(f => `${f.name}: ${f.value}`).join('\n');
        container.addSeparatorComponents(s => s).addTextDisplayComponents(td => td.setContent(turnInfo));
    }

    container.addSeparatorComponents(s => s).addActionRowComponents(...buttonRows.filter(Boolean));

    // Update lobby message
    const channelId = gameState.channelId || gameId.split('-')[1];
    const gameChannel = await interaction.client.channels.fetch(channelId).catch(() => null);
    const gameMessage = await gameChannel?.messages.fetch(gameState.messageId).catch(() => null);
    if (gameMessage) {
        await gameMessage.edit({ components: [container], files: [attachment], flags: MessageFlags.IsComponentsV2 });
    }

    return interaction.reply({ content: 'You have left the lobby.', flags: MessageFlags.Ephemeral });
};
