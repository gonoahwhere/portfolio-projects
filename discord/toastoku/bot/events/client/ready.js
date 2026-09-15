const { ActivityType, ContainerBuilder } = require("discord.js");
const fl = require("fluident");
const { cleanOldCompletions } = require('../../../cleanOldCompletions.js');
const { cleanOldWeeklyQuests } = require('../../../cleanOldWeeklyQuests.js');
const { resetDailyHints } = require("../../../dailyHintsReset.js");
const Profile = require('../../../models/userProfile');
const Giveaway = require('../../../models/giveaway');
const { stripIndents } = require('common-tags');
const BigNumber = require('bignumber.js');
const GuildInfo = require("../../../models/guildInfo");
const mongoose = require("mongoose");
const emojis = require('../../../config/emojis');

module.exports = {
    name: "clientReady",
    once: true,
    async execute(bot) {
        try {
            // -- SYNC GUILDS TO DATABASE
            let createdCount = 0;
            await bot.guilds.fetch();

            for (const [guildId, guild] of bot.guilds.cache) {
                const exists = await GuildInfo.findOne({ guildId });

                if (!exists) {
                    let ownerTag = "Unknown";
                    try {
                        const owner = await bot.users.fetch(guild.ownerId);
                        if (owner) ownerTag = owner.tag;
                    } catch {}

                    await GuildInfo.create({
                        guildId,
                        guildName: guild.name,
                        ownerId: guild.ownerId,
                        ownerTag
                    });

                    createdCount++;
                    console.log(`[DB] Added missing guild entry → ${guild.name} (${guildId})`);
                }
            }

            console.log(`[DB] Guild sync complete. Created ${createdCount} missing entries.`);

            // -- SYNC USERNAMES TO DATABASE FOR WEBSITE
            /*
            const users = await Profile.find({}).lean();
                for (const u of users) {
                    if (u.username) continue;
                    const discordUser = await bot.users.fetch(u.userId).catch(() => null);
                    if (!discordUser) continue;
                    await Profile.findOneAndUpdate(
                        { userId: u.userId },
                        { username: discordUser.username }
                    );

                    //console.log(fl.blue(`Updated username for ${discordUser.username}`));
                }

            console.log(fl.gray('[BOT] Username sync complete.'));
            */



            // -- BOT STATUS STUFF
            const { guilds, commands } = bot;
            const serverNum = guilds.cache.size;
            const userNum = bot.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

            const legacyCommands = bot.guildCommands.filter(cmd => !cmd.data);
            const slashCommands = bot.globalCommands.filter(cmd => cmd.data);

            const legacyCommandCount = legacyCommands.size;
            const slashCommandCount = slashCommands.size;

            const formatNumber = (num) => {
                if (num < 1e3) return num.toString();
                if (num < 1e6) return (num / 1e3).toFixed(1) + "K";
                if (num < 1e9) return (num / 1e6).toFixed(1) + "M";
                if (num < 1e12) return (num / 1e9).toFixed(1) + "B";
                return (num / 1e12).toFixed(1) + "T";
            };

            const watchingStatus = [
                "Noah create toastokus!"
            ];

            const setBotPresence = () => {
                const statusMessage = watchingStatus[Math.floor(Math.random() * watchingStatus.length)];
                bot.user.setPresence({
                    activities: [{
                        name: statusMessage,
                        type: ActivityType.Streaming,
                        url: "https://twitch.tv/gonoahwhere"
                    }],
                    status: "dnd",
                });
            };

            setBotPresence();
            setInterval(setBotPresence, 3600000);
            
            const botProcessing = fl.gradient(`[APP] ${bot.user.tag} processing...`, ['#ED4F44', '#EDA944', '#EDED44', '#A1ED44', '#44E0EE', '#4474ED', '#A944ED', '#ED44D1']);
            console.log(botProcessing);        

            const botOnline = fl.gradient(`[APP] ${bot.user.tag} is now online!`, ['#ED4F44', '#EDA944', '#EDED44', '#A1ED44', '#44E0EE', '#4474ED', '#A944ED', '#ED44D1']);
            console.log(botOnline);
            


            // -- RESET HINTS, CLEAN OLD DAILIES
            let lastResetDate = null;

            setInterval(async () => {
                const nowUTC = new Date();
                const today = nowUTC.toISOString().slice(0, 10); 
                if (today !== lastResetDate) {
                    lastResetDate = today;
                    await resetDailyHints().catch(console.error);
                }
            }, 60 * 60 * 1000);

            await cleanOldCompletions().catch(console.error);
            await cleanOldWeeklyQuests().catch(console.error);

            setInterval(() => {
                cleanOldCompletions().catch(console.error);
                cleanOldWeeklyQuests().catch(console.error);
            }, 24 * 60 * 60 * 1000);




            // -- VOTE REWARDS ON TOP.GG
            processVoteRewards(bot);

            setInterval(() => processVoteRewards(bot), 5 * 60 * 1000);

            async function processVoteRewards(bot) {
                const BATCH_SIZE = 10;
                const DELAY_BETWEEN_DMS = 5000;

                const usersVote = await Profile.find({ pendingVotes: { $gt: 0 } }).limit(BATCH_SIZE);
                if (!usersVote || usersVote.length === 0) return;

                console.log(`[VOTES] Processing ${usersVote.length} pending votes`);

                const today = new Date();
                const day = today.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
                const isDoubleDay = (day === 0 || day === 5 || day === 6);

                const baseRewards = {
                    toasts: 150,
                    exp: 300,
                    hints: 2,
                    votes: 1,
                };

                const multiplier = isDoubleDay ? 2 : 1;

                for (const user of usersVote) {
                    try {
                        user.balance.currentToasts = new BigNumber(user.balance.currentToasts)
                            .plus(baseRewards.toasts * multiplier).toString();
                        user.rank.exp = new BigNumber(user.rank.exp)
                            .plus(baseRewards.exp * multiplier).toString();
                        user.misc.hints = new BigNumber(user.misc.hints)
                            .plus(baseRewards.hints * multiplier).toString();
                        user.misc.votes = new BigNumber(user.misc.votes)
                            .plus(baseRewards.votes * multiplier).toString();

                        user.pendingVotes = 0;

                        await Profile.updateOne(
                            { _id: user._id },
                            {
                                $set: {
                                    balance: user.balance,
                                    rank: user.rank,
                                    misc: user.misc,
                                    pendingVotes: user.pendingVotes,
                                },
                            }
                        );

                        console.log(`[VOTES] Rewards applied (${multiplier}x) for ${user.userId}`);

                        try {
                            const discordUser = await bot.users.fetch(user.userId);
                            await discordUser.send(
                                `🎉 Thanks for voting! You received:\n\n` +
                                `-# +${baseRewards.toasts * multiplier} ${emojis.toast} ${emojis.spacer} +${baseRewards.exp * multiplier} ${emojis.expadd} ${emojis.spacer} +${baseRewards.hints * multiplier} ${emojis.hints} ${emojis.spacer} +${baseRewards.votes * multiplier} vote point${isDoubleDay ? "s (Double Rewards!)" : ""}`
                            );
                        } catch (err) {
                            console.log(`[VOTES] Could not DM user: ${user.userId}`, err);
                        }

                        await new Promise(res => setTimeout(res, DELAY_BETWEEN_DMS));
                    } catch (err) {
                        console.error(`[VOTES] Error processing vote for ${user.userId}:`, err);
                    }
                }
            }



        } catch (error) {
            console.error(fl.red("[ERROR] An error occurred during the ready event:"), error);
        }
    },
};
