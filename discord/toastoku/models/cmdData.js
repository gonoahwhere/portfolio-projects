const mongoose = require('mongoose');

const commandDataSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  nickname: { type: String, required: true },
  description: { type: String, required: true },
  usage: { type: String, required: true },
  category: { type: String, required: true },
  cooldown: { type: String, required: true },
  tier: { type: String, required: true },
  permissions: { type: String, required: true },
  aliases: { type: [String], default: [] },
  adminUse: { type: Boolean, default: false },
  onlyOwner: { type: Boolean, default: false }
});

module.exports = mongoose.model("CommandDatas", commandDataSchema);