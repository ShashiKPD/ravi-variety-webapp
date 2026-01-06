import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProductImageGallery from "@/app/(main)/components/ProductImageGallery"; 
import ProductInfo from "@/app/(main)/components/ProductInfo"; 
import MobileProductHeader from "@/app/(main)/components/product/MobileProductHeader"; 
import ProductSection from "@/app/(main)/components/product/ProductSection"; 
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/utils/supabase/get-user-profile";

type PageProps = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};


export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. User Context
  // const { data: { user } } = await supabase.auth.getUser();
  const { user, role: userRole } = await getCurrentUser();
  
  // let userRole = "anon";
  let isWishlisted = false;

  if (user) {
    const [wishlistRes] = await Promise.all([
      // supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase.from("wishlist_items").select("id").eq("user_id", user.id).eq("product_id", Number(id)).single(),
    ]);
    // userRole = profileRes.data?.role || "anon";
    isWishlisted = !!wishlistRes.data;
    console.log("user profile, wishlist fetched");
  }

  // 2. Fetch Main Product Details (Needed first for slugs)
  const { data: rawData, error } = await supabase
    .rpc("get_product_page_details", { p_product_id: Number(id) })
    .single();

  const productData = rawData as any;

  if (error || !productData || !productData.current_variant) return notFound();

  const { current_variant, size_variants, cousin_products } = productData;

  // 3. Parallel Fetch: Pricing, Tiers, and Related Sections
  const [priceRes, tiersRes, categoryRes, brandRes] = await Promise.all([
    // A. Specific Price for Current Item
    supabase.rpc("get_effective_price", { 
      p_product_id: Number(id), 
      p_user_role: userRole, 
      p_qty: 1 
    }).single(),
    
    // B. Bulk Tiers
    supabase.from("price_tiers")
      .select("min_quantity, unit_price")
      .eq("product_id", id)
      .eq("role", userRole === 'admin' ? 'retailer' : userRole)
      .order("min_quantity"),
    
    // C. "Top in Category" -> Use Search RPC
    supabase.rpc("search_products", {
      p_category_slugs: [current_variant.category_slug],
      p_sort_by: 'newest', // or 'price_desc'
      p_limit: 10,
      p_page: 1
    }),

    // D. "More from Brand" (Replaces People Also Bought) -> Use Search RPC
    supabase.rpc("search_products", {
      p_brand_slugs: [current_variant.brand_slug],
      p_sort_by: 'newest', 
      p_limit: 10,
      p_page: 1
    })
  ]);

  const priceData = priceRes.data || null;
  const pricingTiers = tiersRes.data || [];
  
  // Filter out the current product from results client-side (RPC doesn't have exclude param)
  const categoryProducts = (categoryRes.data || [])
    .filter((p: any) => p.id !== Number(id))
    .map((p: any) => ({
      ...p,
      price: p.final_price, // Map RPC 'final_price' to Component 'price'
      brand_name: current_variant.brand_name // Search RPC might not return brand name depending on version, fallback
    }));

  const brandProducts = (brandRes.data || [])
    .filter((p: any) => p.id !== Number(id))
    .map((p: any) => ({
      ...p,
      price: p.final_price,
      brand_name: current_variant.brand_name
    }));

  return (
    <div className="bg-white sm:bg-gray-50 min-h-screen pb-0 sm:pb-20">
      
      <MobileProductHeader title={current_variant.name} />

      <div className="bg-white border-b px-4 py-2 sm:py-3 mb-0 sm:mb-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center text-[10px] sm:text-xs text-gray-500 gap-1 overflow-x-auto scrollbar-hide">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/search?brands=${current_variant.brand_slug}`} className="hover:text-blue-600 whitespace-nowrap">{current_variant.brand_name}</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/category/${current_variant.category_slug}`} className="hover:text-blue-600 whitespace-nowrap">{current_variant.category_name}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-[200px]">{current_variant.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pb-20 sm:space-y-4 lg:space-y-8">
        <div className="bg-white sm:rounded-2xl sm:shadow-sm sm:border border-gray-100 ">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:divide-x divide-gray-100">
            <div className="md:col-span-6 lg:col-span-5 p-0 sm:p-6 lg:p-8">
              <div className="md:sticky md:top-24">
                <ProductImageGallery images={current_variant.image_urls || []} title={current_variant.name} />
              </div>
            </div>
            <div className="md:col-span-6 lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col h-full">
              <ProductInfo
                currentVariant={current_variant}
                sizeVariants={size_variants}
                cousinProducts={cousin_products}
                priceData={priceData}
                pricingTiers={pricingTiers}
                isWishlisted={isWishlisted}
                userRole={userRole}
              />
            </div>
          </div>
        </div>

        {/* SECTION 1: MORE FROM BRAND */}
        {brandProducts.length > 0 && (
          <div className="bg-white sm:rounded-2xl sm:shadow-sm sm:border border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto">
               <ProductSection 
                 title={`More from ${current_variant.brand_name}`} 
                 products={brandProducts} 
                 viewAllLink={`/search?brands=${current_variant.brand_slug}`} 
               />
            </div>
          </div>
        )}

        {/* SECTION 2: TOP IN CATEGORY */}
        {categoryProducts.length > 0 && (
          <div className="bg-white sm:rounded-2xl sm:shadow-sm sm:border border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto">
               <ProductSection 
                 title={`Popular in ${current_variant.category_name}`} 
                 products={categoryProducts} 
                 viewAllLink={`/category/${current_variant.category_slug}`} 
               />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}