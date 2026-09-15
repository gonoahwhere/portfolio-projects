const mongoose = require('mongoose');

const serverSettings = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    hintsEnabled: { type: Boolean, default: false },
});

module.exports = mongoose.model('ServerSettings', serverSettings);
