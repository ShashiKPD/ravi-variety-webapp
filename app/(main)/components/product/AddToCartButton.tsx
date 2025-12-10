"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addToCart, updateQuantity } from "@/app/(main)/cart/actions";
import { Loader2, Plus, Minus, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  productId: number;
  inStock: boolean; // <--- Changed
  initialQty?: number;
  className?: string;
  packSize?: number;
};

export default function AddToCartButton({
  productId,
  inStock,
  initialQty = 0,
  className,
  packSize = 1,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [qty, setQty] = useState(initialQty);

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!inStock) return;

    // Optimistic: Set to 1
    setQty(1);
    
    startTransition(async () => {
      const res = await addToCart(productId, 1);
      if (res?.error) {
        toast.error(res.error);
        setQty(0); // Revert
      } else {
        toast.success(packSize > 1 ? `Added pack of ${packSize}` : "Added to cart");
      }
    });
  };

  const handleUpdateQty = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();

    const newQty = qty + delta;
    if (newQty < 0) return; // Cannot go below 0

    // Optimistic Update
    setQty(newQty);

    startTransition(async () => {
      const res = await updateQuantity(productId, newQty);
      if (res?.error) {
        // If server says "Insufficient Stock", we revert
        toast.error(res.error);
        setQty(qty); // Revert to previous valid qty
      }
    });
  };

  if (qty > 0) {
    return (
      <div 
        className={cn(
          "flex items-center justify-between h-9 bg-blue-600 text-white rounded-lg shadow-md overflow-hidden touch-manipulation", 
          className
        )}
        onClick={(e) => e.preventDefault()}
      >
        <button
          onClick={(e) => handleUpdateQty(e, -1)}
          disabled={isPending}
          className="h-full w-9 flex items-center justify-center hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <span className="flex-1 text-center text-sm font-bold w-8 truncate select-none">
          {isPending ? <Loader2 className="w-3 h-3 animate-spin mx-auto opacity-70" /> : qty}
        </span>
        
        <button
          onClick={(e) => handleUpdateQty(e, 1)}
          disabled={isPending}
          className="h-full w-9 flex items-center justify-center hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAddClick}
      disabled={isPending || !inStock}
      className={cn(
        "w-full h-9 text-xs sm:text-sm font-bold border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700 shadow-sm rounded-lg uppercase tracking-wide transition-all active:scale-[0.98]",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : !inStock ? (
        <span className="text-gray-400">Out of Stock</span>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" /> Add
        </>
      )}
    </Button>
  ); 
}