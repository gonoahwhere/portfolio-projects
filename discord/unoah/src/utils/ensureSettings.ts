import ServerSettings from "../models/serverSettings.js";

export async function ensureSettings(interaction: any) {
    // Ensures server settings exist
    if (interaction.guildId) {
        await ServerSettings.findOneAndUpdate(
            { guildId: interaction.guildId },
            { $setOnInsert: { guildId: interaction.guildId }},
            { upsert: true, returnDocument: "after" }
        );
    }
}