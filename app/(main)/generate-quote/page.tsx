import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProductWithPrice } from "@/lib/types";
import QuoteGenerator from "../components/QuoteGenerator";

export default async function GenerateQuotePage() {
  const supabase = await createClient();

  // --- 1. Get User and Profile (We need the name) ---
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // --- 2. Get Cart Items ---
  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("user_id", user.id);

  if (cartError || !cartItems || cartItems.length === 0) {
    // ... (Your existing empty cart error handling) ...
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty.</h1>
      </div>
    );
  }

  // --- 3. Get Product Details (via RPC) ---
  const productIds = cartItems.map((item) => item.product_id);
  const { data: products, error: productsError } = await supabase
    .rpc("get_products_with_price")
    .in("id", productIds);

  if (productsError) {
    return <p>Error loading product details: {productsError.message}</p>;
  }

  const typedProducts = products as ProductWithPrice[];

  // --- 4. Merge Data (Now with prices) ---
  let subtotal = 0;
  const quoteItems = cartItems.map((item) => {
    const product = typedProducts?.find((p) => p.id === item.product_id);
    const price = product?.price ?? 0;
    const itemTotal = price * item.quantity;
    subtotal += itemTotal; // Calculate subtotal

    return {
      product_id: item.product_id,
      quantity: item.quantity,
      name: product?.name || "Unknown Product",
      image_url: product?.image_url || null,
      price: price, // Pass the unit price
      itemTotal: itemTotal, // Pass the line total
    };
  });

  // --- 5. Render the Client Component with all new props ---
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <QuoteGenerator
        items={quoteItems}
        subtotal={subtotal}
        userName={profile?.full_name || "Valued Customer"}
      />
    </div>
  );
}