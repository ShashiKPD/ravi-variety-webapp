"use server";

import { createClient } from "@/utils/supabase/server";
import { ProductData } from "@/lib/types";

const PAGE_SIZE = 10;

// Updated: Removed 'userRole' parameter
export async function getMoreProducts(page: number): Promise<ProductData[]> {
  const supabase = await createClient();
  const offset = (page - 1) * PAGE_SIZE;

  // Updated: Removed 'p_user_role' from the arguments
  const { data, error } = await supabase.rpc("get_all_products", {
    p_offset: offset,
    p_limit: PAGE_SIZE
  });

  if (error) {
    console.error("Error fetching more products:", error);
    return [];
  }

  return (data as ProductData[]) || [];
}