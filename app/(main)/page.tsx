import { createClient } from "@/utils/supabase/server";
import ProductCard from "./components/ProductCard";
import CategoryScroller from "./components/CategoryScroller";
import { ProductSummary, ProductPrice } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

// Helper to fetch prices
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
  let showInteractiveButtons = false;

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
    showInteractiveButtons = ["retailer", "wholesaler", "admin"].includes(userRole);
  }

  const [featuredRes, popularRes, categoriesRes, bannersRes] = await Promise.all([
    supabase.rpc("get_homepage_featured").limit(8),
    supabase.rpc("get_popular_products", { limit_count: 12 }),
    supabase.from("categories").select("id, name, slug, image_url"),
    supabase.from("banners").select("*").order("created_at", { ascending: false })
  ]);

  if (featuredRes.error) console.error("Featured Error:", featuredRes.error);
  if (popularRes.error) console.error("Popular Error:", popularRes.error);

  const featuredProducts = await fetchPricesForProducts((featuredRes.data as ProductSummary[]) || [], supabase, userRole);
  const popularProducts = await fetchPricesForProducts((popularRes.data as ProductSummary[]) || [], supabase, userRole);
  const categories = categoriesRes.data || [];
  const banners = bannersRes.data || [];

  return (
    <div className="bg-gray-50 pb-8">
      
      {/* Category Scroller */}
      <CategoryScroller categories={categories} />

      {/* Hero Carousel (Full Width) */}
      {user && banners.length > 0 && (
        // CHANGED: Removed padding div. Added w-full.
        <div className="w-full group relative"> 
          <Carousel className="w-full" opts={{ loop: true }}>
            {/* CHANGED: -ml-0 removes the default left gap from shadcn carousel */}
            <CarouselContent className="-ml-0">
              {banners.map((banner) => (
                // CHANGED: pl-0 removes padding between slides so they touch
                <CarouselItem key={banner.id} className="pl-0">
                  <Card className="border-0 shadow-none rounded-none overflow-hidden p-0">
                     {/* CHANGED: Taller aspect ratios to prevent cropping */}
                     <div className="relative aspect-[16/9] md:aspect-[2.5/1] w-full">
                        <Image 
                          src={banner.image_url} 
                          alt={banner.title || "Offer"} 
                          fill 
                          className="object-cover"
                          sizes="100vw"
                          priority={true}
                        />
                     </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* CHANGED: Positioned arrows absolutely inside the banner area */}
            <CarouselPrevious className="left-4 hidden sm:flex bg-white/80 hover:bg-white border-none" />
            <CarouselNext className="right-4 hidden sm:flex bg-white/80 hover:bg-white border-none" />
          </Carousel>
        </div>
      )}

      {/* Featured Section */}
      {/* Added pt-6 to give breathing room after the massive banner */}
      <section className="p-4 pt-6">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold text-gray-800">Featured Products</h2>
           <Link href="/search?filter=featured" className="text-sm text-blue-600 hover:underline">See all</Link>
        </div>
        
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.variant_id}
                product={product}
                showInteractiveButtons={showInteractiveButtons}
                isInitiallyWishlisted={wishlistVariantIds.has(product.variant_id)}
              />
            ))}
          </div>
        ) : (
           <p className="text-gray-500 text-sm">No featured items available.</p>
        )}
      </section>

      {/* Popular Section */}
      <section className="p-4">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold text-gray-800">Popular & Recommended</h2>
        </div>
        
        {popularProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {popularProducts.map((product) => (
              <ProductCard
                key={product.variant_id}
                product={product}
                showInteractiveButtons={showInteractiveButtons}
                isInitiallyWishlisted={wishlistVariantIds.has(product.variant_id)}
              />
            ))}
          </div>
        ) : (
           <p className="text-gray-500 text-sm">No recommended items available.</p>
        )}
      </section>

    </div>
  );
}