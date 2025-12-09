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
  price_retailer: string;
  price_wholesaler: string;
  size_option: string;
  is_featured: boolean;
  unit_id: string;
  pack_size: string; // Using string for easier form handling (parsed to int on submit)
  barcode: string;   // <--- NEW
  images: File[];
  previewUrls: string[];
  bulkTiers: BulkTier[];
};

export type ExistingGroup = {
  id: number;
  name: string;
  brandName: string;
  skus: string;
};