import { LayoutItem } from '../types';

/**
 * The persisted plan unit is feet (the existing Prisma schema uses feet).
 * Three.js uses the same scale: one world unit is one foot.  Conversion helpers
 * keep the UI/API boundary explicit when a site measurement is supplied in mm.
 */
export const MM_PER_FOOT = 304.8;
export const mmToFeet = (mm: number) => mm / MM_PER_FOOT;
export const feetToMm = (feet: number) => feet * MM_PER_FOOT;
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
export function collisionIds(items: LayoutItem[]) { const invalid = new Set<string>(); const furniture = items.filter(item => !/door|window/.test(`${item.category || ''} ${item.name}`.toLowerCase())); for (let i = 0; i < furniture.length; i++) for (let j = i + 1; j < furniture.length; j++) if (checkCollision(furniture[i], furniture[j])) { invalid.add(furniture[i].id); invalid.add(furniture[j].id); } return invalid; }

const isOpening = (item: LayoutItem) => /door|window/.test(`${item.category || ''} ${item.name}`.toLowerCase());
const isDoor = (item: LayoutItem) => /door/.test(`${item.category || ''} ${item.name}`.toLowerCase());
const intersects = (a: ReturnType<typeof footprint>, b: ReturnType<typeof footprint>) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

/** Keeps doors/windows as room fixtures, rather than treating them as furniture collisions. */
export function furnitureItems(items: LayoutItem[]) { return items.filter(item => !isOpening(item)); }
export function doorClearanceViolations(items: LayoutItem[]) {
  const doors = items.filter(isDoor), furniture = furnitureItems(items);
  const blocked: Array<{ door: LayoutItem; item: LayoutItem }> = [];
  for (const door of doors) for (const item of furniture) {
    const doorBox = footprint(door);
    // A one-foot expansion represents the swing / approach zone for the plan-level door symbol.
    const clearance = { left: doorBox.left - 1, right: doorBox.right + 1, top: doorBox.top - 1, bottom: doorBox.bottom + 1 };
    if (intersects(clearance, footprint(item))) blocked.push({ door, item });
  }
  return blocked;
}

export interface DesignAnalysis {
  roomAreaSqFt: number; occupiedAreaSqFt: number; freeAreaSqFt: number;
  utilizationPercent: number; walkablePercent: number; collisionPairs: Array<[LayoutItem, LayoutItem]>;
  boundaryItemIds: string[]; doorObstructions: Array<{ door: LayoutItem; item: LayoutItem }>; score: number; recommendation: string;
}

/** A 1 ft grid is intentionally conservative and derived entirely from the live layout. */
export function analyzeLayout(items: LayoutItem[], lengthFt: number, widthFt: number): DesignAnalysis {
  const furniture = furnitureItems(items);
  const roomAreaSqFt = lengthFt * widthFt;
  const collisionPairs: Array<[LayoutItem, LayoutItem]> = [];
  const boundaryItemIds = items.filter(item => {
    const box = footprint(item);
    return box.left < 0 || box.top < 0 || box.right > lengthFt || box.bottom > widthFt;
  }).map(item => item.id);
  for (let i = 0; i < furniture.length; i++) for (let j = i + 1; j < furniture.length; j++) if (checkCollision(furniture[i], furniture[j])) collisionPairs.push([furniture[i], furniture[j]]);
  const occupiedAreaSqFt = furniture.reduce((sum, item) => sum + item.widthFt * item.heightFt, 0);
  let total = 0, blocked = 0;
  for (let x = .5; x < lengthFt; x += 1) for (let y = .5; y < widthFt; y += 1) {
    total++;
    if (furniture.some(item => { const box = footprint(item); return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom; })) blocked++;
  }
  const walkablePercent = total ? ((total - blocked) / total) * 100 : 0;
  const utilizationPercent = roomAreaSqFt ? (occupiedAreaSqFt / roomAreaSqFt) * 100 : 0;
  const doorObstructions = doorClearanceViolations(items);
  const score = Math.max(0, Math.min(100, Math.round(100 - collisionPairs.length * 28 - boundaryItemIds.length * 20 - doorObstructions.length * 18 - Math.max(0, 45 - walkablePercent) * .7)));
  const pair = collisionPairs[0];
  const recommendation = pair ? `Move ${pair[1].name} away from ${pair[0].name}; the current footprints overlap.`
    : boundaryItemIds.length ? `Move ${items.find(item => item.id === boundaryItemIds[0])?.name} fully inside the room boundary.`
    : doorObstructions.length ? `Move ${doorObstructions[0].item.name} away from the ${doorObstructions[0].door.name} clearance zone.`
    : walkablePercent < 45 ? 'Reduce or reposition furniture to restore a clear walking route.'
    : 'Layout is spatially valid. Keep wall-aligned storage to preserve the central walking area.';
  return { roomAreaSqFt, occupiedAreaSqFt, freeAreaSqFt: Math.max(0, roomAreaSqFt - occupiedAreaSqFt), utilizationPercent, walkablePercent, collisionPairs, boundaryItemIds, doorObstructions, score, recommendation };
}

/** 1 ft blocked cells for walkability heat overlay (normalized 0–1 room coords). */
export function walkabilityCells(items: LayoutItem[], lengthFt: number, widthFt: number) {
  const furniture = furnitureItems(items);
  const cells: Array<{ x: number; y: number; blocked: boolean }> = [];
  for (let x = 0.5; x < lengthFt; x += 1) {
    for (let y = 0.5; y < widthFt; y += 1) {
      const blocked = furniture.some((item) => {
        const box = footprint(item);
        return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
      });
      cells.push({ x, y, blocked });
    }
  }
  return cells;
}
