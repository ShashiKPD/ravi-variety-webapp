import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CartItemList from "../components/CartItemList";
import PlaceOrderButton from "../components/PlaceOrderButton"; // Import the new button

export default async function CartPage() {
  const supabase = await createClient();

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Get User Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const userRole = profile?.role || "retailer";

  // 3. Get Cart Items
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("id, product_id, quantity")
    .eq("user_id", user.id);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">My Cart</h1>
        <p className="text-gray-600 mb-6">Your cart is empty.</p>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const productIds = cartItems.map((item) => item.product_id);

  // 4. Fetch Products (Variants)
  // FIX: Added 'sku' to the select list
  const { data: products } = await supabase
    .from("products")
    .select(`
      id, name, slug, sku, image_urls, stock_quantity, options,
      product_groups ( name )
    `)
    .in("id", productIds);

  // 5. Fetch Pricing Tiers
  const { data: priceTiers } = await supabase
    .from("price_tiers")
    .select("product_id, min_quantity, unit_price, mrp")
    .eq("role", userRole)
    .in("product_id", productIds);

  // 6. Merge & Calculate Totals
  let subtotal = 0;

  const detailedCart = cartItems.map((item) => {
    const product = products?.find((p) => p.id === item.product_id);
    const tiers = priceTiers?.filter((t) => t.product_id === item.product_id) || [];

    // Pricing Logic
    const applicableTier = tiers
      .sort((a, b) => b.min_quantity - a.min_quantity)
      .find((t) => item.quantity >= t.min_quantity);

    const unitPrice = applicableTier ? applicableTier.unit_price : 0;
    const mrp = applicableTier ? applicableTier.mrp : 0;
    const itemTotal = unitPrice * item.quantity;
    
    subtotal += itemTotal;

    // --- FIX FOR TYPESCRIPT ERRORS ---
    
    // 1. Handle product_groups being an array or object
    // Supabase can return joined relations as arrays. We safely access the first item.
    const groups = product?.product_groups as any; 
    const groupName = Array.isArray(groups) ? groups[0]?.name : groups?.name;
    const productName = groupName || product?.name || "Unknown Item";

    const variantName = product?.options ? (product.options as any).size : null;

    return {
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      productName, 
      variantName,
      slug: product?.slug || "",
      // 2. sku is now fetched, so this works
      sku: product?.sku || "N/A", 
      image_url: product?.image_urls?.[0] || null,
      unitPrice,
      mrp,
      stock: product?.stock_quantity || 0,
      itemTotal
    };
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- Item List --- */}
        <div className="lg:col-span-8">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-0">
              <CartItemList items={detailedCart} />
            </CardContent>
          </Card>
        </div>

        {/* --- Order Summary --- */}
        <div className="lg:col-span-4">
          <Card className="sticky top-24 bg-gray-50/50 border-gray-200">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (Calculated at invoice)</span>
                <span className="font-medium">--</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Estimated Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              {/* REPLACED: Quote Button with Order Button */}
              <PlaceOrderButton />
              
              <p className="text-xs text-center text-gray-500 mt-2">
                By placing this order, you request approval from the supplier. 
                Payment and final invoice will be handled offline.
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}