import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProductCard from "../components/product/ProductCard";
import { ProductSummary, ProductPrice } from "@/lib/types";

export default async function WishlistPage() {
  const supabase = await createClient();

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Get User Role (For pricing)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const userRole = profile?.role || "retailer";

  // 3. Get Wishlisted Variant IDs
  const { data: wishlistItems } = await supabase
    .from("wishlist_items")
    .select("product_id") // In DB schema, product_id FK points to products (variants)
    .eq("user_id", user.id);

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>
          <div className="p-12 text-center border rounded-lg bg-white border-dashed border-gray-300">
             <p className="text-gray-500">Your wishlist is empty.</p>
          </div>
        </div>
      </div>
    );
  }

  const variantIds = wishlistItems.map((item) => item.product_id);

  // 4. Fetch Products (Variants) + Group Info
  // We use !inner join to ensure we only get valid data
  const { data: productsData } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      image_urls,
      stock_quantity,
      options,
      product_groups (
        id,
        name
      )
    `)
    .in("id", variantIds);

  // 5. Fetch Prices (Bulk fetch for efficiency)
  const { data: pricesData } = await supabase
    .from("price_tiers")
    .select("product_id, unit_price, mrp, sale_price")
    .eq("role", userRole)
    .eq("min_quantity", 1) // Base price
    .in("product_id", variantIds);

  // 6. Map to ProductSummary
  const products: ProductSummary[] = (productsData || []).map((p: any) => {
    // Find matching price
    const priceObj = pricesData?.find(price => price.product_id === p.id);
    
    const priceData: ProductPrice | null = priceObj ? {
       unit_price: priceObj.unit_price,
       mrp: priceObj.mrp,
       sale_price: priceObj.sale_price
    } : null;

    // Determine variant name (use "Size" option if available, else Name)
    // Note: p.options is JSONB. Safely access it.
    const variantName = p.options?.size || p.name; 

    return {
      variant_id: p.id,
      variant_name: variantName, 
      product_id: p.product_groups?.id, 
      product_name: p.product_groups?.name || p.name, 
      product_slug: p.slug,
      thumbnail_url: p.image_urls?.[0] || null,
      stock_quantity: p.stock_quantity,
      price_data: priceData
    };
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.variant_id}
              product={product}
              showInteractiveButtons={true}
              isInitiallyWishlisted={true} // Items on this page are by definition wishlisted
            />
          ))}
        </div>
      </div>
    </div>
  );
}