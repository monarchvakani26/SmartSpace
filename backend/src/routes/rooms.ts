import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

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

export default router;
