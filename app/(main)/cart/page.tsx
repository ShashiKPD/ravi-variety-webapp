import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ShieldCheck } from "lucide-react"; 
import CartItemList from "@/app/(main)/components/cart/CartItemList"; // Checked import path
import PlaceOrderButton from "@/app/(main)/components/cart/PlaceOrderButton"; // Checked import path
import CartSynchronizer from "@/app/(main)/components/cart/CartSynchronizer"; // <--- NEW COMPONENT

export default async function CartPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Fetch Cart using the NEW RPC
  // This returns everything: variant labels, bulk pricing, totals
  const { data: cartItems, error } = await supabase
    .rpc("get_cart_details");

  if (error) console.error("Cart RPC Error:", error);

  const items = cartItems || [];
console.log(items)
  // Prepare simple state for Synchronizer comparison
  const serverCartState = items.map((i: any) => ({
    product_id: i.product_id,
    quantity: i.quantity,
    name: i.name,
    image_url: i.image_url,
    unit_price: i.unit_price,
    stock: i.stock_quantity
  }));

  // --- EMPTY STATE ---
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <CartSynchronizer serverItems={[]} /> 
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

  // 2. Calculate Order Totals
  const subtotal = items.reduce((sum: number, item: any) => sum + item.item_total, 0);
  const totalSavings = items.reduce((sum: number, item: any) => sum + item.total_savings, 0);

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32">
      
      <CartSynchronizer serverItems={serverCartState} />

      <h1 className="text-2xl font-bold mb-6 px-4 sm:px-0 text-gray-900 flex items-center gap-2">
        Shopping Cart <span className="text-gray-400 font-normal text-lg">({items.length})</span>
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        
        {/* --- Item List --- */}
        <div className="lg:col-span-8">
          <div className="bg-white sm:rounded-xl border-y sm:border border-gray-200 shadow-sm overflow-hidden">
            {/* Pass the RPC data directly */}
            <CartItemList items={items} />
          </div>
        </div>

        {/* --- Order Summary --- */}
        <div className="lg:col-span-4 px-4 sm:px-0">
          <Card className="sticky top-24 border-gray-200 bg-white shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg font-semibold text-gray-900">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal (MRP)</span>
                  <span>₹{(subtotal + totalSavings).toFixed(2)}</span>
                </div>
                
                {totalSavings > 0 && (
                  <div className="flex justify-between text-sm text-green-700 font-medium">
                    <span>Total Discount</span>
                    <span>- ₹{totalSavings.toFixed(2)}</span>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">Total Payable</span>
                  <span className="text-2xl font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-100">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
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