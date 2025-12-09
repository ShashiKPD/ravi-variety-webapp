"use server";

import { createClient } from "@/utils/supabase/server";

export async function getProductByBarcode(barcode: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, slug, sku, stock_quantity, image_urls,
      price_tiers (unit_price, role, min_quantity),
      units (short_name)
    `)
    .eq("barcode", barcode)
    .single();

  if (error || !data) {
    return { error: "Product not found" };
  }

  const price = data.price_tiers?.find(
    (t: any) => t.role === 'retailer' && t.min_quantity === 1
  )?.unit_price || 0;

  // --- FIX START ---
  // Handle Supabase returning array or object for relations
  const unitData = Array.isArray(data.units) ? data.units[0] : data.units;
  const unitName = unitData?.short_name || "pc";
  // --- FIX END ---

  return {
    product: {
      id: data.id,
      name: data.name,
      image: data.image_urls?.[0] || null,
      price: price,
      stock: data.stock_quantity,
      unit: unitName // Use the safely extracted name
    }
  };
}