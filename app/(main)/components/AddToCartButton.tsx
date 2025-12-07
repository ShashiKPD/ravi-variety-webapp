"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addToCart, updateQuantity } from "@/app/(main)/cart/actions";
import { Loader2, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AddToCartButton({
  productId,
  initialQty = 0,
  className,
}: {
  productId: number;
  initialQty?: number;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  // Optimistic local quantity state
  const [qty, setQty] = useState(initialQty);

  const handleAddClick = () => {
    // Optimistically set to 1
    setQty(1);
    startTransition(async () => {
      const res = await addToCart(productId, 1);
      if (res?.error) {
        toast.error(res.error);
        // Revert on failure
        setQty(0);
      } else {
         toast.success("Added to cart");
      }
    });
  };

  const handleUpdateQty = (newQty: number) => {
    // Optimistically update
    setQty(newQty);
    startTransition(async () => {
      // If newQty is 0, the action should handle removal
      const res = await updateQuantity(productId, newQty);
      if (res?.error) {
        toast.error(res.error);
        // Revert on failure (rough approximation, ideally we'd know previous qty)
        setQty(newQty === 0 ? 1 : newQty - 1); 
      }
    });
  };

  if (qty > 0) {
    // --- COUNTER STATE ([-] QTY [+]) ---
    return (
      <div className={cn("flex items-center justify-between h-8 bg-blue-600 text-white rounded-md shadow-sm overflow-hidden", className)}>
        <button
          onClick={() => handleUpdateQty(qty - 1)}
          disabled={isPending}
          className="h-full px-2 flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        
        <span className="flex-1 text-center text-xs font-bold w-6 truncate">
          {isPending ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : qty}
        </span>
        
        <button
          onClick={() => handleUpdateQty(qty + 1)}
          disabled={isPending}
          className="h-full px-2 flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // --- INITIAL "ADD" STATE ---
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAddClick}
      disabled={isPending}
      className={cn(
        "w-full h-8 text-xs font-bold border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-sm rounded-md uppercase tracking-wider",
        className
      )}
    >
      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add"}
    </Button>
  );
}