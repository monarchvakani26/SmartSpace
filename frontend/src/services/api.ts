import axios from 'axios';
import { 
  User, Lead, Client, Project, FurnitureCategory, FurnitureCatalogItem, 
  Quotation, Order, InventoryItem, CostBreakdown, PricingSettings 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aip_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Rich In-Memory & LocalStorage Persistent Mock Database Fallback ───

const STORAGE_KEY = 'aip_mock_db_v1';

interface MockDB {
  leads: Lead[];
  clients: Client[];
  projects: Project[];
  furnitureCategories: FurnitureCategory[];
  furnitureItems: FurnitureCatalogItem[];
  quotations: Quotation[];
  orders: Order[];
  inventory: InventoryItem[];
  tasks: any[];
}

const initialMockDB: MockDB = {
  leads: [
    { id: 'lead-1', name: 'Rohan Mehta', phone: '9876543210', email: 'rohan.mehta@gmail.com', source: 'WEBSITE', status: 'INTERESTED', createdAt: '2024-05-20' },
    { id: 'lead-2', name: 'Neha Sharma', phone: '9123456780', email: 'neha.s@gmail.com', source: 'INSTAGRAM', status: 'CONTACTED', createdAt: '2024-05-19' },
    { id: 'lead-3', name: 'Amit Verma', phone: '9988776655', email: 'amit.v@gmail.com', source: 'REFERRAL', status: 'NOT_INTERESTED', createdAt: '2024-05-19' },
    { id: 'lead-4', name: 'Pooja Singh', phone: '8200500122', email: 'pooja.singh@gmail.com', source: 'WEBSITE', status: 'INTERESTED', createdAt: '2024-05-18' },
    { id: 'lead-5', name: 'Karan Patel', phone: '7786954433', email: 'karan.p@gmail.com', source: 'FACEBOOK', status: 'NEW', createdAt: '2024-05-18' },
    { id: 'lead-6', name: 'Ananya Roy', phone: '9822334455', email: 'ananya@gmail.com', source: 'WEBSITE', status: 'INTERESTED', createdAt: '2024-05-17' },
    { id: 'lead-7', name: 'Vikram Joshi', phone: '9443322110', email: 'vikram.j@gmail.com', source: 'REFERRAL', status: 'CONTACTED', createdAt: '2024-05-16' },
  ],
  clients: [
    { id: 'cli-1', name: 'Rohan Mehta', phone: '9876543210', email: 'rohan.mehta@gmail.com', address: '401 Prestige Towers, Andheri West', city: 'Mumbai, Maharashtra', createdAt: '2024-05-20' },
    { id: 'cli-2', name: 'Neha Sharma', phone: '9123456780', email: 'neha.s@gmail.com', address: '12 Koregaon Park Road', city: 'Pune, Maharashtra', createdAt: '2024-05-19' },
    { id: 'cli-3', name: 'Amit Verma', phone: '9988776655', email: 'amit.v@gmail.com', address: '7 MG Road, Indiranagar', city: 'Bangalore, Karnataka', createdAt: '2024-05-17' },
    { id: 'cli-4', name: 'Pooja Singh', phone: '8200500122', email: 'pooja.singh@gmail.com', address: 'B-202 Orchid Heights, Powai', city: 'Mumbai, Maharashtra', createdAt: '2024-05-18' },
  ],
  projects: [
    { id: 'proj-1', name: 'Modern Bedroom', description: 'Interior design for master bedroom', type: 'BEDROOM', status: 'IN_PROGRESS', clientId: 'cli-1', client: { id: 'cli-1', name: 'Rohan Mehta', phone: '9876543210', createdAt: '2024-05-20' }, updatedAt: '20 May 2024', createdAt: '2024-05-10' },
    { id: 'proj-2', name: '2BHK Apartment', description: 'Full home interior for 2BHK flat', type: 'FULL_HOME', status: 'DESIGNING', clientId: 'cli-2', client: { id: 'cli-2', name: 'Neha Sharma', phone: '9123456780', createdAt: '2024-05-19' }, updatedAt: '18 May 2024', createdAt: '2024-05-12' },
    { id: 'proj-3', name: 'Luxury Villa', description: 'Premium villa interior design', type: 'FULL_HOME', status: 'QUOTATION', clientId: 'cli-3', client: { id: 'cli-3', name: 'Amit Verma', phone: '9988776655', createdAt: '2024-05-17' }, updatedAt: '17 May 2024', createdAt: '2024-05-14' },
    { id: 'proj-4', name: 'Studio Apartment', description: 'Compact studio interior design', type: 'LIVING_ROOM', status: 'IN_PROGRESS', clientId: 'cli-4', client: { id: 'cli-4', name: 'Pooja Singh', phone: '8200500122', createdAt: '2024-05-18' }, updatedAt: '16 May 2024', createdAt: '2024-05-15' },
  ],
  furnitureCategories: [
    { id: 'cat-all', name: 'All Items', sortOrder: 0 },
    { id: 'cat-beds', name: 'Beds', sortOrder: 1 },
    { id: 'cat-wardrobes', name: 'Wardrobes', sortOrder: 2 },
    { id: 'cat-sofas', name: 'Sofas', sortOrder: 3 },
    { id: 'cat-tables', name: 'Tables', sortOrder: 4 },
    { id: 'cat-doors', name: 'Doors', sortOrder: 5 },
    { id: 'cat-windows', name: 'Windows', sortOrder: 6 },
    { id: 'cat-decor', name: 'Decor', sortOrder: 7 },
    { id: 'cat-others', name: 'Others', sortOrder: 8 },
  ],
  furnitureItems: [
    // Beds
    { id: 'item-bed-king', name: 'King Size Bed', categoryId: 'cat-beds', categoryName: 'Beds', defaultWidthFt: 6, defaultHeightFt: 6.5, defaultHeightM: 1.5, basePrice: 45000 },
    { id: 'item-bed-queen', name: 'Queen Size Bed', categoryId: 'cat-beds', categoryName: 'Beds', defaultWidthFt: 5, defaultHeightFt: 6.5, defaultHeightM: 1.5, basePrice: 35000 },
    { id: 'item-bed-single', name: 'Single Bed', categoryId: 'cat-beds', categoryName: 'Beds', defaultWidthFt: 3.5, defaultHeightFt: 6.5, defaultHeightM: 1.5, basePrice: 22000 },
    
    // Wardrobes
    { id: 'item-wardrobe-3d', name: '3 Door Wardrobe', categoryId: 'cat-wardrobes', categoryName: 'Wardrobes', defaultWidthFt: 6, defaultHeightFt: 2, defaultHeightM: 7, basePrice: 40000 },
    { id: 'item-wardrobe-2d', name: '2 Door Wardrobe', categoryId: 'cat-wardrobes', categoryName: 'Wardrobes', defaultWidthFt: 4, defaultHeightFt: 2, defaultHeightM: 7, basePrice: 28000 },
    { id: 'item-wardrobe-sliding', name: 'Sliding Wardrobe', categoryId: 'cat-wardrobes', categoryName: 'Wardrobes', defaultWidthFt: 5, defaultHeightFt: 2, defaultHeightM: 7, basePrice: 48000 },

    // Sofas
    { id: 'item-sofa-3s', name: '3 Seater Sofa', categoryId: 'cat-sofas', categoryName: 'Sofas', defaultWidthFt: 6.5, defaultHeightFt: 3, defaultHeightM: 3, basePrice: 32000 },
    { id: 'item-sofa-2s', name: '2 Seater Sofa', categoryId: 'cat-sofas', categoryName: 'Sofas', defaultWidthFt: 4.5, defaultHeightFt: 2.8, defaultHeightM: 3, basePrice: 24000 },
    { id: 'item-sofa-l', name: 'L-Shape Sofa', categoryId: 'cat-sofas', categoryName: 'Sofas', defaultWidthFt: 8, defaultHeightFt: 5, defaultHeightM: 3, basePrice: 52000 },

    // Tables
    { id: 'item-sidetable', name: 'Bed Side Table', categoryId: 'cat-tables', categoryName: 'Tables', defaultWidthFt: 1.5, defaultHeightFt: 1.5, defaultHeightM: 2, basePrice: 5000 },
    { id: 'item-tvunit', name: 'TV Unit with Storage', categoryId: 'cat-tables', categoryName: 'Tables', defaultWidthFt: 6, defaultHeightFt: 1.5, defaultHeightM: 2, basePrice: 20000 },
    { id: 'item-coffeetable', name: 'Coffee Table', categoryId: 'cat-tables', categoryName: 'Tables', defaultWidthFt: 3.5, defaultHeightFt: 2, defaultHeightM: 1.5, basePrice: 8500 },
    { id: 'item-studytable', name: 'Study Desk', categoryId: 'cat-tables', categoryName: 'Tables', defaultWidthFt: 4, defaultHeightFt: 2, defaultHeightM: 2.5, basePrice: 14000 },

    // Doors & Windows
    { id: 'item-door-single', name: 'Standard Door', categoryId: 'cat-doors', categoryName: 'Doors', defaultWidthFt: 3, defaultHeightFt: 0.5, defaultHeightM: 7, basePrice: 8000 },
    { id: 'item-window-std', name: 'Room Window', categoryId: 'cat-windows', categoryName: 'Windows', defaultWidthFt: 4, defaultHeightFt: 0.5, defaultHeightM: 4, basePrice: 6500 },

    // Decor & Others
    { id: 'item-decor-plant', name: 'Potted Plant', categoryId: 'cat-decor', categoryName: 'Decor', defaultWidthFt: 1.2, defaultHeightFt: 1.2, defaultHeightM: 3, basePrice: 2500 },
    { id: 'item-decor-rug', name: 'Accent Floor Rug', categoryId: 'cat-decor', categoryName: 'Decor', defaultWidthFt: 6, defaultHeightFt: 4, defaultHeightM: 0.1, basePrice: 7000 },
    { id: 'item-lamp', name: 'Floor Lamp', categoryId: 'cat-decor', categoryName: 'Decor', defaultWidthFt: 1.2, defaultHeightFt: 1.2, defaultHeightM: 5, basePrice: 4500 },
  ],
  quotations: [
    {
      id: 'quot-1',
      quoteNumber: 'HQTH-2024-0012',
      projectId: 'proj-1',
      project: { id: 'proj-1', name: 'Modern Bedroom', type: 'BEDROOM', status: 'IN_PROGRESS', clientId: 'cli-1', updatedAt: '20 May 2024', createdAt: '2024-05-10' },
      clientId: 'cli-1',
      client: { id: 'cli-1', name: 'Rohan Mehta', phone: '9876543210', email: 'rohan.mehta@gmail.com', address: 'Mumbai, Maharashtra', city: 'Mumbai', createdAt: '2024-05-20' },
      status: 'DRAFT',
      validUntil: '2024-06-20',
      itemsTotal: 120000,
      materialCustomization: 25000,
      laborCharges: 15000,
      transport: 5000,
      otherCharges: 5000,
      subTotal: 170000,
      gstPercent: 18,
      gstAmount: 30600,
      totalAmount: 200600,
      profitMargin: 20,
      discount: 5,
      contingency: 2,
      applyGst: true,
      termsConditions: '1. This quotation is valid for 30 days.\n2. 50% advance payment required.\n3. Taxes and delivery included as specified.',
      items: [
        { id: 'qi-1', description: 'King Size Bed with Storage', quantity: 1, rate: 45000, amount: 45000, sortOrder: 1 },
        { id: 'qi-2', description: '2 Door Wardrobe', quantity: 1, rate: 35000, amount: 35000, sortOrder: 2 },
        { id: 'qi-3', description: 'Bed Side Table', quantity: 2, rate: 5000, amount: 10000, sortOrder: 3 },
        { id: 'qi-4', description: 'TV Unit with Storage', quantity: 1, rate: 20000, amount: 20000, sortOrder: 4 },
        { id: 'qi-5', description: 'Lights, Handles, Accessories', quantity: 1, rate: 10000, amount: 10000, sortOrder: 5 },
      ],
      createdAt: '20 May 2024',
    }
  ],
  orders: [
    { id: 'ord-1', orderNumber: 'ORD-2024-0012', projectId: 'proj-1', projectName: 'Modern Bedroom', clientName: 'Rohan Mehta', amount: 161000, totalAmount: 161000, status: 'CONFIRMED', orderDate: '20 May 2024', createdAt: '2024-05-20' },
    { id: 'ord-2', orderNumber: 'ORD-2024-0011', projectId: 'proj-2', projectName: '2BHK Apartment', clientName: 'Neha Sharma', amount: 275000, totalAmount: 275000, status: 'IN_PROGRESS', orderDate: '19 May 2024', createdAt: '2024-05-19' },
    { id: 'ord-3', orderNumber: 'ORD-2024-0010', projectId: 'proj-3', projectName: 'Luxury Villa', clientName: 'Amit Verma', amount: 552500, totalAmount: 552500, status: 'ON_HOLD', orderDate: '17 May 2024', createdAt: '2024-05-17' },
    { id: 'ord-4', orderNumber: 'ORD-2024-0009', projectId: 'proj-4', projectName: 'Studio Apartment', clientName: 'Pooja Singh', amount: 105000, totalAmount: 105000, status: 'COMPLETED', orderDate: '16 May 2024', createdAt: '2024-05-16' },
  ],
  inventory: [
    { id: 'inv-1', name: 'Plywood 18mm', category: 'Boards', unit: 'Sheets', stock: 120, unitPrice: 1800 },
    { id: 'inv-2', name: 'Plywood 12mm', category: 'Boards', unit: 'Sheets', stock: 150, unitPrice: 1200 },
    { id: 'inv-3', name: 'Sunmica - Walnut', category: 'Laminates', unit: 'Sheets', stock: 80, unitPrice: 980 },
    { id: 'inv-4', name: 'Sunmica - White', category: 'Laminates', unit: 'Sheets', stock: 65, unitPrice: 850 },
    { id: 'inv-5', name: 'Handle - Steel', category: 'Hardware', unit: 'Pieces', stock: 200, unitPrice: 120 },
  ],
  tasks: [
    { id: 't-1', title: 'Follow up with Rohan', dueDate: 'Today', isDone: false, priority: 'HIGH' },
    { id: 't-2', title: 'Submit quotation', dueDate: 'Tomorrow', isDone: false, priority: 'HIGH' },
    { id: 't-3', title: 'Site visit - 2BHK', dueDate: '21 May', isDone: false, priority: 'MEDIUM' },
  ]
};

function getDB(): MockDB {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockDB));
  return initialMockDB;
}

