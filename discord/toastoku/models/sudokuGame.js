const mongoose = require('mongoose');

const SudokuGameSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true },
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
  messageId: String,
  channelId: String,
  pencilMode: { type: Boolean, default: false },
  notes: {
    type: [[Number]],
    default: Array.from({ length: 81 }, () => []),
  },
  guildId: String,
});

module.exports = mongoose.model('SudokuGame', SudokuGameSchema);
