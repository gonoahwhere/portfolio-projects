import GuildInfo from '../../models/guildInfo.js';
import { ContainerBuilder } from 'discord.js';
import { MessageFlags } from 'discord-api-types/v10';
import { stripIndents } from 'common-tags';
import topggManager from '../../utils/topgg-stats.js';
import { syncCommandStats } from '../../utils/commandStats.js';

import type { Guild, TextChannel } from 'discord.js';
import type { BotClient } from "../../types/Client.js";

export default {
    name: 'guildCreate',

    async execute(guild: Guild) {
        const client = guild.client;

        let ownerTag = 'Unknown';

        try {
            const owner = await client.users.fetch(guild.ownerId);
            ownerTag = owner.tag;
        } catch {
            // ignore
        }

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
            {
                upsert: true,
                returnDocument: 'after',
            }
        );

        await syncCommandStats(client as BotClient);

        const totalGuilds = client.guilds.cache.size;
        const totalMembers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount ?? 0), 0);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent('### 📜 UNOAH ∘ Added to Guild'))
            .addSeparatorComponents(s => s)
            .addTextDisplayComponents(td =>
                td.setContent(stripIndents`
                    ∘ **Server Name:** ${guild.name}
                    ∘ **Server ID:** ${guild.id}
                    ∘ **Owner:** ${ownerTag} (${guild.ownerId})
                `)
            )
            .addSeparatorComponents(s => s)
            .addTextDisplayComponents(td => td.setContent(`-# ${totalGuilds} Guilds ∘ ${totalMembers.toLocaleString()} Members`));

        const logChannel = client.channels.cache.get('1514674570747973772');

        if (logChannel?.isTextBased()) {
            await (logChannel as TextChannel).send({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        topggManager.scheduleUpdate(client);
    },
};