import GuildInfo from '../../models/guildInfo.js';
import { ContainerBuilder } from 'discord.js';
import { MessageFlags } from 'discord-api-types/v10';
import { stripIndents } from 'common-tags';
import topggManager from '../../utils/topgg-stats.js';
import { syncCommandStats } from '../../utils/commandStats.js';

import type { Guild, TextChannel } from 'discord.js';
import type { BotClient } from "../../types/Client.js";

export default {
    name: 'guildDelete',

    async execute(guild: Guild) {
        const client = guild.client;

        let ownerTag = 'Unknown';

        try {
            const owner = await client.users.fetch(guild.ownerId);
            ownerTag = owner.tag;
        } catch {
            // ignore
        }

        const saved = await GuildInfo.findOne({ guildId: guild.id });

        if (!saved) return;

        const guildName = saved.guildName || guild.name || 'Unknown Guild';
        const ownerId = saved.ownerId || guild.ownerId || 'Unknown ID';
        const finalOwnerTag = ownerTag !== 'Unknown User' ? ownerTag : saved.ownerTag || 'Unknown User';

        await GuildInfo.deleteOne({ guildId: guild.id });
        await syncCommandStats(client as BotClient);

        const totalGuilds = client.guilds.cache.size;
        const totalMembers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount ?? 0), 0);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent('### 📜 UNOAH ∘ Removed from Guild'))
            .addSeparatorComponents(s => s)
            .addTextDisplayComponents(td =>
                td.setContent(stripIndents`
                    ∘ **Server Name:** ${guildName}
                    ∘ **Server ID:** ${guild.id}
                    ∘ **Owner:** ${finalOwnerTag} (${ownerId})
                `)
            )
            .addSeparatorComponents(s => s)
            .addTextDisplayComponents(td => td.setContent(`-# ${totalGuilds} Guilds ∘ ${totalMembers.toLocaleString()} Members`));

        const logChannel = client.channels.cache.get('1514674817771503656');

        if (logChannel?.isTextBased()) {
            await (logChannel as TextChannel).send({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        topggManager.scheduleUpdate(client);
    },
};