const GuildInfo = require("../../../models/guildInfo");
const { ContainerBuilder } = require("discord.js");
const { MessageFlags } = require('discord-api-types/v10');
const { stripIndents } = require("common-tags");
const mongoose = require("mongoose");

module.exports = {
    name: "guildCreate",
    async execute(guild) {
        const client = guild.client;

        // Fetch owner info
        let ownerTag = "Unknown";
        try {
            const owner = await client.users.fetch(guild.ownerId);
            if (owner) ownerTag = owner.tag;
        } catch {}

        // Save to MongoDB
        await GuildInfo.findOneAndUpdate(
            { guildId: guild.id },
            {
                guildId: guild.id,
                guildName: guild.name,
                ownerId: guild.ownerId,
                ownerTag
            },
            { upsert: true }
        );

        // Your logging
        const container = new ContainerBuilder()
            .addTextDisplayComponents(td => td.setContent(`### 📜 Toastoku ∘ Added to Guild`))
            .addSeparatorComponents(s => s)
            .addTextDisplayComponents(td => td.setContent(stripIndents`
                ∘ **Server Name:** ${guild.name}
                ∘ **Server ID:** ${guild.id}
                ∘ **Owner:** ${ownerTag} (${guild.ownerId})
            `));

        const logChannel = client.channels.cache.get("1412139686931202279");
        if (logChannel) await logChannel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
};
