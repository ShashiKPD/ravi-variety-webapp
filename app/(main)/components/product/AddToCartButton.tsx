"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/context/CartContext";

type Props = {
  productId: number;
  inStock: boolean;
  packSize?: number;
  size?: "sm" | "md";
  className?: string;
  // New props needed for Local Cart Context
  name: string;
  imageUrl: string | null;
  price: number;
};

export default function AddToCartButton({
  productId,
  inStock,
  packSize = 1,
  size = "md",
  className,
  name,
  imageUrl,
  price,
}: Props) {
  // 1. Hook into Global State
  const { items, addToCart, updateQty } = useCart();
  
  // 2. Check current state in context
  const cartItem = items.find(i => i.id === productId);
  const qty = cartItem ? cartItem.qty : 0;

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!inStock) return;

    // Instant Local Update
    addToCart({
      id: productId,
      qty: 1,
      name,
      image_url: imageUrl,
      pack_size: packSize,
      price
    });
  };

  const handleUpdateQty = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    updateQty(productId, delta);
  };

  // --- COMPACT COUNTER STATE ---
  if (qty > 0) {
    return (
      <div 
        className={cn(
          "flex items-center h-8 bg-blue-600 shadow-md overflow-hidden touch-manipulation", 
          className // Allows overriding width/rounding from parent
        )}
        onClick={(e) => e.preventDefault()}
      >
        <button
          onClick={(e) => handleUpdateQty(e, -1)}
          // w-8 ensures a good touch target, flex-none prevents squishing
          className={`${size === "sm" ? "w-6" : "w-8"} h-full flex-none flex items-center justify-center hover:bg-blue-400 active:bg-blue-500 hover:text-white active:text-white transition-colors disabled:opacity-50 `}
        >
          <Minus className="w-3 h-3" strokeWidth={3} />
        </button>
        
        {/* Qty takes remaining space, but is tight */}
        <span className="flex-1 min-w-[20px] text-center text-xs font-bold truncate select-none leading-none "> 
          {qty}
        </span>
        
        <button
          onClick={(e) => handleUpdateQty(e, 1)}
          className={`${size === "sm" ? "w-6" : "w-8"} h-full flex-none flex items-center justify-center hover:bg-blue-400 active:bg-blue-500 hover:text-white active:text-white transition-colors disabled:opacity-50 `}
        >
          <Plus className="w-3 h-3" strokeWidth={3} />
        </button>
      </div>
    );
  }

  // --- COMPACT ADD BUTTON ---
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAddClick}
      disabled={!inStock}
      className={cn(
        "h-8 px-4 text-xs font-bold border-blue-200 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-300 shadow-sm rounded-full uppercase tracking-wide transition-all active:scale-[0.98]",
        className
      )}
    >
      {!inStock ? (
        <span className="text-gray-400 font-medium text-[10px] whitespace-nowrap">No Stock</span>
      ) : (
        <span className="flex items-center gap-1">
          ADD <Plus className="w-3.5 h-3.5" strokeWidth={3} />
        </span>
      )}
    </Button>
  );
}