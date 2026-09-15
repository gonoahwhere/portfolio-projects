import mongoose from 'mongoose';

const serverSettings = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    theme: { type: String, default: 'dark' },
    lb: { type: Boolean, default: false },
});

export default mongoose.model('ServerSettings', serverSettings);