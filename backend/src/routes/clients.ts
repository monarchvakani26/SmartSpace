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
    const [clients, total] = await Promise.all([
      prisma.client.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.client.count(),
    ]);
    res.json({ data: clients, total, page, limit, pages: Math.ceil(total / limit) });
  } catch { res.status(500).json({ error: 'Failed to fetch clients' }); }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, email, address, city, gstNumber, leadId } = req.body;
    if (!name || !phone) { res.status(400).json({ error: 'Name and phone required' }); return; }
    const client = await prisma.client.create({ data: { name, phone, email, address, city, gstNumber, leadId } });
    res.status(201).json(client);
  } catch { res.status(500).json({ error: 'Failed to create client' }); }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await prisma.client.findUnique({ where: { id: req.params.id }, include: { projects: true } });
    if (!client) { res.status(404).json({ error: 'Client not found' }); return; }
    res.json(client);
  } catch { res.status(500).json({ error: 'Failed to fetch client' }); }
});

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, email, address, city, gstNumber } = req.body;
    const client = await prisma.client.update({ where: { id: req.params.id }, data: { name, phone, email, address, city, gstNumber } });
    res.json(client);
  } catch { res.status(500).json({ error: 'Failed to update client' }); }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete client' }); }
});

export default router;
