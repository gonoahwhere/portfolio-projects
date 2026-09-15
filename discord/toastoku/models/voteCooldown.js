const mongoose = require("mongoose");

const voteCooldownSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
});

const VoteCooldown = mongoose.model("VoteCooldown", voteCooldownSchema);

module.exports = VoteCooldown;