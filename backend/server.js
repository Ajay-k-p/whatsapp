// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// import routes (adjust paths if your project uses different names)
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/userRoutes');
const mediaRoutes = require('./routes/media');

const { initSocket } = require('./utils/socket');

const app = express();
app.use(express.json({ limit: '20mb' }));

// Configure CORS for Vercel -> Render cross-origin requests
const CLIENT_URL = process.env.CLIENT_URL || process.env.VERCEL_URL || '*';
app.use(cors({
  origin: CLIENT_URL === '*' ? '*' : CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Routes (prefix with /api if you use it)
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/user', userRoutes);
app.use('/api/media', mediaRoutes);

// Basic health route
app.get('/', (req, res) => res.send('WhatsApp Clone API is running'));

// Create server and socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: CLIENT_URL === '*' ? '*' : CLIENT_URL,
    methods: ['GET','POST'],
    credentials: true
  },
  path: '/socket.io',
  transports: ['websocket','polling']
});

// Initialize socket handling (see utils/socket.js)
initSocket(io);

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in env!');
  process.exit(1);
}
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
