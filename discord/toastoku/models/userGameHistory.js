const mongoose = require('mongoose');

const UserGameHistorySchema = new mongoose.Schema({
  userId: String,
  gameId: String,
  type: String,
  difficulty: String,
  completed: Boolean,
  date: { type: Date, default: Date.now },
  puzzle: [Number],
  solved: [Number],
  prefilledSet: [Number],     
  theme: String,
  notes: [[Number]],
  gameIndex: Number,
});

module.exports = mongoose.model('UserGameHistory', UserGameHistorySchema);
