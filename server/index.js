import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { handleMovement, handleDisconnect } from './handlers/movementHandler.js';
import { handleChat } from './handlers/chatHandler.js';

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/virtual-cosmos';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// In-memory Map for active users
// Key: socket.id, Value: { userId, username, x, y, connectedTo: [] }
export const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', async (data) => {
    const { username, x, y } = data;
    
    // 1. Instantly update active memory and broadcast state
    const userData = {
      userId: socket.id,
      username,
      x,
      y,
      connectedTo: []
    };
    activeUsers.set(socket.id, userData);

    const allCurrentUsers = Array.from(activeUsers.values());
    socket.emit('init', { users: allCurrentUsers });
    socket.broadcast.emit('user-joined', userData);

    // 2. Perform DB logic asynchronously without blocking the UI
    try {
      const User = (await import('./models/User.js')).default;
      await User.findOneAndUpdate(
        { userId: socket.id },
        { 
          userId: socket.id,
          username,
          lastX: x,
          lastY: y,
          lastSeen: new Date()
        },
        { upsert: true }
      );
    } catch (err) {
      console.error('Error saving user to DB:', err);
    }
  });

  socket.on('move', (data) => handleMovement(io, socket, data));
  socket.on('message', (data) => handleChat(io, socket, data));
  
  socket.on('reaction', (data) => {
    socket.broadcast.emit('user-reaction', { userId: socket.id, emoji: data.emoji });
    socket.emit('user-reaction', { userId: socket.id, emoji: data.emoji });
  });
  
  socket.on('disconnect', async () => {
    await handleDisconnect(io, socket);
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
