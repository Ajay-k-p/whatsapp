const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  emoji: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      trim: true,
    },

    media: {
      type: String, // image / audio / video URL
    },

    type: {
      type: String,
      enum: ["text", "image", "video", "audio"],
      default: "text",
    },

    // ✅ SINGLE SOURCE OF TRUTH FOR TICKS
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    // Optional (useful for group chats later)
    deliveredTo: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],

    readBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],

    readAt: {
      type: Date,
    },

    reactions: [reactionSchema],

    deletedForAll: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // ✅ createdAt & updatedAt (fixes Invalid Date)
  }
);

module.exports = mongoose.model("Message", messageSchema);
