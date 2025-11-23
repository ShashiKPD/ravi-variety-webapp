import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProductImageGallery from "../../../components/ProductImageGallery";
import ProductInfo from "../../../components/ProductInfo";
import { ProductPrice, PricingTier } from "@/lib/types";

// 1. Update Type: params is now a Promise
type PageProps = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

// Define the shape of the JSON returned by the RPC
type ProductPageData = {
  current_variant: {
    id: number;
    name: string;
    sku: string;
    description: string;
    stock_quantity: number;
    image_urls: string[] | null;
    options: any;
    slug: string;
  } | null; 
  product_details: {
    id: number;
    name: string;
    description: string;
    thumbnail_url: string | null;
  } | null;
  size_variants: {
    id: number;
    name: string;
    slug: string;
    options: any;
    stock_quantity: number;
  }[];
  other_types: {
    product_id: number;
    name: string;
    slug: string;
    thumbnail_url: string | null;
    default_variant_id: number;
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
      supabase.from("wishlist_items").select("id").eq("user_id", user.id).eq("variant_id", Number(id)).single(),
    ]);
    userRole = profileRes.data?.role || "anon";
    isWishlisted = !!wishlistRes.data;
  }

  // 2. Product Details
  const { data: productData, error } = await supabase
    .rpc("get_product_page_details", { p_product_id: Number(id) })
    .single();

  if (error || !productData) return notFound();

  const { current_variant, size_variants, other_types } = productData as ProductPageData;
  if (!current_variant) return notFound();

  // 3. Fetch Price & Tiers (If logged in)
  let priceData: ProductPrice | null = null;
  let pricingTiers: PricingTier[] = [];

  if (userRole !== "anon") {
    // Run these in parallel for speed
    const [priceRes, tiersRes] = await Promise.all([
       supabase.rpc("get_price_for_variant", {
         p_variant_id: Number(id),
         p_quantity: 1, 
         p_user_role: userRole
       }).single(),
       supabase.rpc("get_product_pricing_tiers", {
         p_product_id: Number(id),
         p_role: userRole
       })
    ]);

    priceData = priceRes.data as ProductPrice;
    pricingTiers = tiersRes.data as PricingTier[] || [];
  }

  const allImages = current_variant.image_urls || ["/placeholder.png"];

  return (
    <div className="bg-white min-h-screen pb-10">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-24 lg:h-fit">
             <ProductImageGallery images={allImages} title={current_variant.name} />
          </div>
          <div>
             <ProductInfo
                currentVariant={current_variant}
                sizeVariants={size_variants}
                otherTypes={other_types}
                priceData={priceData}
                pricingTiers={pricingTiers}
                isWishlisted={isWishlisted}
                userRole={userRole}
             />
          </div>
        </div>
      </div>
    </div>
  );
}