function saveDB(db: MockDB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ─── Unified Data Services ───

export const apiService = {
  // Auth
  login: async (email: string, _password: string): Promise<{ token: string; user: User }> => {
    try {
      const res = await apiClient.post('/auth/login', { email, password: _password });
      return res.data;
    } catch {
      // Fallback auth
      const user: User = {
        id: 'u-1',
        name: email.includes('admin') ? 'Rajesh Kumar' : 'Amit Verma',
        email,
        role: email.includes('admin') ? 'ADMIN' : 'DESIGNER',
      };
      const token = 'mock-jwt-token-' + Date.now();
      return { token, user };
    }
  },

  // Dashboard
  getDashboard: async () => {
    try {
      const res = await apiClient.get('/dashboard');
      return res.data;
    } catch {
      const db = getDB();
      return {
        kpis: {
          totalLeads: db.leads.length + 123,
          activeProjects: db.projects.filter(p => p.status !== 'COMPLETED').length + 31,
          totalOrders: db.orders.length + 14,
          revenue: 1245000,
        },
        recentProjects: db.projects,
        tasks: db.tasks,
      };
    }
  },

  // Leads
  getLeads: async () => {
    try {
      const res = await apiClient.get('/leads');
      return res.data.data || res.data;
    } catch {
      return getDB().leads;
    }
  },
  createLead: async (leadData: Partial<Lead>) => {
    try {
      const res = await apiClient.post('/leads', leadData);
      return res.data;
    } catch {
      const db = getDB();
      const newLead: Lead = {
        id: 'lead-' + Date.now(),
        name: leadData.name || 'New Lead',
        phone: leadData.phone || '',
        email: leadData.email,
        source: leadData.source || 'WEBSITE',
        status: leadData.status || 'NEW',
        createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      db.leads.unshift(newLead);
      saveDB(db);
      return newLead;
    }
  },

  // Projects
  getProjects: async () => {
    try {
      const res = await apiClient.get('/projects');
      return res.data.data || res.data;
    } catch {
      return getDB().projects;
    }
  },
  getProjectById: async (id: string) => {
    try {
      const res = await apiClient.get(`/projects/${id}`);
      return res.data;
    } catch {
      const db = getDB();
      return db.projects.find(p => p.id === id) || db.projects[0];
    }
  },
  createProject: async (projectData: Partial<Project>) => {
    try {
      const res = await apiClient.post('/projects', projectData);
      return res.data;
    } catch {
      const db = getDB();
      const client = db.clients.find(c => c.id === projectData.clientId) || db.clients[0];
      const newProj: Project = {
        id: 'proj-' + Date.now(),
        name: projectData.name || 'Untitled Project',
        description: projectData.description,
        type: projectData.type || 'BEDROOM',
        status: 'DESIGNING',
        clientId: client.id,
        client,
        updatedAt: 'Just now',
        createdAt: new Date().toISOString(),
      };
      db.projects.unshift(newProj);
      saveDB(db);
      return newProj;
    }
  },

  // Clients
  getClients: async () => {
    try {
      const res = await apiClient.get('/clients');
      return res.data.data || res.data;
    } catch {
      return getDB().clients;
    }
  },

  // Furniture Catalog
  getFurnitureCategories: async () => {
    try {
      const res = await apiClient.get('/furniture/categories');
      return res.data;
    } catch {
      return getDB().furnitureCategories;
    }
  },
  getFurnitureItems: async (categoryId?: string) => {
    try {
      const res = await apiClient.get('/furniture', { params: { categoryId } });
      return res.data;
    } catch {
      const db = getDB();
      if (!categoryId || categoryId === 'cat-all') return db.furnitureItems;
      return db.furnitureItems.filter(item => item.categoryId === categoryId);
    }
  },

  // Quotation & Costing
  calculateCost: (items: any[], settings: PricingSettings): CostBreakdown => {
    const costItems = items.map((item, idx) => {
      const base = item.basePrice || 20000;
      const customAdder = item.customizations?.materialPricePerSqFt 
        ? item.customizations.materialPricePerSqFt * (item.widthFt || 4) * (item.heightFt || 2) * 2 
        : 0;
      const rate = base + customAdder;
      return {
        furnitureItemId: item.furnitureItemId || item.id,
        name: item.name || 'Furniture Item',
        description: item.name + (item.customizations?.materialName ? ` (${item.customizations.materialName})` : ''),
        quantity: 1,
        rate,
        amount: rate,
        category: item.category,
      };
    });

    const itemsTotal = costItems.reduce((acc, curr) => acc + curr.amount, 0) || 120000;
    const materialCustomization = Math.round(itemsTotal * 0.18);
    const laborCharges = 15000;
    const transport = 5000;
    const otherCharges = 5000;

    const baseCost = itemsTotal + materialCustomization;
    const withMargin = baseCost * (1 + (settings.profitMargin || 20) / 100);
    const withDiscount = withMargin * (1 - (settings.discount || 0) / 100);
    const subTotal = Math.round(withDiscount + laborCharges + transport + otherCharges);
    
    const gstPercent = 18;
    const gstAmount = settings.applyGst ? Math.round(subTotal * 0.18) : 0;
    const totalAmount = subTotal + gstAmount;

    return {
      items: costItems,
      itemsTotal,
      materialCustomization,
      laborCharges,
      transport,
      otherCharges,
      subTotal,
      gstPercent,
      gstAmount,
      totalAmount,
    };
  },

  getQuotations: async () => {
    try {
      const res = await apiClient.get('/quotations');
      return res.data.data || res.data;
    } catch {
      return getDB().quotations;
    }
  },
  getQuotationById: async (id: string) => {
    try {
      const res = await apiClient.get(`/quotations/${id}`);
      return res.data;
    } catch {
      const db = getDB();
      return db.quotations.find(q => q.id === id) || db.quotations[0];
    }
  },

  // Orders
  getOrders: async () => {
    try {
      const res = await apiClient.get('/orders');
      return res.data.data || res.data;
    } catch {
      return getDB().orders;
    }
  },

  // Inventory
  getInventory: async () => {
    try {
      const res = await apiClient.get('/inventory');
      return res.data.data || res.data;
    } catch {
      return getDB().inventory;
    }
  },
};
