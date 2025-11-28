"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { submitOrder } from "../cart/actions";

export default function PlaceOrderButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePlaceOrder = async () => {
    if (!confirm("Confirm order placement? Stock will be reserved upon approval.")) return;
    
    setLoading(true);
    const result = await submitOrder();
    
    if (result.error) {
      alert(result.error);
      setLoading(false);
    } else if (result.success && result.orderId) {
      // Redirect to the new Order Success/Details page
      router.push(`/orders/${result.orderId}`);
    }
  };

  return (
    <Button 
      className="w-full h-11 text-base bg-green-600 hover:bg-green-700 text-white" 
      onClick={handlePlaceOrder}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Place Order
        </>
      )}
    </Button>
  );
}