import { createClient } from "@/utils/supabase/server";
import HeroCarousel from "./components/HeroCarousel";
import SuperCategoryRail from "./components/SuperCategoryRail";
import ProductRail from "./components/ProductRail";
import { ProductSummary, ProductPrice } from "@/lib/types";
import { redirect } from "next/navigation";

// Helper to fetch prices (Unchanged)
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

  // UPDATED: Fetch Supercategories instead of Categories
  const [featuredRes, popularRes, superCatRes, bannersRes] = await Promise.all([
    supabase.rpc("get_homepage_featured").limit(8),
    supabase.rpc("get_popular_products", { limit_count: 12 }),
    supabase.from("supercategories").select("id, name, slug, image_url").order("name"),
    supabase.from("banners").select("*").order("created_at", { ascending: false })
  ]);

  const featuredProducts = await fetchPricesForProducts((featuredRes.data as ProductSummary[]) || [], supabase, userRole);
  const popularProducts = await fetchPricesForProducts((popularRes.data as ProductSummary[]) || [], supabase, userRole);
  const supercategories = superCatRes.data || [];
  const banners = bannersRes.data || [];

  return (
    <div className="bg-gray-100 min-h-screen pb-4">
      
      {/* 1. Supercategory Rail (Top Nav) */}
      <SuperCategoryRail data={supercategories} />

      {/* 2. Hero Carousel */}
      {/* Note: In Flipkart, carousel is usually BELOW the categories */}
      {user && banners.length > 0 && (
        <div className="mt-2">
          <HeroCarousel banners={banners} />
        </div>
      )}

      {/* 3. Featured Products Rail */}
      <div className="mt-2">
        <ProductRail 
          title="Featured Products" 
          products={featuredProducts} 
          viewAllLink="/search?filter=featured"
          userRole={userRole}
          wishlistIds={wishlistVariantIds}
        />
      </div>

      {/* 4. Popular Products Rail */}
      <div className="mt-2">
        <ProductRail 
          title="Best Sellers" 
          products={popularProducts} 
          viewAllLink="/search?sort=popularity"
          userRole={userRole}
          wishlistIds={wishlistVariantIds}
        />
      </div>

    </div>
  );
}