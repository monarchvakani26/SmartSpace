import { FurnitureCatalogItem, LayoutItem } from '../types';

const AI_BASE = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

export interface RecommendResult {
  room_type: string;
  style_preference: string;
  recommended_palette: {
    primary: string;
    secondary: string;
    accent: string;
    materials: string[];
  };
  suggested_items: Array<{ category: string; name: string; reason: string }>;
  confidence_score: number;
  source: 'ai' | 'local';
}

export interface OptimizeResult {
  status: string;
  conflicts_resolved: number;
  issues_found: string[];
  optimized_layout: LayoutItem[];
  source: 'ai' | 'local';
}

export interface CostPredictResult {
  predicted_cost_inr: number;
  predicted_range: { min: number; max: number };
  model_used: string;
  source: 'ai' | 'local';
}

export interface SceneObject {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  widthFt: number;
  heightFt: number;
  verticalHeightFt?: number;
  confidence: number;
  approximate: boolean;
}

export interface SceneAnalysisResult {
  status: string;
  approximate: boolean;
  reference_width_ft?: number;
  room_length_ft: number;
  room_width_ft: number;
  stages: Record<string, string>;
  detected_objects: SceneObject[];
  message: string;
  source: 'ai' | 'local';
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${AI_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `AI ${path} failed`);
  }
  return res.json();
}

/** Local furnish suggestions when the AI service is offline. */
export function localRecommend(roomType: string, style = 'MODERN'): RecommendResult {
  const bedroom = [
    { category: 'Beds', name: 'King Size Bed', reason: 'Anchors the room on the long wall' },
    { category: 'Wardrobes', name: '3 Door Wardrobe', reason: 'Storage along the back wall' },
    { category: 'Tables', name: 'Bed Side Table', reason: 'Nightstand clearance beside the bed' },
    { category: 'Tables', name: 'TV Unit with Storage', reason: 'Media wall opposite the bed' },
    { category: 'Doors', name: 'Standard Door', reason: 'Entry opening on short wall' },
  ];
  const living = [
    { category: 'Sofas', name: '3 Seater Sofa', reason: 'Primary seating facing the room' },
    { category: 'Tables', name: 'Coffee Table', reason: 'Centered in the seating zone' },
    { category: 'Tables', name: 'TV Unit with Storage', reason: 'Media wall alignment' },
    { category: 'Decor', name: 'Accent Floor Rug', reason: 'Defines the lounge footprint' },
    { category: 'Doors', name: 'Standard Door', reason: 'Entry opening' },
  ];
  const kitchen = [
    { category: 'Tables', name: 'Study Desk', reason: 'Prep counter proxy along wall' },
    { category: 'Wardrobes', name: '2 Door Wardrobe', reason: 'Tall storage / pantry stand-in' },
    { category: 'Doors', name: 'Standard Door', reason: 'Entry opening' },
    { category: 'Windows', name: 'Room Window', reason: 'Light wall opening' },
  ];
  const office = [
    { category: 'Tables', name: 'Study Desk', reason: 'Work surface against the wall' },
    { category: 'Sofas', name: '2 Seater Sofa', reason: 'Guest seating' },
    { category: 'Wardrobes', name: '2 Door Wardrobe', reason: 'Storage / filing' },
    { category: 'Doors', name: 'Standard Door', reason: 'Entry opening' },
  ];

  const map: Record<string, typeof bedroom> = {
    BEDROOM: bedroom,
    LIVING_ROOM: living,
    KITCHEN: kitchen,
    OFFICE: office,
    FULL_HOME: [...bedroom.slice(0, 3), ...living.slice(0, 2)],
  };

  const suggested = map[roomType.toUpperCase()] || bedroom;
  return {
    room_type: roomType,
    style_preference: style,
    recommended_palette: {
      primary: style === 'CLASSIC' ? '#5C4033' : '#2C4A3E',
      secondary: '#E2D4C3',
      accent: '#A67C52',
      materials: ['Plywood 18mm', 'Sunmica Walnut', 'Matte Laminate'],
    },
    suggested_items: suggested,
    confidence_score: 0.82,
    source: 'local',
  };
}

