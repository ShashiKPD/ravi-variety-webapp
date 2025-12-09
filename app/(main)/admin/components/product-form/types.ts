export type BulkTier = {
  minQuantity: number;
  unitPrice: number;
  role: 'retailer' | 'wholesaler';
};

export type ProductInput = {
  id: number;
  isExpanded: boolean;
  name: string;
  description: string;
  sku: string;
  stock: string;
  mrp: string;
  price_retailer: string; // Acts as Tier 1 (Qty 1)
  price_wholesaler: string; // Acts as Tier 1 (Qty 1)
  size_option: string;
  is_featured: boolean;
  unit_id: string;
  images: File[];
  previewUrls: string[];
  bulkTiers: BulkTier[]; // <--- NEW FIELD
};

export type ExistingGroup = {
  id: number;
  name: string;
  brandName: string;
  skus: string;
};