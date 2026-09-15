const { ContainerBuilder, MediaGalleryItemBuilder, AttachmentBuilder } = require("discord.js");
const { titleCase, getTurnEmbedFields, createCellButtons, createNumberButtons, getConflictingCells, drawSudokuGrid } = require('../../commands/global/sudoku');
const { MessageFlags } = require('discord-api-types/v10');
const { games } = require('../../../utils/games.js');
const mongoose = require('mongoose');
const SudokuGame = require('../../../models/sudokuGame');
const DailyCompletion = require('../../../models/dailyCompletion');
const logFinishedGame = require('../../../utils/gameHistory.js');
const Profile = require('../../../models/userProfile');
const BigNumber = require('bignumber.js');
const { grantGameRewards } = require('../../../utils/rewards');
const { updateWeeklyQuestsFromGame } = require("../../../utils/updateQuests");
const emojis = require('../../../config/emojis');

// Helper: checks row/col/box uniqueness
function isPuzzleValid(puzzle) {
    for (let i = 0; i < 81; i++) {
        const val = puzzle[i];
        if (val === null) continue;
        
        const row = Math.floor(i / 9);
        const col = i % 9;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = 0; r < 9; r++) {
            if (r !== col && puzzle[row * 9 + r] === val) return false;
        }
        for (let c = 0; c < 9; c++) {
            if (c !== row && puzzle[c * 9 + col] === val) return false;
        }
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const idx = (boxRow + r) * 9 + (boxCol + c);
                if (idx !== i && puzzle[idx] === val) return false;
            }
        }
    }
    return true;
}

// Check if prefilled cells are unchanged
function prefilledCorrect(puzzle, prefilledSet, firstSolution) {
    for (const idx of prefilledSet) {
        if (puzzle[idx] !== firstSolution[idx]) return false;
    }
    return true;
}

