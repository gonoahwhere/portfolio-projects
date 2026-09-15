import GuildInfo from '../models/guildInfo.js';
import type { Client } from 'discord.js';

export async function backfillGuildInfo(client: Client) {
    console.log(`[backfill] starting for ${client.guilds.cache.size} guilds...`);

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const guild of client.guilds.cache.values()) {
        try {
            let ownerTag = 'Unknown';
            try {
                const owner = await client.users.fetch(guild.ownerId);
                ownerTag = owner.tag;
            } catch {
                // ignore
            }

            const existing = await GuildInfo.findOne({ guildId: guild.id });

            await GuildInfo.findOneAndUpdate(
                { guildId: guild.id },
                {
                    guildId: guild.id,
                    guildName: guild.name,
                    ownerId: guild.ownerId,
                    ownerTag,
                    icon: guild.iconURL() ?? undefined,
                    banner: guild.bannerURL({ size: 1024 }) ?? undefined,
                    memberCount: guild.memberCount,
                },
                { upsert: true }
            );

            existing ? updated++ : created++;
        } catch (err) {
            failed++;
            console.error(`[backfill] failed for guild ${guild.id}:`, err);
        }
    }

    console.log(`[backfill] done. created=${created} updated=${updated} failed=${failed}`);
}