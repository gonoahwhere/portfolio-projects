const mongoose = require('mongoose');

const DailyPuzzleSchema = new mongoose.Schema({
  date: { type: String, unique: true },
  puzzle: [Number],
  originalPuzzle: [Number],
  prefilledSet: [Number],
  theme: String,
  difficulty: String,
  mode: String,
  hostId: String,
  joinedPlayers: [String],
  currentTurnIndex: Number,
  selectedCell: Number,
  selectedValue: Number,
  selectedGrid: Number,
  started: { type: Boolean, default: false },
  conflictSet: [Number],
  allSolutions: [[Number]],
  lastUpdated: { type: Date, default: Date.now },
  pencilMode: { type: Boolean, default: false },
});

module.exports = mongoose.model('DailyPuzzle', DailyPuzzleSchema);