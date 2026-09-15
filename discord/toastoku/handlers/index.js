const fs    = require("fs");
const path = require("path");
const fl = require("fluident");

// Load Global SlashCommands
const loadGlobalCommands = async function(bot) {
    const commandsPath = path.join(bot.cwd, 'bot', 'commands', 'guild');
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    const successfullyLoaded = [];
    const failedToLoad = [];

    for (const file of commandFiles) {
        const commandPath = path.join(commandsPath, file);
        const command = require(commandPath);
        const commandName = file.replace(/\.[^/.]+$/, '');

        if (command.data && command.data.name) {
            bot.globalCommands.set(command.data.name, command);
            successfullyLoaded.push(command.data.name);
        } else {
            failedToLoad.push({ name: commandName, reason: 'missing or invalid command name' });
        }
    }

    if (successfullyLoaded.length > 0) {
        console.log(fl.blue(`[ⓘ] ✔ • Global slash commands loaded:`));
        successfullyLoaded.forEach(name => console.log(`  - ${fl.magenta(name)}`));
    }

    if (failedToLoad.length > 0) {
        console.log(fl.red(`[ⓘ] ❌ • Failed to load global slash commands:`));
        failedToLoad.forEach(c => console.log(`  - ${fl.magenta(c.name)}: ${c.reason}`));
    }
};

// Load Guild SlashCommands
const loadGuildCommands = async function(bot) {
    const commandsPath = path.join(bot.cwd, 'bot', 'commands', 'global');
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    const successfullyLoaded = [];
    const failedToLoad = [];

    for (const file of commandFiles) {
        const commandPath = path.join(commandsPath, file);
        const command = require(commandPath);
        const commandName = file.replace(/\.[^/.]+$/, '');

        if (command.data && command.data.name) {
            bot.guildCommands.set(command.data.name, command);
            successfullyLoaded.push(command.data.name);
        } else {
            failedToLoad.push({ name: commandName, reason: 'missing or invalid command name' });
        }
    }

    if (successfullyLoaded.length > 0) {
        console.log(fl.blue(`[ⓘ] ✔ • Guild slash commands loaded:`));
        successfullyLoaded.forEach(name => console.log(`  - ${fl.magenta(name)}`));
    }

    if (failedToLoad.length > 0) {
        console.log(fl.red(`[ⓘ] ❌ • Failed to load guild slash commands:`));
        failedToLoad.forEach(c => console.log(`  - ${fl.magenta(c.name)}: ${c.reason}`));
    }
};

// Load Client Events
const loadClientEvents = async function (bot) {
    const eventsPath = path.join(bot.cwd, 'bot', 'events', 'client');
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

    const successfullyLoaded = [];
    const failedToLoad = [];

    for (const file of eventFiles) {
        const eventPath = path.join(eventsPath, file);
        const event = require(eventPath);
        const eventName = file.replace(/\.[^/.]+$/, '');

        if (event.name) {
            try {
                if (event.once) {
                    bot.once(event.name, (...args) => event.execute(...args, bot));
                } else {
                    bot.on(event.name, (...args) => event.execute(...args, bot));
                }

                successfullyLoaded.push(event.name);
            } catch (err) {
                failedToLoad.push({ name: eventName, reason: err.message });
            }
        } else {
            failedToLoad.push({ name: eventName, reason: 'missing or invalid event name' });
        }
    }

    if (successfullyLoaded.length > 0) {
        console.log(fl.blue(`[ⓘ] ✔ • Client events loaded:`));
        successfullyLoaded.forEach(name => console.log(`  - ${fl.magenta(name)}`));
    }

    if (failedToLoad.length > 0) {
        console.log(fl.red(`[ⓘ] ❌ • Failed to load client events:`));
        failedToLoad.forEach(c => console.log(`  - ${fl.magenta(c.name)}: ${c.reason}`));
    }
};

module.exports = {
    loadGlobalCommands,
    loadGuildCommands,
    loadClientEvents
}