import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/dashboard
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalLeads, activeProjects, totalOrders, recentProjects, tasks, revenue] = await Promise.all([
      prisma.lead.count(),
      prisma.project.count({ where: { status: { in: ['DESIGNING', 'IN_PROGRESS', 'QUOTATION'] } } }),
      prisma.order.count(),
      prisma.project.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { client: { select: { name: true } } },
      }),
      prisma.task.findMany({
        take: 5,
        where: { isDone: false },
        orderBy: { dueDate: 'asc' },
        include: { project: { select: { name: true } }, assignedTo: { select: { name: true } } },
      }),
      prisma.quotation.aggregate({ _sum: { totalAmount: true } }),
    ]);

    res.json({
      kpis: {
        totalLeads,
        activeProjects,
        totalOrders,
        revenue: revenue._sum.totalAmount || 0,
      },
      recentProjects,
      tasks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

export default router;
