export type RoleName = 
  | 'ADMIN'
  | 'SALES_EXECUTIVE'
  | 'DESIGNER'
  | 'ESTIMATOR'
  | 'PROCUREMENT_MANAGER'
  | 'INSTALLATION_TEAM';

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleName;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'INTERESTED' | 'NOT_INTERESTED' | 'CONVERTED';
export type LeadSource = 'WEBSITE' | 'INSTAGRAM' | 'FACEBOOK' | 'REFERRAL' | 'WALK_IN' | 'OTHER';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  assignedTo?: { id?: string; name: string };
  assignedToId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  gstNumber?: string;
  leadId?: string;
  createdAt: string;
}

export type ProjectType = 'BEDROOM' | 'LIVING_ROOM' | 'KITCHEN' | 'BATHROOM' | 'OFFICE' | 'FULL_HOME' | 'COMMERCIAL';
export type ProjectStatus = 'LEAD' | 'DESIGNING' | 'IN_PROGRESS' | 'QUOTATION' | 'APPROVED' | 'ORDERED' | 'INSTALLATION' | 'COMPLETED' | 'ON_HOLD';

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  status: ProjectStatus;
  clientId: string;
  client?: Client;
  designerId?: string;
  designer?: { id: string; name: string; email: string };
  updatedAt: string;
  createdAt: string;
}

export interface FurnitureCatalogItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  defaultWidthFt: number;
  defaultHeightFt: number; // depth
  defaultHeightM: number;  // vertical height in ft
  basePrice: number;
  unit?: string;
  description?: string;
  imageUrl?: string;
}

export interface FurnitureCategory {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
  items?: FurnitureCatalogItem[];
}

export interface LayoutItemCustomizations {
  materialId?: string;
  materialName?: string;
  materialPricePerSqFt?: number;
  finishId?: string;
  finishName?: string;
  colorId?: string;
  colorHex?: string;
  colorName?: string;
  hardwareId?: string;
  hardwareName?: string;
  internalSetup?: string;
  softClose?: boolean;
}

export interface LayoutItem {
  id: string;
  furnitureItemId: string;
  name: string;
  category?: string;
  x: number;          // ft from left
  y: number;          // ft from top
  rotation: number;   // degrees
  widthFt: number;    // width in ft
  heightFt: number;   // depth in ft
  verticalHeightFt?: number; // 3D height
  customizations?: LayoutItemCustomizations;
}

export interface RoomLayoutState {
  roomId: string;
  projectId: string;
  roomName: string;
  roomType: string;
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  items: LayoutItem[];
}

export interface PricingSettings {
  profitMargin: number; // %
  discount: number;     // %
  contingency: number;  // %
  applyGst: boolean;
}

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

export interface Quotation {
  id: string;
  quoteNumber: string;
  projectId: string;
  project?: Project;
  clientId: string;
  client?: Client;
  createdById?: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'REVISED';
  validUntil: string;
  itemsTotal: number;
  materialCustomization: number;
  laborCharges: number;
  transport: number;
  otherCharges: number;
  subTotal: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  profitMargin: number;
  discount: number;
  contingency: number;
  applyGst: boolean;
  termsConditions: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    sortOrder: number;
  }>;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  projectId: string;
  project?: { name: string; client?: { name: string } };
  clientName?: string;
  projectName?: string;
  quotationId?: string;
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  amount?: number;
  totalAmount: number;
  orderDate: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  unitPrice: number;
  reorderLevel?: number;
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  isDone: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  projectName?: string;
  assignedToName?: string;
}
