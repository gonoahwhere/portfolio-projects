const mongoose = require("mongoose");

const weeklyQuestSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  week: { type: Number, required: true },
  quests: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model("WeeklyQuest", weeklyQuestSchema);
