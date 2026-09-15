const GuildInfo = require("../../../models/guildInfo");
const { ContainerBuilder } = require("discord.js");
const { MessageFlags } = require('discord-api-types/v10');
const { stripIndents } = require("common-tags");
const mongoose = require("mongoose");

module.exports = {
    name: "guildDelete",
    async execute(guild) {
        const client = guild.client;

        // Try to fetch owner info live
        let ownerTag = "Unknown";
        try {
            const owner = await client.users.fetch(guild.ownerId);
            if (owner) ownerTag = owner.tag;
        } catch {}

        // Load stored data (if cache is empty on restart)
        const saved = await GuildInfo.findOne({ guildId: guild.id });
        if (!saved || !guild.available) return;


        const guildName = guild.name ?? saved?.guildName ?? "Unknown";
        const ownerId = guild.ownerId ?? saved?.ownerId ?? "Unknown";
        const finalOwnerTag = ownerTag !== "Unknown"
            ? ownerTag
            : saved?.ownerTag ?? "Unknown";

        // Remove from DB since bot actually left
        if (saved) await saved.deleteOne();
        

        // Your logging
        const container = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent(`### 📜 Toastoku ∘ Left a Guild`))
            .addSeparatorComponents(s => s)
            .addTextDisplayComponents(td => td.setContent(stripIndents`
                ∘ **Server Name:** ${guildName}
                ∘ **Server ID:** ${guild.id}
                ∘ **Owner:** ${finalOwnerTag} (${ownerId})
            `));

        const logChannel = client.channels.cache.get("1412139731168526406");
        if (logChannel) await logChannel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
};
