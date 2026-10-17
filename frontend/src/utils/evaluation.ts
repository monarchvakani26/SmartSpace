/**
 * Offline evaluation harness for layout analysis + greedy optimizer.
 * Used by EvaluationPage and can be cited in the FYP report.
 */
import { LayoutItem } from '../types';
import { analyzeLayout, collisionIds } from './layout3d';
import { localOptimize } from '../services/aiService';

export interface EvalRoom {
  id: string;
  name: string;
  lengthFt: number;
  widthFt: number;
  items: LayoutItem[];
}

export interface EvalRow {
  id: string;
  name: string;
  collisionsBefore: number;
  collisionsAfter: number;
  scoreBefore: number;
  scoreAfter: number;
  walkableBefore: number;
  walkableAfter: number;
  issuesResolved: number;
}

function item(
  id: string,
  name: string,
  category: string,
  x: number,
  y: number,
  w: number,
  h: number,
  vh = 2.5
): LayoutItem {
  return {
    id,
    furnitureItemId: id,
    name,
    category,
    x,
    y,
    rotation: 0,
    widthFt: w,
    heightFt: h,
    verticalHeightFt: vh,
  };
}

/** 12 synthetic rooms with intentional overlaps / boundary issues. */
export function buildEvalSuite(): EvalRoom[] {
  return [
    {
      id: 'r1',
      name: 'Bedroom overlap A',
      lengthFt: 12,
      widthFt: 10,
      items: [
        item('a1', 'King Size Bed', 'Beds', 2, 1, 6, 6.5, 1.5),
        item('a2', '3 Door Wardrobe', 'Wardrobes', 3, 2, 6, 2, 7),
        item('a3', 'Bed Side Table', 'Tables', 8.5, 1.5, 1.5, 1.5, 2),
      ],
    },
    {
      id: 'r2',
      name: 'Bedroom wall overflow',
      lengthFt: 11,
      widthFt: 9,
      items: [
        item('b1', 'Queen Size Bed', 'Beds', 6, 1, 5, 6.5, 1.5),
        item('b2', '2 Door Wardrobe', 'Wardrobes', 0.3, 0.3, 4, 2, 7),
        item('b3', 'TV Unit with Storage', 'Tables', 8, 7.5, 6, 1.5, 2),
      ],
    },
    {
      id: 'r3',
      name: 'Living triple pile',
      lengthFt: 14,
      widthFt: 12,
      items: [
        item('c1', '3 Seater Sofa', 'Sofas', 2, 2, 6.5, 3, 3),
        item('c2', 'Coffee Table', 'Tables', 3, 3, 3.5, 2, 1.5),
        item('c3', '2 Seater Sofa', 'Sofas', 4, 2.5, 4.5, 2.8, 3),
        item('c4', 'TV Unit with Storage', 'Tables', 4, 10, 6, 1.5, 2),
      ],
    },
    {
      id: 'r4',
      name: 'Door clearance block',
      lengthFt: 12,
      widthFt: 10,
      items: [
        item('d1', 'Standard Door', 'Doors', 0.2, 4, 3, 0.5, 7),
        item('d2', 'King Size Bed', 'Beds', 0.5, 3.5, 6, 6.5, 1.5),
        item('d3', '3 Door Wardrobe', 'Wardrobes', 8, 0.4, 6, 2, 7),
      ],
    },
    {
      id: 'r5',
      name: 'Compact studio crush',
      lengthFt: 9,
      widthFt: 8,
      items: [
        item('e1', 'Single Bed', 'Beds', 1, 1, 3.5, 6.5, 1.5),
        item('e2', 'Study Desk', 'Tables', 2, 2, 4, 2, 2.5),
        item('e3', '2 Door Wardrobe', 'Wardrobes', 1.5, 1.2, 4, 2, 7),
      ],
    },
    {
      id: 'r6',
      name: 'Wide living clear',
      lengthFt: 16,
      widthFt: 14,
      items: [
        item('f1', 'L-Shape Sofa', 'Sofas', 1, 1, 8, 5, 3),
        item('f2', 'Coffee Table', 'Tables', 4, 7, 3.5, 2, 1.5),
        item('f3', 'TV Unit with Storage', 'Tables', 5, 12, 6, 1.5, 2),
        item('f4', 'Standard Door', 'Doors', 0.2, 6, 3, 0.5, 7),
      ],
    },
    {
      id: 'r7',
      name: 'Kitchen aisle block',
      lengthFt: 10,
      widthFt: 8,
      items: [
        item('g1', 'Study Desk', 'Tables', 0.4, 0.4, 4, 2, 2.5),
        item('g2', '2 Door Wardrobe', 'Wardrobes', 0.5, 1, 4, 2, 7),
        item('g3', 'Room Window', 'Windows', 5, 0.2, 4, 0.5, 4),
      ],
    },
    {
      id: 'r8',
      name: 'Office desk clash',
      lengthFt: 12,
      widthFt: 10,
      items: [
        item('h1', 'Study Desk', 'Tables', 3, 3, 4, 2, 2.5),
        item('h2', 'Study Desk', 'Tables', 4, 3.5, 4, 2, 2.5),
        item('h3', '2 Seater Sofa', 'Sofas', 1, 7, 4.5, 2.8, 3),
      ],
    },
    {
      id: 'r9',
      name: 'Bedroom side table stack',
      lengthFt: 13,
      widthFt: 11,
      items: [
        item('i1', 'King Size Bed', 'Beds', 3.5, 1, 6, 6.5, 1.5),
        item('i2', 'Bed Side Table', 'Tables', 9.2, 1.2, 1.5, 1.5, 2),
        item('i3', 'Bed Side Table', 'Tables', 9.4, 1.4, 1.5, 1.5, 2),
        item('i4', '3 Door Wardrobe', 'Wardrobes', 0.4, 0.4, 6, 2, 7),
      ],
    },
    {
      id: 'r10',
      name: 'Near-empty room',
      lengthFt: 12,
      widthFt: 10,
      items: [
        item('j1', 'King Size Bed', 'Beds', 3, 2, 6, 6.5, 1.5),
        item('j2', 'Standard Door', 'Doors', 0.2, 4, 3, 0.5, 7),
      ],
    },
    {
      id: 'r11',
      name: 'Four-piece living knot',
      lengthFt: 15,
      widthFt: 12,
      items: [
        item('k1', '3 Seater Sofa', 'Sofas', 2, 2, 6.5, 3, 3),
        item('k2', 'Accent Floor Rug', 'Decor', 2.5, 2.5, 6, 4, 0.1),
        item('k3', 'Coffee Table', 'Tables', 3.5, 3.5, 3.5, 2, 1.5),
        item('k4', 'Floor Lamp', 'Decor', 4, 3, 1.2, 1.2, 5),
      ],
    },
    {
      id: 'r12',
      name: 'Boundary + overlap mix',
      lengthFt: 10,
      widthFt: 9,
      items: [
        item('l1', 'Queen Size Bed', 'Beds', 5.5, 0.5, 5, 6.5, 1.5),
        item('l2', '3 Door Wardrobe', 'Wardrobes', 5, 0.3, 6, 2, 7),
        item('l3', 'TV Unit with Storage', 'Tables', 2, 7.8, 6, 1.5, 2),
      ],
    },
  ];
}

