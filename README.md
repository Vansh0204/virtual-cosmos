# 🌌 Virtual Cosmos

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![PixiJS](https://img.shields.io/badge/PixiJS-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://pixijs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**Virtual Cosmos** is a fully functioning, real-time 2D multiplayer virtual environment where users can freely navigate their avatars and initiate spatial, proximity-based chat sessions with others seamlessly.

This project was built to test real-time logic, spatial proximity detection, backend state management, and modern interactive frontend rendering techniques.

---

## 🎯 Core Features

### Must Haves (Implemented)
- **🚀 User Movement:** Fluid, decoupled 2D navigation rendered onto a vast virtual canvas using **PixiJS**. Users can traverse seamlessly via **Arrow Keys**.
- **🌐 Real-Time Multiplayer:** The server broadcasts state synchronization. As users join, they instantly appear on-screen for active peers without visual stutter thanks to real-time `Socket.IO` coordinate transmissions.
- **📡 Proximity Detection:** Complex radial Euclidean distance calculated at runtime. When two users get closer than `150 pixels`, they physically connect; when they separate, they disconnect.
- **💬 Dynamic Chat Rooms:** Moving into another user's proximity automatically joins you into a dedicated, deterministic messaging socket room—and sliding open the Tailwind CSS powered chat panel overlay. 
- **✨ Clean UI/UX:** Features glassmorphism modals, mini-map radars, live connection stat trackers, active overlapping room indicators, and buttery-smooth interpolating animations down to the `requestAnimationFrame` level.

### Bonus / Stretch Goals (Implemented)
- **🎨 User Color Customization:** Pick between 5 sleek, contrasting styling classes during initial onboarding.
- **📜 Persistent Chat History:** MongoDB instances intercept transient messaging sequences. The platform safely merges the last 20 previously sent messages inside physical chat sectors the second you walk back into an old friend's radius.
- **💡 Emoji Reactions:** A quick toggle layout configured inside the event loop! Press **`1` through `5`** instantly on your keyboard to emit floating particle reactions above your Avatar. 
- **📍 Named Zones (Biomes):** Interactive ambient biomes designated in coordinate ranges (e.g., Lounge and Meeting Area). When walked through, the backdrop colors seamlessly ease into a new atmospheric background layer.

---

## 🛠️ Architecture Overview

The system runs on two discrete decoupled services relying on bidirectional multiplex WebSocket pathways. Submissions limit payload flooding via `33ms` throttled emissions—ensuring scalability without congesting the NodeJS environment. 

1. **Frontend (Vite Server):** Operates strict presentation and visual interpolation. Reads the global `users` state tree to calculate target properties via smooth linear interpolation math (Lerping).
2. **Backend Engine (Express):** Responsible for executing spatial calculations and preventing client-manipulated boundaries. State commits back to the local database securely to prevent session loss on drop.

---

## 🚀 Setting up the Project locally

### Prerequisites
Before running, make sure you have installed on your system:
- **Node.js** (v18+)
- **MongoDB** running natively on `localhost:27017` (If you use Atlas, replace the `MONGO_URI` below)

### 1. Clone & Install
```bash
git clone https://github.com/Vansh0204/virtual-cosmos.git
cd virtual-cosmos
```

### 2. Boot the Backend (Server)
```bash
cd server
npm install 
```
Create a `.env` file inside `/server` (if it does not exist) to hook into MongoDB:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/virtual-cosmos
```
Start running:
```bash
npm run dev
```

### 3. Boot the Frontend (Client Side)
Open a new terminal window inside the cloned location: 
```bash
cd client
npm install
```
Create a `.env` file inside `/client` (if it does not exist) pointing sockets back toward your Node instance:
```env
VITE_SOCKET_URL=http://localhost:4000
```
Start the web app!
```bash
npm run dev
```

Visit the application at: **`http://localhost:5173`**

---

*Authored by Vansh for the Virtual Cosmos Assignment.*
