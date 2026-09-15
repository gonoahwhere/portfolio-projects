const { Events } = require("discord.js");
const { MessageFlags } = require('discord-api-types/v10');
const fl = require('fluident');
const { ALLOWED_IDS } = require("../../../config/dev.js");

const menuHandlers = require("../menus");
const buttonHandlers = require("../buttons");
const UserProfile = require("../../../models/userProfile");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, bot) {

    try {     
      // --- AUTOCOMPLETE HANDLER ---
      if (interaction.isAutocomplete()) {
        const command = bot.guildCommands?.get(interaction.commandName) ?? bot.globalCommands?.get(interaction.commandName);
        if (!command?.autocomplete) return;

        try {
          await command.autocomplete(interaction);
        } catch (err) {
          console.error(`[AUTOCOMPLETE ERROR] ${interaction.commandName}:`, err);
        }
        return;
      }

      // --- SLASH COMMAND HANDLER ---
      if (interaction.isChatInputCommand()) {
        const command = bot.guildCommands?.get(interaction.commandName) ?? bot.globalCommands?.get(interaction.commandName);
        if (!command) {
          console.log(`No slash command found for ${interaction.commandName}`);
          return;
        }
        // --- DEV GUARD ---
        if (command.devOnly && !ALLOWED_IDS.includes(interaction.user.id)) {
          return interaction.reply({ content: 'Production commands are restricted to the Developers only...', flags: MessageFlags.Ephemeral })
        }

        try {
          await UserProfile.findOneAndUpdate(
            { userId: interaction.user.id },
            { $inc: { commandsUsed: 1 } },
            { upsert: true, new: true }
          );
        } catch (err) {
          console.error("[COMMAND TRACKING ERROR]", err);
        }
        
        await command.execute(interaction, bot);
        return;
      }

      // --- SELECT MENUS ---
      if (interaction.isStringSelectMenu()) {
        for (const handler of menuHandlers) {
          await handler(interaction);
        }
      }

      //  --- BUTTONS ---      
      if (interaction.isButton()) {
        for (const handler of buttonHandlers) {
          await handler(interaction);
        }
      }
    } catch (err) {
      console.error(fl.red(`[INTERACTION ERROR] ${interaction.commandName || 'unknown'}:`), err);

      if (
        interaction.isRepliable?.() &&
        !interaction.replied &&
        !interaction.deferred
      ) {
        try {
          await interaction.reply({
            content: "There was an error while executing this interaction!",
            flags: MessageFlags.Ephemeral,
          });
        } catch (e) {
          console.error(fl.red("Failed to reply to interaction error:"), e);
        }
      } else if (interaction.isRepliable?.()) {
        try {
          await interaction.followUp({
            content: "There was an error while executing this interaction!",
            flags: MessageFlags.Ephemeral,
          });
        } catch (e) {
          console.error(fl.red("Failed to follow up after interaction error:"), e);
        }
      }

    }
  },
};
