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
  images: File[];
  previewUrls: string[];
};

export type ExistingGroup = {
  id: number;
  name: string;
  brandName: string;
  skus: string; // <-- Added this
};