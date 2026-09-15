const mongoose = require('mongoose');

const UserSettingsSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String },
    anonymous: { type: Boolean, default: false },
    anonymousName: { type: String, default: null },
    reminders: {
        vote: {
            enabled: { type: Boolean, default: false },
            nextReminder: { type: Date, default: null }, 
        },
        dpuzzle: {
            enabled: { type: Boolean, default: false },
            nextReminder: { type: Date, default: null }, 
        },
        wquest: {
            enabled: { type: Boolean, default: false },
            nextReminder: { type: Date, default: null }, 
        }
    },
});

module.exports = mongoose.model('userSettings', UserSettingsSchema, 'usersettings');
