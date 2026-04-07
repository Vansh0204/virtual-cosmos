import React, { useState, useEffect } from 'react';
import NameEntry from './components/NameEntry';
import CosmosCanvas from './components/CosmosCanvas';
import ChatPanel from './components/ChatPanel';
import { useSocket } from './hooks/useSocket';
import { useProximity } from './hooks/useProximity';

function App() {
  const socket = useSocket();
  const [hasJoined, setHasJoined] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  
  const { nearbyUserIds, activeRooms } = useProximity(socket);

  const handleJoin = (username, color) => {
    if (!socket) return;
    
    socket.connect();
    
    const initialX = Math.random() * 800 + 400;
    const initialY = Math.random() * 800 + 400;

    socket.emit('join', { username, x: initialX, y: initialY });
    
    setHasJoined(true);
    setCurrentUser({ userId: 'temp-id', username, color, x: initialX, y: initialY });
  };

  useEffect(() => {
    if (!socket) return;
    
    socket.on('connect', () => {
      setCurrentUser((prev) => prev ? { ...prev, userId: socket.id } : null);
    });

    socket.on('init', ({ users: initialUsers }) => {
      // Find current user safely
      const me = initialUsers.find(u => u.userId === socket.id);
      if (me) {
        setCurrentUser(prev => ({ ...prev, ...me }));
      }
      setUsers(initialUsers);
    });

    socket.on('user-joined', (user) => {
      setUsers((prev) => [...prev, user]);
    });

    socket.on('user-moved', ({ userId, x, y }) => {
      setUsers((prev) => prev.map(u => u.userId === userId ? { ...u, x, y } : u));
    });

    socket.on('user-left', ({ userId }) => {
      setUsers((prev) => prev.filter(u => u.userId !== userId));
    });

    return () => {
      socket.off('connect');
      socket.off('init');
      socket.off('user-joined');
      socket.off('user-moved');
      socket.off('user-left');
    };
  }, [socket]);

  const handleMove = (x, y) => {
    if (socket && currentUser) {
      setCurrentUser(p => ({ ...p, x, y })); // Optimsitic update for minimap
      socket.emit('move', { x, y });
    }
  };

  // Safe unique users map including currentUser
  const allUsersToRender = [
    ...(currentUser && currentUser.userId !== 'temp-id' ? [currentUser] : []),
    ...users.filter(u => u.userId !== currentUser?.userId)
  ];

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-900 relative font-sans text-white">
      {!hasJoined && <NameEntry onJoin={handleJoin} />}
      
      {hasJoined && currentUser && (
        <>
          <CosmosCanvas 
            socket={socket}
            currentUser={currentUser} 
            users={allUsersToRender} 
            onMove={handleMove}
            nearbyUserIds={nearbyUserIds}
          />
          
          <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-30 flex justify-between items-start">
            <div className="bg-gray-900/80 backdrop-blur px-4 py-2 rounded-xl border border-gray-700 shadow-lg pointer-events-auto">
              <h1 className="text-xl font-bold text-blue-400">Virtual Cosmos</h1>
              <div className="text-sm font-medium text-gray-400 flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                {allUsersToRender.length} User{allUsersToRender.length !== 1 ? 's' : ''} Online
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 z-30 pointer-events-none bg-gray-900/80 backdrop-blur px-4 py-3 rounded-xl border border-gray-700 shadow-lg">
            <p className="text-sm text-gray-400 font-mono mb-2">
              <span className="text-white font-bold bg-gray-800 px-2 py-1 rounded">Arrows</span> to Move
            </p>
            <p className="text-sm text-gray-400 font-mono">
              <span className="text-white font-bold bg-gray-800 px-2 py-1 rounded">1-5</span> to React
            </p>
          </div>

          <div className="absolute bottom-4 right-4 z-30 w-32 h-32 bg-gray-900/80 backdrop-blur rounded-xl border border-gray-700 overflow-hidden opacity-80 pointer-events-none">
            {/* minimap simple implementation */}
            <div className="relative w-full h-full">
               {allUsersToRender.map(u => (
                 <div 
                   key={u.userId}
                   className={`absolute w-1.5 h-1.5 rounded-full ${u.userId === currentUser.userId ? 'bg-white z-10' : 'bg-green-500'}`}
                   style={{ 
                     left: `${(u.x / 4000) * 100}%`, 
                     top: `${(u.y / 4000) * 100}%`,
                     transform: 'translate(-50%, -50%)'
                   }}
                 />
               ))}
            </div>
          </div>

          <ChatPanel 
            activeRooms={activeRooms} 
            socket={socket} 
            currentUserId={currentUser?.userId} 
          />
        </>
      )}
    </div>
  );
}

export default App;
