const { SlashCommandBuilder, ContainerBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const mongoose = require('mongoose');
const Profile = require('../../../models/userProfile');
const Settings = require('../../../models/userSettings');
const BigNumber = require('bignumber.js');
const { generateGamertag } = require('gamertag-forge');
const { totalXpForLevel } = require('../../../utils/xpManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your bot\'s profile!')
        .addStringOption(opt => 
            opt
                .setName('section')
                .setDescription('Choose which section to view')
                .setRequired(true)
                .addChoices(
                    { name: 'Toasts', value: 'toasts' },
                    { name: 'Gameplay', value: 'gameplay' },
                    { name: 'Level', value: 'level' },
                    { name: 'Miscellaneous', value: 'misc' },
                    { name: 'Privacy', value: 'privacy' },
                )
        ),

    async execute(interaction) {
        const section = interaction.options.getString('section');
        let targetUser = interaction.user;

        let support_team = ['372456601266683914', '794323707115470928', '661200758510977084', '269904947578011649', '555652788592443392'];
        let bot_devs = ['372456601266683914', '794323707115470928', '661200758510977084', '269904947578011649', '555652788592443392'];
        let bot_owner = '372456601266683914';

        let badgeEmojis = {
            support: '<:bot_support:1419317266377605251>',
            dev: '<:bot_dev:1419317276527824896>',
            owner: '<:bot_owner:1419317289198551202>',
        }

        let badges = [];
        if (targetUser.id === bot_owner) badges.push('owner');
        if (bot_devs.includes(targetUser.id)) badges.push('dev');
        if (support_team.includes(targetUser.id)) badges.push('support');
        let profileData = await Profile.findOne({ userId: targetUser.id });
        let settingData = await Settings.findOne({ userId: targetUser.id });

        if (!settingData) {
            let anonymousName;
            const MAX_ATTEMPTS = 50;
            let attempts = 0;

            while (attempts < MAX_ATTEMPTS) {
                anonymousName = generateGamertag({ style: 'bakery', minNumber: 0, maxNumber: 999999 });

                if (!anonymousName) {
                    attempts++
                    continue;
                }

                const exists = await Settings.findOne({ anonymousName });
                if (!exists) break;
                attempts++
            }

            if (!anonymousName) {
                let fallbackUnique = false;
                let fallbackAttempts = 0;

                while (!fallbackUnique && fallbackAttempts < 100) {
                    anonymousName = `Anonymous${Math.floor(Math.random() * 1000000)}`
                    const exists = await Profile.findOne({ anonymousName });
                    if (!exists) fallbackUnique = true;
                    fallbackAttempts++
                }
            }

            settingData = new Profile({
                _id: new mongoose.Types.ObjectId(),
                userId: targetUser.id,
                anonymousName,
                anonymous: false,
            });

            await settingData.save();
        }

        const anony = settingData.anonymous ?? false;
        await interaction.deferReply({ flags: anony ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral : MessageFlags.IsComponentsV2 });

        let displayBadges = badges.map(id => badgeEmojis[id]).join('  ') || '`No roles to display.`';
        let suffixes = [
            "", "K", "M", "B", "T", 
            "Qa", "Qi", "Sx", "Sp", "Oc", 
            "No", "Dc", "Ud", "Dd", "Td", 
            "Qad", "Qid", "Sxd", "Spd", "Ocd", 
            "Nod", "Vg", "Uvg", "Dvg", "Tvg", 
            "Qavg", "Qivg", "Sxvg", "Spvg", "Ocv", 
            "Novg", "Tg"
        ];

        function formatValue(num) {
            num = new BigNumber(num);
            if (num.isLessThan(1000)) return num.toString();
            let expStr = num.toExponential(2);
            let [mantissa, exponent] = expStr.split('e');
            let exp = Math.floor(parseInt(exponent) / 3);
            let suffix = suffixes[exp] || "e" + (exp * 3);
            let divisor = new BigNumber(1000).pow(exp);
            return num.div(divisor).toFixed(2) + suffix;
        }

        let hints = new BigNumber(profileData.misc.hints || "0");
        let dailyHints = new BigNumber(profileData.misc.dailyHints || "0");
        let gamesPlayed = new BigNumber(profileData.misc.gamesPlayed || "0");
        let boosters = new BigNumber(profileData.misc.boosters || "0");
        let currentToasts = new BigNumber(profileData.balance.currentToasts || "0");
        let spentToasts = new BigNumber(profileData.balance.spentToasts || "0");
        let totalToasts = currentToasts.plus(spentToasts);
        let votes = new BigNumber(profileData.misc.votes || "0");
        let commandsUsed = profileData.commandsUsed || 0;
        let gamesAbandoned = profileData.games.abandoned || 0;
        let gamesCompleted = profileData.games.completed || 0;
        let questsCompleted = profileData.questsCompleted || 0;
        let displayAnony = `\`${anony ? "True" : "False"}\``;
        let aliasLine = anony ? `-# • Display Name: \`${settingData.anonymousName}\`\n` : "";
        let exp = new BigNumber(profileData.rank.exp || "0");
        let computedLevel = 0;
        
        while(exp.gte(totalXpForLevel(computedLevel + 1))) {
            computedLevel++;
        }

        let level = computedLevel.toString();

        // Get user's rank by level
        let userRank = 'Unranked';
        try {
            const allUsers = await Profile.find({}).lean();
            const sorted = allUsers
                .map(u => ({ userId: u.userId, level: new BigNumber(u.rank?.level || 0) }))
                .filter(u => u.level.gt(0))
                .sort((a, b) => b.level.comparedTo(a.level));

            const rankIndex = sorted.findIndex(u => u.userId === targetUser.id);
            if (rankIndex >= 0) userRank = `#${rankIndex + 1}`;
        } catch {
            userRank = 'Unranked';
        }

        const sections = {
            toasts: () => 
                `-# • Current: \`${formatValue(currentToasts)}\`\n` +
                `-# • Spent: \`${formatValue(spentToasts)}\`\n` +
                `-# • Total: \`${formatValue(totalToasts)}\``,

            gameplay: () =>
                `-# • Games Played: \`${formatValue(gamesPlayed)}\`\n` +
                `-# • Games Completed: \`${formatValue(gamesCompleted)}\`\n` +
                `-# • Games Abandoned: \`${formatValue(gamesAbandoned)}\`\n` +
                `-# • Quests Completed: \`${formatValue(questsCompleted)}\`\n` +
                `-# • Bonus Hints: \`${formatValue(hints)}\`\n` +
                `-# • Daily Hints: \`${formatValue(dailyHints)}\``,

            level: () =>
                `-# • Rank: \`${userRank}\`\n` +
                `-# • Level: \`${level}\`\n` +
                `-# • Exp: \`${formatValue(exp)}\``,

            misc: () =>
                `-# • Commands Used: \`${formatValue(commandsUsed)}\`\n` +
                `-# • Boosters: \`${formatValue(boosters)}\`\n` +
                `-# • Votes: \`${formatValue(votes)}\`\n` +
                `-# • Roles: ${displayBadges}`,

            privacy: () =>
                `-# • Anonymous: ${displayAnony}\n` +
                `${aliasLine}`
        };

        const sectionTitles = {
            toasts: 'Toasts',
            gameplay: 'Gameplay',
            level: 'Level',
            misc: 'Miscellaneous',
            privacy: 'Privacy',
        };

        const container = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent(`### 🍞 **Toastoku Profile** – ${sectionTitles[section]}`))
            .addTextDisplayComponents(td => td.setContent(`-# **Discover how golden your own loaf of genius is.**`))
            .addSeparatorComponents(s => s)
            .addTextDisplayComponents(td => td.setContent(sections[section]()))
            .addSeparatorComponents(s => s)
            .addTextDisplayComponents(td => td.setContent(`-# *All stats are updated regularly. Keep loafing! 🍞*`));

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
}