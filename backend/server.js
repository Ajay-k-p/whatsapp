require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chats");
const messageRoutes = require("./routes/messages");
const statusRoutes = require("./routes/statuses");
const mediaRoutes = require("./routes/media");
const userRoutes = require("./routes/userRoutes");

const { initSocket } = require("./utils/socket");

const app = express();

/* =========================
   HTTP SERVER
========================= */
const server = http.createServer(app);

/* =========================
   CORS CONFIG
========================= */
const allowedOrigins = [
  "http://localhost:3000",
  "https://your-frontend.vercel.app" // 🔴 CHANGE THIS
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

/* =========================
   BODY PARSERS
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   SOCKET.IO
========================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Make io accessible everywhere
app.set("io", io);

// Initialize socket events
initSocket(io);

/* =========================
   MONGODB CONNECTION
========================= */
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/statuses", statusRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/user", userRoutes);

/* =========================
   HEALTH CHECK (IMPORTANT FOR RENDER)
========================= */
app.get("/", (req, res) => {
  res.send("WhatsApp Clone API is running 🚀");
});

/* =========================
   SERVER LISTEN
========================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
