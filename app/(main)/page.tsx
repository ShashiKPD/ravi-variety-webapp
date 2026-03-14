import { createClient } from "@/utils/supabase/server";
import { createClient as createStaticClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import HeroCarousel from "./components/HeroCarousel";
import SuperCategoryRail from "./components/SuperCategoryRail";
import ProductRail from "./components/ProductRail";
import ProductInfiniteGrid from "./components/ProductInfiniteGrid";
import { redirect } from "next/navigation";

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

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Auth Check (For UI Logic Only)
  const { data: { user } } = await supabase.auth.getUser();
  let wishlistVariantIds = new Set<number>();
  const isLoggedIn = !!user; // Pass this to child components

  if (user) {
    const [profileRes, wishlistRes] = await Promise.all([
      supabase.from("profiles").select("is_active").eq("id", user.id).single(),
      supabase.from("wishlist_items").select("product_id").eq("user_id", user.id),
    ]);

    if (profileRes.data && profileRes.data.is_active === false) {
      redirect("/auth/signout");
    }

    if (wishlistRes.data) {
      wishlistVariantIds = new Set(wishlistRes.data.map((item) => item.product_id));
    }
  }

  const [
    featuredRes, 
    supercategories, 
    banners, 
    recommendedRes, 
    newArrivalsRes, 
    allProductsRes
  ] = await Promise.all([
    supabase.rpc("get_homepage_featured", { p_limit: 8 }), // No Role param
    getCachedSupercategories(), 
    getCachedBanners(), 
    // No ID/Role params. Returns empty array if auth.uid() is null internally.
    supabase.rpc("get_recommended_products", { p_limit: 10 }), 
    supabase.rpc("get_new_arrivals", { p_limit: 10 }), // No Role param
    supabase.rpc("get_all_products", { p_limit: 10, p_offset: 0 }) // No Role param
  ]);

  const featuredProducts = featuredRes.data || [];
  const recommendedProducts = recommendedRes.data || [];
  const newArrivals = newArrivalsRes.data || [];
  const allProductsInitial = allProductsRes.data || [];

  return (
    <div className="bg-gray-50/30 min-h-screen pb-12 md:w-[80%] mx-auto">
      
      <SuperCategoryRail data={supercategories} />

      {banners.length > 0 && (
           <HeroCarousel banners={banners} />
      )}

      {featuredProducts.length > 0 && (
        <ProductRail 
          title="Featured Products" 
          products={featuredProducts} 
          viewAllLink="/search?filter=featured"
          wishlistIds={wishlistVariantIds}
          isLoggedIn={isLoggedIn}
        />
      )}

      {recommendedProducts.length > 0 && (
        <div className="mt-2">
          <ProductRail 
            title="Recommended For You" 
            products={recommendedProducts} 
            wishlistIds={wishlistVariantIds}
            isLoggedIn={isLoggedIn}
          />
        </div>
      )}

      {newArrivals.length > 0 && (
        <div className="mt-2">
          <ProductRail 
            title="New Arrivals" 
            products={newArrivals} 
            viewAllLink="/search?sort=newest" 
            wishlistIds={wishlistVariantIds}
            isLoggedIn={isLoggedIn}
          />
        </div>
      )}

      <ProductInfiniteGrid 
        title="Browse All"
        initialProducts={allProductsInitial}
        wishlistIds={wishlistVariantIds}
        isLoggedIn={isLoggedIn}
      />

    </div>
  );
}