// backend/utils/socket.js
const User = require("../models/User");
const Message = require("../models/Message");
const Chat = require("../models/Chat");

let ioInstance;
const onlineUsers = new Map(); // userId -> socketId

function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    /* =========================
       USER SETUP
    ========================= */
    socket.on("setup", async (userId) => {
      socket.userId = String(userId);
      onlineUsers.set(socket.userId, socket.id);

      socket.join(socket.userId);

      await User.findByIdAndUpdate(userId, { isOnline: true });

      io.emit("userOnline", { userId });
    });

    /* =========================
       JOIN CHAT ROOM
    ========================= */
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    /* =========================
       SEND MESSAGE
    ========================= */
    socket.on("sendMessage", async ({ chatId, messageId }) => {
      try {
        const msg = await Message.findById(messageId)
          .populate("sender")
          .populate("chat");

        if (!msg) return;

        // 1️⃣ Send message to chat room
        io.to(chatId).emit("receiveMessage", msg);

        // 2️⃣ Mark as DELIVERED if receiver online
        const chat = await Chat.findById(chatId).populate("participants");

        chat.participants.forEach(async (user) => {
          const uid = String(user._id);

          if (uid !== String(msg.sender._id) && onlineUsers.has(uid)) {
            await Message.findByIdAndUpdate(messageId, {
              status: "delivered",
            });

            io.to(String(msg.sender._id)).emit("messageStatusUpdate", {
              messageId,
              status: "delivered",
            });
          }
        });
      } catch (err) {
        console.error("sendMessage error:", err);
      }
    });

    /* =========================
       MESSAGE READ
    ========================= */
    socket.on("messageRead", async ({ messageId, readerId }) => {
      try {
        const msg = await Message.findByIdAndUpdate(
          messageId,
          {
            status: "read",
            readAt: new Date(),
            $addToSet: { readBy: readerId },
          },
          { new: true }
        );

        if (!msg) return;

        // Notify sender (blue ticks)
        io.to(String(msg.sender)).emit("messageStatusUpdate", {
          messageId,
          status: "read",
        });
      } catch (err) {
        console.error("messageRead error:", err);
      }
    });

    /* =========================
       TYPING
    ========================= */
    socket.on("typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("typing", { chatId, userId });
    });

    socket.on("stopTyping", ({ chatId, userId }) => {
      socket.to(chatId).emit("stopTyping", { chatId, userId });
    });

    /* =========================
       REACTIONS
    ========================= */
    socket.on("addReaction", async ({ messageId, userId, emoji }) => {
      try {
        await Message.findByIdAndUpdate(messageId, {
          $push: { reactions: { user: userId, emoji } },
        });

        const msg = await Message.findById(messageId);
        io.to(String(msg.chat)).emit("reactionAdded", {
          messageId,
          userId,
          emoji,
        });
      } catch (err) {
        console.error("reaction error", err);
      }
    });

    /* =========================
       DELETE MESSAGE
    ========================= */
    socket.on("deleteMessageForAll", async ({ messageId }) => {
      try {
        const msg = await Message.findByIdAndUpdate(
          messageId,
          { deletedForAll: true, deletedAt: new Date() },
          { new: true }
        );

        io.to(String(msg.chat)).emit("messageDeletedForAll", { messageId });
      } catch (err) {
        console.error("delete error", err);
      }
    });

    /* =========================
       DISCONNECT
    ========================= */
    socket.on("disconnect", async () => {
      const userId = socket.userId;

      if (userId) {
        onlineUsers.delete(userId);

        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        io.emit("userOffline", {
          userId,
          lastSeen: new Date(),
        });
      }
    });
  });
}

function getIo() {
  return ioInstance;
}

module.exports = { initSocket, getIo };