export function localOptimize(
  items: LayoutItem[],
  lengthFt: number,
  widthFt: number
): OptimizeResult {
  const issues: string[] = [];
  const next = items.map((item) => ({ ...item }));

  // Push out of bounds
  for (const item of next) {
    if (item.x + item.widthFt > lengthFt) {
      issues.push(`${item.name} exceeds right wall`);
      item.x = Math.max(0, lengthFt - item.widthFt - 0.4);
    }
    if (item.y + item.heightFt > widthFt) {
      issues.push(`${item.name} exceeds bottom wall`);
      item.y = Math.max(0, widthFt - item.heightFt - 0.4);
    }
    item.x = Math.max(0, item.x);
    item.y = Math.max(0, item.y);
  }

  // Separate overlaps greedily
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < next.length; i++) {
      for (let j = i + 1; j < next.length; j++) {
        const a = next[i];
        const b = next[j];
        const aDoor = /door|window/i.test(`${a.category} ${a.name}`);
        const bDoor = /door|window/i.test(`${b.category} ${b.name}`);
        if (aDoor || bDoor) continue;

        const overlapX = a.x < b.x + b.widthFt && a.x + a.widthFt > b.x;
        const overlapY = a.y < b.y + b.heightFt && a.y + a.heightFt > b.y;
        if (!overlapX || !overlapY) continue;

        issues.push(`${a.name} overlaps ${b.name}`);
        const shiftRight = b.x + b.widthFt + 0.5;
        const shiftDown = b.y + b.heightFt + 0.5;
        if (shiftRight + a.widthFt <= lengthFt) {
          a.x = Number(shiftRight.toFixed(2));
        } else if (shiftDown + a.heightFt <= widthFt) {
          a.y = Number(shiftDown.toFixed(2));
        } else {
          a.x = Number(Math.max(0, lengthFt - a.widthFt - 0.3).toFixed(2));
          a.y = Number(Math.max(0, widthFt - a.heightFt - 0.3).toFixed(2));
        }
      }
    }
  }

  return {
    status: 'optimized',
    conflicts_resolved: issues.length,
    issues_found: [...new Set(issues)],
    optimized_layout: next,
    source: 'local',
  };
}

export function localPredictCost(params: {
  room_type: string;
  length_ft: number;
  width_ft: number;
  height_ft: number;
  item_count: number;
  material_tier?: string;
}): CostPredictResult {
  const area = params.length_ft * params.width_ft;
  const tierMul =
    params.material_tier === 'LUXURY' ? 1.45 : params.material_tier === 'ECONOMY' ? 0.75 : 1;
  const base = area * 950 * tierMul + params.item_count * 18500 + params.height_ft * 1200;
  const predicted = Math.round(base);
  return {
    predicted_cost_inr: predicted,
    predicted_range: { min: Math.round(predicted * 0.9), max: Math.round(predicted * 1.12) },
    model_used: 'local-heuristic',
    source: 'local',
  };
}

