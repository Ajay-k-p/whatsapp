// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

// ROUTES
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chats");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/userRoutes");
const mediaRoutes = require("./routes/media");

const { initSocket } = require("./utils/socket");

const app = express();
app.use(express.json({ limit: "25mb" }));

/* ---------------------------------------------------
   ✅ STRICT CORS FOR VERCEL FRONTEND + RENDER BACKEND
--------------------------------------------------- */

const FRONTEND_URL = process.env.FRONTEND_URL || "https://whatsapp-silk-xi.vercel.app";

app.use(
  cors({
    origin: FRONTEND_URL,       // ❗ Specific domain only (no *)
    credentials: true,          // ❗ Required for login
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ---------------------------------------------------
   API ROUTES
--------------------------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/media", mediaRoutes);

app.get("/", (req, res) => {
  res.send("WhatsApp Clone API is running");
});

/* ---------------------------------------------------
   SOCKET.IO CORS CONFIG
--------------------------------------------------- */

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
  transports: ["websocket"],
});

initSocket(io);

/* ---------------------------------------------------
   MONGODB CONNECTION
--------------------------------------------------- */

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* ---------------------------------------------------
   START SERVER
--------------------------------------------------- */

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("🚀 Backend Running on:", PORT);
  console.log("🌐 CORS Allowed:", FRONTEND_URL);
});
