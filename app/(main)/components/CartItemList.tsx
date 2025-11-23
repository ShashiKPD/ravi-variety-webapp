"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { removeItem, updateQuantity } from "../cart/actions";
import { useTransition } from "react";
import { Trash2, Loader2, Minus, Plus } from "lucide-react";

// 1. Define the 'DetailedCartItem' type (you can move this to lib/types.ts)
type DetailedCartItem = {
  product_id: number;
  quantity: number;
  name: string;
  image_url: string | null;
  price: number;
  itemTotal: number;
};

export default function CartItemList({
  items,
}: {
  items: DetailedCartItem[];
}) {
  // 2. useTransition is the modern React way to handle loading states
  //    without blocking the UI.
  let [isPending, startTransition] = useTransition();

  const handleRemove = (productId: number) => {
    // 3. startTransition marks this as a low-priority update
    startTransition(async () => {
      await removeItem(productId);
    });
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 0) return; // Don't allow negative
    
    startTransition(async () => {
      await updateQuantity(productId, newQuantity);
    });
  };

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li key={item.product_id} className="flex gap-4 py-4">
          <div className="relative h-24 w-24 rounded-md overflow-hidden">
            <Image
              src={item.image_url || ""}
              alt={item.name}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-lg font-semibold">₹{item.price.toFixed(2)}</p>
            </div>
            
            {/* --- 4. Quantity Selector --- */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                disabled={isPending}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                disabled={isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-right flex flex-col justify-between items-end">
            <p className="font-semibold text-lg">₹{item.itemTotal.toFixed(2)}</p>
            
            {/* --- 5. Remove Button --- */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(item.product_id)}
              disabled={isPending}
              aria-label="Remove item"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5 text-gray-500" />
              )}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}