/** Approximate photo scene when depth/segmentation models are absent. */
export function localSceneFromPhoto(referenceWidthFt = 3, roomHint = 'BEDROOM'): SceneAnalysisResult {
  const scale = Math.max(0.6, Math.min(1.6, referenceWidthFt / 3));
  const length = Number((12 * scale).toFixed(1));
  const width = Number((10 * scale).toFixed(1));

  const bedroom: SceneObject[] = [
    { id: 'det-door', name: 'Standard Door', category: 'Doors', x: 0.2, y: width * 0.35, widthFt: 3, heightFt: 0.5, verticalHeightFt: 7, confidence: 0.55, approximate: true },
    { id: 'det-bed', name: 'King Size Bed', category: 'Beds', x: length * 0.28, y: 0.8, widthFt: 6, heightFt: 6.5, verticalHeightFt: 1.5, confidence: 0.62, approximate: true },
    { id: 'det-ward', name: '3 Door Wardrobe', category: 'Wardrobes', x: 0.4, y: 0.4, widthFt: 6, heightFt: 2, verticalHeightFt: 7, confidence: 0.58, approximate: true },
    { id: 'det-side', name: 'Bed Side Table', category: 'Tables', x: length * 0.28 + 6.2, y: 1.2, widthFt: 1.5, heightFt: 1.5, verticalHeightFt: 2, confidence: 0.5, approximate: true },
    { id: 'det-tv', name: 'TV Unit with Storage', category: 'Tables', x: length * 0.25, y: width - 2.2, widthFt: 6, heightFt: 1.5, verticalHeightFt: 2, confidence: 0.48, approximate: true },
  ];

  const living: SceneObject[] = [
    { id: 'det-door', name: 'Standard Door', category: 'Doors', x: 0.2, y: width * 0.4, widthFt: 3, heightFt: 0.5, verticalHeightFt: 7, confidence: 0.55, approximate: true },
    { id: 'det-sofa', name: '3 Seater Sofa', category: 'Sofas', x: 1, y: 1, widthFt: 6.5, heightFt: 3, verticalHeightFt: 3, confidence: 0.6, approximate: true },
    { id: 'det-coffee', name: 'Coffee Table', category: 'Tables', x: 2.5, y: 4.5, widthFt: 3.5, heightFt: 2, verticalHeightFt: 1.5, confidence: 0.52, approximate: true },
    { id: 'det-tv', name: 'TV Unit with Storage', category: 'Tables', x: 2, y: width - 2, widthFt: 6, heightFt: 1.5, verticalHeightFt: 2, confidence: 0.5, approximate: true },
  ];

  const objects = roomHint.toUpperCase().includes('LIV') ? living : bedroom;

  return {
    status: 'approximate_ready',
    approximate: true,
    reference_width_ft: referenceWidthFt,
    room_length_ft: length,
    room_width_ft: width,
    stages: {
      upload: 'complete',
      depth: 'heuristic_proxy',
      segmentation: 'heuristic_proxy',
      reconstruction: 'approximate_footprints',
    },
    detected_objects: objects.map((o) => ({
      ...o,
      x: Number(Math.min(Math.max(0, o.x), Math.max(0, length - o.widthFt)).toFixed(2)),
      y: Number(Math.min(Math.max(0, o.y), Math.max(0, width - o.heightFt)).toFixed(2)),
    })),
    message:
      'Approximate editable footprints from the photo scale. Treat as a starting layout — refine in the studio.',
    source: 'local',
  };
}

export function matchCatalogItem(
  suggestionName: string,
  catalog: FurnitureCatalogItem[]
): FurnitureCatalogItem | undefined {
  const lower = suggestionName.toLowerCase();
  return (
    catalog.find((c) => c.name.toLowerCase() === lower) ||
    catalog.find((c) => lower.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(lower.split(' ')[0])) ||
    catalog.find((c) => lower.includes((c.categoryName || '').toLowerCase().replace(/s$/, '')))
  );
}

/** Spread suggested catalog pieces into a sensible starting layout. */
export function placeSuggestionsInRoom(
  suggestions: Array<{ category: string; name: string }>,
  catalog: FurnitureCatalogItem[],
  lengthFt: number,
  widthFt: number
): Omit<LayoutItem, 'id'>[] {
  const placed: Omit<LayoutItem, 'id'>[] = [];
  let cursorX = 0.5;
  let cursorY = 0.5;
  let rowH = 0;

  for (const s of suggestions) {
    const cat = matchCatalogItem(s.name, catalog) ||
      catalog.find((c) => (c.categoryName || '').toLowerCase() === s.category.toLowerCase());
    if (!cat) continue;

    if (cursorX + cat.defaultWidthFt > lengthFt - 0.3) {
      cursorX = 0.5;
      cursorY += rowH + 0.6;
      rowH = 0;
    }
    if (cursorY + cat.defaultHeightFt > widthFt - 0.3) {
      cursorY = Math.max(0.3, widthFt - cat.defaultHeightFt - 0.4);
    }

    // Prefer wall placement for wardrobes / doors / beds
    let x = cursorX;
    let y = cursorY;
    const catName = (cat.categoryName || '').toLowerCase();
    if (catName.includes('wardrobe')) {
      x = 0.4;
      y = 0.4;
    } else if (catName.includes('bed')) {
      x = Math.max(0.5, (lengthFt - cat.defaultWidthFt) / 2);
      y = 0.8;
    } else if (catName.includes('door')) {
      x = 0.2;
      y = Math.max(0.5, widthFt / 2 - cat.defaultHeightFt / 2);
    } else if (cat.name.toLowerCase().includes('tv')) {
      x = Math.max(0.5, (lengthFt - cat.defaultWidthFt) / 2);
      y = Math.max(0.5, widthFt - cat.defaultHeightFt - 0.5);
    }

    placed.push({
      furnitureItemId: cat.id,
      name: cat.name,
      category: cat.categoryName || s.category,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      rotation: 0,
      widthFt: cat.defaultWidthFt,
      heightFt: cat.defaultHeightFt,
      verticalHeightFt: cat.defaultHeightM,
    });

    cursorX = x + cat.defaultWidthFt + 0.5;
    rowH = Math.max(rowH, cat.defaultHeightFt);
  }

  // De-overlap with local optimizer
  const withIds = placed.map((p, i) => ({ ...p, id: `tmp-${i}` }));
  return localOptimize(withIds, lengthFt, widthFt).optimized_layout.map(
    ({ id: _id, ...rest }) => rest
  );
}

