const mongoose = require('mongoose');

const fontDataSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  font: { type: String, default: 'NightBlood' },
});

module.exports = mongoose.model('userConfDatas', fontDataSchema, 'userConfDatas');
