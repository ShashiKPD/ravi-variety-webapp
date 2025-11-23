import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// 1. Import our new Client Component
import CartItemList from "../components/CartItemList";
import { ProductWithPrice } from "@/lib/types"; // Import our shared type

export default async function CartPage() {
  const supabase = await createClient();

  // --- 1. Get User ---
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // --- 2. Get Cart Items ---
  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("user_id", user.id);

  if (cartError) { /* ... error handling ... */ }

  // 3. Handle Empty Cart
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">My Cart</h1>
        <p className="text-gray-600">Your cart is empty.</p>
        <Button asChild className="mt-4">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  // --- 4. Get Product Details (RPC) ---
  const productIds = cartItems.map((item) => item.product_id);
  const { data: products, error: productsError } = await supabase
    .rpc("get_products_with_price")
    .in("id", productIds);

  if (productsError) { /* ... error handling ... */ }

  const typedProducts = products as ProductWithPrice[];

  // --- 5. Merge Data ---
  let subtotal = 0;
  const detailedCart = cartItems.map((item) => {
    const product = typedProducts?.find((p) => p.id === item.product_id);
    const price = product?.price ?? 0;
    const itemTotal = price * item.quantity;
    subtotal += itemTotal;
    
    return {
      product_id: item.product_id,
      quantity: item.quantity,
      name: product?.name || "Unknown Product",
      image_url: product?.image_url || null,
      price: price,
      itemTotal: itemTotal,
    };
  });

  // --- 6. Render the UI (now much cleaner) ---
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">My Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        
        {/* --- Column 1: Item List --- */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="px-4">
              {/* 7. We just render our new Client Component here */}
              <CartItemList items={detailedCart} />
            </CardContent>
          </Card>
        </div>

        {/* --- Column 2: Order Summary (Stays the same) --- */}
        <div className="lg:col-span-1">
          <Card className="top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <Button className="w-full" asChild>
                <Link href="/generate-quote">Generate Quote</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}