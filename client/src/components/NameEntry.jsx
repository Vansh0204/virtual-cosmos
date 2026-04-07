import React, { useState } from 'react';

const NameEntry = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4ade80');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim(), color);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">Virtual Cosmos</h1>
        <p className="text-gray-400 text-center mb-6">Enter your name to join the space</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Username"
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 border border-gray-700 transition"
              autoFocus
              maxLength={15}
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Avatar Color</label>
            <div className="flex justify-between">
              {['#f87171', '#60a5fa', '#4ade80', '#fbbf24', '#c084fc'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full border-2 transition-transform ${color === c === c ? 'scale-110 border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
          >
            Join Cosmos
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameEntry;
