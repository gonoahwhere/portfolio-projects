const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { MessageFlags } = require('discord-api-types/v10');
const Profile = require('../../../models/userProfile');
const Settings = require('../../../models/userSettings');
const mongoose = require('mongoose');
const BigNumber = require('bignumber.js');
const { LevelingSystem, RankCardBuilder } = require('xp-flow');
const { totalXpForLevel } = require('../../../utils/xpManager');

function getStatusColour(status) {
    switch (status) {
        case 'online':
            return '#43B581';
        case 'idle':
            return '#FAA61A';
        case 'dnd':
            return '#F04747';
        case 'offline':
        case 'invisible':
            return '#757575';
        case 'mobile':
            return '#2D9C7D';
        default:
            return '#757575'
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('View your rank card for Toastoku!')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Select a user to view their rank card')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        let dbConfig = { type: 'mongodb', uri: process.env.MongoURI };
        let targetUser = interaction.options.getUser('user') || interaction.user;
        let profileData = await Profile.findOne({ userId: targetUser.id });
        let settingData = await Settings.findOne({ userId: targetUser.id });

        if (!profileData) {
            return interaction.reply({ content: `No profile data found for ${targetUser.username}`, flags: MessageFlags.Ephemeral })
        }

        let exp = new BigNumber(profileData.rank.exp || "0");
        let anony = settingData.anonymous || false;
        const allProfiles = await Profile.find({}).lean();

        const sortedProfiles = allProfiles
            .map(p => ({ userId: p.userId, exp: new BigNumber(p.rank?.exp || "0") }))
            .sort((a, b) => b.exp.comparedTo(a.exp));

        const userRank = sortedProfiles.findIndex(p => p.userId === targetUser.id) + 1;

        let computedLevel = 0;
        while (exp.gte(totalXpForLevel(computedLevel + 1))) {
            computedLevel++;
        }

        profileData.rank.level = computedLevel.toString();
        await profileData.save();

        let xpForCurrentLevel = totalXpForLevel(computedLevel);
        let xpForNextLevel = totalXpForLevel(computedLevel + 1);
        let progressBN = exp.minus(xpForCurrentLevel);
        let neededBN = xpForNextLevel.minus(xpForCurrentLevel);
        let MAX_SAFE_XP = new BigNumber('1e93');
        let progressSafe = BigNumber.min(progressBN, MAX_SAFE_XP);
        let neededSafe = BigNumber.min(neededBN, MAX_SAFE_XP);

        let leveling = new LevelingSystem({ database: dbConfig });
        let presenceStatus = 'offline';

        try {
            const member = await interaction.guild.members.fetch({
                user: targetUser.id,
                force: false
            });
            
            if (member?.presence?.status) {
                presenceStatus = member.presence.status;
            }
        } catch (err) {
            console.error(`Failed to fetch presence data for ${targetUser.username}:`, err);
        }

        const statusColour = getStatusColour(presenceStatus);

        let card = new RankCardBuilder({
            username: targetUser.username,
            avatarUrl: targetUser.displayAvatarURL({ extension: 'png' }),
        })

        .setLevel(computedLevel)
        .setRank(userRank)
        .setCurrentXp(progressSafe.toNumber())
        .setRequiredXp(neededSafe.toNumber())
        .setBackgroundColor('#2a2e35')
        .setXpBarColor('#FFB703')
        .setStatus(presenceStatus);

        let imageBuffer = await leveling.createRankCard(card);
        let attachment = new AttachmentBuilder(imageBuffer, { name: 'rank-card.png' });

        if (targetUser.id === interaction.user.id && anony) {
            return interaction.reply({
                content: `Here is your rank card ${interaction.user.username}!`,
                files: [attachment],
                flags: MessageFlags.Ephemeral,
            });
        }

        if (targetUser.id !== interaction.user.id && anony) {
            return interaction.reply({
                content: `Sorry, you cannot view the rank card of ${targetUser.username} because they are anonymous.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        return interaction.reply({
            content: `Here is the rank card for ${targetUser.username}!`,
            files: [attachment],
        });
    }
}