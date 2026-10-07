// Shapes returned by the API. Keep in sync with server/src/types/dto.ts.

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  sku: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
}

export type ProductUpdateInput = Partial<Omit<ProductInput, 'stock'>>;

export interface SaleSummary {
  id: string;
  invoiceNumber: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleDetail {
  id: string;
  invoiceNumber: string;
  total: number;
  createdAt: string;
  items: SaleItem[];
}

export interface SaleRequestItem {
  productId: string;
  quantity: number;
}

export type StockMovementType = 'INITIAL' | 'SALE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: StockMovementType;
  quantity: number;
  beforeStock: number;
  afterStock: number;
  referenceType: string | null;
  referenceId: string | null;
  referenceLabel: string | null;
  note: string | null;
  createdAt: string;
}

export interface StockAdjustmentInput {
  productId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  note?: string;
}

export interface Dashboard {
  totalProducts: number;
  totalUnits: number;
  todaySalesTotal: number;
  lowStockCount: number;
  lowStockThreshold: number;
  latestSales: SaleSummary[];
  lowStockProducts: Product[];
}
