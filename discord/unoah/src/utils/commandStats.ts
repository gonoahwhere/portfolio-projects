import CommandStats from '../models/commandStats.js';
import type { BotClient } from '../types/Client.js';

export async function incrementCommandCount(): Promise<void> {
    try {
        await CommandStats.findOneAndUpdate(
            { name: 'command_stats_unoah' },
            { $inc: { commandCount: 1 } },
            { upsert: true, setDefaultsOnInsert: true }
        );
    } catch (err) {
        console.error('[COMMAND STATS] Failed to increment commandCount:', err);
    }
}

export async function syncCommandStats(bot: BotClient): Promise<void> {
    try {
        const guildCount = bot.guilds.cache.size;

        const userCount = bot.guilds.cache.reduce(
            (acc, g) => acc + (g.memberCount ?? 0),
            0
        );

        const slashCount =
            (bot.guildCommands?.size ?? 0) + (bot.globalCommands?.size ?? 0);

        await CommandStats.findOneAndUpdate(
            { name: 'command_stats_unoah' },
            { guildCount, userCount, slashCount },
            { upsert: true, setDefaultsOnInsert: true }
        );
    } catch (err) {
        console.error('[COMMAND STATS] Failed to sync stats:', err);
    }
}