import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import authRouter from './routes/auth';
import dashboardRouter from './routes/dashboard';
import leadsRouter from './routes/leads';
import clientsRouter from './routes/clients';
import projectsRouter from './routes/projects';
import roomsRouter from './routes/rooms';
import furnitureRouter from './routes/furniture';
import quotationsRouter from './routes/quotations';
import ordersRouter from './routes/orders';
import inventoryRouter from './routes/inventory';
import usersRouter from './routes/users';
import { authMiddleware } from './middleware/auth.middleware';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/dashboard', authMiddleware, dashboardRouter);
app.use('/api/leads', authMiddleware, leadsRouter);
app.use('/api/clients', authMiddleware, clientsRouter);
app.use('/api/projects', authMiddleware, projectsRouter);
app.use('/api/rooms', authMiddleware, roomsRouter);
app.use('/api/furniture', authMiddleware, furnitureRouter);
app.use('/api/quotations', authMiddleware, quotationsRouter);
app.use('/api/orders', authMiddleware, ordersRouter);
app.use('/api/inventory', authMiddleware, inventoryRouter);
app.use('/api/users', authMiddleware, usersRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Interior Planner API running on http://localhost:${PORT}`);
});

export default app;
