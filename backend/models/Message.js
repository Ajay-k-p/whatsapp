const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  emoji: String,
  createdAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String },
  media: { type: String },
  type: { type: String, enum: ["text", "image", "video", "audio"], default: "text" },

  deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  read: { type: Boolean, default: false },
  readAt: { type: Date },

  reactions: [reactionSchema],

  deletedForAll: { type: Boolean, default: false },
  deletedAt: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
