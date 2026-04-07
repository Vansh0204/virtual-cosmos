# Virtual Cosmos

A 2D real-time multiplayer virtual space where users can move around and chat with each other based on physical proximity.

## Tech Stack

| Component | Technology |
| --- | --- |
| Frontend | React (Vite), PixiJS, Tailwind CSS |
| Backend | Node.js, Express, Socket.IO, MongoDB |

## Prerequisites
- Node.js 18+
- MongoDB running on localhost:27017

## Setup

Start the Backend Server:
```bash
cd server
npm install
npm run dev
```

Start the Frontend View:
```bash
cd client
npm install
npm run dev
```

## How Proximity Logic Works
The server listens for `move` events from clients. On every move, the server calculates the Euclidean distance between the moving user and all other connected users. If the distance falls below a configurable threshold (150 pixels), a connection is established, generating a unique `roomId` based on their sorted user IDs. The server emits a `proximity-connect` event, joining both users to the Socket.IO room for chatting. If they move apart beyond the threshold, it emits `proximity-disconnect` and leaves the room.

## Environment Variables
Server (`server/.env`):
- `PORT` (default: 4000)
- `MONGO_URI` (default: mongodb://localhost:27017/virtual-cosmos)

Client (`client/.env`):
- `VITE_SOCKET_URL` (default: http://localhost:4000)
