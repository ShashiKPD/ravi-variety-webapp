"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { placeOrder } from "@/app/(main)/cart/actions";
import { toast } from "sonner";
import { useCart } from "@/lib/context/CartContext"; // <--- Import Context

export default function PlaceOrderButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Destructure clearCart from your context
  // (Ensure you've added this function to your CartContext provider as shown below)
  const { clearCart } = useCart(); 

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      const res = await placeOrder();

      if (res.error) {
        toast.error(res.error);
        setLoading(false);
      } else if (res.success && res.orderId) {
        
        // 1. Clear Local State & Storage immediately
        clearCart();
        
        toast.success("Order placed successfully!");
        
        // 2. Navigate to Order Receipt
        router.push(`/orders/${res.orderId}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button 
      className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md"
      onClick={handlePlaceOrder}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Processing...
        </>
      ) : (
        <>
          Place Order Request <ArrowRight className="w-5 h-5 ml-2" />
        </>
      )}
    </Button>
  );
}