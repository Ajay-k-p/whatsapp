// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

// ROUTES
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chats");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/userRoutes");
const mediaRoutes = require("./routes/media");

const { initSocket } = require("./utils/socket");

const app = express();
app.use(express.json({ limit: "20mb" }));

/* ---------------------------------------------------
   ✅ FIXED — STRICT CORS FOR VERCEL + RENDER
--------------------------------------------------- */

// Your Vercel frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || "https://whatsapp-silk-xi.vercel.app";

// Backend Render URL (for Socket)
const RENDER_URL = process.env.RENDER_URL || "https://whatsapp-i2eo.onrender.com";

app.use(
  cors({
    origin: FRONTEND_URL, // ❗ NO WILDCARD
    credentials: true, // ❗ required because axios uses withCredentials
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ---------------------------------------------------
   ROUTES
--------------------------------------------------- */

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/media", mediaRoutes);

// Health route
app.get("/", (req, res) => {
  res.send("WhatsApp Clone API is running");
});

/* ---------------------------------------------------
   SOCKET.IO WITH STRICT CORS
--------------------------------------------------- */

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
  transports: ["websocket", "polling"],
  path: "/socket.io",
});

initSocket(io);

/* ---------------------------------------------------
   MONGO CONNECTION
--------------------------------------------------- */

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* ---------------------------------------------------
   START SERVER
--------------------------------------------------- */

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
  console.log("🌐 Allowed Frontend:", FRONTEND_URL);
});
