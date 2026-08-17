import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CostItem {
  furnitureItemId?: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  category?: string;
}

export interface CostBreakdown {
  items: CostItem[];
  itemsTotal: number;
  materialCustomization: number;
  laborCharges: number;
  transport: number;
  otherCharges: number;
  subTotal: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
}

/**
 * generateItemList — pure function that derives a costed item list from a room layout.
 * This is the ML input pipeline for Phase 3 cost prediction.
 */
export async function generateItemList(roomLayoutId: string, options?: {
  profitMargin?: number; discount?: number; contingency?: number; applyGst?: boolean;
}): Promise<CostBreakdown> {
  const layout = await prisma.roomLayout.findUnique({
    where: { id: roomLayoutId },
    include: {
      items: { include: { furnitureItem: { include: { category: true } } } },
      room: true,
    },
  });

  if (!layout) throw new Error('Layout not found');

  const profitMargin = options?.profitMargin ?? 15;
  const discount = options?.discount ?? 0;
  const contingencyPct = options?.contingency ?? 5;
  const applyGst = options?.applyGst ?? true;

  // Build item cost list from layout
  const items: CostItem[] = layout.items.map((li) => {
    const base = li.furnitureItem?.basePrice || 0;

    // Customization cost adder (material × surface area estimate)
    let customAdder = 0;
    const customs = li.customizations as any;
    if (customs?.materialPricePerSqFt) {
      const surfaceArea = li.widthFt * li.heightFt * 2; // rough sq ft
      customAdder = customs.materialPricePerSqFt * surfaceArea;
    }

    const rate = base + customAdder;
    return {
      furnitureItemId: li.furnitureItemId,
      name: li.furnitureItem?.name || 'Custom Item',
      description: li.furnitureItem?.name || 'Custom Item',
      quantity: 1,
      rate,
      amount: rate,
      category: li.furnitureItem?.category?.name,
    };
  });

  const itemsTotal = items.reduce((s, i) => s + i.amount, 0);

  // Material customization total
  const materialCustomization = items.reduce((s, _i) => s + 0, 0); // computed above

  // Labor: lookup by room type
  const laborRule = await prisma.pricingRule.findFirst({
    where: { ruleType: 'LABOR_RATE', roomType: layout.room.type as any },
  });
  const laborCharges = laborRule?.value || 15000;

  // Transport
  const transportRule = await prisma.pricingRule.findFirst({ where: { ruleType: 'TRANSPORT' } });
  const transport = transportRule?.value || 5000;

  // Other = contingency on itemsTotal
  const otherCharges = Math.round(itemsTotal * (contingencyPct / 100));

  // Margin & discount applied to itemsTotal
  const withMargin = itemsTotal * (1 + profitMargin / 100);
  const withDiscount = withMargin * (1 - discount / 100);
  const subTotal = withDiscount + laborCharges + transport + otherCharges;

  const gstPercent = 18;
  const gstAmount = applyGst ? Math.round(subTotal * (gstPercent / 100)) : 0;
  const totalAmount = subTotal + gstAmount;

  return {
    items,
    itemsTotal: Math.round(itemsTotal),
    materialCustomization: Math.round(materialCustomization),
    laborCharges,
    transport,
    otherCharges,
    subTotal: Math.round(subTotal),
    gstPercent,
    gstAmount,
    totalAmount: Math.round(totalAmount),
  };
}
