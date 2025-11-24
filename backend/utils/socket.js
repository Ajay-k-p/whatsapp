// backend/utils/socket.js
const User = require("../models/User");
const Message = require("../models/Message");
const Chat = require("../models/Chat");

let ioInstance;
const onlineUsers = new Map(); // userId -> socketId

function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    // setup: identify user
    socket.on("setup", async (userId) => {
      try {
        socket.userId = userId;
        onlineUsers.set(String(userId), socket.id);

        socket.join(String(userId));

        await User.findByIdAndUpdate(userId, { isOnline: true });

        io.emit("userOnline", { userId });
      } catch (err) {
        console.error("setup error", err);
      }
    });

    // Join chat room
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    // Typing indicator
    socket.on("typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("typing", { chatId, userId });
    });

    // Send message
    socket.on("sendMessage", async ({ chatId, message, senderId }) => {
      try {
        const payload = {
          ...message,
          senderId: senderId || message.sender?._id || message.sender
        };

        // Broadcast to all chat participants
        io.to(chatId).emit("receiveMessage", payload);

        // Fetch participants
        const chat = await Chat.findById(chatId).populate("participants");

        if (chat && chat.participants) {
          chat.participants.forEach((user) => {
            const uid = String(user._id);
            if (uid !== String(senderId)) {
              const socketId = onlineUsers.get(uid);
              if (socketId) {
                io.to(String(senderId)).emit("messageDelivered", {
                  messageId: message._id,
                  chatId,
                  deliveredTo: uid
                });
              }
            }
          });
        }
      } catch (err) {
        console.error("sendMessage error:", err);
      }
    });

    // Delivered
    socket.on("messageDelivered", async ({ messageId, chatId, userId }) => {
      try {
        await Message.findByIdAndUpdate(
          messageId,
          { $addToSet: { deliveredTo: userId } },
          { new: true }
        );

        const msg = await Message.findById(messageId);

        io.to(String(msg.sender)).emit("messageDelivered", {
          messageId,
          chatId,
          deliveredTo: userId,
        });
      } catch (err) {
        console.error("delivered error", err);
      }
    });

    // Read
    socket.on("messageRead", async ({ messageId, chatId, readerId }) => {
      try {
        await Message.findByIdAndUpdate(
          messageId,
          {
            $addToSet: { seenBy: readerId },
            read: true,
            readAt: new Date(),
          }
        );

        io.to(chatId).emit("messageRead", {
          messageId,
          readerId,
          chatId,
        });
      } catch (err) {
        console.error("read error", err);
      }
    });

    // Add reaction
    socket.on("addReaction", async ({ messageId, userId, emoji }) => {
      try {
        await Message.findByIdAndUpdate(
          messageId,
          { $push: { reactions: { user: userId, emoji } } }
        );

        const msg = await Message.findById(messageId);
        io.to(String(msg.chat)).emit("reactionAdded", { messageId, userId, emoji });
      } catch (err) {
        console.error("reaction error", err);
      }
    });

    // Delete message for everyone
    socket.on("deleteMessageForAll", async ({ messageId, chatId }) => {
      try {
        await Message.findByIdAndUpdate(
          messageId,
          { deletedForAll: true, deletedAt: new Date() }
        );

        io.to(chatId).emit("messageDeletedForAll", { messageId });
      } catch (err) {
        console.error("delete error", err);
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      try {
        const userId = socket.userId;

        if (userId) {
          onlineUsers.delete(String(userId));
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          io.emit("userOffline", {
            userId,
            lastSeen: new Date(),
          });
        }
      } catch (err) {
        console.error("disconnect error", err);
      }
    });
  });
}

function getIo() {
  return ioInstance;
}

module.exports = { initSocket, getIo };
