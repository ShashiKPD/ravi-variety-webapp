export type ProductPrice = {
  unit_price: number;
  sale_price: number | null;
  mrp: number | null;
};

// This is the standard type for any product card (Vertical or Horizontal)
export type ProductSummary = {
  variant_id: number;
  variant_name: string;
  product_id: number;
  product_name: string;
  product_slug: string;
  thumbnail_url: string | null;
  stock_quantity: number;
  price_data?: ProductPrice | null; // Optional, populated if user is logged in
};
export interface PricingTier {
  min_quantity: number;
  unit_price: number;
  mrp: number; // Added this
}
export interface ProductData {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  
  // Inventory
  in_stock: boolean;
  
  // Variant Details
  pack_size: number;
  unit_name: string;
  variant_name: string | null; // <--- (e.g., "500g", "XL")

  // Pricing
  final_price: number;
  original_price: number;
  mrp: number;
  price_source: 'standard' | 'bulk' | 'sale'; 
  discount_label: string | null;
  savings_percentage: number;
}