const { StringSelectMenuBuilder, ContainerBuilder, ActionRowBuilder } = require("discord.js");
const { MessageFlags } = require('discord-api-types/v10');
const mongoose = require('mongoose');
const Profile = require('../../../models/userProfile');
const BigNumber = require('bignumber.js');

module.exports = async function handleLeaderboardMenu(interaction) {
    if (interaction.customId !== 'toastoku_leaderboard_menu') return;
    if (interaction.user.id !== interaction.message.interaction?.user.id) {
        return interaction.reply({ content: "Only the original user can interact with this menu.", flags: MessageFlags.Ephemeral });
    }
    
    const selectMenuRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('toastoku_leaderboard_menu')
            .setPlaceholder('Select a category...')
            .addOptions([
                { label: '🍞 Current Toasts', value: 'current_toasts_menu' },
                { label: '🍞 Spent Toasts', value: 'spent_toasts_menu' },
                { label: '🍞 Total Toasts', value: 'total_toasts_menu' },
                { label: '🏆 Ranks', value: 'ranks_menu' },
                { label: '🎮 Games', value: 'games_toastoku_menu' },
                { label: '⭐ Votes', value: 'votes_toastoku_menu' },
            ])
    );
    
    const suffixes = [
        "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc",
        "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod", "Vg",
        "Uvg", "Dvg", "Tvg", "Qavg", "Qivg", "Sxvg", "Spvg", "Ocv", "Novg", "Tg"
    ];

    function formatValue(num) {
        num = new BigNumber(num);
        if (num.isLessThan(1000)) return num.toString();

        const expStr = num.toExponential(2);
        const [mantissa, exponent] = expStr.split('e');
        const exp = Math.floor(parseInt(exponent) / 3);
        const suffix = suffixes[exp] || 'e' + (exp * 3);
        const divisor = new BigNumber(1000).pow(exp);
        return num.div(divisor).toFixed(2) + suffix;
    }

    async function generateLeaderboard(interaction, fieldName, displayLabel, valueFn) {
        const allUsers = await Profile.find({});
        const userStats = await Promise.all(allUsers.map(async user => {
            const value = valueFn
                ? valueFn(user)
                : new BigNumber(fieldName.split('.').reduce((obj, key) => obj?.[key], user) || 0);

            const discordUser = await interaction.client.users.fetch(user.userId).catch(() => null);
            const name = user.anonymous
                ? (user.anonymousName || "Anonymous")
                : (discordUser?.username || "Unknown User");

            return { id: user.userId, displayName: name, value };
        }));

        const nonZeroUsers = userStats.filter(u => u.value.gt(0));
        const sortedUsers = nonZeroUsers.sort((a, b) => b.value.comparedTo(a.value));
        const topUsers = sortedUsers.slice(0, 10);

        const rankListEntries = topUsers.map((u, i) => {
            const badges = ['<:gold:1433482397852373043>', '<:silver:1433482400213500076>', '<:bronze:1433482399005675580>',
                '<:04:1425263805423681758>', '<:05:1425263814693224448>', '<:06:1425263828698136757>',
                '<:07:1425263837992452248>', '<:08:1425263847991803944>',
                '<:09:1425263866933285026>', '<:10:1425263875905032274>'
            ];
            const badge = badges[i] || `${i + 1}`;
            return `${badge} \`${u.displayName}\` : \`${formatValue(u.value)}\``;
        });

        const userEntry = sortedUsers.find(u => u.id === interaction.user.id);
        const userIndex = sortedUsers.findIndex(u => u.id === interaction.user.id);
        const userRank = userIndex >= 0 ? userIndex + 1 : "Unranked";
        const userValue = userEntry ? userEntry.value.toString() : "0";

        return { rankListEntries, userRank, userValue, displayLabel };
    }

    let fieldName, lb;
    switch (interaction.values[0]) {
        case 'current_toasts_menu':
            fieldName = "balance.currentToasts";
            lb = await generateLeaderboard(interaction, fieldName, "Current Toasts");
            break;
        case 'spent_toasts_menu':
            fieldName = "balance.spentToasts";
            lb = await generateLeaderboard(interaction, fieldName, "Spent Toasts");
            break;
        case 'total_toasts_menu':
            fieldName = "balance.totalToasts";
            lb = await generateLeaderboard(
                interaction,
                fieldName,
                "All Time Toasts",
                (user) => new BigNumber(user.balance?.currentToasts || 0).plus(user.balance?.spentToasts || 0)
            );
            break;
        case 'ranks_menu':
            fieldName = "rank.level";
            lb = await generateLeaderboard(interaction, fieldName, "Levels");
            break;
        case 'votes_toastoku_menu':
            fieldName = "misc.votes";
            lb = await generateLeaderboard(interaction, fieldName, "Vote Points");
            break;
        case 'games_toastoku_menu':
            fieldName = "misc.gamesPlayed";
            lb = await generateLeaderboard(interaction, fieldName, "Games Played");
            break;
        default:
            return;
    }

    const leaderboardLabels = {
        "balance.currentToasts": {
            unranked: "-# You haven't earned any Toasts yet! 😢",
            ranked: (rank, value) => `-# You're ranked ${rank} with ${formatValue(value)} Toasts`
        },
        "balance.spentToasts": {
            unranked: "-# You haven't spent any Toasts yet! 😢",
            ranked: (rank, value) => `-# You're ranked ${rank} with ${formatValue(value)} Spent Toasts`
        },
        "balance.totalToasts": {
            unranked: "-# You haven't earned/spent any Toasts yet! 😢",
            ranked: (rank, value) => `-# You're ranked ${rank} with ${formatValue(value)} All Time Toasts`
        },
        "rank.level": {
            unranked: "-# You haven't leveled up yet! 😢",
            ranked: (rank, value) => `-# You're ranked ${rank} at level ${formatValue(value)}`
        },
        "misc.gamesPlayed": {
            unranked: "-# You haven't played any games yet! 😢",
            ranked: (rank, value) => `-# You're ranked ${rank} with ${formatValue(value)} Games Played`
        },
        "misc.votes": {
            unranked: "-# You haven't started voting yet! 😢",
            ranked: (rank, value) => `-# You're ranked ${rank} with ${formatValue(value)} Vote Points`
        },
    };

    const labels = leaderboardLabels[fieldName];
    const label = lb.userRank === "Unranked" ? labels.unranked : labels.ranked(lb.userRank, lb.userValue);

    const container = new ContainerBuilder()
        .addTextDisplayComponents(td => td.setContent(`### 🏆 Toastoku Leaderboards – ${lb.displayLabel}`))
        .addTextDisplayComponents(td => td.setContent(lb.rankListEntries.join("\n") || "No members found 😢"))
        .addSeparatorComponents(s => s)
        .addTextDisplayComponents(td => td.setContent(label))
        .addSeparatorComponents(s => s)
        .addActionRowComponents(selectMenuRow);

    return interaction.update({ components: [container] });
};
