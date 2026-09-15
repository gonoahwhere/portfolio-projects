import { Client, Collection } from "discord.js";

export interface BotClient extends Client {
    globalCommands: Collection<string, any>;
    guildCommands: Collection<string, any>;
    events: Collection<string, any>;
    config: any;
    mongoose: {
        init: () => void | Promise<void>;
    }
}