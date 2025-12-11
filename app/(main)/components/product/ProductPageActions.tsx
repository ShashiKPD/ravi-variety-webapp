"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
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
  // NEW: Controlled Props
  qty: number;
  onQtyChange: (val: number) => void;
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
}: Props) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    if (qty < 1) return;

    addToCart({
      id: productId,
      qty: qty,
      name,
      image_url: imageUrl,
      pack_size: packSize,
      price: price
    });

    setIsAnimating(true);
    toast.success(`Added ${qty} items to cart`);
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 lg:static lg:border-none lg:shadow-none lg:p-0 lg:mt-8">
      <div className="max-w-7xl mx-auto flex gap-3 lg:gap-4 items-center">
        
        {/* Controlled Quantity Stepper */}
        <div className="flex items-center border border-gray-300 rounded-lg h-11 lg:h-12 w-32 shrink-0 bg-white overflow-hidden">
          <button 
            onClick={() => onQtyChange(Math.max(1, qty - 1))}
            className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors border-r border-gray-100"
            disabled={qty <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <div className="flex-1 h-full relative">
            <Input 
              type="number" 
              min={1} 
              max={stock}
              value={qty} 
              onChange={(e) => onQtyChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full h-full border-0 text-center font-bold text-gray-900 focus-visible:ring-0 px-0 rounded-none shadow-none text-lg appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <button 
            onClick={() => onQtyChange(Math.min(stock, qty + 1))}
            className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors border-l border-gray-100"
            disabled={qty >= stock}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add Button */}
        <Button 
          onClick={handleAddToCart}
          className={cn(
            "flex-1 h-11 lg:h-12 text-base font-bold shadow-sm transition-all duration-300 relative overflow-hidden",
            isAnimating ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          <div className={cn("flex items-center gap-2 transition-transform duration-300", isAnimating ? "-translate-y-10" : "translate-y-0")}>
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </div>
          <div className={cn("absolute inset-0 flex items-center justify-center gap-2 transition-transform duration-300", isAnimating ? "translate-y-0" : "translate-y-10")}>
            <Check className="w-5 h-5" />
            Added
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