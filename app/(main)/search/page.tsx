import { createClient } from "@/utils/supabase/server";
import SearchFilters from "../components/search/SearchFilters";
import { ProductSummary, ProductPrice } from "@/lib/types";
import ProductGrid from "../components/ProductGrid"; // Import new component

type SearchPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function fetchPricesForResults(products: any[], supabase: any, userRole: string) {
  if (!userRole || userRole === "anon" || products.length === 0) {
    return products.map(p => ({ ...p, price_data: null })) as ProductSummary[];
  }

  const promises = products.map(async (p) => {
    const { data } = await supabase.rpc("get_price_for_variant", {
      p_variant_id: p.variant_id,
      p_quantity: 1,
      p_user_role: userRole,
    }).single();
    
    return {
      variant_id: p.variant_id,
      variant_name: p.variant_name,
      product_id: p.product_id,
      product_name: p.product_name,
      product_slug: p.product_slug,
      thumbnail_url: p.thumbnail_url,
      stock_quantity: p.stock_quantity,
      price_data: data as ProductPrice | null
    } as ProductSummary;
  });

  return Promise.all(promises);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  // 1. Get User Role
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = "anon";
  let wishlistVariantIds = new Set<number>();

  if (user) {
    const [profileRes, wishlistRes] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase.from("wishlist_items").select("product_id").eq("user_id", user.id)
    ]);
    userRole = profileRes.data?.role || "anon";
    if (wishlistRes.data) {
      wishlistVariantIds = new Set(wishlistRes.data.map(i => i.product_id));
    }
  }

  // 2. Parse Params
  const query = typeof params.q === "string" ? params.q : "";
  const page = Number(params.page) || 1;
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const limit = 20;

  const brandIds = typeof params.brands === "string" ? params.brands.split(",").map(Number) : null;
  const categoryIds = typeof params.categories === "string" ? params.categories.split(",").map(Number) : null;
  const sizeFilters = typeof params.sizes === "string" ? params.sizes.split(",") : null;
  const minPrice = params.min_price ? Number(params.min_price) : null;
  const maxPrice = params.max_price ? Number(params.max_price) : null;

  // 3. Fetch Data
  const [searchResults, categoriesRes, brandsRes, sizesRes] = await Promise.all([
    supabase.rpc("search_products", {
      p_search_text: query || null,
      p_brand_ids: brandIds,
      p_category_ids: categoryIds,
      p_sizes: sizeFilters,
      p_min_price: minPrice,
      p_max_price: maxPrice,
      p_sort_by: sort,
      p_page: page,
      p_limit: limit
    }),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
    supabase.rpc("get_distinct_product_sizes")
  ]);

  const availableSizes = sizesRes.data?.map((s: { size: string }) => s.size) || [];
  const productsRaw = searchResults.data || [];
  const totalCount = productsRaw[0]?.total_count || 0;
  const totalPages = Math.ceil(Number(totalCount) / limit);

  // 4. Hydrate Prices
  const products = await fetchPricesForResults(productsRaw, supabase, userRole);
  const showInteractiveButtons = ["retailer", "wholesaler", "admin"].includes(userRole);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {query ? `Results for "${query}"` : "All Products"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Showing {products.length} of {Number(totalCount)} items
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-2">
        <SearchFilters 
          categories={categoriesRes.data || []} 
          brands={brandsRes.data || []} 
          sizes={availableSizes} 
        />

        <div className="flex-1">
          {/* REPLACED HUGE BLOCK WITH THIS: */}
          <ProductGrid 
            products={products}
            totalCount={Number(totalCount)}
            currentPage={page}
            limit={limit}
            showInteractiveButtons={showInteractiveButtons}
            wishlistVariantIds={wishlistVariantIds}
            currentParams={params}
            clearFiltersHref="/search"
          />
        </div>
      </div>
    </div>
  );
}