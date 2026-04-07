import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { createUserAvatar } from './UserAvatar.jsx';

const CosmosCanvas = ({ socket, currentUser, users, onMove, nearbyUserIds }) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const avatarsRef = useRef({});
  const graphicsRef = useRef(null);

  useEffect(() => {
    // Initialize Pixi Application
    const app = new PIXI.Application({
      resizeTo: window,
      backgroundColor: 0x111827,
      antialias: true
    });
    
    canvasRef.current.appendChild(app.view);
    appRef.current = app;

    // Background Grid
    const bgContainer = new PIXI.Container();
    app.stage.addChild(bgContainer);
    
    const gridGraphics = new PIXI.Graphics();
    gridGraphics.lineStyle(1, 0x1f2937, 0.5);
    const w = 4000;
    const h = 4000;
    for (let i = 0; i < w; i += 50) {
      gridGraphics.moveTo(i, 0);
      gridGraphics.lineTo(i, h);
    }
    for (let j = 0; j < h; j += 50) {
      gridGraphics.moveTo(0, j);
      gridGraphics.lineTo(w, j);
    }
    bgContainer.addChild(gridGraphics);

    // Zones implementation
    const zones = [
      { name: 'Lounge (Chill)', x: 300, y: 200, w: 600, h: 400, color: 0x3b82f6 },
      { name: 'Meeting Area', x: 1200, y: 500, w: 500, h: 500, color: 0xef4444 }
    ];
    
    const zonesContainer = new PIXI.Container();
    bgContainer.addChild(zonesContainer);
    
    zones.forEach(zone => {
      const g = new PIXI.Graphics();
      g.beginFill(zone.color, 0.15);
      g.lineStyle(2, zone.color, 0.8);
      g.drawRect(zone.x, zone.y, zone.w, zone.h);
      g.endFill();
      zonesContainer.addChild(g);

      const zoneText = new PIXI.Text(zone.name, new PIXI.TextStyle({ 
        fontFamily: 'Inter, sans-serif',
        fill: '#ffffff', 
        fontSize: 24, 
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowBlur: 2,
        dropShadowDistance: 0
      }));
      zoneText.x = zone.x + 20;
      zoneText.y = zone.y + 20;
      zonesContainer.addChild(zoneText);
    });

    // Lines container for proximity connections
    const linesGraphics = new PIXI.Graphics();
    app.stage.addChild(linesGraphics);
    graphicsRef.current = linesGraphics;

    // Movement Tracking
    const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
    
    const handleKeyDown = (e) => { 
      if (keys[e.key] !== undefined) keys[e.key] = true; 

      // Emoji reactions
      const emojiMap = { '1': '😀', '2': '❤️', '3': '😂', '4': '👍', '5': '🎉' };
      if (emojiMap[e.key] && socket) {
        socket.emit('reaction', { emoji: emojiMap[e.key] });
      }
    };
    const handleKeyUp = (e) => { if (keys[e.key] !== undefined) keys[e.key] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let lastEmitTime = 0;

    app.ticker.add(() => {
      const me = avatarsRef.current[currentUser.userId];
      if (!me) return;

      let moved = false;
      const speed = 4;
      const appWidth = app.screen.width;
      const appHeight = app.screen.height;

      if (keys.ArrowUp) { me.y -= speed; moved = true; }
      if (keys.ArrowDown) { me.y += speed; moved = true; }
      if (keys.ArrowLeft) { me.x -= speed; moved = true; }
      if (keys.ArrowRight) { me.x += speed; moved = true; }

      if (moved) {
        me.x = Math.max(24, Math.min(4000 - 24, me.x));
        me.y = Math.max(24, Math.min(4000 - 24, me.y));

        const now = Date.now();
        if (now - lastEmitTime > 33) {
          onMove(me.x, me.y);
          lastEmitTime = now;
        }
      }

      app.stage.position.x = appWidth / 2 - me.x;
      app.stage.position.y = appHeight / 2 - me.y;

      // Check current zone
      let currentZone = null;
      zones.forEach(z => {
        if (me.x > z.x && me.x < z.x + z.w && me.y > z.y && me.y < z.y + z.h) {
          currentZone = z;
        }
      });

      if (currentZone) {
        app.renderer.background.color = 0x1e293b;
      } else {
        app.renderer.background.color = 0x111827; // default
      }

      // Render proximity connections
      graphicsRef.current.clear();
      graphicsRef.current.lineStyle(2, 0x4ade80, 0.4);
      nearbyUserIds.forEach(id => {
        const other = avatarsRef.current[id];
        if (other) {
          graphicsRef.current.moveTo(me.x, me.y);
          graphicsRef.current.lineTo(other.x, other.y);
        }
      });
      
      // Interpolate other users for smooth movement
      Object.keys(avatarsRef.current).forEach(id => {
        if (id === currentUser.userId) return;
        const avatar = avatarsRef.current[id];
        if (avatar.targetX !== undefined && avatar.targetY !== undefined) {
          avatar.x += (avatar.targetX - avatar.x) * 0.1;
          avatar.y += (avatar.targetY - avatar.y) * 0.1;
        }
      });
    });

    if (socket) {
      socket.on('user-reaction', ({ userId, emoji }) => {
        const container = avatarsRef.current[userId];
        if (!container) return;

        const style = new PIXI.TextStyle({ fontSize: 40 });
        const text = new PIXI.Text(emoji, style);
        text.anchor.set(0.5);
        text.y = -50;
        container.addChild(text);

        let alpha = 1;
        let yPos = -50;
        const anim = () => {
          alpha -= 0.02;
          yPos -= 1;
          text.y = yPos;
          text.alpha = alpha;
          if (alpha <= 0) {
            container.removeChild(text);
            app.ticker.remove(anim);
          }
        };
        app.ticker.add(anim);
      });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (socket) socket.off('user-reaction');
      app.destroy(true, true);
    };
  }, [currentUser.userId, socket]);

  // Sync users
  useEffect(() => {
    if (!appRef.current) return;
    const stage = appRef.current.stage;

    // Add new users
    users.forEach(user => {
      if (!avatarsRef.current[user.userId]) {
        const isCurrent = user.userId === currentUser.userId;
        const container = createUserAvatar(user, isCurrent);
        
        // If current user, place them instantly
        if (isCurrent) {
          container.x = user.x;
          container.y = user.y;
        } else {
          container.x = user.x ?? 0;
          container.y = user.y ?? 0;
          container.targetX = user.x ?? 0;
          container.targetY = user.y ?? 0;
        }

        stage.addChild(container);
        avatarsRef.current[user.userId] = container;
      } else {
        // Update existing user targets
        const avatar = avatarsRef.current[user.userId];
        if (user.userId !== currentUser.userId) {
          avatar.targetX = user.x;
          avatar.targetY = user.y;
        }
      }
    });

    // Remove old users
    const userIds = users.map(u => u.userId);
    Object.keys(avatarsRef.current).forEach(id => {
      if (!userIds.includes(id)) {
        stage.removeChild(avatarsRef.current[id]);
        delete avatarsRef.current[id];
      }
    });
  }, [users, currentUser.userId]);

  return <div ref={canvasRef} className="absolute inset-0 overflow-hidden bg-gray-900" />;
};

export default CosmosCanvas;
