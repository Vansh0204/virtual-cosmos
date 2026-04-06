import { activeUsers } from '../index.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

const PROXIMITY_RADIUS = 150;

export const handleMovement = (io, socket, data) => {
  const { x, y } = data;
  const user = activeUsers.get(socket.id);
  if (!user) return;

  user.x = x;
  user.y = y;
  
  // Broadcast move to others
  socket.broadcast.emit('user-moved', { userId: socket.id, x, y });

  // Compute proximity
  checkProximity(io, socket.id);
};

const checkProximity = (io, moverId) => {
  const mover = activeUsers.get(moverId);
  if (!mover) return;

  activeUsers.forEach((otherUser, otherId) => {
    if (moverId === otherId) return;

    const dx = mover.x - otherUser.x;
    const dy = mover.y - otherUser.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const isConnected = distance <= PROXIMITY_RADIUS;
    const currentlyConnected = mover.connectedTo.includes(otherId);

    const roomId = [moverId, otherId].sort().join('-');

    if (isConnected && !currentlyConnected) {
      // newly connected
      mover.connectedTo.push(otherId);
      otherUser.connectedTo.push(moverId);
      
      const moverSocket = io.sockets.sockets.get(moverId);
      const otherSocket = io.sockets.sockets.get(otherId);
      
      if (moverSocket) {
        moverSocket.join(roomId);
        moverSocket.emit('proximity-connect', { roomId, userId: otherId, username: otherUser.username });
        moverSocket.emit('proximity-update', { nearbyUserIds: mover.connectedTo });
        sendChatHistory(moverSocket, roomId);
      }
      if (otherSocket) {
        otherSocket.join(roomId);
        otherSocket.emit('proximity-connect', { roomId, userId: moverId, username: mover.username });
        otherSocket.emit('proximity-update', { nearbyUserIds: otherUser.connectedTo });
        sendChatHistory(otherSocket, roomId);
      }
    } else if (!isConnected && currentlyConnected) {
      // newly disconnected
      mover.connectedTo = mover.connectedTo.filter(id => id !== otherId);
      otherUser.connectedTo = otherUser.connectedTo.filter(id => id !== moverId);
      
      const moverSocket = io.sockets.sockets.get(moverId);
      const otherSocket = io.sockets.sockets.get(otherId);
      
      if (moverSocket) {
        moverSocket.leave(roomId);
        moverSocket.emit('proximity-disconnect', { roomId, userId: otherId });
        moverSocket.emit('proximity-update', { nearbyUserIds: mover.connectedTo });
      }
      if (otherSocket) {
        otherSocket.leave(roomId);
        otherSocket.emit('proximity-disconnect', { roomId, userId: moverId });
        otherSocket.emit('proximity-update', { nearbyUserIds: otherUser.connectedTo });
      }
    }
  });
};

const sendChatHistory = async (socket, roomId) => {
  try {
    const messages = await Message.find({ roomId })
      .sort({ timestamp: -1 })
      .limit(20);
    socket.emit('chat-history', { roomId, messages: messages.reverse() });
  } catch (err) {
    console.error('Error fetching chat history:', err);
  }
};

export const handleDisconnect = async (io, socket) => {
  const user = activeUsers.get(socket.id);
  if (user) {
    try {
      // Save final position to DB
      await User.findOneAndUpdate(
        { userId: socket.id },
        { lastX: user.x, lastY: user.y, lastSeen: new Date() }
      );
    } catch (err) {
      console.error('Error saving user to DB on disconnect:', err);
    }

    // Disconnect from all connected users
    user.connectedTo.forEach(otherId => {
      const otherUser = activeUsers.get(otherId);
      if (otherUser) {
        otherUser.connectedTo = otherUser.connectedTo.filter(id => id !== socket.id);
        const roomId = [socket.id, otherId].sort().join('-');
        const otherSocket = io.sockets.sockets.get(otherId);
        if (otherSocket) {
          otherSocket.leave(roomId);
          otherSocket.emit('proximity-disconnect', { roomId, userId: socket.id });
          otherSocket.emit('proximity-update', { nearbyUserIds: otherUser.connectedTo });
        }
      }
    });

    activeUsers.delete(socket.id);
    socket.broadcast.emit('user-left', { userId: socket.id });
  }
};
