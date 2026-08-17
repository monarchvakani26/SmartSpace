import { PrismaClient, RoleName, LeadStatus, LeadSource, ProjectType, ProjectStatus, RoomType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AI Interior Planner database...');

  // ─── Users ───────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 10);
  const salesHash = await bcrypt.hash('sales123', 10);
  const designerHash = await bcrypt.hash('designer123', 10);
  const estimatorHash = await bcrypt.hash('estimator123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aiinteriorplanner.com' },
    update: {},
    create: { name: 'Rajesh Kumar', email: 'admin@aiinteriorplanner.com', passwordHash: adminHash, role: RoleName.ADMIN },
  });
  const sales = await prisma.user.upsert({
    where: { email: 'sales@aiinteriorplanner.com' },
    update: {},
    create: { name: 'Priya Sharma', email: 'sales@aiinteriorplanner.com', passwordHash: salesHash, role: RoleName.SALES_EXECUTIVE },
  });
  const designer = await prisma.user.upsert({
    where: { email: 'designer@aiinteriorplanner.com' },
    update: {},
    create: { name: 'Amit Verma', email: 'designer@aiinteriorplanner.com', passwordHash: designerHash, role: RoleName.DESIGNER },
  });
  const estimator = await prisma.user.upsert({
    where: { email: 'estimator@aiinteriorplanner.com' },
    update: {},
    create: { name: 'Neha Patel', email: 'estimator@aiinteriorplanner.com', passwordHash: estimatorHash, role: RoleName.ESTIMATOR },
  });

  console.log('✅ Users seeded');

  // ─── Furniture Categories ─────────────────────────────────────────
  const categories = [
    { name: 'All Items', icon: 'grid', sortOrder: 0 },
    { name: 'Beds', icon: 'bed', sortOrder: 1 },
    { name: 'Wardrobes', icon: 'layout', sortOrder: 2 },
    { name: 'Sofas', icon: 'armchair', sortOrder: 3 },
    { name: 'Tables', icon: 'table', sortOrder: 4 },
    { name: 'Doors', icon: 'door-open', sortOrder: 5 },
    { name: 'Windows', icon: 'square', sortOrder: 6 },
    { name: 'Decor', icon: 'flower', sortOrder: 7 },
    { name: 'Others', icon: 'more-horizontal', sortOrder: 8 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.furnitureCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categoryMap[cat.name] = c.id;
  }
  console.log('✅ Furniture categories seeded');

  // ─── Furniture Catalog ────────────────────────────────────────────
  const furnitureItems = [
    // Beds
    { name: 'Single Bed', categoryName: 'Beds', defaultWidthFt: 3.5, defaultHeightFt: 6.5, defaultHeightM: 1.5, basePrice: 18000 },
    { name: 'Double Bed', categoryName: 'Beds', defaultWidthFt: 5, defaultHeightFt: 6.5, defaultHeightM: 1.5, basePrice: 25000 },
    { name: 'King Size Bed', categoryName: 'Beds', defaultWidthFt: 6, defaultHeightFt: 7, defaultHeightM: 1.5, basePrice: 35000 },
    { name: 'Queen Size Bed', categoryName: 'Beds', defaultWidthFt: 5, defaultHeightFt: 6.5, defaultHeightM: 1.5, basePrice: 28000 },
    { name: 'Bunk Bed', categoryName: 'Beds', defaultWidthFt: 3.5, defaultHeightFt: 6.5, defaultHeightM: 5, basePrice: 22000 },
    // Wardrobes
    { name: 'Wardrobe 2-Door', categoryName: 'Wardrobes', defaultWidthFt: 4, defaultHeightFt: 2, defaultHeightM: 7, basePrice: 28000 },
    { name: 'Wardrobe 3-Door', categoryName: 'Wardrobes', defaultWidthFt: 6, defaultHeightFt: 2, defaultHeightM: 7, basePrice: 40000 },
    { name: 'Wardrobe Sliding', categoryName: 'Wardrobes', defaultWidthFt: 5, defaultHeightFt: 2, defaultHeightM: 7, basePrice: 45000 },
    { name: 'Walk-In Wardrobe', categoryName: 'Wardrobes', defaultWidthFt: 8, defaultHeightFt: 4, defaultHeightM: 7, basePrice: 75000 },
    // Sofas
    { name: 'Sofa 2-Seater', categoryName: 'Sofas', defaultWidthFt: 5, defaultHeightFt: 2.5, defaultHeightM: 3, basePrice: 22000 },
    { name: 'Sofa 3-Seater', categoryName: 'Sofas', defaultWidthFt: 7, defaultHeightFt: 2.5, defaultHeightM: 3, basePrice: 32000 },
    { name: 'L-Shape Sofa', categoryName: 'Sofas', defaultWidthFt: 8, defaultHeightFt: 5, defaultHeightM: 3, basePrice: 48000 },
    { name: 'Sofa-cum-Bed', categoryName: 'Sofas', defaultWidthFt: 6, defaultHeightFt: 3, defaultHeightM: 3, basePrice: 28000 },
    // Tables
    { name: 'Dining Table 4-Seater', categoryName: 'Tables', defaultWidthFt: 4, defaultHeightFt: 3, defaultHeightM: 2.5, basePrice: 18000 },
    { name: 'Dining Table 6-Seater', categoryName: 'Tables', defaultWidthFt: 6, defaultHeightFt: 3, defaultHeightM: 2.5, basePrice: 26000 },
    { name: 'Coffee Table', categoryName: 'Tables', defaultWidthFt: 4, defaultHeightFt: 2, defaultHeightM: 1.5, basePrice: 8000 },
    { name: 'Study Table', categoryName: 'Tables', defaultWidthFt: 4, defaultHeightFt: 2, defaultHeightM: 2.5, basePrice: 12000 },
    { name: 'Side Table', categoryName: 'Tables', defaultWidthFt: 1.5, defaultHeightFt: 1.5, defaultHeightM: 2, basePrice: 5000 },
    { name: 'TV Unit', categoryName: 'Tables', defaultWidthFt: 6, defaultHeightFt: 1.5, defaultHeightM: 2, basePrice: 20000 },
    // Doors
    { name: 'Single Door', categoryName: 'Doors', defaultWidthFt: 3, defaultHeightFt: 0.5, defaultHeightM: 7, basePrice: 8000 },
    { name: 'Double Door', categoryName: 'Doors', defaultWidthFt: 5, defaultHeightFt: 0.5, defaultHeightM: 7, basePrice: 15000 },
    // Windows
    { name: 'Window Standard', categoryName: 'Windows', defaultWidthFt: 4, defaultHeightFt: 0.5, defaultHeightM: 4, basePrice: 6000 },
    { name: 'Bay Window', categoryName: 'Windows', defaultWidthFt: 6, defaultHeightFt: 0.5, defaultHeightM: 4, basePrice: 12000 },
    // Decor
    { name: 'Bookshelf', categoryName: 'Decor', defaultWidthFt: 3, defaultHeightFt: 1, defaultHeightM: 6, basePrice: 10000 },
    { name: 'Dressing Table', categoryName: 'Decor', defaultWidthFt: 3, defaultHeightFt: 1.5, defaultHeightM: 5, basePrice: 12000 },
    { name: 'Floor Lamp', categoryName: 'Decor', defaultWidthFt: 1, defaultHeightFt: 1, defaultHeightM: 5, basePrice: 3500 },
    { name: 'Plant Stand', categoryName: 'Decor', defaultWidthFt: 1, defaultHeightFt: 1, defaultHeightM: 2, basePrice: 2000 },
    // Others
    { name: 'AC Unit', categoryName: 'Others', defaultWidthFt: 3, defaultHeightFt: 1, defaultHeightM: 1, basePrice: 35000 },
    { name: 'Refrigerator', categoryName: 'Others', defaultWidthFt: 2, defaultHeightFt: 2.5, defaultHeightM: 5.5, basePrice: 28000 },
    { name: 'Washing Machine', categoryName: 'Others', defaultWidthFt: 2, defaultHeightFt: 2, defaultHeightM: 3.5, basePrice: 22000 },
  ];

  for (const item of furnitureItems) {
    const catId = categoryMap[item.categoryName];
    if (!catId) continue;
    await prisma.furnitureCatalog.upsert({
      where: { id: `seed-${item.name.replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `seed-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
        name: item.name,
        categoryId: catId,
        defaultWidthFt: item.defaultWidthFt,
        defaultHeightFt: item.defaultHeightFt,
        defaultHeightM: item.defaultHeightM,
        basePrice: item.basePrice,
      },
    });
  }
  console.log('✅ Furniture catalog seeded');

  // ─── Materials ────────────────────────────────────────────────────
  const materials = [
    { name: 'Plywood 19mm', category: 'Boards', pricePerSqFt: 85 },
    { name: 'Plywood 12mm', category: 'Boards', pricePerSqFt: 65 },
    { name: 'MDF 18mm', category: 'Boards', pricePerSqFt: 55 },
    { name: 'Blockboard', category: 'Boards', pricePerSqFt: 75 },
    { name: 'Sunmica - Walnut', category: 'Laminates', pricePerSqFt: 35 },
    { name: 'Sunmica - White', category: 'Laminates', pricePerSqFt: 30 },
    { name: 'Sunmica - Oak', category: 'Laminates', pricePerSqFt: 38 },
    { name: 'Sunmica - Cream', category: 'Laminates', pricePerSqFt: 30 },
    { name: 'Acrylic Gloss', category: 'Finishes', pricePerSqFt: 90 },
    { name: 'PU Paint', category: 'Finishes', pricePerSqFt: 120 },
    { name: 'Veneer - Teak', category: 'Finishes', pricePerSqFt: 150 },
    { name: 'Glass - Clear 6mm', category: 'Glass', pricePerSqFt: 95 },
  ];
  for (const m of materials) {
    await prisma.material.upsert({ where: { name: m.name }, update: {}, create: m });
  }
  console.log('✅ Materials seeded');

  // ─── Finishes ─────────────────────────────────────────────────────
  const finishes = [
    { name: 'Matte', priceAdder: 0 },
    { name: 'Glossy', priceAdder: 15 },
    { name: 'Satin', priceAdder: 10 },
    { name: 'Texture', priceAdder: 20 },
    { name: 'Metallic', priceAdder: 35 },
    { name: 'Dark Walnut', priceAdder: 5 },
  ];
  for (const f of finishes) {
    await prisma.finish.upsert({ where: { name: f.name }, update: {}, create: f });
  }

  // ─── Colors ───────────────────────────────────────────────────────
  const colors = [
    { name: 'White', hexCode: '#FFFFFF', category: 'Neutrals' },
    { name: 'Cream', hexCode: '#F5F0E8', category: 'Neutrals' },
    { name: 'Beige', hexCode: '#D2B48C', category: 'Neutrals' },
    { name: 'Walnut Brown', hexCode: '#5C4033', category: 'Browns' },
    { name: 'Teak', hexCode: '#8B6914', category: 'Browns' },
    { name: 'Charcoal', hexCode: '#36454F', category: 'Darks' },
    { name: 'Navy Blue', hexCode: '#0F1629', category: 'Blues' },
    { name: 'Forest Green', hexCode: '#228B22', category: 'Greens' },
    { name: 'Terracotta', hexCode: '#E2725B', category: 'Warm' },
    { name: 'Dusty Pink', hexCode: '#D4A0A0', category: 'Warm' },
    { name: 'Slate Gray', hexCode: '#708090', category: 'Neutrals' },
    { name: 'Black', hexCode: '#1A1A1A', category: 'Darks' },
  ];
  for (const c of colors) {
    await prisma.color.create({ data: c }).catch(() => {});
  }

  // ─── Hardware ─────────────────────────────────────────────────────
  const hardware = [
    { name: 'Gold Handles', type: 'Handle', priceAdder: 1200 },
    { name: 'Silver Handles', type: 'Handle', priceAdder: 800 },
    { name: 'Black Matte Handles', type: 'Handle', priceAdder: 950 },
    { name: 'No Handles (Push-to-Open)', type: 'Handle', priceAdder: 600 },
    { name: 'Concealed Hinges', type: 'Hinge', priceAdder: 400 },
    { name: 'Soft Close Hinges', type: 'Hinge', priceAdder: 800 },
  ];
  for (const h of hardware) {
    await prisma.hardwareOption.create({ data: h }).catch(() => {});
  }
  console.log('✅ Materials, finishes, colors, hardware seeded');

  // ─── Pricing Rules ────────────────────────────────────────────────
  const pricingRules = [
    { name: 'Bedroom Labor Rate', ruleType: 'LABOR_RATE', roomType: RoomType.BEDROOM, value: 15000, unit: 'fixed' },
    { name: 'Living Room Labor Rate', ruleType: 'LABOR_RATE', roomType: RoomType.LIVING_ROOM, value: 20000, unit: 'fixed' },
    { name: 'Kitchen Labor Rate', ruleType: 'LABOR_RATE', roomType: RoomType.KITCHEN, value: 25000, unit: 'fixed' },
    { name: 'Standard Transport', ruleType: 'TRANSPORT', value: 5000, unit: 'fixed' },
    { name: 'Installation Charge', ruleType: 'INSTALLATION', value: 8, unit: 'percentage' },
    { name: 'Default Contingency', ruleType: 'CONTINGENCY', value: 5, unit: 'percentage' },
  ];
  for (const r of pricingRules) {
    await prisma.pricingRule.create({ data: r }).catch(() => {});
  }
  console.log('✅ Pricing rules seeded');

  // ─── Leads ────────────────────────────────────────────────────────
  const leads = [
    { name: 'Rohan Mehta', phone: '9876543210', email: 'rohan.mehta@gmail.com', source: LeadSource.WEBSITE, status: LeadStatus.INTERESTED, assignedToId: sales.id },
    { name: 'Neha Sharma', phone: '9123456780', email: 'neha.s@gmail.com', source: LeadSource.INSTAGRAM, status: LeadStatus.CONTACTED, assignedToId: sales.id },
    { name: 'Arti Verma', phone: '9988778665', email: 'arti.v@gmail.com', source: LeadSource.REFERRAL, status: LeadStatus.NOT_INTERESTED, assignedToId: sales.id },
    { name: 'Pooja Singh', phone: '8200500102', email: 'pooja.singh@gmail.com', source: LeadSource.WEBSITE, status: LeadStatus.INTERESTED, assignedToId: sales.id },
    { name: 'Karan Patel', phone: '7786954435', email: 'karan.patel@gmail.com', source: LeadSource.FACEBOOK, status: LeadStatus.NEW, assignedToId: sales.id },
  ];

  const leadRecords: any[] = [];
  for (const l of leads) {
    const lead = await prisma.lead.create({ data: l });
    leadRecords.push(lead);
  }
  console.log('✅ Leads seeded');

  // ─── Clients ─────────────────────────────────────────────────────
  const client1 = await prisma.client.create({
    data: {
      name: 'Rohan Mehta', phone: '9876543210', email: 'rohan.mehta@gmail.com',
      address: '401 Prestige Towers, Andheri West', city: 'Mumbai',
      leadId: leadRecords[0].id,
    },
  });
  const client2 = await prisma.client.create({
    data: {
      name: 'Nisha Kapoor', phone: '9898001122', email: 'nisha.k@gmail.com',
      address: '12, Koregaon Park Road', city: 'Pune',
    },
  });
  const client3 = await prisma.client.create({
    data: {
      name: 'Amit Joshi', phone: '8765432100', email: 'amit.joshi@gmail.com',
      address: '7 MG Road, Indiranagar', city: 'Bangalore',
    },
  });
  console.log('✅ Clients seeded');

  // ─── Projects ─────────────────────────────────────────────────────
  const proj1 = await prisma.project.create({
    data: {
      name: 'Modern Bedroom', description: 'Interior design for master bedroom',
      type: ProjectType.BEDROOM, status: ProjectStatus.IN_PROGRESS,
      clientId: client1.id, designerId: designer.id,
    },
  });
  const proj2 = await prisma.project.create({
    data: {
      name: '3BHK Apartment', description: 'Full home interior for 3BHK flat',
      type: ProjectType.FULL_HOME, status: ProjectStatus.QUOTATION,
      clientId: client2.id, designerId: designer.id,
    },
  });
  const proj3 = await prisma.project.create({
    data: {
      name: 'Luxury Villa', description: 'Premium villa interior design',
      type: ProjectType.FULL_HOME, status: ProjectStatus.DESIGNING,
      clientId: client3.id, designerId: designer.id,
    },
  });
  console.log('✅ Projects seeded');

  // ─── Room + RoomLayout ────────────────────────────────────────────
  const room1 = await prisma.room.create({
    data: { name: 'Master Bedroom', type: RoomType.MASTER_BEDROOM, projectId: proj1.id },
  });
  const layout1 = await prisma.roomLayout.create({
    data: { roomId: room1.id, length: 12, width: 10, height: 9 },
  });

  // Add sample layout items using seeded furniture IDs
  const bedId = `seed-king-size-bed`;
  const wardrobeId = `seed-wardrobe-3-door`;
  const sideTableId = `seed-side-table`;
  const tvUnitId = `seed-tv-unit`;

  await prisma.layoutItem.createMany({
    data: [
      { roomLayoutId: layout1.id, furnitureItemId: bedId, x: 3, y: 1, rotation: 0, widthFt: 6, heightFt: 7, customizations: { materialId: null, finishId: null, colorId: null } },
      { roomLayoutId: layout1.id, furnitureItemId: wardrobeId, x: 0.5, y: 0.5, rotation: 0, widthFt: 6, heightFt: 2 },
      { roomLayoutId: layout1.id, furnitureItemId: sideTableId, x: 9.5, y: 3, rotation: 0, widthFt: 1.5, heightFt: 1.5 },
      { roomLayoutId: layout1.id, furnitureItemId: tvUnitId, x: 2, y: 8, rotation: 0, widthFt: 6, heightFt: 1.5 },
    ],
  });

  // ─── Tasks ────────────────────────────────────────────────────────
  await prisma.task.createMany({
    data: [
      { title: 'Follow up with Rohan', projectId: proj1.id, assignedToId: sales.id, dueDate: new Date(), priority: 'HIGH' },
      { title: 'Submit quotation for 3BHK', projectId: proj2.id, assignedToId: estimator.id, dueDate: new Date(Date.now() + 86400000), priority: 'HIGH' },
      { title: 'Site visit — 3BHK', projectId: proj2.id, assignedToId: designer.id, dueDate: new Date(Date.now() + 2 * 86400000), priority: 'MEDIUM' },
    ],
  });

  // ─── Quotation ────────────────────────────────────────────────────
  const quotation = await prisma.quotation.create({
    data: {
      quoteNumber: 'ROTH-2024-0012',
      projectId: proj1.id,
      clientId: client1.id,
      createdById: estimator.id,
      status: 'DRAFT',
      validUntil: new Date(Date.now() + 30 * 86400000),
      itemsTotal: 121000,
      materialCustomization: 8000,
      laborCharges: 15000,
      transport: 5000,
      otherCharges: 5000,
      subTotal: 154000,
      gstPercent: 18,
      gstAmount: 27720,
      totalAmount: 181720,
      profitMargin: 15,
      discount: 0,
      contingency: 5,
      applyGst: true,
      termsConditions: '1. This quotation is valid for 30 days.\n2. 50% advance payment is required to confirm the order.\n3. Balance payment before delivery/installation.\n4. Taxes as applicable.\n5. Delivery within 45-60 working days after order confirmation.',
    },
  });

  await prisma.quotationItem.createMany({
    data: [
      { quotationId: quotation.id, furnitureItemId: bedId, description: 'King Size Bed with Storage', quantity: 1, rate: 45000, amount: 45000, sortOrder: 1 },
      { quotationId: quotation.id, furnitureItemId: wardrobeId, description: '3 Door Wardrobe', quantity: 1, rate: 40000, amount: 40000, sortOrder: 2 },
      { quotationId: quotation.id, furnitureItemId: sideTableId, description: 'Side Table', quantity: 2, rate: 5000, amount: 10000, sortOrder: 3 },
      { quotationId: quotation.id, furnitureItemId: tvUnitId, description: 'TV Unit with Storage', quantity: 1, rate: 20000, amount: 20000, sortOrder: 4 },
      { quotationId: quotation.id, description: 'Lights, Handles, Accessories', quantity: 1, rate: 6000, amount: 6000, sortOrder: 5 },
    ],
  });

  // ─── Orders ───────────────────────────────────────────────────────
  await prisma.order.createMany({
    data: [
      { orderNumber: 'ORD-2026-001', projectId: proj1.id, quotationId: quotation.id, status: 'CONFIRMED', totalAmount: 181720 },
      { orderNumber: 'ORD-2026-002', projectId: proj2.id, status: 'IN_PROGRESS', totalAmount: 421000 },
      { orderNumber: 'ORD-2026-003', projectId: proj3.id, status: 'ON_HOLD', totalAmount: 215000 },
    ],
  });

  // ─── Inventory ────────────────────────────────────────────────────
  await prisma.inventory.createMany({
    data: [
      { name: 'Plywood 19mm', category: 'Boards', unit: 'Sheets', stock: 120, unitPrice: 2200, reorderLevel: 20 },
      { name: 'Plywood 12mm', category: 'Boards', unit: 'Sheets', stock: 160, unitPrice: 1200, reorderLevel: 30 },
      { name: 'Sunmica — Walnut', category: 'Laminates', unit: 'Sheets', stock: 80, unitPrice: 980, reorderLevel: 15 },
      { name: 'Sunmica — White', category: 'Laminates', unit: 'Sheets', stock: 85, unitPrice: 850, reorderLevel: 15 },
      { name: 'Hardware — Steel', category: 'Hardware', unit: 'Pieces', stock: 200, unitPrice: 250, reorderLevel: 40 },
    ],
  });

  console.log('✅ Rooms, layouts, quotation, orders, inventory seeded');
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📋 Login credentials:');
  console.log('  Admin:     admin@aiinteriorplanner.com / admin123');
  console.log('  Sales:     sales@aiinteriorplanner.com / sales123');
  console.log('  Designer:  designer@aiinteriorplanner.com / designer123');
  console.log('  Estimator: estimator@aiinteriorplanner.com / estimator123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
