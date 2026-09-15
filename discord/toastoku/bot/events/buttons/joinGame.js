const { ContainerBuilder, MediaGalleryItemBuilder, AttachmentBuilder } = require("discord.js");
const { titleCase, createGridButtons, createLobbyButtons, getTurnEmbedFields, drawSudokuGrid } = require('../../commands/global/sudoku');
const { MessageFlags } = require('discord-api-types/v10');
const { games } = require('../../../utils/games.js');
const mongoose = require('mongoose');
const SudokuGame = require('../../../models/sudokuGame');

let gameId;
let hostUserId;

module.exports = async function handleJoinGame(interaction) {
    if (interaction.customId !== 'join_game') return;

    const existingSingle = await SudokuGame.findOne({
        gameId: `sudoku-${interaction.channelId}-${interaction.user.id}`,
        mode: 'single'
    });

    if (existingSingle) {
        return interaction.reply({
            content: 'You are already in a singleplayer game in this channel! Finish it before joining a multiplayer game.',
            flags: MessageFlags.Ephemeral
        });
    }

    const multiplayerGame = await SudokuGame.findOne({
        gameId: { $regex: `^sudoku-${interaction.channelId}-` },
        mode: 'multi',
        started: false
    });

    if (!multiplayerGame) {
        return interaction.reply({
            content: 'No ongoing multiplayer game found in this channel!',
            flags: MessageFlags.Ephemeral
        });
    }

    if (multiplayerGame.hostId === interaction.user.id || multiplayerGame.joinedPlayers.includes(interaction.user.id)) {
        return interaction.reply({
            content: 'You are already part of this multiplayer game!',
            flags: MessageFlags.Ephemeral
        });
    }

    const hostUserId = multiplayerGame.hostId;
    const gameId = `sudoku-${interaction.channelId}-${hostUserId}`;
    let gameState = games.get(gameId);

    if (!gameState) {
        const savedGame = await SudokuGame.findOne({ gameId });
        if (!savedGame) return interaction.reply({
            content: 'Game data could not be found!',
            flags: MessageFlags.Ephemeral
        });

        gameState = {
            ...savedGame.toObject(),
            pencilMode: savedGame.pencilMode || false,
            prefilledSet: new Set(savedGame.prefilledSet),
            conflictSet: new Set(savedGame.conflictSet),
            notes: savedGame.notes ? savedGame.notes.map(arr => new Set(arr)) : Array.from({ length: 81 }, () => new Set()),
        };
    }

    const maxPlayers = 4;

    if (gameState.joinedPlayers.includes(interaction.user.id)) {
        return interaction.reply({ content: 'You have already joined this game.', flags: MessageFlags.Ephemeral });
    }

    if (gameState.joinedPlayers.length >= maxPlayers) {
        return interaction.reply({ content: 'This game is full.', flags: MessageFlags.Ephemeral });
    }

    gameState.joinedPlayers.push(interaction.user.id);
    games.set(gameId, gameState);

    await SudokuGame.updateOne({ gameId }, {
        joinedPlayers: gameState.joinedPlayers,
        messageId: gameState.messageId,
        channelId: interaction.channelId
    });

    const fields = getTurnEmbedFields(gameState);
    const percent = Math.floor(gameState.puzzle.filter(n => n !== null).length / 81 * 100);
    const buffer = await drawSudokuGrid(gameState.puzzle, gameState.prefilledSet, gameState.theme, null, null, null, gameState.conflictSet, interaction.user.id);
    const attachment = new AttachmentBuilder(buffer, { name: 'sudoku.png' });

    const buttonRows = !gameState.started ? createLobbyButtons(gameState, interaction.user.id) : createGridButtons(gameState, gameState.joinedPlayers[gameState.currentTurnIndex]);

    const container = new ContainerBuilder()
        .addTextDisplayComponents(td => td.setContent(`### ${titleCase(gameState.theme)} Sudoku ∘ ${titleCase(gameState.difficulty)} [${percent}%]`))
        .addMediaGalleryComponents(g => g.addItems(
            new MediaGalleryItemBuilder()
                .setURL(`attachment://${attachment.name}`)
        ));

    if (gameState.mode === 'multi') {
        let turnInfo = fields.map(f => `${f.name}: ${f.value}`).join('\n');
        container.addSeparatorComponents(s => s)
        container.addTextDisplayComponents(td => td.setContent(turnInfo));
    }

    container.addSeparatorComponents(s => s).addActionRowComponents(...buttonRows.filter(Boolean));
    return interaction.update({ components: [container], files: [attachment] });
}