import { ActivityType } from "discord.js";
import fl from "fluident";

import GuildInfo from "../../models/guildInfo.js";
import { restoreLobbiesFromDB } from "../../utils/lobbies.js";
import { backfillGuildInfo } from '../../utils/backfillGuildInfo.js';
import { syncCommandStats } from "../../utils/commandStats.js";

import type { BotClient } from "../../types/Client.js";

export default {
    name: "clientReady",
    once: true,

    async execute(bot: BotClient) {
        try {
            // -- Bot Status
            const botProcessing = fl.gradient(`\n[APP] ${bot.user?.tag} processing...`, [ "#ED4F44", "#EDA944", "#EDED44", "#A1ED44", "#44E0EE", "#4474ED", "#A944ED", "#ED44D1" ]);
            console.log(botProcessing);

            const botOnline = fl.gradient(`[APP] ${bot.user?.tag} is now online!`, [ "#ED4F44", "#EDA944", "#EDED44", "#A1ED44", "#44E0EE", "#4474ED", "#A944ED", "#ED44D1" ]);
            console.log(botOnline);

            const streamingStatus: string[] = [
                "your next move being carefully ruined.",
                "a perfectly timed disaster just for you.",
                "every decision you make backfiring instantly.",
                "the exact moment things go wrong.",
                "your luck being manually set to zero.",
                "a chain reaction of unfortunate events.",
                "your plans collapsing in real time.",
                "the worst possible outcome unfolding.",
                "your last bit of hope disappearing.",
                "a guaranteed loss, handcrafted for you.",
                "your winning streak being deleted.",
                "the universe picking you specifically.",
                "every good option turning bad.",
                "your expectations being crushed live.",
                "a flawless plan going horribly wrong.",
                "the moment you realise it's over.",
                "your luck getting nerfed mid-game.",
                "a disaster with your name on it.",
                "every outcome but the good one.",
                "your chances being quietly sabotaged.",
                "a loss you couldn't have avoided.",
                "your confidence being misplaced again.",
                "the exact second everything falls apart.",
                "your downfall, now streaming live.",
            ];

            const setBotPresence = () => {
                const statusMessage = streamingStatus[Math.floor(Math.random() * streamingStatus.length)];

                bot.user?.setPresence({
                    activities: [
                        {
                            name: statusMessage!,
                            type: ActivityType.Streaming,
                            url: "https://twitch.tv/gonoahwhere",
                        },
                    ],
                    status: "dnd",
                });
            };

            setBotPresence();
            setInterval(setBotPresence, 3_600_000);

            // Restore active lobbies
            await restoreLobbiesFromDB();

            // Sync guilds to the database
            await Promise.all(
                bot.guilds.cache.map(async (guild) => {
                    let ownerTag = "Unknown";

                    try {
                        const owner = await bot.users.fetch(guild.ownerId);
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
                        },
                        {
                            upsert: true,
                            returnDocument: 'after',
                            setDefaultsOnInsert: true,
                        }
                    );
                })
            );

            await backfillGuildInfo(bot);
            await syncCommandStats(bot);

            console.log(fl.green(`[READY] Synced ${bot.guilds.cache.size} guilds to MongoDB.`));
        } catch (err) {
            const error = err as Error;
            console.error(fl.red("[READY] An error occurred during the ready event:"), error);
        }
    },
};