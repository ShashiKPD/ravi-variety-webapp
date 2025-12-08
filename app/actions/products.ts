"use server";

import { createClient } from "@/utils/supabase/server";
import { ProductSummary, ProductPrice } from "@/lib/types";

async function fetchPricesForProducts(products: ProductSummary[], supabase: any, userRole: string) {
  if (userRole === "anon" || products.length === 0) {
    return products.map(p => ({ ...p, price_data: null }));
  }

  const promises = products.map(async (p) => {
    const { data } = await supabase.rpc("get_price_for_variant", {
      p_variant_id: p.variant_id,
      p_quantity: 1,
      p_user_role: userRole,
    }).single();
    return { ...p, price_data: data as ProductPrice | null };
  });

  return Promise.all(promises);
}

export async function getMoreProducts(page: number, userRole: string = "anon") {
  const supabase = await createClient();
  const limit = 10;
  const offset = (page - 1) * limit;

  const { data: rawProducts, error } = await supabase
    .rpc("get_all_products", {
      p_offset: offset,
      p_limit: limit
    });

  if (error) {
    console.error(error);
    return [];
  }

  if (!rawProducts || rawProducts.length === 0) return [];

  const productsWithPrices = await fetchPricesForProducts(rawProducts as ProductSummary[], supabase, userRole);
  
  return productsWithPrices;
}