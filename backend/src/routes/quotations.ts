import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateItemList } from '../services/costing.service';

const router = Router();
const prisma = new PrismaClient();

// GET /api/quotations
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { project: { select: { name: true } }, client: { select: { name: true } } },
      }),
      prisma.quotation.count(),
    ]);
    res.json({ data: quotations, total, page, limit, pages: Math.ceil(total / limit) });
  } catch { res.status(500).json({ error: 'Failed to fetch quotations' }); }
});

// POST /api/quotations/generate — generate from room layout
router.post('/generate', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomLayoutId, projectId, clientId, profitMargin, discount, contingency, applyGst } = req.body;
    if (!roomLayoutId || !projectId || !clientId) {
      res.status(400).json({ error: 'roomLayoutId, projectId, clientId required' });
      return;
    }

    const breakdown = await generateItemList(roomLayoutId, { profitMargin, discount, contingency, applyGst });

    const count = await prisma.quotation.count();
    const quoteNumber = `QUOT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const quotation = await prisma.quotation.create({
      data: {
        quoteNumber,
        projectId,
        clientId,
        createdById: req.user!.id,
        validUntil: new Date(Date.now() + 30 * 86400000),
        itemsTotal: breakdown.itemsTotal,
        materialCustomization: breakdown.materialCustomization,
        laborCharges: breakdown.laborCharges,
        transport: breakdown.transport,
        otherCharges: breakdown.otherCharges,
        subTotal: breakdown.subTotal,
        gstPercent: breakdown.gstPercent,
        gstAmount: breakdown.gstAmount,
        totalAmount: breakdown.totalAmount,
        profitMargin: profitMargin ?? 15,
        discount: discount ?? 0,
        contingency: contingency ?? 5,
        applyGst: applyGst ?? true,
        termsConditions: '1. This quotation is valid for 30 days.\n2. 50% advance payment is required to confirm the order.\n3. Balance payment before delivery/installation.\n4. Taxes as applicable.',
        items: {
          create: breakdown.items.map((item, i) => ({
            furnitureItemId: item.furnitureItemId,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            sortOrder: i + 1,
          })),
        },
      },
      include: { items: { include: { furnitureItem: true } }, client: true, project: true },
    });

    res.status(201).json(quotation);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to generate quotation' }); }
});

// GET /api/quotations/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { furnitureItem: true }, orderBy: { sortOrder: 'asc' } },
        client: true,
        project: true,
        createdBy: { select: { name: true, email: true } },
      },
    });
    if (!quotation) { res.status(404).json({ error: 'Quotation not found' }); return; }
    res.json(quotation);
  } catch { res.status(500).json({ error: 'Failed to fetch quotation' }); }
});

// PATCH /api/quotations/:id/status
router.patch('/:id/status', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const q = await prisma.quotation.update({ where: { id: req.params.id }, data: { status } });
    res.json(q);
  } catch { res.status(500).json({ error: 'Failed to update status' }); }
});

// POST /api/quotations/preview-cost — preview cost breakdown without saving
router.post('/preview-cost', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomLayoutId, profitMargin, discount, contingency, applyGst } = req.body;
    const breakdown = await generateItemList(roomLayoutId, { profitMargin, discount, contingency, applyGst });
    res.json(breakdown);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to compute cost' }); }
});

export default router;
