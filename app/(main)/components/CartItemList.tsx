"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition, useState } from "react";
import { Trash2, Loader2, Minus, Plus } from "lucide-react";
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
  unitName?: string; // Added unitName
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
          <li key={item.id} className="flex gap-3 py-4 px-3 sm:px-6 hover:bg-gray-50/50 transition-colors">
            
            {/* 1. Product Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded-md border bg-white">
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
            <div className="flex flex-1 flex-col justify-between min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                
                {/* Details Section */}
                <div className="space-y-1">
                  <Link href={`/p/${item.slug}/${item.product_id}`}>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight hover:text-blue-600 transition-colors">
                      {item.productName}
                    </h3>
                  </Link>
                  
                  {/* Variant & SKU Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {item.variantName && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {item.variantName}
                      </span>
                    )}
                    {item.sku && (
                       <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                         #{item.sku}
                       </span>
                    )}
                  </div>

                  {/* B2B Price Block */}
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-base font-bold text-gray-900">₹{item.unitPrice}</p>
                    {item.mrp > item.unitPrice && (
                      <>
                        <span className="text-xs text-gray-400 line-through">₹{item.mrp}</span>
                        <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 h-4 px-1 text-[9px] font-bold">
                          {margin}% Margin
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 mt-2 md:mt-0">
                  
                  {/* Quantity Input Group */}
                  <div className="flex items-center border rounded-md h-8 bg-white shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-full w-8 rounded-none text-gray-500 hover:text-gray-900"
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
                      className="w-10 h-full border-none shadow-none text-center focus-visible:ring-0 p-0 text-sm font-medium"
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-full w-8 rounded-none text-gray-500 hover:text-gray-900"
                      disabled={isPending}
                      onClick={() => handleQuantityUpdate(item.product_id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="flex items-center gap-3 md:gap-4 ml-auto md:ml-0">
                    <div className="text-right">
                       {/* Mobile Label for Total */}
                       <span className="text-[10px] text-gray-500 block md:hidden leading-none mb-0.5">Total</span>
                       <p className="font-bold text-sm sm:text-lg text-gray-900">₹{item.itemTotal.toFixed(2)}</p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(item.product_id)}
                      disabled={isPending}
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 -mr-2 md:mr-0"
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