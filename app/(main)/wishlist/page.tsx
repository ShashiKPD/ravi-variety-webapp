import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
// Correct Import Path
import ProductCard from "@/app/(main)/components/product/ProductCard";
import { ProductData } from "@/lib/types";
import BackButton from "../components/BackButton";

export default async function WishlistPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/wishlist");
  }

  const { data: items, error } = await supabase.rpc("get_wishlist_details");

  if (error) {
    console.error("Wishlist RPC Error:", error);
  }

  // 3. Transform to ProductData interface
  const products: ProductData[] = (items || []).map((item: any) => ({
    id: item.variant_id, // <--- Maps correctly now
    name: item.name,
    slug: item.slug,
    image_url: item.image_url,
    in_stock: item.in_stock,
    pack_size: item.pack_size,
    unit_name: item.unit_name,
    variant_name: item.variant_name,
    final_price: item.final_price,
    original_price: item.original_price,
    mrp: item.mrp,
    price_source: item.price_source,
    discount_label: item.discount_label,
    savings_percentage: item.savings_percentage
  }));

  if (!products || products.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center bg-white">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
          <Heart className="w-8 h-8 text-gray-300 fill-gray-50" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Your wishlist is empty</h1>
        <p className="text-gray-500 mb-6 text-sm max-w-xs mx-auto">
          Save items you want to buy later by clicking the heart icon.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
          <Link href="/">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
        
        <nav className="flex justify-between items-start sticky top-0 bg-white p-4 z-200 border-b border-gray-200 shadow-sm">
          <div className="flex items-center">
            <BackButton href="/account" label="" className="active:bg-gray-300" />
            <div className="flex flex-col items-baseline">
              <h1 className="text-lg leading-4 font-bold text-gray-900">
                Wishlist 
              </h1>
              <span className="text-gray-400 font-normal text-xs">{products.length} items</span>
            </div>
          </div>
          <Link href="/cart" className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full">
            <ShoppingCart className="w-5 h-5 text-gray-600 fill-gray-50" />
          </Link>
        </nav>
        
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {products.map((product) => (
            <div key={product.id} className="h-full">
              <ProductCard
                product={product}
                isLoggedIn={true}
                isWishlisted={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}