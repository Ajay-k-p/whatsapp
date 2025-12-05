const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, trim: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  messageType: { type: String, enum: ['text', 'image'], default: 'text' },
  mediaUrl: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);