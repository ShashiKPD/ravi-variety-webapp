"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition, useState } from "react";
import { Trash2, Loader2, Minus, Plus, Package, Layers, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { removeItem, updateQuantity } from "@/app/(main)/cart/actions";

// Updated Type (matches new RPC output)
type CartItemRPC = {
  cart_id: number; // <--- Changed from 'id'
  product_id: number;
  quantity: number;
  name: string;
  slug: string;
  sku?: string;
  image_url: string | null;
  stock_quantity: number;
  variant_label: string | null;
  unit_name: string;
  unit_price: number;
  original_price: number;
  price_source: 'standard' | 'bulk' | 'sale';
  discount_label: string | null;
  savings_percent: number;
  item_total: number;
  total_savings: number;
};

export default function CartItemList({ items }: { items: CartItemRPC[] }) {
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
        const isStandard = item.price_source === 'standard';

        return (
          <li key={item.cart_id} className="flex gap-4 py-4 px-4 sm:px-6 hover:bg-gray-50/50 transition-colors group">
            
            {/* 1. Product Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm">
              <Link href={`/p/${item.slug}/${item.product_id}`}>
                {item.image_url ? (
                   <Image
                     src={item.image_url}
                     alt={item.name}
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
              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between items-start gap-2">
                  <Link href={`/p/${item.slug}/${item.product_id}`} className="block">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  {/* Mobile Remove Button */}
                  <button 
                    onClick={() => handleRemove(item.product_id)} 
                    disabled={isPending}
                    className="sm:hidden text-gray-400 hover:text-red-500 p-1 -mr-2 -mt-2"
                  >
                    {loadingId === item.product_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Variant Info & Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {item.variant_label && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium bg-gray-100 text-gray-600 border-gray-200 whitespace-nowrap">
                      {item.variant_label}
                    </Badge>
                  )}
                  
                  {!isStandard && (
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-5 font-bold whitespace-nowrap gap-1 ${
                      item.price_source === 'bulk' 
                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                        : 'bg-green-50 text-green-700 border-green-100'
                    }`}>
                      {item.price_source === 'bulk' ? <Layers className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                      {item.discount_label || `${item.savings_percent}% OFF`}
                    </Badge>
                  )}
                </div>

                {/* Price Block */}
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mt-1">
                  <span className="text-base font-bold text-gray-900">
                    ₹{item.unit_price}
                  </span>

                  {isStandard ? (
                    <span className="text-xs text-gray-500">
                      MRP: ₹{item.original_price}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{item.original_price}
                    </span>
                  )}
                  
                  <span className="text-xs text-gray-400">/ {item.unit_name}</span>
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

                {/* Item Total & Savings */}
                <div className="text-right">
                   <p className="font-bold text-base sm:text-lg text-gray-900">
                     ₹{item.item_total.toFixed(2)}
                   </p>
                   {item.total_savings > 0 && (
                     <p className="text-[10px] text-green-600 font-medium">
                       Saved ₹{item.total_savings.toFixed(2)}
                     </p>
                   )}
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