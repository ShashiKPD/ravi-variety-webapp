import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ArrowRight, ShieldCheck } from "lucide-react"; 
import CartItemList from "../components/CartItemList";
import PlaceOrderButton from "../components/PlaceOrderButton";

export default async function CartPage() {
  const supabase = await createClient();

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Get User Role & Status
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // --- EMPTY STATE ---
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Your cart is empty</h1>
        <p className="text-gray-500 mb-6 text-sm max-w-xs mx-auto">
          Start adding products to create your order request.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
          <Link href="/">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const productIds = cartItems.map((item) => item.product_id);

  // 4. Fetch Products
  const { data: products } = await supabase
    .from("products")
    .select(`
      id, name, slug, sku, image_urls, stock_quantity, options,
      product_groups ( name ),
      unit_id, units(short_name)
    `)
    .in("id", productIds);

  // 5. Fetch Pricing
  const { data: priceTiers } = await supabase
    .from("price_tiers")
    .select("product_id, min_quantity, unit_price, mrp")
    .eq("role", userRole)
    .in("product_id", productIds);

  // 6. Merge & Calculate
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
    <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32">
      <h1 className="text-2xl font-bold mb-6 px-4 sm:px-0 text-gray-900 flex items-center gap-2">
        Shopping Cart <span className="text-gray-400 font-normal text-lg">({cartItems.length})</span>
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        
        {/* --- Item List --- */}
        <div className="lg:col-span-8">
          <div className="bg-white sm:rounded-xl border-y sm:border border-gray-200 shadow-sm overflow-hidden">
            <CartItemList items={detailedCart} />
          </div>
        </div>

        {/* --- Order Summary --- */}
        <div className="lg:col-span-4 px-4 sm:px-0">
          <Card className="sticky top-24 border-gray-200 bg-white shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg font-semibold text-gray-900">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              
              <div className="flex justify-between items-baseline">
                <span className="text-base font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-100">
                <ShieldCheck className="w-4 h-4" />
                <span>Price inclusive of GST. No shipping fees.</span>
              </div>
              
              <Separator />
              
              <PlaceOrderButton />
              
              <p className="text-[11px] text-center text-gray-400 mt-2 leading-tight">
                Placing this order sends a request to the supplier for approval.
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}