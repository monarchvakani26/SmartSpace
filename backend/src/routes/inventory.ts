import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.inventory.findMany({ skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.inventory.count(),
    ]);
    res.json({ data: items, total, page, limit, pages: Math.ceil(total / limit) });
  } catch { res.status(500).json({ error: 'Failed to fetch inventory' }); }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, unit, stock, unitPrice, reorderLevel } = req.body;
    const item = await prisma.inventory.create({ data: { name, category, unit, stock: parseFloat(stock), unitPrice: parseFloat(unitPrice), reorderLevel: parseFloat(reorderLevel || 10) } });
    res.status(201).json(item);
  } catch { res.status(500).json({ error: 'Failed to add inventory item' }); }
});

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stock, unitPrice } = req.body;
    const item = await prisma.inventory.update({ where: { id: req.params.id }, data: { stock: parseFloat(stock), unitPrice: parseFloat(unitPrice) } });
    res.json(item);
  } catch { res.status(500).json({ error: 'Failed to update inventory item' }); }
});

export default router;
