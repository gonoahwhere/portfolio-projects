import { Api } from '@top-gg/sdk';
import fl from 'fluident';
import type { Client } from 'discord.js';

const api = new Api(process.env.TOPGG_TOKEN!);
let timeout: NodeJS.Timeout | null = null;

export default {
    scheduleUpdate(client: Client) {
        // clear any pending update
        if (timeout) clearTimeout(timeout);

        // wait 60 seconds after last change
        timeout = setTimeout( async () => {
            try {
                await api.postStats({
                    serverCount: client.guilds.cache.size,
                });

                console.log(fl.yellow(`[TOP.GG] Updated stats: ${client.guilds.cache.size} guilds`));
            } catch (err) {
                console.error("[TOP.GG] Failed to post stats:", err);
            }
        }, 60_000);
    }
}