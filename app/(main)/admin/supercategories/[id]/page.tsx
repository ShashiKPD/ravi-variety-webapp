import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProductGrid from "@/app/(main)/components/ProductGrid";
import SearchFilters from "@/app/(main)/components/search/SearchFilters";
import { ProductSummary, ProductPrice } from "@/lib/types";

// ... (Copy helper fetchPricesForProducts from search/page.tsx) ...
async function fetchPricesForProducts(products: any[], supabase: any, userRole: string) {
    if (!userRole || userRole === "anon" || products.length === 0) return products.map(p => ({ ...p, price_data: null }));
    const promises = products.map(async (p) => {
        const { data } = await supabase.rpc("get_price_for_variant", { p_variant_id: p.variant_id, p_quantity: 1, p_user_role: userRole }).single();
        return { 
            variant_id: p.variant_id, variant_name: p.variant_name, product_id: p.product_id, 
            product_name: p.product_name, product_slug: p.product_slug, thumbnail_url: p.thumbnail_url, 
            stock_quantity: p.stock_quantity, price_data: data as ProductPrice | null 
        } as ProductSummary;
    });
    return Promise.all(promises);
}

export default async function SuperCategoryPage({ params, searchParams }: any) {
  const supabase = await createClient();
  const { id } = await params;
  const urlParams = await searchParams;

  // 1. Fetch Info
  const { data: supercat } = await supabase.from("supercategories").select("name").eq("id", id).single();
  if (!supercat) return notFound();

  // 2. User Role
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

  // 3. Filters
  const page = Number(urlParams.page) || 1;
  const sort = typeof urlParams.sort === "string" ? urlParams.sort : "newest";
  const brandIds = typeof urlParams.brands === "string" ? urlParams.brands.split(",").map(Number) : null;
  const categoryIds = typeof urlParams.categories === "string" ? urlParams.categories.split(",").map(Number) : null; // User can still filter by sub-category inside supercategory
  const sizeFilters = typeof urlParams.sizes === "string" ? urlParams.sizes.split(",") : null;
  const minPrice = urlParams.min_price ? Number(urlParams.min_price) : null;
  const maxPrice = urlParams.max_price ? Number(urlParams.max_price) : null;

  // 4. Fetch
  const [searchResults, categoriesRes, brandsRes, sizesRes] = await Promise.all([
    supabase.rpc("search_products", {
      p_search_text: null,
      p_supercategory_id: Number(id), // <--- THE KEY FILTER
      p_category_ids: categoryIds, // Optional sub-filters
      p_brand_ids: brandIds,
      p_sizes: sizeFilters,
      p_min_price: minPrice,
      p_max_price: maxPrice,
      p_sort_by: sort,
      p_page: page,
      p_limit: 20
    }),
    // Fetch only categories belonging to this supercategory for the filter sidebar? 
    // Or all? Ideally only relevant ones. 
    supabase.from("categories").select("id, name").eq("supercategory_id", id).order("name"), 
    supabase.from("brands").select("id, name").order("name"),
    supabase.rpc("get_distinct_product_sizes")
  ]);

  const availableSizes = sizesRes.data?.map((s: any) => s.size) || [];
  const productsRaw = searchResults.data || [];
  const totalCount = productsRaw[0]?.total_count || 0;
  
  const products = await fetchPricesForProducts(productsRaw, supabase, userRole);
  const showInteractiveButtons = ["retailer", "wholesaler", "admin"].includes(userRole);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{supercat.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Showing {products.length} of {Number(totalCount)} items</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-2">
        <SearchFilters 
          categories={categoriesRes.data || []} // Only shows sub-categories
          brands={brandsRes.data || []} 
          sizes={availableSizes} 
        />
        <div className="flex-1">
          <ProductGrid 
            products={products}
            totalCount={Number(totalCount)}
            currentPage={page}
            limit={20}
            showInteractiveButtons={showInteractiveButtons}
            wishlistVariantIds={wishlistVariantIds}
            currentParams={urlParams}
            clearFiltersHref={`/supercategory/${id}`}
          />
        </div>
      </div>
    </div>
  );
}