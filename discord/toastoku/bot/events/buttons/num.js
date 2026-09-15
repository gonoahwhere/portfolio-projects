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

function sanitizeNotes(notes) {
    const clean = [];

    for (let i = 0; i < 81; i++) {
        const raw = notes?.[i];

        if (raw instanceof Set) {
            clean[i] = new Set([...raw].filter(x => Number.isInteger(x) && x >= 1 && x <= 9));
            continue;
        }

        if (Array.isArray(raw)) {
            clean[i] = new Set(raw.filter(x => Number.isInteger(x) && x >= 1 && x <= 9));
            continue;
        }

        if (typeof raw === "string") {
            const nums = raw
                .replace(/[^0-9]/g, "") 
                .split("")
                .map(n => parseInt(n))
                .filter(n => n >= 1 && n <= 9);

            clean[i] = new Set(nums);
            continue;
        }

        clean[i] = new Set();
    }

    while (clean.length < 81) clean.push(new Set());
    return clean;
}

// Helper function to safely convert notes to array format for database storage
function notesToArray(notes) {
    const result = [];
    for (let i = 0; i < 81; i++) {
        const nums = new Set();

        const extract = (val) => {
            if (val == null) return;
            // Iterable but not array (Set, Map, etc.)
            if (typeof val === 'object' && typeof val[Symbol.iterator] === 'function' && !Array.isArray(val)) {
                for (const x of val) extract(x);
            } else if (Array.isArray(val)) {
                for (const x of val) extract(x);
            } else if (typeof val === 'number' && Number.isInteger(val) && val >= 1 && val <= 9) {
                nums.add(val);
            } else if (typeof val === 'string') {
                for (const ch of val.replace(/[^1-9]/g, '')) nums.add(parseInt(ch));
            }
        };

        extract(notes?.[i]);
        result.push([...nums]);
    }
    return result;
}

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

function prefilledCorrect(puzzle, prefilledSet, firstSolution) {
    for (const idx of prefilledSet) {
        if (puzzle[idx] !== firstSolution[idx]) return false;
    }
    return true;
}

