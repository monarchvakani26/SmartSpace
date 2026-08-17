import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/', requireRole('ADMIN'), async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } });
    res.json(users);
  } catch { res.status(500).json({ error: 'Failed to fetch users' }); }
});

router.post('/', requireRole('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, passwordHash: hash, role }, select: { id: true, name: true, email: true, role: true } });
    res.status(201).json(user);
  } catch { res.status(500).json({ error: 'Failed to create user' }); }
});

router.patch('/:id', requireRole('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, role, isActive } = req.body;
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { name, email, role, isActive }, select: { id: true, name: true, email: true, role: true, isActive: true } });
    res.json(user);
  } catch { res.status(500).json({ error: 'Failed to update user' }); }
});

export default router;
