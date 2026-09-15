const mongoose = require('mongoose');

const DailyCompletionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('DailyCompletion', DailyCompletionSchema);