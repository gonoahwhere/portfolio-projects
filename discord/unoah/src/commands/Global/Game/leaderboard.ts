import { ChatInputCommandInteraction, SlashCommandBuilder, AttachmentBuilder, MessageFlags } from 'discord.js';
import type { BotClient } from '../../../types/Client.js';
import { GuildUserStats } from '../../../models/leaderboard.js';
import { GuildInfo } from '../../../models/guildInfo.js';
import ServerSettings from '../../../models/serverSettings.js';
import type { LeaderboardUser, LeaderboardGuild } from '../../../types/leaderboard.js';
import { renderGuildLeaderboard, renderGlobalLeaderboard } from '../../../utils/renderLeaderboard.js';
import { updateUserAvatar, updateGuildIcon } from '../../../utils/captureAvatars.js';

export default {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View guild or global leaderboards')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Which leaderboard to view')
                .setRequired(true)
                .addChoices(
                    { name: 'Guild', value: 'guild' },
                    { name: 'Global', value: 'global' }
                )
        ),

    async execute(interaction: ChatInputCommandInteraction, bot: BotClient) {
        if (!interaction.guildId) {
            return interaction.reply({
                content: 'This command must be used in a server.',
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply();

        const type = interaction.options.getString('type');

        try {
            if (type === 'guild') {
                await handleGuildLeaderboard(interaction, bot);
            } else {
                await handleGlobalLeaderboard(interaction, bot);
            }
        } catch (error) {
            console.error('Leaderboard command error:', error);
            await interaction.editReply({
                content: 'Something went wrong rendering the leaderboard.',
            });
        }
    },
};

// /leaderboard type:guild — user leaderboard, scoped to THIS guild only
async function handleGuildLeaderboard(interaction: ChatInputCommandInteraction, bot: BotClient) {
    const guildId = interaction.guildId!;
    const guild = interaction.guild!;

    await updateGuildIcon(guild);

    const users = await GuildUserStats.find({ guildId, wins: { $gt: 0 } }).lean();

    if (users.length === 0) {
        return await interaction.editReply({
            content: 'No wins recorded in this server yet.',
        });
    }

    const sortedUsers: LeaderboardUser[] = await Promise.all(
        users
            .sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0))
            .slice(0, 10)
            .map(async (user) => {
                const obj: LeaderboardUser = {
                    userId: user.userId,
                    username: user.username,
                    wins: user.wins ?? 0,
                };

                try {
                    const discordUser = await interaction.client.users.fetch(user.userId);
                    await updateUserAvatar(discordUser);
                    const avatarHash = discordUser.avatar;

                    obj.avatarUrl = avatarHash ? `https://cdn.discordapp.com/avatars/${user.userId}/${avatarHash}.${avatarHash.startsWith('a_') ? 'gif' : 'png'}?size=256` : bot.user!.displayAvatarURL({ extension: "png", size: 256 });
                } catch (error) {
                    console.error(`Failed to fetch user ${user.userId}:`, error);
                }

                return obj;
            })
    );

    const buffer = await renderGuildLeaderboard(guild.name, guildId, sortedUsers);
    const attachment = new AttachmentBuilder(buffer, { name: 'guild-leaderboard.png' });
    await interaction.editReply({ files: [attachment] });
}

// /leaderboard type:global — total wins per server, summed across that server's users, opted-in servers only
async function handleGlobalLeaderboard(interaction: ChatInputCommandInteraction, bot: BotClient) {
    const optedInServers = await ServerSettings.find({ lb: true }).lean();

    if (optedInServers.length === 0) {
        return await interaction.editReply({
            content: 'No servers have opted into the global leaderboard yet.',
        });
    }

    const guildIds = optedInServers.map(s => s.guildId);

    const totals = await GuildUserStats.aggregate([
        { $match: { guildId: { $in: guildIds } } },
        { $group: { _id: '$guildId', totalWins: { $sum: '$wins' } } },
        { $match: { totalWins: { $gt: 0 } } },
        { $sort: { totalWins: -1 } },
        { $limit: 10 },
    ]);

    if (totals.length === 0) {
        return await interaction.editReply({
            content: 'No wins recorded yet among servers with global leaderboard enabled.',
        });
    }

    const rankedGuildIds = totals.map(t => t._id as string);
    const guildInfos = await GuildInfo.find({ guildId: { $in: rankedGuildIds } }).lean();
    const infoMap = new Map(guildInfos.map(g => [g.guildId, g]));

    const guilds: LeaderboardGuild[] = await Promise.all(
        totals.map(async (stat) => {
            const guildId = stat._id as string;
            const info = infoMap.get(guildId);

            const obj: LeaderboardGuild = {
                guildId,
                guildName: info?.guildName ?? 'Unknown Guild',
                totalWins: stat.totalWins ?? 0,
            };

            try {
                const discordGuild = await interaction.client.guilds.fetch(guildId);

                obj.iconUrl = discordGuild.iconURL({
                    extension: 'png',
                    size: 512,
                }) ?? bot.user!.displayAvatarURL({
                    extension: 'png',
                    size: 512,
                });

            } catch {
                obj.iconUrl = bot.user!.displayAvatarURL({
                    extension: 'png',
                    size: 512,
                });
            }

            return obj;
        })
    );

    const buffer = await renderGlobalLeaderboard(guilds, bot.user!.displayAvatarURL({ extension: "png", size: 512 }));
    const attachment = new AttachmentBuilder(buffer, { name: 'global-leaderboard.png' });
    await interaction.editReply({ files: [attachment] });
}