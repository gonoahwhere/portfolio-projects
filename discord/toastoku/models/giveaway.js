const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
    messageId: { type: String, required: true },   // Discord message ID
    channelId: { type: String, required: true },   // Discord channel ID
    guildId: { type: String, required: true },     // Discord guild ID
    title: { type: String, required: true },       // Giveaway title
    description: { type: String, required: true }, // Giveaway description
    winnersCount: { type: Number, required: true },// Number of winners
    hostedBy: { type: String, required: true },    // User ID of host
    endTime: { type: Date, required: true },       // End time
    entries: { type: [String], default: [] },      // Array of user IDs who entered
    ended: { type: Boolean, default: false },      // Whether giveaway ended
    deleteAt: Date,                                // Deletes 10m after ending
}, { timestamps: true });                          // optional: adds createdAt/updatedAt

module.exports = mongoose.model('Giveaway', giveawaySchema);
