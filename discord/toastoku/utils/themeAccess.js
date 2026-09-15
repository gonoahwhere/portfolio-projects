const { themeRegistry } = require('./themeConfig');
const UserTheme = require('../models/userThemes');

const SUPPORT_SERVER_ID = "1412083896300077140";
const BOOSTER_ROLE_ID = "1500062088452640798";
const ALLOWED_IDS = [
    "372456601266683914", // Noah
    "661200758510977084", // Null
    "555652788592443392", // Demon
    "269904947578011649", // Megan
    "794323707115470928", // Caulden
]

async function getAvailableThemes(userId, guildId, guild) {
    const userThemeDoc = await UserTheme.findOne({ userId });
    const unlocked = userThemeDoc?.unlockedThemes ?? [];

    let member = null;
    if (guild) {
        try { 
            member = await guild.members.fetch(userId) 
        } catch {

        }
    }

    const isInSupportServer = guildId === SUPPORT_SERVER_ID;
    const isBooster = member?.roles?.cache?.has(BOOSTER_ROLE_ID) ?? false;
    const isOwner = userId === ALLOWED_IDS[0];
    const isAllowed = ALLOWED_IDS.includes(userId);

    return Object.entries(themeRegistry)
        .filter(([key, config]) => {
            //if (isOwner) return true;
            if (isAllowed) return true;
            switch (config.folder) {
                case 'free':
                    return true;
                case 'support':
                    return isInSupportServer;
                case 'booster':
                    return isBooster;
                case 'unlockable':
                    return unlocked.includes(key);
                default:
                    return false;
            }
        })
        .map(([key, config]) => ({ name: config.label, value: key }));
}

module.exports = { getAvailableThemes };