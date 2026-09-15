const { SlashCommandBuilder, ContainerBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const mongoose = require('mongoose');
const Profile = require('../../../models/userProfile');
const Settings = require('../../../models/userSettings');
const BigNumber = require('bignumber.js');
const { execute } = require('./sudoku');

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
    const allUsers = await Profile.find({}).lean();

    const usersWithValues = allUsers
        .map(user => ({ user, value: valueFn ? valueFn(user) : new BigNumber(fieldName.split('.').reduce((obj, key) => obj?.[key], user) || 0) }))
        .filter(({ value }) => value.gt(0))
        .sort((a, b) => b.value.comparedTo(a.value));

    const topUsers = usersWithValues.slice(0, 10);

    const rankListEntries = await Promise.all(topUsers.map(async ({ user, value }, i) => {
        const badges = [
            '<:gold:1432118464922914959>', '<:silver:1432118468437610667>', '<:bronze:1432118466181206121>',
            '<:04:1419330898553471006>', '<:05:1419330887396626432>', '<:06:1419330873798688909>',
            '<:07:1419330861329027154>', '<:08:1419330851849900154>',
            '<:09:1419330843515687074>', '<:10:1419330835135463455>'
        ];

        let name;
        if (user.anonymous) {
            name = user.anonymousName || 'Anonymous';
        } else {
            const discordUser = interaction.client.users.cache.get(user.userId) ?? await interaction.client.users.fetch(user.userId).catch(() => null);
            name = discordUser?.username || 'Unknown User';
        }

        return `${badges[i]} \`${name}\` : \`${formatValue(value)}\``;
    }));

    const userIndex = usersWithValues.findIndex(({ user }) => user.userId === interaction.user.id);
    const userRank = userIndex >= 0 ? userIndex + 1 : "Unranked";
    const userValue = userIndex >= 0 ? usersWithValues[userIndex].value.toString() : "0";

    return { rankListEntries, userRank, userValue, displayLabel };
}

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the richest users across Toastoku!')
        .addStringOption(opt => 
            opt
                .setName('board')
                .setDescription('Choose the leaderboard you want to view')
                .setRequired(true)
                .addChoices(
                    { name: 'Current Toasts', value: 'currentToasts' },
                    { name: 'Spent Toasts', value: 'spentToasts' },
                    { name: 'Earned Toasts', value: 'earnedToasts' },
                    { name: 'Level', value: 'level' },
                    { name: 'Games Played', value: 'gamesPlayed' },
                    { name: 'Votes', value: 'votes' },
                    { name: 'Hints', value: 'hints' },
                    { name: 'Commands Used', value: 'commandsUsed' },
                )
        ),
    
    async execute(interaction) {
        const board = interaction.options.getString('board');
        if (!board) return;

        const userProfile = await Profile.findOne({ userId: interaction.user.id }).lean();
        const userSetting = await Settings.findOne({ userId: interaction.user.id }).lean();
        const isAnonymous = userSetting?.anonymous ?? false;

        await interaction.deferReply({ flags: isAnonymous ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral : MessageFlags.IsComponentsV2 });

        let fieldName;
        let lb;

        switch (board) {
            case 'currentToasts':
                fieldName = 'balance.currentToasts';
                lb = await generateLeaderboard(interaction, fieldName, "Current Toasts");
                break;
            case 'spentToasts':
                fieldName = 'balance.spentToasts';
                lb = await generateLeaderboard(interaction, fieldName, "Spent Toasts");
                break;
            case 'earnedToasts':
                fieldName = 'balance.totalToasts';
                lb = await generateLeaderboard(interaction, fieldName, "Total Toasts", (user) => new BigNumber(user.balance?.currentToasts || 0).plus(user.balance?.spentToasts || 0));
                break;
            case 'level':
                fieldName = 'rank.level';
                lb = await generateLeaderboard(interaction, fieldName, "Level");
                break;
            case 'gamesPlayed':
                fieldName = 'misc.gamesPlayed';
                lb = await generateLeaderboard(interaction, fieldName, "Games Played");
                break;
            case 'votes':
                fieldName = 'misc.votes';
                lb = await generateLeaderboard(interaction, fieldName, "Votes");
                break;
            case 'hints':
                fieldName = 'misc.hints';
                lb = await generateLeaderboard(interaction, fieldName, "Bonus Hints");
                break;
            case 'commandsUsed':
                fieldName = 'commandsUsed';
                lb = await generateLeaderboard(interaction, fieldName, "Commands Used");
                break;
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
            "misc.hints": {
                unranked: "-# You haven't started gaining hints yet! 😢",
                ranked: (rank, value) => `-# You're ranked ${rank} with ${formatValue(value)} Bonus Hints`
            }, 
            "commandsUsed": {
                unranked: "-# You haven't started using commands yet! 😢",
                ranked: (rank, value) => `-# You're ranked ${rank} with ${formatValue(value)} Commands Used`
            }, 
        };

        const labels = leaderboardLabels[fieldName];
        const label = lb.userRank === 'Unranked' ? labels.unranked : labels.ranked(lb.userRank, lb.userValue);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent(`### 🏆 Toastoku Leaderboards – ${lb.displayLabel}`))
            .addTextDisplayComponents(td => td.setContent(lb.rankListEntries.join("\n") || "No members found 😢"))
            .addSeparatorComponents(s => s)
            .addTextDisplayComponents(td => td.setContent(label));
            
        return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 })
    }
}