const mongoose = require("mongoose");

const guildInfoSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    guildName: { type: String, default: "Unknown" },
    ownerId: { type: String, default: "Unknown" },
    ownerTag: { type: String, default: "Unknown" }
});

module.exports = mongoose.model("GuildInfo", guildInfoSchema);
