const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");
const cloudinaryConfig = require("./config/cloudinary");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chats");
const messageRoutes = require("./routes/messages");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const server = createServer(app);

// ✅ Bulletproof allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://whatsapp-silk-xi.vercel.app", // your production frontend
  process.env.FRONTEND_URL,
].filter(Boolean); // removes undefined

// ✅ Express CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow server-to-server
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

// ✅ JSON middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ DB & Cloudinary
connectDB();
cloudinaryConfig();

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Error handler
app.use(errorHandler);

// ✅ Socket.io setup
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Socket events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  socket.on("new message", (newMessage) => {
    const chat = newMessage.chat;
    if (!chat?.participants) return;

    chat.participants.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
      socket.to(user._id).emit("message received", newMessage);
    });
  });

  socket.on("typing", (chatId) => socket.to(chatId).emit("typing"));
  socket.on("stop typing", (chatId) => socket.to(chatId).emit("stop typing"));

  socket.on("message seen", ({ messageId, chatId }) => {
    socket.to(chatId).emit("message seen", messageId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ Dynamic port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
