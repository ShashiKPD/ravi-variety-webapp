import { createClient } from "@/utils/supabase/server";
import SearchFilters from "@/app/(main)/components/search/SearchFilters";
import ProductGrid from "@/app/(main)/components/ProductGrid";
import { ProductData } from "@/lib/types";

type SearchPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

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
      wishlistVariantIds = new Set(wishlistRes.data.map((i: any) => i.product_id));
    }
  }

  const query = typeof params.q === "string" ? params.q : "";
  const page = Number(params.page) || 1;
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const limit = 20;

  const brandSlugs = typeof params.brands === "string" ? params.brands.split(",") : null;
  const categorySlugs = typeof params.categories === "string" ? params.categories.split(",") : null;
  
  const sizeFilters = typeof params.sizes === "string" ? params.sizes.split(",") : null;
  const minPrice = params.min_price ? Number(params.min_price) : null;
  const maxPrice = params.max_price ? Number(params.max_price) : null;
  const inStock = params.stock === 'true';
  const isFeatured = params.filter === 'featured';

  const [searchResults, categoriesRes, brandsRes, sizesRes] = await Promise.all([
    supabase.rpc("search_products", {
      p_search_text: query || null,
      p_supercategory_slug: null,
      p_category_slugs: categorySlugs,
      p_brand_slugs: brandSlugs,
      p_sizes: sizeFilters,
      p_min_price: minPrice,
      p_max_price: maxPrice,
      p_in_stock: inStock ? true : null,
      p_is_featured: isFeatured ? true : null,
      p_sort_by: sort,
      p_page: page,
      p_limit: limit
    }),
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("brands").select("id, name, slug").order("name"),
    supabase.rpc("get_distinct_product_sizes")
  ]);

  const rawProducts = searchResults.data || [];
  const totalCount = rawProducts[0]?.total_count || 0;
  const availableSizes = sizesRes.data?.map((s: any) => s.size) || [];

  const products: ProductData[] = rawProducts.map((p: any) => ({
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

  let pageTitle = "All Products";
  if (isFeatured) {
    pageTitle = "Featured Products";
  } else if (query) {
    pageTitle = `Results for "${query}"`;
  } else if (brandSlugs && brandSlugs.length === 1) {
    const brandName = brandsRes.data?.find((b) => b.slug === brandSlugs[0])?.name;
    if (brandName) pageTitle = brandName;
  } else if (categorySlugs && categorySlugs.length === 1) {
    const catName = categoriesRes.data?.find((c) => c.slug === categorySlugs[0])?.name;
    if (catName) pageTitle = catName;
  }

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="mb-4 border-b border-gray-100 pb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Showing {products.length} of {Number(totalCount)} items
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
        <aside className="w-full md:w-[260px] lg:w-[260px] shrink-0">
          <SearchFilters 
            categories={categoriesRes.data || []} 
            brands={brandsRes.data || []} 
            sizes={availableSizes} 
          />
        </aside>

        <div className="flex-1 min-w-0">
          <ProductGrid 
            products={products}
            totalCount={Number(totalCount)}
            currentPage={page}
            limit={limit}
            isLoggedIn={isLoggedIn}
            wishlistVariantIds={wishlistVariantIds}
            currentParams={params} // Pass raw params object
            clearFiltersHref="/search"
            supercategorySlug={null} // Important for search page
          />
        </div>
      </div>
    </div>
  );
}