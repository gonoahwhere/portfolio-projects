const mongoose = require('mongoose');

const userThemeSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, unique: true },
        unlockedThemes: { type: [String], default: [] },
    }, { 
        timestamps: true 
    }
);

module.exports = mongoose.model('UserTheme', userThemeSchema, 'usertheme');