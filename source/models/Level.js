const { Schema, model } = require('mongoose');

// Sent to Mongoosedb
const levelSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 0,
  },
});

module.exports = model('Level', levelSchema);
