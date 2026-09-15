import { User, Guild } from 'discord.js';
import { GuildUserStats } from '../models/leaderboard.js';
import GuildInfo from "../models/guildInfo.js";

export async function updateUserAvatar(user: User): Promise<void> {
    try {
        await GuildUserStats.findOneAndUpdate(
            { userId: user.id },
            { avatar: user.avatar || undefined },
            { upsert: true }
        );
    } catch (error) {
        console.error(`Failed to update avatar for user ${user.id}:`, error);
    }
}

export async function updateGuildIcon(guild: Guild): Promise<void> {
    try {
        await GuildInfo.findOneAndUpdate(
            { guildId: guild.id },
            { icon: guild.icon || undefined },
            { upsert: true }
        );
    } catch (error) {
        console.error(`Failed to update icon for guild ${guild.id}:`, error);
    }
}