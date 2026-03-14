// app/actions/products.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { ProductData } from "@/lib/types";

export async function fetchProductsAction(
  urlParams: any,
  supercatSlug: string | null,
  page: number,
  limit: number = 20,
) {
  const supabase = await createClient();

  // Parse filters from the clean dictionary we pass from the client
  const categorySlugs = urlParams.categories
    ? urlParams.categories.split(",")
    : null;
  const activeCategorySlug = urlParams.category || null;
  const finalCategorySlugs = activeCategorySlug
    ? [activeCategorySlug]
    : categorySlugs;
  const brandSlugs = urlParams.brands ? urlParams.brands.split(",") : null;
  const sizeFilters = urlParams.sizes ? urlParams.sizes.split(",") : null;

  const { data: rawProducts, error } = await supabase.rpc("search_products", {
    p_search_text: urlParams.q || null,
    p_supercategory_slug: supercatSlug,
    p_category_slugs: finalCategorySlugs,
    p_brand_slugs: brandSlugs,
    p_sizes: sizeFilters,
    p_min_price: urlParams.min_price ? Number(urlParams.min_price) : null,
    p_max_price: urlParams.max_price ? Number(urlParams.max_price) : null,
    p_in_stock: urlParams.stock === "true" ? true : null,
    p_is_featured: urlParams.filter === "featured" ? true : null,
    p_sort_by: urlParams.sort || "newest",
    p_page: page,
    p_limit: limit,
  });

  if (error) {
    console.error("Search RPC Error:", error);
    return [];
  }

  const products: ProductData[] = (rawProducts || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image_url: p.image_url,
    in_stock: p.in_stock,
    pack_size: p.pack_size,
    unit_name: p.unit_name,
    variant_name: p.variant_name,
    final_price: p.final_price,
    original_price: p.original_price,
    mrp: p.mrp,
    price_source: p.price_source,
    discount_label: p.discount_label,
    savings_percentage: p.savings_percentage,
  }));

  return products;
}
