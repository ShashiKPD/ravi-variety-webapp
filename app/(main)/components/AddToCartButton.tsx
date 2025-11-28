"use client";

import { useState } from "react";
import { addToCart } from "../cart/actions"; 
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
// import { useToast } from "@/components/ui/use-toast"; // If you have toast

export default function AddToCartButton({ 
  productId, 
  quantity = 1,
  className 
}: { 
  productId: number, 
  quantity?: number,
  className?: string
}) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCartClick = async () => {
    // 1. Instant Feedback State
    setIsPending(true);
    
    // 2. Perform Action
    const result = await addToCart(productId, quantity);
    
    setIsPending(false);

    if (result.error) {
      alert(result.error); // Or use toast({ variant: "destructive" ... })
    } else {
      // 3. Success Feedback
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    }
  };

  return (
    <Button
      onClick={handleCartClick}
      disabled={isPending || isSuccess}
      className={cn("w-full transition-all duration-200", className, isSuccess && "bg-green-600 hover:bg-green-700 text-white")}
    >
      {isSuccess ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Added
        </>
      ) : isPending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
}