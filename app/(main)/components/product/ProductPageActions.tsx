"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus, Check, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/context/CartContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import WishlistButton from "../WishlistButton";

type Props = {
  productId: number;
  stock: number;
  name: string;
  imageUrl: string | null;
  price: number;
  packSize: number;
  isWishlisted: boolean;
  isLoggedIn: boolean;
  qty: number;
  onQtyChange: (val: number) => void;
  cartQty: number;
};

export default function ProductPageActions({
  productId,
  stock,
  name,
  imageUrl,
  price,
  packSize,
  isWishlisted,
  isLoggedIn,
  qty,
  onQtyChange,
  cartQty,
}: Props) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { addToCart, updateQty } = useCart();

  const handleAction = () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    // CASE 1: REMOVE ITEM (Qty is 0)
    if (qty === 0) {
      updateQty(productId, -cartQty); // Removes item by subtracting total
      toast.success("Item removed from cart");
      return;
    }

    // CASE 2: ADD NEW ITEM
    if (cartQty === 0) {
      addToCart({
        id: productId,
        qty: qty,
        name,
        image_url: imageUrl,
        pack_size: packSize,
        price: price
      });
      toast.success(`Added ${qty} items to cart`);
    } 
    // CASE 3: UPDATE EXISTING ITEM
    else {
      const delta = qty - cartQty;
      if (delta !== 0) {
        updateQty(productId, delta);
        toast.success(`Cart updated to ${qty} items`);
      }
    }

    // Success Animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  if (stock <= 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t lg:static lg:border-none lg:p-0 z-50">
        <Button disabled className="w-full h-12 text-base font-bold bg-gray-100 text-gray-400">
          Out of Stock
        </Button>
      </div>
    );
  }

  // LOGIC: Determine Button State
  const isInCart = cartQty > 0;
  const isZero = qty === 0;
  const isDirty = qty !== cartQty; // Has value changed from what's saved?

  // Calculate Min value for stepper: 
  // If in cart, allow going to 0 (to remove). If not in cart, min is 1.
  const minStep = isInCart ? 0 : 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 lg:static lg:border-none lg:shadow-none lg:p-0 lg:mt-8">
      <div className="max-w-7xl mx-auto flex gap-3 lg:gap-4 items-center">
        
        {/* STEPPER */}
        <div className={cn(
          "flex items-center border rounded-lg h-11 lg:h-12 w-32 shrink-0 bg-white overflow-hidden transition-colors",
          isZero ? "border-red-300 bg-red-50" : "border-gray-300"
        )}>
          <button 
            onClick={() => onQtyChange(Math.max(minStep, qty - 1))}
            className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors border-r border-transparent"
            disabled={qty <= minStep}
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <div className="flex-1 h-full relative">
            <Input 
              type="number" 
              min={minStep} 
              max={stock}
              value={qty} 
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                onQtyChange(Math.max(minStep, val));
              }}
              className={cn(
                "w-full h-full border-0 text-center font-bold focus-visible:ring-0 px-0 rounded-none shadow-none text-lg appearance-none bg-transparent",
                isZero ? "text-red-600" : "text-gray-900"
              )}
            />
          </div>

          <button 
            onClick={() => onQtyChange(Math.min(stock, qty + 1))}
            className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors border-l border-transparent"
            disabled={qty >= stock}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* PRIMARY ACTION BUTTON */}
        <Button 
          onClick={handleAction}
          disabled={isInCart && !isDirty && !isAnimating && !isZero} // Disable if In Sync (unless 0)
          className={cn(
            "flex-1 h-11 lg:h-12 text-base font-bold shadow-sm transition-all duration-300 relative overflow-hidden",
            
            // STATE: REMOVE (Red)
            isZero 
              ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
              
            // STATE: SYNCED (Green Outline)
            : isInCart && !isDirty && !isAnimating
              ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-none" 
              
            // STATE: SUCCESS ANIMATION (Solid Green)
            : isAnimating 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              
            // STATE: DEFAULT / UPDATE (Blue)
              : "bg-blue-600 hover:bg-blue-700 text-white" 
          )}
        >
          <div className={cn("flex items-center gap-2 transition-transform duration-300", isAnimating ? "-translate-y-10" : "translate-y-0")}>
            
            {/* 1. Remove State */}
            {isZero ? (
              <>
                <Trash2 className="w-5 h-5" /> Remove
              </>
            ) 
            /* 2. New Add State */
            : !isInCart ? (
              <>
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </>
            ) 
            /* 3. Synced State */
            : !isDirty ? (
              <>
                <Check className="w-5 h-5" /> In Cart
              </>
            ) 
            /* 4. Update State */
            : (
              <>
                <RefreshCw className="w-5 h-5" /> Update Qty
              </>
            )}

          </div>
          
          {/* Success Overlay Animation */}
          <div className={cn("absolute inset-0 flex items-center justify-center gap-2 transition-transform duration-300", isAnimating ? "translate-y-0" : "translate-y-10")}>
            <Check className="w-5 h-5" />
            {isZero ? "Removed" : isInCart ? "Updated" : "Added"}
          </div>
        </Button>

        {/* Wishlist */}
        <div className="shrink-0">
          <WishlistButton 
            productId={productId} 
            isLoggedIn={isLoggedIn}
            initialState={isWishlisted}
            className="h-11 w-11 lg:h-12 lg:w-12 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500"
          />
        </div>

      </div>
    </div>
  );
}