module.exports = async function handleNum(interaction) {
    if (!interaction.customId.startsWith('num_')) return;

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
            gameId = `sudoku-${interaction.channelId}-${hostId}`;
        }
    }

    let gameState = games.get(gameId);

    if (!gameState) {
        let savedGame = await SudokuGame.findOne({ gameId });

        // Non-host multiplayer player: search by channel + membership
        if (!savedGame && interaction.channel?.type !== 'DM') {
            savedGame = await SudokuGame.findOne({
                gameId: { $regex: `^sudoku-${interaction.channelId}-` },
                joinedPlayers: hostId,
                mode: 'multi'
            });
            if (savedGame) gameId = savedGame.gameId;
        }

        if (!savedGame) {
            return interaction.reply({ content: 'No active Sudoku game found!', flags: MessageFlags.Ephemeral });
        }

        if (savedGame.mode !== 'daily' &&
            savedGame.hostId !== hostId &&
            !savedGame.joinedPlayers.includes(hostId)
        ) {
            return interaction.reply({ content: 'You are not part of this game!', flags: MessageFlags.Ephemeral });
        }

        const dbObj = savedGame.toObject();
        delete dbObj.notes;

        gameState = {
            ...dbObj,
            prefilledSet: new Set(savedGame.prefilledSet),
            conflictSet: new Set(savedGame.conflictSet),
            pencilMode: savedGame.pencilMode || false,
        };
        
        gameState.notes = sanitizeNotes(savedGame.notes);
    }

    gameState.notes = sanitizeNotes(gameState.notes);

    if (gameState.messageId && interaction.message.id !== gameState.messageId) {
        return interaction.reply({ content: "This interaction does not belong to your game!", flags: MessageFlags.Ephemeral });
    }
    if (!gameState) {
        const savedGame = await SudokuGame.findOne({ gameId });
        if (!savedGame) return interaction.reply({ content: 'No active Sudoku game found for you!', flags: MessageFlags.Ephemeral });
        const dbObj = savedGame.toObject();
        delete dbObj.notes;

        gameState = {
            ...dbObj,
            prefilledSet: new Set(savedGame.prefilledSet),
            conflictSet: new Set(savedGame.conflictSet),
            pencilMode: savedGame.pencilMode || false,
        };

        gameState.notes = sanitizeNotes(savedGame.notes);
    }

    const currentPlayerId = gameState.mode === 'multi'
        ? gameState.joinedPlayers[gameState.currentTurnIndex % gameState.joinedPlayers.length]
        : interaction.user.id;

    if (interaction.user.id !== currentPlayerId) {
        return interaction.reply({ content: "It's not your turn!", flags: MessageFlags.Ephemeral });
    }

    const selectedCell = gameState.selectedCell;
    if (selectedCell === null)
        return interaction.reply({ content: 'No cell selected!', flags: MessageFlags.Ephemeral });

    const num = parseInt(interaction.customId.split('_')[1]);
    if (isNaN(num) || num < 1 || num > 9) return;

    if (!gameState.notes[selectedCell])
        gameState.notes[selectedCell] = new Set();

    if (gameState.pencilMode) {
        const cellNotes = gameState.notes[selectedCell];
        if (cellNotes.has(num)) cellNotes.delete(num);
        else cellNotes.add(num);
    } else {
        const zeroBasedNum = num;
        gameState.puzzle[selectedCell] = zeroBasedNum;
        gameState.selectedValue = zeroBasedNum;
        gameState.notes[selectedCell] = new Set();

        const row = Math.floor(selectedCell / 9);
        const col = selectedCell % 9;
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;

        for (let i = 0; i < 9; i++) {
            const rowIdx = row * 9 + i;
            if (gameState.notes[rowIdx]) gameState.notes[rowIdx].delete(num);

            const colIdx = i * 9 + col;
            if (gameState.notes[colIdx]) gameState.notes[colIdx].delete(num);
        }

        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                const idx = r * 9 + c;
                if (gameState.notes[idx]) gameState.notes[idx].delete(num);
            }
        }

        gameState.conflictSet = getConflictingCells(gameState.puzzle);
        gameState.selectedCell = null;
    }

    gameState.notes = sanitizeNotes(gameState.notes);
    games.set(gameId, gameState);

    // Use the helper function to safely convert notes to arrays
    const safeNotes = notesToArray(gameState.notes);
    await SudokuGame.updateOne(
        { gameId },
        {
            puzzle: gameState.puzzle,
            selectedCell: gameState.selectedCell,
            selectedValue: gameState.selectedValue,
            conflictSet: [...gameState.conflictSet],
            notes: safeNotes,
            pencilMode: gameState.pencilMode,
            lastUpdated: Date.now(),
            messageId: gameState.messageId
        }
    );

    const filledCells = gameState.puzzle.filter(n => n !== null).length;
    const percent = Math.floor((filledCells / 81) * 100);
    const fields = getTurnEmbedFields(gameState);
    const buffer = await drawSudokuGrid(gameState.puzzle, gameState.prefilledSet, gameState.theme, selectedCell, gameState.pencilMode ? null : gameState.selectedValue, gameState.selectedGrid, gameState.conflictSet, safeNotes, interaction.user.id);
    const attachment = new AttachmentBuilder(buffer, { name: 'sudoku.png' });

    const container = new ContainerBuilder()
        .addTextDisplayComponents(td =>
            td.setContent(
                `### ${gameId.startsWith('sudoku-daily-') ? 'Daily' : titleCase(gameState.theme)} Sudoku ∘ ${titleCase(gameState.difficulty)} [${percent}%]`
            )
        )
        .addMediaGalleryComponents(g =>
            g.addItems(new MediaGalleryItemBuilder().setURL(`attachment://${attachment.name}`))
        );

    if (gameState.mode === 'multi') {
        const turnInfo = fields.map(f => `${f.name}: ${f.value}`).join('\n');
        container
            .addSeparatorComponents(s => s)
            .addTextDisplayComponents(td => td.setContent(turnInfo));
    }

    if (filledCells === 81) {
        const isCorrect = prefilledCorrect(gameState.puzzle, gameState.prefilledSet, gameState.originalPuzzle) && isPuzzleValid(gameState.puzzle);
        if (isCorrect) {
            container.addSeparatorComponents(s => s);
            const { leveledUp, newLevel, xpGained, toastsGained, hintsGained } =
                await grantGameRewards(interaction.user.id, interaction.guild?.id);
            const hintText = hintsGained > 0 ? ` and ${hintsGained} Hint!` : "";

            if (leveledUp) {
                container.addTextDisplayComponents(td => td.setContent(`🎉 Congratulations, you leveled up to ${newLevel}, you gained ${toastsGained} ${emojis.toast}${hintText}`));
            } else {
                container.addTextDisplayComponents(td => td.setContent(`🎉 Congratulations, you gained ${xpGained} ${emojis.expadd} ${emojis.spacer} ${toastsGained} ${emojis.toast}${hintText}`));
            }

            let customThemesCompleted = 0;
            const allCustomThemes = ['faces', 'toastie', 'colourblind', 'animals', 'transport'];
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
                customThemesCompleted,
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
                notes: notesToArray(gameState.notes),
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
            const playerIds = gameState.mode === 'multi' && gameState.joinedPlayers?.length > 0
                ? gameState.joinedPlayers
                : [interaction.user.id];

            await Profile.updateMany(
                { userId: { $in: playerIds } },
                { $inc: { 'games.completed': 1 } }
            );

            if (gameState.mode === 'daily') {
                const today = new Date().toISOString().split('T')[0];
                await DailyCompletion.create({ userId: interaction.user.id, date: today });
            }

            return interaction.update({ components: [container], files: [finalAttachment] });
        } else {
            container.addSeparatorComponents(s => s);
            container.addTextDisplayComponents(td =>
                td.setContent(`${emojis.deny} The puzzle is not correct yet. Keep trying!`)
            );
        }
    }

    const buttonRows =
        gameState.selectedCell !== null
            ? createNumberButtons(gameState.theme, gameState.prefilledSet, gameState.puzzle, gameState.selectedCell, gameState.mode, gameState.pencilMode, gameState.joinedPlayers)
            : createCellButtons(gameState.theme, gameState.prefilledSet, gameState.puzzle, gameState.selectedGrid, gameState.mode, gameState.joinedPlayers);

    container
        .addSeparatorComponents(s => s)
        .addActionRowComponents(...buttonRows.filter(Boolean));

    return interaction.update({ components: [container], files: [attachment] });
};