export function runEvaluation(suite: EvalRoom[] = buildEvalSuite()): {
  rows: EvalRow[];
  summary: {
    rooms: number;
    avgCollisionReduction: number;
    avgScoreGain: number;
    roomsImproved: number;
    roomsCollisionFreeAfter: number;
  };
} {
  const rows: EvalRow[] = suite.map((room) => {
    const beforeIds = collisionIds(room.items);
    const before = analyzeLayout(room.items, room.lengthFt, room.widthFt);
    const opt = localOptimize(room.items, room.lengthFt, room.widthFt);
    const afterIds = collisionIds(opt.optimized_layout);
    const after = analyzeLayout(opt.optimized_layout, room.lengthFt, room.widthFt);
    return {
      id: room.id,
      name: room.name,
      collisionsBefore: beforeIds.size,
      collisionsAfter: afterIds.size,
      scoreBefore: before.score,
      scoreAfter: after.score,
      walkableBefore: Number(before.walkablePercent.toFixed(1)),
      walkableAfter: Number(after.walkablePercent.toFixed(1)),
      issuesResolved: opt.conflicts_resolved,
    };
  });

  const n = rows.length || 1;
  const avgCollisionReduction =
    rows.reduce((s, r) => s + (r.collisionsBefore - r.collisionsAfter), 0) / n;
  const avgScoreGain = rows.reduce((s, r) => s + (r.scoreAfter - r.scoreBefore), 0) / n;
  const roomsImproved = rows.filter((r) => r.scoreAfter > r.scoreBefore || r.collisionsAfter < r.collisionsBefore).length;
  const roomsCollisionFreeAfter = rows.filter((r) => r.collisionsAfter === 0).length;

  return {
    rows,
    summary: {
      rooms: rows.length,
      avgCollisionReduction: Number(avgCollisionReduction.toFixed(2)),
      avgScoreGain: Number(avgScoreGain.toFixed(2)),
      roomsImproved,
      roomsCollisionFreeAfter,
    },
  };
}
