import { createClient } from "@/utils/supabase/server";
import { createClient as createStaticClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import HeroCarousel from "./components/HeroCarousel";
import SuperCategoryRail from "./components/SuperCategoryRail";
import ProductRail from "./components/ProductRail";
import ProductInfiniteGrid from "./components/ProductInfiniteGrid";
import { ProductSummary, ProductPrice } from "@/lib/types";
import { redirect } from "next/navigation";

// Static Client Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const getCachedBanners = unstable_cache(
  async () => {
    const supabase = createStaticClient(supabaseUrl, supabaseAnonKey);
    const { data } = await supabase.from("banners").select("*").order("created_at", { ascending: false });
    return data || [];
  },
  ["homepage-banners"],
  { revalidate: 3600 } 
);

const getCachedSupercategories = unstable_cache(
  async () => {
    const supabase = createStaticClient(supabaseUrl, supabaseAnonKey);
    const { data } = await supabase.from("supercategories").select("id, name, slug, image_url").order("name");
    return data || [];
  },
  ["homepage-supercategories"],
  { revalidate: 86400 }
);

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

export default async function HomePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  let wishlistVariantIds = new Set<number>();
  let userRole = "anon";

  if (user) {
    const [profileRes, wishlistRes] = await Promise.all([
      supabase.from("profiles").select("role, is_active").eq("id", user.id).single(),
      supabase.from("wishlist_items").select("product_id").eq("user_id", user.id),
    ]);

    if (profileRes.data && profileRes.data.is_active === false) {
      redirect("/auth/signout");
    }

    userRole = profileRes.data?.role || "anon";
    if (wishlistRes.data) {
      wishlistVariantIds = new Set(wishlistRes.data.map((item) => item.product_id));
    }
  }

  // UPDATED: Added 'newArrivalsRes' to the fetch list
  const [featuredRes, supercategories, banners, recommendedRes, newArrivalsRes, allProductsRes] = await Promise.all([
    supabase.rpc("get_homepage_featured").limit(8),
    getCachedSupercategories(), 
    getCachedBanners(),         
    user ? supabase.rpc("get_recommended_products", { p_user_id: user.id, p_limit: 10 }) : Promise.resolve({ data: [] }),
    supabase.rpc("get_new_arrivals", { p_limit: 10 }), // New Arrivals Call
    supabase.rpc("get_all_products", { p_offset: 0, p_limit: 10 })
  ]);

  const featuredProducts = await fetchPricesForProducts((featuredRes.data as ProductSummary[]) || [], supabase, userRole);
  const recommendedProducts = await fetchPricesForProducts((recommendedRes.data as ProductSummary[]) || [], supabase, userRole);
  const newArrivals = await fetchPricesForProducts((newArrivalsRes.data as ProductSummary[]) || [], supabase, userRole);
  const allProductsInitial = await fetchPricesForProducts((allProductsRes.data as ProductSummary[]) || [], supabase, userRole);
  
  return (
    <div className="bg-gray-100 min-h-screen pb-4">
      
      <SuperCategoryRail data={supercategories} />

      {user && banners.length > 0 && (
        <HeroCarousel banners={banners} />
      )}

      {/* Featured */}
      <div className="">
        <ProductRail 
          title="Featured Products" 
          products={featuredProducts} 
          viewAllLink="/search?filter=featured"
          userRole={userRole}
          wishlistIds={wishlistVariantIds}
        />
      </div>

      {/* Recommended */}
      {recommendedProducts.length > 0 && (
        <div className="mt-2">
          <ProductRail 
            title="Recommended For You" 
            products={recommendedProducts} 
            userRole={userRole}
            wishlistIds={wishlistVariantIds}
          />
        </div>
      )}

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <div className="mt-2">
          <ProductRail 
            title="New Arrivals" 
            products={newArrivals} 
            viewAllLink="/search?sort=newest" // Link to search page sorted by date
            userRole={userRole}
            wishlistIds={wishlistVariantIds}
          />
        </div>
      )}

      {/* All Products */}
      <div className="mt-2">
        <ProductInfiniteGrid 
          initialProducts={allProductsInitial}
          userRole={userRole}
          wishlistIds={wishlistVariantIds}
        />
      </div>

    </div>
  );
}