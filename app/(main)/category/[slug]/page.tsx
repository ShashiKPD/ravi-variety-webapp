import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProductGrid from "@/app/(main)/components/ProductGrid";
import SuperCategorySidebar from "@/app/(main)/components/SuperCategorySidebar";
import { ProductData } from "@/lib/types";
import { SlidersHorizontal } from "lucide-react";

export default async function CategoryPage({ params, searchParams }: any) {
  const supabase = await createClient();
  const { slug } = await params;
  const urlParams = await searchParams;

  const { data: supercat } = await supabase
    .from("supercategories")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (!supercat) return notFound();

  // Fetch Taxonomy
  const { data: taxonomy } = await supabase.rpc("get_supercategory_taxonomy", { 
    p_supercategory_id: supercat.id 
  });

  const { data: { user } } = await supabase.auth.getUser();
  let userRole = "anon";
  let wishlistVariantIds = new Set<number>();
  
  if (user) {
    const [pRes, wRes] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase.from("wishlist_items").select("product_id").eq("user_id", user.id)
    ]);
    userRole = pRes.data?.role || "anon";
    if (wRes.data) wishlistVariantIds = new Set(wRes.data.map((i: any) => i.product_id));
  }

  const page = Number(urlParams.page) || 1;
  const limit = 20;

  const categorySlugs = urlParams.categories ? urlParams.categories.split(",") : null;
  const activeCategorySlug = urlParams.category || null;
  const finalCategorySlugs = activeCategorySlug ? [activeCategorySlug] : categorySlugs;

  // FIX: Parse brands as strings (slugs), not numbers
  const brandSlugs = urlParams.brands ? urlParams.brands.split(",") : null;

  const { data: rawProducts, error } = await supabase.rpc("search_products", {
    p_search_text: urlParams.q || null,
    p_supercategory_slug: supercat.slug,
    p_category_slugs: finalCategorySlugs,
    
    // FIX: Use p_brand_slugs instead of p_brand_ids
    p_brand_slugs: brandSlugs, 
    
    p_min_price: urlParams.min_price ? Number(urlParams.min_price) : null,
    p_max_price: urlParams.max_price ? Number(urlParams.max_price) : null,
    p_in_stock: urlParams.stock === 'true' ? true : null,
    p_sort_by: urlParams.sort || "newest",
    p_page: page,
    p_limit: limit
  });

  if (error) console.error("Search RPC Error:", error);

  const totalCount = rawProducts?.[0]?.total_count || 0;

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
    savings_percentage: p.savings_percentage
  }));

  const isLoggedIn = ["retailer", "wholesaler", "admin"].includes(userRole);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm px-4 py-3">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 capitalize">{supercat.name}</h1>
            <p className="text-xs text-gray-500 mt-1">
              {Number(totalCount)} items found
              {activeCategorySlug && <span className="text-gray-400"> in {activeCategorySlug}</span>}
            </p>
          </div>
          <div className="flex gap-2 md:hidden">
            <button className="flex items-center gap-1 px-3 py-1.5 border rounded-full text-xs font-medium bg-gray-50">
                <SlidersHorizontal className="w-3 h-3" /> Filter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full flex-1 flex items-start">
        <aside className="w-[20%] shrink-0 border-r border-gray-200 min-h-[calc(100vh-110px)] bg-white sticky top-[110px] self-start overflow-y-auto max-h-[calc(100vh-110px)] scrollbar-hide">
             <SuperCategorySidebar 
               taxonomy={taxonomy || []} 
               activeCategorySlug={activeCategorySlug} 
               supercategorySlug={supercat.slug} 
             />
        </aside>

        <div className="flex-1 w-[80%] min-w-0 p-2 sm:p-4 md:p-6 bg-white">
          <ProductGrid 
            products={products}
            totalCount={Number(totalCount)}
            currentPage={page}
            limit={limit}
            isLoggedIn={isLoggedIn}
            wishlistVariantIds={wishlistVariantIds}
            currentParams={urlParams}
            clearFiltersHref={`/category/${slug}`}
          />
        </div>
      </div>
    </div>
  );
}