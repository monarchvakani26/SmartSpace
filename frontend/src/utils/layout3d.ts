import { LayoutItem } from '../types';

/** The canonical plan unit is feet. Three world units intentionally equal one foot. */
export const feetToWorld = (feet: number) => feet;
export const worldToFeet = (world: number) => world;
export const layout2DTo3D = (item: LayoutItem) => ({ x: feetToWorld(item.x + item.widthFt / 2), y: feetToWorld((item.verticalHeightFt || 2.5) / 2), z: feetToWorld(item.y + item.heightFt / 2) });
export const layout3DTo2D = (worldX: number, worldZ: number, item: LayoutItem) => ({ x: worldToFeet(worldX - item.widthFt / 2), y: worldToFeet(worldZ - item.heightFt / 2) });
export const SNAP_DISTANCE_FT = 0.35; // approximately 100 mm

export function clampAndSnap(item: LayoutItem, x: number, y: number, lengthFt: number, widthFt: number) {
  const maxX = Math.max(0, lengthFt - item.widthFt), maxY = Math.max(0, widthFt - item.heightFt);
  let nextX = Math.max(0, Math.min(maxX, x)), nextY = Math.max(0, Math.min(maxY, y));
  if (nextX < SNAP_DISTANCE_FT) nextX = 0; if (maxX - nextX < SNAP_DISTANCE_FT) nextX = maxX;
  if (nextY < SNAP_DISTANCE_FT) nextY = 0; if (maxY - nextY < SNAP_DISTANCE_FT) nextY = maxY;
  return { x: Number(nextX.toFixed(2)), y: Number(nextY.toFixed(2)) };
}

// MVP collision is an axis-aligned footprint test. Rotated items use their conservative AABB.
export function footprint(item: LayoutItem) {
  const r = item.rotation * Math.PI / 180, w = Math.abs(item.widthFt * Math.cos(r)) + Math.abs(item.heightFt * Math.sin(r)), d = Math.abs(item.widthFt * Math.sin(r)) + Math.abs(item.heightFt * Math.cos(r));
  const x = item.x + item.widthFt / 2, y = item.y + item.heightFt / 2;
  return { left: x - w / 2, right: x + w / 2, top: y - d / 2, bottom: y + d / 2 };
}
export function checkCollision(a: LayoutItem, b: LayoutItem) { const A = footprint(a), B = footprint(b); return A.left < B.right && A.right > B.left && A.top < B.bottom && A.bottom > B.top; }
export function collisionIds(items: LayoutItem[]) { const invalid = new Set<string>(); for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) if (checkCollision(items[i], items[j])) { invalid.add(items[i].id); invalid.add(items[j].id); } return invalid; }
