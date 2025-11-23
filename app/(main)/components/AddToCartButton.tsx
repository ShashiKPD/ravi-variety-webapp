"use client";

import { useState } from "react";
// import { addToCart } from "../app/(main)/cart/actions"; // Check import path
import {addToCart} from "@/app/(main)/cart/actions";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Updated Props
export default function AddToCartButton({ 
  productId, 
  quantity = 1,
  className 
}: { 
  productId: number, 
  quantity?: number,
  className?: string
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleCartClick = async () => {
    setIsLoading(true);
    // Pass the quantity to the server action
    const result = await addToCart(productId, quantity);
    setIsLoading(false);

    if (result.error) {
      alert(result.error); 
    } else {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  return (
    <Button
      onClick={handleCartClick}
      disabled={isLoading || isAdded}
      className={cn("w-full", className)}
    >
      {isAdded ? (
        "Added!"
      ) : (
        <>
          {isLoading ? (
             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
             <ShoppingCart className="h-4 w-4 mr-2" />
          )}
          {isLoading ? "Adding..." : "Add to Cart"}
        </>
      )}
    </Button>
  );
}