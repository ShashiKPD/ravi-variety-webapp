"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { placeOrder } from "@/app/(main)/cart/actions";
import { toast } from "sonner";

export default function PlaceOrderButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePlaceOrder = async () => {
    // Optional: Add a confirmation dialog if you want
    // if (!confirm("Confirm order placement?")) return;

    setLoading(true);

    try {
      const res = await placeOrder();

      if (res.error) {
        toast.error(res.error);
        setLoading(false);
      } else if (res.success && res.orderId) {
        toast.success("Order placed successfully!");
        // Navigate to the Order Receipt page
        // Using orderId returned from your RPC
        router.push(`/orders/${res.orderId}`);
      }
    } catch (err) {
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