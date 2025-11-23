import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProductCard from "../components/ProductCard";
import { ProductWithPrice } from "@/lib/types"; // 1. Import our shared type

export default async function WishlistPage() {
  const supabase = await createClient();

  // --- 1. Get User ---
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --- 2. Get Wishlisted Product IDs ---
  const { data: wishlistItems, error: wishlistError } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id);

  if (wishlistError) { /* ... error handling ... */ }
  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
        <p>Your wishlist is empty.</p>
      </div>
    );
  }

  const productIds = wishlistItems.map((item) => item.product_id);

  // --- 3. Fetch Products via RPC ---
  // No more 'role' or 'view' logic needed!
  const { data: products, error: productsError } = await supabase
    .rpc("get_products_with_price")
    .in("id", productIds);

  if (productsError) {
    return <p>Error loading products: {productsError.message}</p>;
  }

  // 4. Cast the RPC result
  const typedProducts = products as ProductWithPrice[];

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>

      {typedProducts && typedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {typedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showInteractiveButtons={true}
              isInitiallyWishlisted={true} // Everything on this page is wishlisted
            />
          ))}
        </div>
      ) : (
        <p>Your wishlist is empty or products could not be loaded.</p>
      )}
    </main>
  );
}