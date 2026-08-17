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
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { project: { select: { name: true, client: { select: { name: true } } } } },
      }),
      prisma.order.count(),
    ]);
    res.json({ data: orders, total, page, limit, pages: Math.ceil(total / limit) });
  } catch { res.status(500).json({ error: 'Failed to fetch orders' }); }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, quotationId, totalAmount, notes } = req.body;
    const count = await prisma.order.count();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const order = await prisma.order.create({ data: { orderNumber, projectId, quotationId, totalAmount, notes, status: 'CONFIRMED' } });
    res.status(201).json(order);
  } catch { res.status(500).json({ error: 'Failed to create order' }); }
});

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, notes } = req.body;
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status, notes } });
    res.json(order);
  } catch { res.status(500).json({ error: 'Failed to update order' }); }
});

export default router;
