import { createClient } from "@/utils/supabase/server";
import ProductCard from "./components/ProductCard";
import { ProductSummary, ProductPrice } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Leaf, IceCream, Home } from "lucide-react";

// Helper to fetch prices for a list of products
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

  // --- 1. User Context ---
  const { data: { user } } = await supabase.auth.getUser();
  let wishlistVariantIds = new Set<number>();
  let userRole = "anon";
  let showInteractiveButtons = false;

  if (user) {
    const [profileRes, wishlistRes] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase.from("wishlist_items").select("variant_id").eq("user_id", user.id),
    ]);

    userRole = profileRes.data?.role || "anon";
    if (wishlistRes.data) {
      wishlistVariantIds = new Set(wishlistRes.data.map((item) => item.variant_id));
    }
    showInteractiveButtons = ["retailer", "wholesaler", "admin"].includes(userRole);
  }

  // --- 2. Data Fetching (Parallel) ---
  // RESTORED: Fetching categories along with products
  const [featuredRes, popularRes, categoriesRes] = await Promise.all([
    supabase.rpc("get_homepage_featured").limit(8),
    supabase.rpc("get_popular_products", { limit_count: 12 }),
    supabase.from("categories").select("id, name, slug"), // Fetch categories
  ]);

  if (featuredRes.error) console.error("Featured Error:", featuredRes.error);
  if (popularRes.error) console.error("Popular Error:", popularRes.error);

  // --- 3. Process Data ---
  const featuredProducts = await fetchPricesForProducts((featuredRes.data as ProductSummary[]) || [], supabase, userRole);
  const popularProducts = await fetchPricesForProducts((popularRes.data as ProductSummary[]) || [], supabase, userRole);
  const categories = categoriesRes.data || [];

  // Icon mapping for categories (You can expand this map as needed)
  const categoryIcons = {
    Aachar: <Leaf className="h-6 w-6 text-green-600" />,
    Spices: <Leaf className="h-6 w-6 text-orange-600" />, 
    "Ice Cream": <IceCream className="h-6 w-6 text-pink-500" />,
    Default: <Home className="h-6 w-6 text-blue-500" />,
  };

  // --- 4. Mock Hero Banners ---
  const heroBanners = [
    { id: 1, content: "Bulk Savings on Spices", bgColor: "bg-orange-100" },
    { id: 2, content: "New Arrivals: Pickles", bgColor: "bg-green-100" },
  ];

  return (
    <div className="bg-gray-50 pb-8">
      
      {/* --- Category Scroller (Restored) --- */}
      {categories.length > 0 && (
        <div className="bg-white p-3 shadow-sm mb-2 sticky top-[73px] z-40 overflow-hidden border-b"> 
          {/* Added 'border-b' and adjusted sticky top to sit below the header (approx 73px) */}
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide px-2">
            {categories.map((category) => (
              <Link
                href={`/category/${category.id}`}
                key={category.id}
                className="flex flex-col items-center gap-1 w-20 shrink-0 group cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="h-12 w-12 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors border border-transparent group-hover:border-blue-200">
                  {categoryIcons[category.name as keyof typeof categoryIcons] ||
                    categoryIcons.Default}
                </div>
                <span className="text-xs text-center truncate w-full group-hover:text-blue-600 font-medium text-gray-700 leading-tight">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* --- Hero Carousel --- */}
      <div className="p-4 pt-2">
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {heroBanners.map((banner) => (
              <CarouselItem key={banner.id}>
                <Card className="border-0 shadow-sm overflow-hidden">
                  <CardContent className={`flex aspect-[2.5/1] items-center justify-center p-6 ${banner.bgColor}`}>
                    <span className="text-2xl sm:text-4xl font-bold text-gray-800">{banner.content}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 hidden sm:flex" />
          <CarouselNext className="right-2 hidden sm:flex" />
        </Carousel>
      </div>

      {/* --- Section 1: Featured Products --- */}
      <section className="p-4 pt-2">
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

      {/* --- Section 2: Recommended / Popular --- */}
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