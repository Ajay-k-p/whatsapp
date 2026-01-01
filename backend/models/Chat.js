const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true, // replaces manual createdAt
  }
);

// 🔐 CRITICAL: ensure only ONE chat per two users
chatSchema.index(
  { participants: 1 },
  { unique: true }
);

module.exports = mongoose.model("Chat", chatSchema);
