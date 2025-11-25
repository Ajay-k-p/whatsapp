// backend/utils/socket.js
const Message = require('../models/Message');
const Chat = require('../models/Chat');

let ioInstance = null;
const onlineUsers = new Map(); // userId → Set(socketIds)

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log("🔵 Socket connected:", socket.id);


    // -----------------------------------------
    // SETUP USER
    // -----------------------------------------
    socket.on('setup', ({ userId }) => {
      if (!userId) return;

      socket.userId = userId;

      const existing = onlineUsers.get(userId) || new Set();
      existing.add(socket.id);
      onlineUsers.set(userId, existing);

      socket.join(`user_${userId}`);

      socket.emit('connected');
      console.log(`🟢 User ${userId} authenticated → socket ${socket.id}`);
    });


    // -----------------------------------------
    // JOIN CHAT ROOM
    // -----------------------------------------
    socket.on('joinChat', ({ chatId }) => {
      if (!chatId) return;

      socket.join(`chat_${chatId}`);
      console.log(`📌 Socket ${socket.id} joined chat_${chatId}`);
    });


    // -----------------------------------------
    // NEW MESSAGE
    // -----------------------------------------
    socket.on('newMessage', async ({ message }) => {
      try {
        // If message already saved in DB
        if (message && message._id) {
          io.to(`chat_${message.chat}`).emit('messageReceived', message);
          return;
        }

        // Fallback persistence
        const msg = await Message.create(message);

        await Chat.findByIdAndUpdate(message.chat, {
          $push: { messages: msg._id },
          lastMessage: msg._id
        });

        io.to(`chat_${message.chat}`).emit('messageReceived', msg);

      } catch (err) {
        console.error("newMessage error:", err);
        socket.emit("error", { message: "Message save failed" });
      }
    });


    // -----------------------------------------
    // READ MESSAGE (BLUE TICK)
    // -----------------------------------------
    socket.on('messageRead', async ({ messageId, chatId, readerId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { seenBy: readerId },
          readAt: new Date()
        });

        io.to(`chat_${chatId}`).emit('messageRead', { messageId, readerId });

      } catch (err) {
        console.error("messageRead error:", err);
      }
    });


    // -----------------------------------------
    // ADD REACTION
    // -----------------------------------------
    socket.on('addReaction', async ({ messageId, reaction, reactorId }) => {
      try {
        const updated = await Message.findByIdAndUpdate(
          messageId,
          { $push: { reactions: { user: reactorId, reaction } } },
          { new: true }
        );

        if (updated) {
          io.to(`chat_${updated.chat}`).emit("reactionUpdated", updated);
        }

      } catch (err) {
        console.error("addReaction error:", err);
      }
    });


    // -----------------------------------------
    // DELETE FOR ALL
    // -----------------------------------------
    socket.on('deleteMessageForAll', async ({ messageId, chatId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, {
          deletedForAll: true,
          deletedAt: new Date()
        });

        io.to(`chat_${chatId}`).emit('messageDeletedForAll', { messageId });

      } catch (err) {
        console.error("deleteMessageForAll error:", err);
      }
    });


    // -----------------------------------------
    // DISCONNECT
    // -----------------------------------------
    socket.on("disconnect", () => {
      const uid = socket.userId;

      if (uid) {
        const set = onlineUsers.get(uid);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) onlineUsers.delete(uid);
          else onlineUsers.set(uid, set);
        }
      }

      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
}

function getIo() {
  return ioInstance;
}

module.exports = { initSocket, getIo };
