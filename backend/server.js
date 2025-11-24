require("dotenv").config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');
const statusRoutes = require('./routes/statuses');
const mediaRoutes = require('./routes/media');

const { initSocket } = require('./utils/socket');

const app = express();

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// ========================================
// 🔥 CONNECT TO MONGODB ATLAS (SECURELY)
// ========================================
// We now use the variable from the .env file instead of the hardcoded link
mongoose.connect(
  process.env.MONGO_URI, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log("MongoDB Atlas Connected ✔"))
.catch((err) => console.error("MongoDB Atlas Error ❌:", err));

// ========================================
// 🔥 ROUTES
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/media', mediaRoutes);

// ⬇️ NEW ROUTE FOR PROFILE PICTURE UPDATE
app.use("/api/user", require("./routes/userRoutes"));

// ========================================
// 🔥 SOCKET.IO INITIALIZATION
// ========================================
initSocket(io);

// ========================================
// SERVER LISTEN
// ========================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));