module.exports = async function handleCell(interaction) {
    if (!interaction.customId.startsWith('cell_')) return;

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
    
    let currentPlayerId;
    if (gameState.mode === 'multi') {
        currentPlayerId = gameState.joinedPlayers[gameState.currentTurnIndex % gameState.joinedPlayers.length];
    } else {
        currentPlayerId = interaction.user.id;
    }

    if (interaction.user.id !== currentPlayerId) {
        return interaction.reply({ content: `It's not your turn!`, flags: MessageFlags.Ephemeral });
    }

    const cellIndex = parseInt(interaction.customId.split('_')[1]);
    if (gameState.puzzle[cellIndex] !== null) {
        gameState.puzzle[cellIndex] = null;
        gameState.selectedCell = null;
    } else {
        gameState.selectedCell = cellIndex;
    }

    gameState.selectedGrid = Math.floor(cellIndex / 27) * 3 + Math.floor((cellIndex % 9) / 3);
    gameState.conflictSet = getConflictingCells(gameState.puzzle);

    const buffer = await drawSudokuGrid( gameState.puzzle, gameState.prefilledSet, gameState.theme, gameState.selectedCell, null, gameState.selectedGrid, gameState.conflictSet, gameState.notes.map(s => Array.from(s)), interaction.user.id);
    const attachment = new AttachmentBuilder(buffer, { name: 'sudoku.png' });
    const fields = getTurnEmbedFields(gameState);
    const percent = Math.floor(gameState.puzzle.filter(n => n !== null).length / 81 * 100);

    const container = new ContainerBuilder()
        .addTextDisplayComponents(td => td.setContent(`### ${gameId.startsWith('sudoku-daily-') ? 'Daily' : titleCase(gameState.theme)} Sudoku ∘ ${titleCase(gameState.difficulty)} [${percent}%]`))
        .addMediaGalleryComponents(g => g.addItems( new MediaGalleryItemBuilder().setURL(`attachment://${attachment.name}`)));

    if (gameState.mode === 'multi') {
        const turnInfo = fields.map(f => `${f.name}: ${f.value}`).join('\n');
        container.addSeparatorComponents(s => s);
        container.addTextDisplayComponents(td => td.setContent(turnInfo));
    }

    const filledCells = gameState.puzzle.filter(n => n !== null).length;
    if (filledCells === 81) {
        const isCorrect = prefilledCorrect(gameState.puzzle, gameState.prefilledSet, gameState.originalPuzzle) && isPuzzleValid(gameState.puzzle);
        if (isCorrect) {
            container.addSeparatorComponents(s => s);
            const { leveledUp, newLevel, xpGained, toastsGained, hintsGained } = await grantGameRewards(interaction.user.id, interaction.guild?.id);
            const hintText = hintsGained > 0 ? ` and ${hintsGained} Hint!` : "";

            if (leveledUp) {
                container.addTextDisplayComponents(td => td.setContent(`🎉 Congratulations, you leveled up to ${newLevel}, you gained ${toastsGained} ${emojis.toast}${hintText}`));
            } else {
                container.addTextDisplayComponents(td => td.setContent(`🎉 Congratulations, you gained ${xpGained} ${emojis.expadd} ${emojis.spacer} ${toastsGained} ${emojis.toast}${hintText}`));
            }

            let customThemesCompleted = 0;
            const allCustomThemes = ['faces','toastie','colourblind','animals','transport'];
            if (gameState.theme && allCustomThemes.includes(gameState.theme.toLowerCase())) {
                customThemesCompleted = 1;
            }

            const options = {
                solved: true,
                daily: gameState.mode === 'daily' ? 1 : 0,
                toastEarned: toastsGained,
                expEarned: xpGained,
                hintsCollected: hintsGained,
                hintsUsed: 0,
                customThemesCompleted: customThemesCompleted,
                endedEarly: false,
                difficulty: gameState.difficulty,
                theme: gameState.theme
            };

            if (gameState.mode === 'daily') {
                await updateWeeklyQuestsFromGame(interaction.user.id, gameState, options, interaction.user);
            } else {
                await updateWeeklyQuestsFromGame(interaction.user.id, gameState, options, interaction.channel);
            }

            const finalBuffer = await drawSudokuGrid(gameState.puzzle, gameState.prefilledSet, gameState.theme, null, null, null, null, interaction.user.id);
            const finalAttachment = new AttachmentBuilder(finalBuffer, { name: 'sudoku.png' });

            await SudokuGame.updateOne({ gameId }, {
                puzzle: gameState.puzzle,
                prefilledSet: [...gameState.prefilledSet],
                theme: gameState.theme,
                difficulty: gameState.difficulty,
                selectedCell: null,
                selectedGrid: null,
                selectedValue: null,
                conflictSet: [...gameState.conflictSet],
                mode: gameState.mode,
                currentTurnIndex: gameState.currentTurnIndex,
                joinedPlayers: gameState.joinedPlayers,
                allSolutions: gameState.allSolutions,
                messageId: gameState.messageId
            });

            await logFinishedGame(gameState, true);
            let profileData = await Profile.findOne({ userId: interaction.user.id });
            if (!profileData) {
                profileData = new Profile({ _id: new mongoose.Types.ObjectId(), userId: interaction.user.id });
                await profileData.save();
            }

            let gamesPlayed = new BigNumber(profileData.misc.gamesPlayed || "0");
            gamesPlayed = gamesPlayed.plus(1);
            profileData.misc.gamesPlayed = gamesPlayed.toString();
            await profileData.save();
            games.delete(gameId);
            await SudokuGame.deleteOne({ gameId });

            if (gameState.mode === 'daily') {
                const today = new Date().toISOString().split('T')[0];
                await DailyCompletion.create({ userId: interaction.user.id, date: today });
            };

            return interaction.update({ components: [container], files: [finalAttachment] });
        } else {
            container.addSeparatorComponents(s => s);
            container.addTextDisplayComponents(td => td.setContent(`${emojis.deny} The puzzle is not correct yet. Keep trying!`));
        }
    }

    const buttonRows = gameState.selectedCell !== null
        ? createNumberButtons(gameState.theme, new Set(gameState.prefilledSet), gameState.puzzle, cellIndex, gameState.mode, gameState.pencilMode, gameState.joinedPlayers)
        : createCellButtons(gameState.theme, new Set(gameState.prefilledSet), gameState.puzzle, gameState.selectedGrid, gameState.mode, gameState.joinedPlayers);

    container.addSeparatorComponents(s => s).addActionRowComponents(...buttonRows.filter(Boolean));

    games.set(gameId, gameState);
    await SudokuGame.updateOne({ gameId }, { puzzle: gameState.puzzle, prefilledSet: [...gameState.prefilledSet], selectedCell: gameState.selectedCell, selectedGrid: gameState.selectedGrid, selectedValue: gameState.selectedValue, conflictSet: [...gameState.conflictSet], lastUpdated: Date.now(), } );

    return interaction.update({ components: [container], files: [attachment] });
}