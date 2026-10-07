// Shapes returned by the API. Money is sent as plain numbers (Rupiah), dates as ISO strings.
// The client keeps its own copy in client/src/types/api.ts, so change both when you change one.

export interface ProductDto {
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

export interface SaleSummaryDto {
  id: string;
  invoiceNumber: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface SaleItemDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleDetailDto {
  id: string;
  invoiceNumber: string;
  total: number;
  createdAt: string;
  items: SaleItemDto[];
}

export type StockMovementTypeDto = 'INITIAL' | 'SALE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';

export interface StockMovementDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: StockMovementTypeDto;
  quantity: number;
  beforeStock: number;
  afterStock: number;
  referenceType: string | null;
  referenceId: string | null;
  referenceLabel: string | null;
  note: string | null;
  createdAt: string;
}

export interface DashboardDto {
  totalProducts: number;
  totalUnits: number;
  todaySalesTotal: number;
  lowStockCount: number;
  lowStockThreshold: number;
  latestSales: SaleSummaryDto[];
  lowStockProducts: ProductDto[];
}
