import { useState, useEffect } from 'react';

export const useProximity = (socket) => {
  const [nearbyUserIds, setNearbyUserIds] = useState(new Set());
  const [activeRooms, setActiveRooms] = useState({}); // { roomId: { userId, username } }

  useEffect(() => {
    if (!socket) return;

    socket.on('proximity-update', ({ nearbyUserIds }) => {
      setNearbyUserIds(new Set(nearbyUserIds));
    });

    socket.on('proximity-connect', ({ roomId, userId, username }) => {
      setActiveRooms((prev) => ({
        ...prev,
        [roomId]: { userId, username }
      }));
    });

    socket.on('proximity-disconnect', ({ roomId }) => {
      setActiveRooms((prev) => {
        const updated = { ...prev };
        delete updated[roomId];
        return updated;
      });
    });

    return () => {
      socket.off('proximity-update');
      socket.off('proximity-connect');
      socket.off('proximity-disconnect');
    };
  }, [socket]);

  return { nearbyUserIds, activeRooms };
};
