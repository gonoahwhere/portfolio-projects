import fs from "fs";
import path from "path";
import fl from "fluident";
import type { BotClient } from "../types/Client.js";

// Load all guild slash commands
export const loadGuildCommands = async (bot: BotClient) => {
    const commandsPath = path.join(process.cwd(), "dist", "commands", "Guild");
    const guildCommandFolders: string[] = fs.readdirSync(commandsPath);

    const successfullyLoaded: string[] = [];
    const failedToLoad: { name: string; reason: string }[] = [];

    for (const folder of guildCommandFolders) {
        const folderPath = path.join(commandsPath, folder);
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const commandFiles: string[] = fs
            .readdirSync(folderPath)
            .filter((file: string) => file.endsWith(".js") || file.endsWith(".ts"));

        for (const file of commandFiles) {
            try {
                const commandPath = path.join(folderPath, file);
                const commandModule = await import(`file://${commandPath}`);
                const command = commandModule.default;

                const commandName = file.replace(/\.[^/.]+$/, "");

                if (command?.data?.name) {
                    bot.guildCommands.set(command.data.name, command);
                    successfullyLoaded.push(command.data.name);
                } else {
                    failedToLoad.push({
                        name: commandName,
                        reason: "missing or invalid command name",
                    });
                }
            } catch (err) {
                const error = err as Error;
                failedToLoad.push({ name: file, reason: error.message });
            }
        }
    }

    if (successfullyLoaded.length > 0) {
        console.log(fl.blue(`\n[ⓘ] ✔ • Guild slash commands loaded:`));
        successfullyLoaded.forEach((name) => console.log(`  - ${fl.magenta(name)}`));
    }

    if (failedToLoad.length > 0) {
        console.log(fl.red(`\n[ⓘ] ❌ • Failed to load guild slash commands:`));
        failedToLoad.forEach((c) => console.log(`  - ${fl.magenta(c.name)}: ${c.reason}`));
    }
};

// Load all global slash commands
export const loadGlobalCommands = async (bot: BotClient) => {
    const commandsPath = path.join(process.cwd(), "dist", "commands", "Global");
    if (!fs.existsSync(commandsPath)) return;

    const globalCommandFolders: string[] = fs.readdirSync(commandsPath);

    const successfullyLoaded: string[] = [];
    const failedToLoad: { name: string; reason: string }[] = [];

    for (const folder of globalCommandFolders) {
        const folderPath = path.join(commandsPath, folder);
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const commandFiles: string[] = fs
            .readdirSync(folderPath)
            .filter((file: string) => file.endsWith(".js") || file.endsWith(".ts"));

        for (const file of commandFiles) {
            try {
                const commandPath = path.join(folderPath, file);
                const commandModule = await import(`file://${commandPath}`);
                const command = commandModule.default;

                const commandName = file.replace(/\.[^/.]+$/, "");

                if (command?.data?.name) {
                    bot.globalCommands.set(command.data.name, command);
                    successfullyLoaded.push(command.data.name);
                } else {
                    failedToLoad.push({
                        name: commandName,
                        reason: "missing or invalid command name",
                    });
                }
            } catch (err) {
                const error = err as Error;
                failedToLoad.push({ name: file, reason: error.message });
            }
        }
    }

    if (successfullyLoaded.length > 0) {
        console.log(fl.blue(`\n[ⓘ] ✔ • Global slash commands loaded:`));
        successfullyLoaded.forEach((name) => console.log(`  - ${fl.magenta(name)}`));
    }

    if (failedToLoad.length > 0) {
        console.log(fl.red(`\n[ⓘ] ❌ • Failed to load global slash commands:`));
        failedToLoad.forEach((c) => console.log(`  - ${fl.magenta(c.name)}: ${c.reason}`));
    }
};

// Load all client events
export const loadClientEvents = async (bot: BotClient) => {
    const eventsPath = path.join(process.cwd(), "dist", "events", "client");

    const eventFiles: string[] = fs
        .readdirSync(eventsPath)
        .filter((f) => f.endsWith(".js") || f.endsWith(".ts"));

    const successfullyLoaded: string[] = [];
    const failedToLoad: { name: string; reason: string }[] = [];

    for (const file of eventFiles) {
        const eventPath = path.join(eventsPath, file);
        const eventName = file.replace(/\.[^/.]+$/, "");

        try {
            const eventModule = await import(`file://${eventPath}`);
            const event = eventModule.default;

            if (event?.name) {
                const boundExecute = event.execute.bind(event);

                if (event.once) {
                    bot.once(event.name, (...args: unknown[]) => boundExecute(...args, bot));
                } else {
                    bot.on(event.name, (...args: unknown[]) => boundExecute(...args, bot));
                }

                successfullyLoaded.push(event.name);
            } else {
                failedToLoad.push({ name: eventName, reason: "missing or invalid event name" });
            }
        } catch (err) {
            const error = err as Error;
            failedToLoad.push({ name: eventName, reason: error.message });
        }
    }

    if (successfullyLoaded.length > 0) {
        console.log(fl.blue(`\n[ⓘ] ✔ • Client events loaded:`));
        successfullyLoaded.forEach((name) => console.log(`  - ${fl.magenta(name)}`));
    }

    if (failedToLoad.length > 0) {
        console.log(fl.red(`\n[ⓘ] ❌ • Failed to load client events:`));
        failedToLoad.forEach((c) => console.log(`  - ${fl.magenta(c.name)}: ${c.reason}`));
    }
};

// Default export for main index.ts
export default {
    loadGlobalCommands,
    loadGuildCommands,
    loadClientEvents,
}