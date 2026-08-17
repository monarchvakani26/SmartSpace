import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/furniture/categories
router.get('/categories', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.furnitureCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { items: { where: { isActive: true }, orderBy: { name: 'asc' } } },
    });
    res.json(categories);
  } catch { res.status(500).json({ error: 'Failed to fetch categories' }); }
});

// GET /api/furniture
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.query;
    const where = categoryId ? { categoryId: String(categoryId), isActive: true } : { isActive: true };
    const items = await prisma.furnitureCatalog.findMany({ where, include: { category: true }, orderBy: { name: 'asc' } });
    res.json(items);
  } catch { res.status(500).json({ error: 'Failed to fetch furniture' }); }
});

// GET /api/furniture/materials
router.get('/materials', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [materials, finishes, colors, hardware] = await Promise.all([
      prisma.material.findMany({ orderBy: { name: 'asc' } }),
      prisma.finish.findMany({ orderBy: { name: 'asc' } }),
      prisma.color.findMany({ orderBy: { name: 'asc' } }),
      prisma.hardwareOption.findMany({ orderBy: { name: 'asc' } }),
    ]);
    res.json({ materials, finishes, colors, hardware });
  } catch { res.status(500).json({ error: 'Failed to fetch materials' }); }
});

// GET /api/furniture/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await prisma.furnitureCatalog.findUnique({ where: { id: req.params.id }, include: { category: true } });
    if (!item) { res.status(404).json({ error: 'Item not found' }); return; }
    res.json(item);
  } catch { res.status(500).json({ error: 'Failed to fetch furniture item' }); }
});

export default router;
