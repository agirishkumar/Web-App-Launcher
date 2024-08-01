const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
  name: { type: String, required: true },
  command: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  state: { type: String, enum: ['running', 'stopped'], default: 'stopped' },
  port: { type: Number },
  containerId: { type: String }
});

module.exports = mongoose.model('App', appSchema);