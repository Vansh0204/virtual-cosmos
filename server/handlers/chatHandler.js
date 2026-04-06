import { activeUsers } from '../index.js';
import Message from '../models/Message.js';

export const handleChat = async (io, socket, data) => {
  const { roomId, text } = data;
  const user = activeUsers.get(socket.id);
  if (!user) return;

  const timestamp = new Date().toISOString();

  const messageData = {
    roomId,
    fromUserId: socket.id,
    fromUsername: user.username,
    text,
    timestamp
  };

  // Broadcast message to everyone in the room
  io.to(roomId).emit('message', messageData);

  // Store message history
  try {
    await Message.create(messageData);
  } catch (err) {
    console.error('Failed to save message:', err);
  }
};