export const aiService = {
  async recommend(params: {
    room_type: string;
    budget_tier?: string;
    style_preference?: string;
    room_area_sqft?: number;
  }): Promise<RecommendResult> {
    try {
      const data = await postJson<Omit<RecommendResult, 'source'>>('/recommend', {
        room_type: params.room_type,
        budget_tier: params.budget_tier || 'MEDIUM',
        style_preference: params.style_preference || 'MODERN',
        room_area_sqft: params.room_area_sqft,
      });
      return { ...data, source: 'ai' };
    } catch {
      return localRecommend(params.room_type, params.style_preference || 'MODERN');
    }
  },

  async optimize(params: {
    room_length_ft: number;
    room_width_ft: number;
    items: LayoutItem[];
    walkway_clearance_ft?: number;
  }): Promise<OptimizeResult> {
    try {
      const data = await postJson<{
        status: string;
        conflicts_resolved: number;
        issues_found: string[];
        optimized_layout: LayoutItem[];
      }>('/optimize-layout', {
        room_length_ft: params.room_length_ft,
        room_width_ft: params.room_width_ft,
        items: params.items,
        walkway_clearance_ft: params.walkway_clearance_ft ?? 2.5,
      });
      // Merge AI coords with full item payloads
      const byId = new Map(params.items.map((i) => [i.id, i]));
      const optimized = data.optimized_layout.map((o) => {
        const prev = byId.get(o.id) || params.items.find((i) => i.name === o.name);
        return { ...(prev || o), ...o, id: o.id || prev?.id || `opt-${Math.random()}` };
      });
      // Run local pass for better overlap separation
      const polished = localOptimize(optimized, params.room_length_ft, params.room_width_ft);
      return { ...polished, source: 'ai', issues_found: [...data.issues_found, ...polished.issues_found] };
    } catch {
      return localOptimize(params.items, params.room_length_ft, params.room_width_ft);
    }
  },

  async predictCost(params: {
    room_type: string;
    length_ft: number;
    width_ft: number;
    height_ft: number;
    item_count: number;
    material_tier?: string;
    city?: string;
  }): Promise<CostPredictResult> {
    try {
      const data = await postJson<Omit<CostPredictResult, 'source'> & { model_used?: string }>(
        '/predict-cost',
        {
          ...params,
          material_tier: params.material_tier || 'STANDARD',
          city: params.city || 'Mumbai',
        }
      );
      const isHeuristic = (data.model_used || '').toLowerCase().includes('heuristic');
      return { ...data, source: isHeuristic ? 'local' : 'ai' };
    } catch {
      return localPredictCost(params);
    }
  },

  async analyzeScene(file: File, referenceWidthFt: number, roomHint = 'BEDROOM'): Promise<SceneAnalysisResult> {
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('reference_width_ft', String(referenceWidthFt));
      form.append('room_hint', roomHint);
      const res = await fetch(`${AI_BASE}/scene-analysis`, { method: 'POST', body: form });
      if (!res.ok) throw new Error('scene analysis failed');
      const data = await res.json();
      if (!data.detected_objects?.length) {
        const local = localSceneFromPhoto(referenceWidthFt, roomHint);
        return { ...local, message: data.message || local.message, source: 'ai' };
      }
      return {
        status: data.status,
        approximate: true,
        reference_width_ft: referenceWidthFt,
        room_length_ft: data.room_length_ft || localSceneFromPhoto(referenceWidthFt).room_length_ft,
        room_width_ft: data.room_width_ft || localSceneFromPhoto(referenceWidthFt).room_width_ft,
        stages: data.stages,
        detected_objects: data.detected_objects,
        message: data.message,
        source: 'ai',
      };
    } catch {
      return localSceneFromPhoto(referenceWidthFt, roomHint);
    }
  },
};
