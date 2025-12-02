"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition, useState } from "react";
import { Trash2, Loader2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { removeItem, updateQuantity } from "@/app/(main)/cart/actions";

// Updated Type to accept separated names
type B2BCartItem = {
  id: number;
  product_id: number;
  quantity: number;
  productName: string; // "Aachi Mango Achar"
  variantName: string | null; // "1kg"
  slug: string;
  sku?: string;
  image_url: string | null;
  unitPrice: number;
  mrp: number;
  stock: number;
  itemTotal: number;
  unitName?: string; // "Ctn", "Pcs", etc.
};

export default function CartItemList({ items }: { items: B2BCartItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleRemove = (productId: number) => {
    setLoadingId(productId);
    startTransition(async () => {
      await removeItem(productId);
      setLoadingId(null);
    });
  };

  const handleQuantityUpdate = (productId: number, newQty: number) => {
    if (newQty < 1) return;
    setLoadingId(productId);
    startTransition(async () => {
      await updateQuantity(productId, newQty);
      setLoadingId(null);
    });
  };

  return (
    <ul className="divide-y divide-gray-100">
      {items.map((item) => {
        const margin = item.mrp > 0 
          ? Math.round(((item.mrp - item.unitPrice) / item.mrp) * 100) 
          : 0;

        return (
          <li key={item.id} className="flex gap-4 py-6 px-4 sm:px-6 hover:bg-gray-50/50 transition-colors">
            
            {/* 1. Product Image */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-white">
              <Link href={`/p/${item.slug}/${item.product_id}`}>
                <Image
                  src={item.image_url || "/placeholder.png"}
                  alt={item.productName}
                  fill
                  className="object-contain p-2 mix-blend-multiply hover:scale-105 transition-transform"
                />
              </Link>
            </div>

            {/* 2. Content Column */}
            <div className="flex flex-1 flex-col justify-between">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Details Section */}
                <div>
                  <div className="flex flex-col items-start gap-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-base">
                      <Link href={`/p/${item.slug}/${item.product_id}`} className="hover:underline hover:text-blue-600">
                        {item.productName}
                      </Link>
                    </h3>
                    
                    {/* --- VARIANT ON NEW LINE --- */}
                    {item.variantName && (
                      <div className="flex items-center gap-2">
                         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                           {item.variantName}
                         </span>
                         {/* SKU moved next to variant for context */}
                         {item.sku && (
                           <span className="text-xs text-gray-400 font-mono tracking-wide">
                             #{item.sku}
                           </span>
                         )}
                      </div>
                    )}
                  </div>

                  {/* B2B Price Block */}
                  <div className="mt-3 flex items-center gap-3">
                    <p className="text-lg font-bold text-gray-900">₹{item.unitPrice}</p>
                    {item.mrp > item.unitPrice && (
                      <>
                        <span className="text-sm text-gray-400 line-through">₹{item.mrp}</span>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 h-5 px-1.5 text-[10px]">
                          {margin}% Margin
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-col items-end justify-between gap-4">
                  
                  {/* Quantity Input Group */}
                  <div className="flex items-center border rounded-md h-9 bg-white shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-full w-9 rounded-none text-gray-500 hover:text-gray-900"
                      disabled={isPending || item.quantity <= 1}
                      onClick={() => handleQuantityUpdate(item.product_id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      disabled={isPending}
                      onChange={(e) => {
                         const val = parseInt(e.target.value) || 1;
                         handleQuantityUpdate(item.product_id, val);
                      }}
                      className="w-14 h-full border-none shadow-none text-center focus-visible:ring-0 p-0 text-sm font-medium"
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-full w-9 rounded-none text-gray-500 hover:text-gray-900"
                      disabled={isPending}
                      onClick={() => handleQuantityUpdate(item.product_id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    
                    <span className="text-xs text-gray-500 font-medium ml-2 w-8">
                      {item.unitName || "Pcs"}
                    </span>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-lg text-gray-900">₹{item.itemTotal.toFixed(2)}</p>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(item.product_id)}
                      disabled={isPending}
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      {loadingId === item.product_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}