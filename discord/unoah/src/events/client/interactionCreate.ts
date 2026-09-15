import { Events } from "discord.js";
import type { Interaction, GuildBasedChannel } from "discord.js";
import { MessageFlags, PermissionFlagsBits } from "discord-api-types/v10";
import fl from "fluident";
import type { BotClient } from "../../types/Client.js";
import { ensureSettings } from "../../utils/ensureSettings.js";
import { ALLOWED_IDS } from "../../config/dev.js";
import { incrementCommandCount } from "../../utils/commandStats.js";

// Event Handlers
import { loadButtonHandlers } from "../buttons/index.js";
let buttonHandlers: any[] = [];

export default {
    name: Events.InteractionCreate,

    async execute(interaction: Interaction, bot: BotClient) {
        try {
            // PERMISSION GUARD - CHECK CHANNEL-LEVEL PERMISSIONS
            if (interaction.guild && !interaction.isAutocomplete?.()) {
                const botMember = interaction.guild!.members.me;
                const channelPermissions = (interaction.channel as GuildBasedChannel | null)?.permissionsFor(botMember as any)

                const requiredPermissions = [
                    PermissionFlagsBits.SendMessages,      // 2048
                    PermissionFlagsBits.AttachFiles,       // 32768
                    PermissionFlagsBits.EmbedLinks         // 16384
                ];

                // DEBUG - Remove later
                //console.log('=== CHANNEL PERMISSIONS DEBUG ===');
                //console.log('Bot member:', botMember?.user?.username);
                //console.log('Channel:', interaction.channel?.name);
                //console.log('SendMessages?', channelPermissions?.has(PermissionFlagsBits.SendMessages));
                //console.log('AttachFiles?', channelPermissions?.has(PermissionFlagsBits.AttachFiles));
                //console.log('EmbedLinks?', channelPermissions?.has(PermissionFlagsBits.EmbedLinks));

                const missingPermissions = requiredPermissions.filter(perm => !channelPermissions?.has(perm));

                //console.log('Missing permissions:', missingPermissions);

                if (missingPermissions.length > 0) {
                    if (interaction.isRepliable?.() && !interaction.replied && !interaction.deferred) {
                        return interaction.reply({
                            content: `I seem to be missing one or more of the following permissions that I need to function properly :pleading_face: \n- \`Send Messages\` \n- \`Attach Files\` \n- \`Embed Links\`\n\nIf I have these permissions enabled via roles then make sure that the channel permissions are not blocking access (including \`@everyone\`)!`,
                            flags: MessageFlags.Ephemeral
                        });
                    }
                    return;
                }
            }

            // -- AUTOCOMPLETE
            if (interaction.isAutocomplete?.()) {
                const commandName = interaction.commandName;
                const command =
                    bot.guildCommands?.get(commandName) ??
                    bot.globalCommands?.get(commandName);

                if (!command?.autocomplete) return;

                try {
                    await command.autocomplete(interaction);
                } catch (err) {
                    const error = err as Error;
                    console.error(fl.red(`[AUTOCOMPLETE] ${commandName}:`), error);
                }

                return;
            }

            // -- SLASH COMMAND
            if (interaction.isChatInputCommand?.()) {
                const commandName = interaction.commandName;
                const command =
                    bot.guildCommands?.get(commandName) ??
                    bot.globalCommands?.get(commandName);

                if (!command) {
                    console.log(fl.red(`No slash command found for ${commandName}`));
                    return;
                }

                // -- DEV GUARD
                if (command.devOnly && !ALLOWED_IDS.includes(interaction.user.id)) {
                    return interaction.reply({ content: 'Commands are restricted to the Developers only until release...', flags: MessageFlags.Ephemeral })
                }

                await ensureSettings(interaction);

                await command.execute(interaction, bot);
                await incrementCommandCount();
                return;
            }
            // -- BUTTONS
            if (interaction.isButton()) {
                if (buttonHandlers.length === 0) {
                    buttonHandlers = await loadButtonHandlers();
                }

                for (const handler of buttonHandlers) {
                    try {
                        const shouldHandle = await handler(interaction);
                        if (shouldHandle) break;
                    } catch (err) {
                        console.error("Button handler error:", err);
                    }
                }

                return;
            }
        } catch (err) {
            const error = err as Error;
            console.error(`[INTERACTION CREATE] Error:`, error);

            // -- REPLY ON ERROR
            if (interaction.isRepliable?.() && !interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({
                        content: "There was an error while executing this interaction!",
                        flags: MessageFlags.Ephemeral,
                    });
                } catch (e) {
                    const replyError = e as Error;
                    console.error(fl.red(`Failed to reply to interaction error:`), replyError);
                }
            } else if (interaction.isRepliable?.()) {
                try {
                    await interaction.followUp({
                        content: "There was an error while executing this interaction!",
                        flags: MessageFlags.Ephemeral,
                    });
                } catch (e) {
                    const followUpError = e as Error;
                    console.error(
                        fl.red("Failed to follow up after interaction error:"),
                        followUpError
                    );
                }
            }
        }
    },
};