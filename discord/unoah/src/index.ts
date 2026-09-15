import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import type { BotClient } from "./types/Client.ts"
import "dotenv/config";
import mongooseHandler from "./utils/mongoose.js";

// Handlers
import clientHandler from "./handlers/index.js";
import config from "./config.js";

// Increase Max Listeners
import { setMaxListeners } from "events";
setMaxListeners(150);

// Intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
    ],
}) as BotClient;

// Attach Properties
client.globalCommands = new Collection();
client.guildCommands = new Collection();
client.events = new Collection();
client.config = config;
client.mongoose = mongooseHandler;

// Load Handlers
await clientHandler.loadGlobalCommands(client)
await clientHandler.loadGuildCommands(client)
await clientHandler.loadClientEvents(client);

// Error Handling
process.on("uncaughtException", (err) => {
    console.error("[UNCAUGHT EXCEPTION]:", err);
})

process.on("unhandledRejection", (reason, promise) => {
    console.error("[UNHANDLED REJECTION]:");
    console.error("Promise:", promise);
    console.error("Reason:", reason);
});

// Login
const token = process.env.TOKEN;
if (!token) throw new Error("TOKEN not found in .env");

client.mongoose.init();
client.login(token)