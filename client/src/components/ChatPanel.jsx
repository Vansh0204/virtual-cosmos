import React, { useState, useEffect, useRef } from 'react';

const ChatPanel = ({ activeRooms, socket, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const roomIds = Object.keys(activeRooms);
  const hasConnection = roomIds.length > 0;

  useEffect(() => {
    if (hasConnection) {
      setIsOpen(true);
    } else {
      const timer = setTimeout(() => setIsOpen(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasConnection]);

  useEffect(() => {
    if (!socket) return;
    
    const handleMessage = (msg) => {
      setMessages(p => [...p, msg]);
    };
    
    const handleHistory = ({ roomId, messages: historicMessages }) => {
      setMessages(p => {
        const existingTimestamps = new Set(p.map(m => m.timestamp));
        const newMsgs = historicMessages.filter(m => !existingTimestamps.has(m.timestamp));
        return [...p, ...newMsgs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
    };
    
    socket.on('message', handleMessage);
    socket.on('chat-history', handleHistory);
    
    return () => {
      socket.off('message', handleMessage);
      socket.off('chat-history', handleHistory);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !hasConnection) return;
    
    // Broadcast to all active connected rooms
    roomIds.forEach(roomId => {
      socket.emit('message', { roomId, text: input });
    });
    
    setInput('');
  };

  const currentNames = Object.values(activeRooms).map(r => r.username);
  const headerText = hasConnection ? `Connected with ${currentNames.join(', ')}` : 'Chat ended — you moved apart';

  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-gray-900/90 backdrop-blur-md border-l border-gray-800 shadow-2xl flex flex-col transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${hasConnection ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <h2 className="text-white font-semibold flex-1 truncate">{headerText}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => {
          const isMe = m.fromUserId === currentUserId;
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="text-xs text-gray-500 mb-1">{m.fromUsername}</div>
              <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!hasConnection}
            placeholder={hasConnection ? "Type a message..." : "Disconnected..."}
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!hasConnection || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full disabled:opacity-50 transition flex items-center justify-center w-10 h-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
