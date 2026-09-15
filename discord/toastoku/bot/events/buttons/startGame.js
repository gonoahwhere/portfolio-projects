const { ContainerBuilder, MediaGalleryItemBuilder, AttachmentBuilder } = require("discord.js");
const { titleCase, createGridButtons, getTurnEmbedFields, drawSudokuGrid } = require('../../commands/global/sudoku');
const { MessageFlags } = require('discord-api-types/v10');
const { games } = require('../../../utils/games.js');
const mongoose = require('mongoose');
const SudokuGame = require('../../../models/sudokuGame');

let gameId;
let hostUserId;

module.exports = async function handleStartGame(interaction) {
    if (interaction.customId !== 'start_game') return;

    const multiplayerGame = await SudokuGame.findOne({ gameId: { $regex: `^sudoku-${interaction.channelId}-` } });
    if (!multiplayerGame) {
        return interaction.reply({ content: 'No ongoing multiplayer game found in this channel!', flags: MessageFlags.Ephemeral });
    }

    if (multiplayerGame.started) {
        return interaction.reply({ content: 'This game has already started.', flags: MessageFlags.Ephemeral });
    }
    
    hostUserId = multiplayerGame.hostId;
    gameId = `sudoku-${interaction.channelId}-${hostUserId}`;

    if (interaction.user.id !== hostUserId || interaction.user.id !== multiplayerGame.hostId) {
        return interaction.reply({ content: 'Only the host can start the game!', flags: MessageFlags.Ephemeral });
    } if (multiplayerGame.joinedPlayers.length < 2) {
        return interaction.reply({ content: 'At least 2 players are required to start the game.', flags: MessageFlags.Ephemeral });
    } else {
        await SudokuGame.updateOne({ gameId }, { started: true, currentTurnIndex: 0, messageId: multiplayerGame.messageId });

        const dbObj = multiplayerGame.toObject();
        const gameState = {
            ...dbObj,
            prefilledSet: new Set(dbObj.prefilledSet),
            conflictSet: new Set(dbObj.conflictSet),
            pencilMode: dbObj.pencilMode || false,
            notes: Array(81).fill(null).map((_, i) => new Set(dbObj.notes?.[i] || [])),
            started: true,
            currentTurnIndex: 0,
        };
        games.set(gameId, gameState);

        const percent = Math.floor(gameState.puzzle.filter(n => n !== null).length / 81 * 100);
        const buffer = await drawSudokuGrid(gameState.puzzle, gameState.prefilledSet, gameState.theme, null, null, null, gameState.conflictSet, gameState.notes.map(s => Array.from(s)), interaction.user.id);
        const attachment = new AttachmentBuilder(buffer, { name: 'sudoku.png' });

        const buttonRows = createGridButtons(gameState, gameState.joinedPlayers[0]);
        const fields = getTurnEmbedFields(gameState);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent(`### ${titleCase(gameState.theme)} Sudoku ∘ ${titleCase(gameState.difficulty)} [${percent}%]`))
            .addMediaGalleryComponents(g => g.addItems(
                new MediaGalleryItemBuilder()
                  .setURL(`attachment://${attachment.name}`)
            ));

        if (gameState.mode === 'multi') {
            const turnInfo = fields.map(f => `${f.name}: ${f.value}`).join('\n');
            container.addSeparatorComponents(s => s);
            container.addTextDisplayComponents(td => td.setContent(turnInfo));
        }

        container.addSeparatorComponents(s => s).addActionRowComponents(...buttonRows.filter(Boolean));

        return interaction.update({ components: [container], files: [attachment] });
    }
}