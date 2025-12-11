import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProductImageGallery from "@/app/(main)/components/ProductImageGallery"; 
import ProductInfo from "@/app/(main)/components/ProductInfo"; 
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type PageProps = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

// Shape matches the JSON returned by 'get_product_page_details' v2
type ProductPageData = {
  current_variant: {
    id: number;
    name: string;
    sku: string;
    description: string;
    stock_quantity: number;
    image_urls: string[] | null;
    pack_size: number;
    brand_name: string;
    brand_slug: string;
    category_name: string;
    category_slug: string;
    unit_short_name: string;
  };
  size_variants: {
    id: number;
    slug: string;
    size: string; 
    pack_size: number;
    stock_quantity: number;
  }[];
  cousin_products: {
    product_id: number;
    name: string;
    slug: string;
    image_url: string | null;
    size_matched: boolean;
  }[];
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. User Context
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = "anon";
  let isWishlisted = false;

  if (user) {
    const [profileRes, wishlistRes] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase.from("wishlist_items").select("id").eq("user_id", user.id).eq("product_id", Number(id)).single(),
    ]);
    userRole = profileRes.data?.role || "anon";
    isWishlisted = !!wishlistRes.data;
  }

  // 2. Fetch Product Data
  const { data: rawData, error } = await supabase
    .rpc("get_product_page_details", { p_product_id: Number(id) })
    .single();

  const productData = rawData as ProductPageData;

  if (error || !productData || !productData.current_variant) return notFound();

  const { current_variant, size_variants, cousin_products } = productData;

  // 3. Fetch Pricing
  const priceRes = await supabase.rpc("get_effective_price", {
    p_product_id: Number(id),
    p_user_role: userRole,
    p_qty: 1 
  }).single();

  const tiersRes = await supabase
    .from("price_tiers")
    .select("min_quantity, unit_price")
    .eq("product_id", id)
    .eq("role", userRole === 'admin' ? 'retailer' : userRole)
    .order("min_quantity");

  const priceData = priceRes.data || null;
  const pricingTiers = tiersRes.data || [];

  return (
    <div className="bg-white sm:bg-gray-50 min-h-screen pb-0 sm:pb-20">
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b px-4 py-3 mb-0 sm:mb-6">
        <div className="max-w-7xl mx-auto flex items-center text-xs text-gray-500 gap-1 overflow-x-auto scrollbar-hide">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/search?brands=${current_variant.brand_slug}`} className="hover:text-blue-600 whitespace-nowrap">
            {current_variant.brand_name}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/category/${current_variant.category_slug}`} className="hover:text-blue-600 whitespace-nowrap">
            {current_variant.category_name}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{current_variant.name}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        
        {/* Product Card / Layout Wrapper */}
        <div className="bg-white sm:rounded-2xl sm:shadow-sm sm:border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x divide-gray-100">
            
            {/* Left: Gallery */}
            <div className="lg:col-span-5 p-4 sm:p-6 lg:p-8">
              <div className="sticky top-24">
                <ProductImageGallery 
                  images={current_variant.image_urls || []} 
                  title={current_variant.name} 
                />
              </div>
            </div>

            {/* Right: Info */}
            <div className="lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col h-full">
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
      </div>
    </div>
  );
}