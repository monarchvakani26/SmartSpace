import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
    });
    res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, email: true, role: true } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

export default router;
