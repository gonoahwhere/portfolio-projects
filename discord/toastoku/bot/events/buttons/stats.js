const { ContainerBuilder, MediaGalleryItemBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ActionRowBuilder } = require("discord.js");
const { titleCase, drawSudokuGrid } = require('../../commands/global/sudoku');
const UserGameHistory = require('../../../models/userGameHistory');
const pageMap = new Map();
const { MessageFlags } = require('discord-api-types/v10');

module.exports = async function handleStats(interaction) {
    if (!interaction.customId.startsWith('stats_command_')) return;
    if (interaction.user.id !== interaction.message.interaction?.user.id) {
        return interaction.reply({ content: "Only the original user can interact with this.", ephemeral: true });
    }

    let currentIndex = pageMap.get(interaction.user.id) ?? 0;
    const logFinishedGame = await UserGameHistory.find({ userId: interaction.user.id }).sort({ gameIndex: -1 }).limit(10);

    if (!logFinishedGame.length) return interaction.reply({ content: "No recent games found.", flags: MessageFlags.Ephemeral });

    if (interaction.customId === 'stats_command_prev') {
        currentIndex = Math.max(0, currentIndex - 1);
    }

    if (interaction.customId === 'stats_command_next') {
        currentIndex = Math.min(logFinishedGame.length - 1, currentIndex + 1);
    }

    pageMap.set(interaction.user.id, currentIndex);

    const game = logFinishedGame[currentIndex];
    const d = new Date(game.date);
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    let typeLabel;
    if (game.type === 'single') typeLabel = 'Singleplayer';
    else if (game.type === 'multi') typeLabel = 'Multiplayer';
    else if (game.type === 'daily') typeLabel = 'Daily';
    else typeLabel = 'Unknown';
    const theme = game.theme;
    const difficulty = game.difficulty;
    const status = game.completed ? 'Completed' : 'Ended Early';
    const filledCells = game.puzzle.filter(n => n !== null).length;
    const percent = Math.floor((filledCells / 81) * 100);
    const notes = game.notes.map(s => new Set(s));
    const prefilledSet = new Set(game.prefilledSet || []);
    const gameIndex = game.gameIndex;

    const buffer = await drawSudokuGrid(game.puzzle, prefilledSet, game.theme, null, null, null, new Set(), notes, interaction.user.id);
    const attachment = new AttachmentBuilder(buffer, { name: 'sudoku.png' });

    const prevStatsButton = new ButtonBuilder()
        .setCustomId('stats_command_prev')
        .setLabel('⬅️ Prev')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentIndex === 0);

    const pageStatsButton = new ButtonBuilder()
        .setCustomId('stats_command_page')
        .setLabel(`${currentIndex + 1}/${logFinishedGame.length}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextStatsButton = new ButtonBuilder()
        .setCustomId('stats_command_next')
        .setLabel('Next ➡️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentIndex === logFinishedGame.length - 1);

    const container = new ContainerBuilder()
        .addTextDisplayComponents(td => td.setContent(`### ${interaction.user.username}'s Stats [#${currentIndex + 1}]`))
        .addMediaGalleryComponents(g => g.addItems( new MediaGalleryItemBuilder().setURL('attachment://sudoku.png')))
        .addSeparatorComponents(s => s)
        .addTextDisplayComponents(td => td.setContent(`Status: ${status}\nType: ${titleCase(typeLabel)}\nDifficulty: ${titleCase(difficulty)}\nTheme: ${titleCase(theme)}\nPercent Complete: ${percent}%\nDate: ${date}`))
        .addSeparatorComponents(s => s)
        .addActionRowComponents(new ActionRowBuilder().addComponents(prevStatsButton, pageStatsButton, nextStatsButton));

    await interaction.update({ components: [container], files: [attachment] });
}