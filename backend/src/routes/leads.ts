import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/leads
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { assignedTo: { select: { name: true } } },
      }),
      prisma.lead.count(),
    ]);
    res.json({ data: leads, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch leads' }); }
});

// POST /api/leads
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, email, source, status, notes, assignedToId } = req.body;
    if (!name || !phone) { res.status(400).json({ error: 'Name and phone required' }); return; }
    const lead = await prisma.lead.create({ data: { name, phone, email, source: source || 'WEBSITE', status: status || 'NEW', notes, assignedToId } });
    res.status(201).json(lead);
  } catch (err) { res.status(500).json({ error: 'Failed to create lead' }); }
});

// GET /api/leads/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id }, include: { assignedTo: true } });
    if (!lead) { res.status(404).json({ error: 'Lead not found' }); return; }
    res.json(lead);
  } catch { res.status(500).json({ error: 'Failed to fetch lead' }); }
});

// PATCH /api/leads/:id
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, email, source, status, notes, assignedToId } = req.body;
    const lead = await prisma.lead.update({ where: { id: req.params.id }, data: { name, phone, email, source, status, notes, assignedToId } });
    res.json(lead);
  } catch { res.status(500).json({ error: 'Failed to update lead' }); }
});

// DELETE /api/leads/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete lead' }); }
});

export default router;
