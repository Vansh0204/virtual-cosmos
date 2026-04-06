import * as PIXI from 'pixi.js';

export const createUserAvatar = (user, isCurrent = false) => {
  const container = new PIXI.Container();
  container.x = user.x;
  container.y = user.y;

  // Proximity ring
  if (isCurrent) {
    const ring = new PIXI.Graphics();
    ring.lineStyle(2, 0x4ade80, 0.3);
    ring.beginFill(0x4ade80, 0.05);
    ring.drawCircle(0, 0, 150); // PROXIMITY_RADIUS = 150
    ring.endFill();
    container.addChild(ring);
  }

  // Draw Avatar Circle
  const circle = new PIXI.Graphics();
  const colorHex = user.color ? parseInt(user.color.replace('#', '0x'), 16) : 0x4ade80;
  
  if (isCurrent) {
    circle.lineStyle(3, 0xffffff, 1); // Highlight current user
  }
  circle.beginFill(colorHex);
  circle.drawCircle(0, 0, 24);
  circle.endFill();
  container.addChild(circle);

  // Username label
  const style = new PIXI.TextStyle({
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    fill: '#ffffff',
    align: 'center',
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 2,
    dropShadowDistance: 0
  });
  const text = new PIXI.Text(user.username, style);
  text.anchor.set(0.5);
  text.y = 36;
  container.addChild(text);
  
  return container;
};

// Default export if needed as a React component, though we use the function helper
export default function UserAvatar() {
  return null;
}
