const mongoose = require("mongoose");

const commandStatsSchema = new mongoose.Schema({
  name: { type: String, default: "command_stats_production" },
  slashCount: { type: Number, default: 0 },
  userCount: { type: Number },
  guildCount: { type: Number },
});

module.exports = mongoose.model("CommandStats", commandStatsSchema);