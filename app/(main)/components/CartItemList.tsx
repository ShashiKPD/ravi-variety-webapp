"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition, useState } from "react";
import { Trash2, Loader2, Minus, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { removeItem, updateQuantity } from "@/app/(main)/cart/actions";

type B2BCartItem = {
  id: number;
  product_id: number;
  quantity: number;
  productName: string;
  variantName: string | null;
  slug: string;
  sku?: string;
  image_url: string | null;
  unitPrice: number;
  mrp: number;
  stock: number;
  itemTotal: number;
  unitName?: string; 
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
          <li key={item.id} className="flex gap-4 py-4 px-4 sm:px-6 hover:bg-gray-50/50 transition-colors group">
            
            {/* 1. Product Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm">
              <Link href={`/p/${item.slug}/${item.product_id}`}>
                {item.image_url ? (
                   <Image
                     src={item.image_url}
                     alt={item.productName}
                     fill
                     className="object-contain p-1 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                   />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-300">
                     <Package className="w-8 h-8" />
                   </div>
                )}
              </Link>
            </div>

            {/* 2. Content Column */}
            <div className="flex flex-1 flex-col sm:flex-row gap-4 min-w-0">
              
              {/* Product Info */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <Link href={`/p/${item.slug}/${item.product_id}`} className="block">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-blue-600 transition-colors">
                      {item.productName}
                    </h3>
                  </Link>
                  {/* Mobile Remove Button (Top Right) */}
                  <button 
                    onClick={() => handleRemove(item.product_id)} 
                    disabled={isPending}
                    className="sm:hidden text-gray-400 hover:text-red-500 p-1 -mr-2 -mt-2"
                  >
                    {loadingId === item.product_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Variant & SKU */}
                <div className="flex flex-wrap items-center gap-2">
                  {item.variantName && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium bg-gray-100 text-gray-600 border-gray-200">
                      {item.variantName}
                    </Badge>
                  )}
                  {item.sku && (
                    <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                      #{item.sku}
                    </span>
                  )}
                </div>

                {/* Price Block */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-base font-bold text-gray-900">₹{item.unitPrice}</span>
                  {item.mrp > item.unitPrice && (
                    <>
                      <span className="text-xs text-gray-400 line-through">₹{item.mrp}</span>
                      {margin > 0 && (
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                          {margin}% Margin
                        </span>
                      )}
                    </>
                  )}
                  <span className="text-xs text-gray-400">/ {item.unitName || "unit"}</span>
                </div>
              </div>

              {/* Controls Section (Qty & Total) */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 mt-1 sm:mt-0">
                
                {/* Quantity Stepper */}
                <div className="flex items-center border rounded-md h-8 bg-white shadow-sm overflow-hidden w-28 sm:w-auto">
                  <button
                    className="h-full w-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                    disabled={isPending || item.quantity <= 1}
                    onClick={() => handleQuantityUpdate(item.product_id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  
                  <div className="flex-1 h-full flex items-center justify-center text-sm font-semibold border-x w-8 sm:w-10">
                    {item.quantity}
                  </div>

                  <button
                    className="h-full w-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                    disabled={isPending}
                    onClick={() => handleQuantityUpdate(item.product_id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right">
                   <p className="font-bold text-base sm:text-lg text-gray-900">₹{item.itemTotal.toFixed(2)}</p>
                </div>

                {/* Desktop Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(item.product_id)}
                  disabled={isPending}
                  className="hidden sm:flex h-8 text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 px-2"
                >
                  {loadingId === item.product_id ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Remove
                </Button>

              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}