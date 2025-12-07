import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CartItemList from "../components/CartItemList";
import PlaceOrderButton from "../components/PlaceOrderButton";

export default async function CartPage() {
  const supabase = await createClient();

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Get User Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();
  
  if (profile && profile.is_active === false) {
    redirect("/auth/signout");
  }

  const userRole = profile?.role || "retailer";

  // 3. Get Cart Items
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("id, product_id, quantity")
    .eq("user_id", user.id);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">My Cart</h1>
        <p className="text-gray-500 mb-6 text-sm">Your cart is empty.</p>
        <Button asChild variant="outline">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const productIds = cartItems.map((item) => item.product_id);

  // 4. Fetch Products (Variants) with Unit ID
  const { data: products } = await supabase
    .from("products")
    .select(`
      id, name, slug, sku, image_urls, stock_quantity, options,
      product_groups ( name ),
      unit_id, units(short_name)
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

    const applicableTier = tiers
      .sort((a, b) => b.min_quantity - a.min_quantity)
      .find((t) => item.quantity >= t.min_quantity);

    const unitPrice = applicableTier ? applicableTier.unit_price : 0;
    const mrp = applicableTier ? applicableTier.mrp : 0;
    const itemTotal = unitPrice * item.quantity;
    
    subtotal += itemTotal;

    const groups = product?.product_groups as any; 
    const groupName = Array.isArray(groups) ? groups[0]?.name : groups?.name;
    const productName = groupName || product?.name || "Unknown Item";
    const variantName = product?.options ? (product.options as any).size : null;
    // @ts-ignore
    const unitName = product?.units?.short_name || "Pcs";

    return {
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      productName, 
      variantName,
      slug: product?.slug || "",
      sku: product?.sku || "N/A", 
      image_url: product?.image_urls?.[0] || null,
      unitPrice,
      mrp,
      stock: product?.stock_quantity || 0,
      itemTotal,
      unitName
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24">
      <h1 className="text-2xl font-bold mb-4 px-4 sm:px-0 text-gray-900">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* --- Item List --- */}
        <div className="lg:col-span-8">
          <Card className="border-x-0 sm:border-x border-t border-b-0 sm:border-b shadow-sm bg-white rounded-none sm:rounded-lg overflow-hidden">
            <CardContent className="p-0">
              <CartItemList items={detailedCart} />
            </CardContent>
          </Card>
        </div>

        {/* --- Order Summary --- */}
        <div className="lg:col-span-4 px-4 sm:px-0">
          <Card className="sticky top-24 border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (Calculated at checkout)</span>
                <span className="font-medium">--</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <PlaceOrderButton />
              
              <p className="text-[10px] text-center text-gray-400 mt-2 leading-tight">
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