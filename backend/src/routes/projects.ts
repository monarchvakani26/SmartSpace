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
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        skip, take: limit, orderBy: { updatedAt: 'desc' },
        include: { client: { select: { name: true } }, designer: { select: { name: true } } },
      }),
      prisma.project.count(),
    ]);
    res.json({ data: projects, total, page, limit, pages: Math.ceil(total / limit) });
  } catch { res.status(500).json({ error: 'Failed to fetch projects' }); }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, type, clientId, designerId } = req.body;
    if (!name || !clientId) { res.status(400).json({ error: 'Name and clientId required' }); return; }
    const project = await prisma.project.create({
      data: { name, description, type: type || 'BEDROOM', clientId, designerId: designerId || req.user?.id },
      include: { client: { select: { name: true } } },
    });
    res.status(201).json(project);
  } catch { res.status(500).json({ error: 'Failed to create project' }); }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        designer: { select: { id: true, name: true, email: true } },
        rooms: { include: { layouts: { include: { items: true } } } },
        quotations: true,
        tasks: true,
      },
    });
    if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
    res.json(project);
  } catch { res.status(500).json({ error: 'Failed to fetch project' }); }
});

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, type, status, clientId, designerId } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description, type, status, clientId, designerId },
    });
    res.json(project);
  } catch { res.status(500).json({ error: 'Failed to update project' }); }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete project' }); }
});

export default router;
