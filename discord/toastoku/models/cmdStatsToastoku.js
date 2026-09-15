const mongoose = require("mongoose");

const commandStatToastokuSchema = new mongoose.Schema({
  name: { type: String, default: "command_stats_toastoku" },
  slashCount: { type: Number, default: 0 },
  userCount: { type: Number },
  guildCount: { type: Number },
});

module.exports = mongoose.model("CommandStatsToastoku", commandStatToastokuSchema, "commandstats");