import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

type PlanItem = { id: string; x: number; y: number; widthFt: number; heightFt: number; rotation: number; furnitureItem?: { name: string; category?: { name: string } | null } };
const opening = (item: PlanItem) => /door|window/.test(`${item.furnitureItem?.name || ''} ${item.furnitureItem?.category?.name || ''}`.toLowerCase());
const box = (item: PlanItem) => ({ left: item.x, right: item.x + item.widthFt, top: item.y, bottom: item.y + item.heightFt });
const overlaps = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
function spatialAnalysis(items: PlanItem[], length: number, width: number) {
  const furniture = items.filter(item => !opening(item));
  const collisions: Array<{ firstId: string; secondId: string; message: string }> = [];
  for (let i = 0; i < furniture.length; i++) for (let j = i + 1; j < furniture.length; j++) if (overlaps(box(furniture[i]), box(furniture[j]))) collisions.push({ firstId: furniture[i].id, secondId: furniture[j].id, message: `${furniture[i].furnitureItem?.name || 'Furniture'} overlaps ${furniture[j].furnitureItem?.name || 'furniture'}.` });
  const boundaryViolations = furniture.filter(item => { const b = box(item); return b.left < 0 || b.top < 0 || b.right > length || b.bottom > width; }).map(item => item.id);
  const doorObstructions = items.filter(item => /door/.test(`${item.furnitureItem?.name || ''} ${item.furnitureItem?.category?.name || ''}`.toLowerCase())).flatMap(door => furniture.filter(item => { const b = box(door); return overlaps({ left: b.left - 1, right: b.right + 1, top: b.top - 1, bottom: b.bottom + 1 }, box(item)); }).map(item => ({ doorId: door.id, itemId: item.id })));
  const occupiedArea = furniture.reduce((total, item) => total + item.widthFt * item.heightFt, 0);
  const area = length * width;
  const utilization = area ? (occupiedArea / area) * 100 : 0;
  const walkableArea = Math.max(0, area - occupiedArea);
  const score = Math.max(0, Math.min(100, Math.round(100 - collisions.length * 28 - boundaryViolations.length * 20 - doorObstructions.length * 18 - Math.max(0, 45 - (100 - utilization)) * .7)));
  const recommendations = collisions.length ? [{ type: 'collision', severity: 'high', objectId: collisions[0].secondId, message: collisions[0].message }] : doorObstructions.length ? [{ type: 'clearance', severity: 'high', objectId: doorObstructions[0].itemId, message: 'Furniture blocks door clearance.' }] : [];
  return { collisions, boundaryViolations, doorObstructions, walkableArea, spaceUtilization: utilization, score, recommendations };
}

// Create room for a project
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, projectId, length, width, height } = req.body;
    if (!projectId || !length || !width) { res.status(400).json({ error: 'projectId, length, width required' }); return; }
    const room = await prisma.room.create({
      data: {
        name: name || `${type || 'Bedroom'} 1`,
        type: type || 'BEDROOM',
        projectId,
        layouts: { create: { length: parseFloat(length), width: parseFloat(width), height: parseFloat(height || 9) } },
      },
      include: { layouts: { include: { items: { include: { furnitureItem: { include: { category: true } } } } } } },
    });
    res.status(201).json(room);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create room' }); }
});

// GET room with layout
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: { layouts: { where: { isActive: true }, include: { items: { include: { furnitureItem: { include: { category: true } } } } } } },
    });
    if (!room) { res.status(404).json({ error: 'Room not found' }); return; }
    res.json(room);
  } catch { res.status(500).json({ error: 'Failed to fetch room' }); }
});

// Update room dimensions
router.patch('/:id/layout', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { length, width, height, items } = req.body;
    const room = await prisma.room.findUnique({ where: { id: req.params.id }, include: { layouts: { where: { isActive: true } } } });
    if (!room) { res.status(404).json({ error: 'Room not found' }); return; }

    const layoutId = room.layouts[0]?.id;
    if (!layoutId) { res.status(404).json({ error: 'Layout not found' }); return; }

    // Update dimensions
    if (length || width || height) {
      await prisma.roomLayout.update({ where: { id: layoutId }, data: { length: parseFloat(length), width: parseFloat(width), height: parseFloat(height) } });
    }

    // Sync items if provided
    if (items !== undefined) {
      // Delete existing, recreate from state
      await prisma.layoutItem.deleteMany({ where: { roomLayoutId: layoutId } });
      if (items.length > 0) {
        await prisma.layoutItem.createMany({
          data: items.map((item: any) => ({
            roomLayoutId: layoutId,
            furnitureItemId: item.furnitureItemId,
            x: item.x, y: item.y, rotation: item.rotation || 0,
            widthFt: item.widthFt, heightFt: item.heightFt,
            customizations: item.customizations || null,
          })),
        });
      }
    }

    const updated = await prisma.roomLayout.findUnique({
      where: { id: layoutId },
      include: { items: { include: { furnitureItem: { include: { category: true } } } } },
    });
    res.json(updated);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update layout' }); }
});

// Update a single layout item (customizations)
router.patch('/layout-item/:itemId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { x, y, rotation, widthFt, heightFt, customizations } = req.body;
    const item = await prisma.layoutItem.update({
      where: { id: req.params.itemId },
      data: { x, y, rotation, widthFt, heightFt, customizations },
    });
    res.json(item);
  } catch { res.status(500).json({ error: 'Failed to update layout item' }); }
});

// Rule-based analysis remains available without optional AI models and always uses persisted layout data.
router.post('/:id/analyze', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const layout = await prisma.roomLayout.findUnique({ where: { id: req.params.id }, include: { items: { include: { furnitureItem: { include: { category: true } } } } } });
    if (!layout) { res.status(404).json({ error: 'Layout not found' }); return; }
    res.json(spatialAnalysis(layout.items, layout.length, layout.width));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to analyze layout' }); }
});

router.post('/:id/apply-suggestion', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const layout = await prisma.roomLayout.findUnique({ where: { id: req.params.id }, include: { items: { include: { furnitureItem: { include: { category: true } } } } } });
    if (!layout) { res.status(404).json({ error: 'Layout not found' }); return; }
    const analysis = spatialAnalysis(layout.items, layout.length, layout.width);
    const targetId = req.body.objectId || analysis.recommendations[0]?.objectId;
    const target = layout.items.find(item => item.id === targetId);
    if (!target) { res.status(422).json({ error: 'No applicable layout suggestion' }); return; }
    const x = Math.max(0, layout.length - target.widthFt), y = Math.max(0, layout.width - target.heightFt);
    const updated = await prisma.layoutItem.update({ where: { id: target.id }, data: { x, y } });
    res.json({ item: updated, analysis: spatialAnalysis(layout.items.map(item => item.id === target.id ? { ...item, x, y } : item), layout.length, layout.width) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to apply layout suggestion' }); }
});

export default router;
