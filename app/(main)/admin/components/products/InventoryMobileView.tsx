"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, AlertCircle, Edit, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the shape of the product data passed from the page
type ProductRow = {
  id: number;
  name: string;
  sku: string;
  image_url: string | null;
  stock_quantity: number;
  price_retailer: number;
  sale_id: number | null;
  discount_type: "percentage" | "fixed_price" | null;
  discount_value: number | null;
  is_featured: boolean;
  brand_name?: string;
  group_name?: string;
};

type Props = {
  products: ProductRow[];
};

export default function InventoryMobileView({ products }: Props) {
  
  // Helper to truncate text
  const truncate = (str: string | undefined, len: number) => {
    if (!str) return "";
    return str.length > len ? str.substring(0, len) + "..." : str;
  };

  if (!products || products.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500 flex flex-col items-center">
        <Package className="w-12 h-12 mb-3 text-gray-300" />
        <p className="font-medium text-gray-900">No products found.</p>
        <p className="text-sm mt-1">Try adjusting filters.</p>
        <Button variant="link" asChild className="text-blue-600 mt-2">
          <Link href="/admin/products">Clear Filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {products.map((p) => {
        // Calculate Discounted Price for Display
        let finalPrice = p.price_retailer;
        if (p.sale_id && p.discount_value) {
          if (p.discount_type === 'percentage') {
            finalPrice = p.price_retailer - (p.price_retailer * (p.discount_value / 100));
          } else {
            finalPrice = p.price_retailer - p.discount_value;
          }
        }

        return (
          <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative active:border-blue-400 transition-colors">
            <div className="flex gap-4">
              
              {/* Image Section */}
              <div className="w-20 h-20 rounded-lg border bg-gray-50 relative overflow-hidden shrink-0">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} sizes="(max-width: 768px) 25vw, 64px" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package className="w-8 h-8" />
                  </div>
                )}
                
                {p.is_featured && (
                  <div className="absolute top-0 left-0 bg-amber-400 text-amber-950 text-[9px] font-bold px-1.5 py-0.5 rounded-br-md shadow-sm z-10 flex items-center gap-0.5">
                    <Star className="w-2 h-2 fill-current" /> FEATURED
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                
                {/* Header: Name + Edit */}
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug" title={p.name}>
                      {p.name}
                    </h3>
                    <Link 
                      href={`/admin/products/${p.id}/edit`} 
                      className="p-2 -mr-2 -mt-2 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  {/* Metadata: Brand / Group */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-2">
                    <span className="font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                      {truncate(p.brand_name, 12) || "Generic"}
                    </span>
                    <span className="text-gray-300">/</span>
                    <span className="truncate max-w-[100px]">
                      {truncate(p.group_name, 15) || "Uncategorized"}
                    </span>
                  </div>
                </div>

                {/* Footer: Stock & Price */}
                <div className="flex items-end justify-between mt-3 pt-3 border-t border-dashed border-gray-100">
                  
                  {/* Stock */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wide">Stock</span>
                    <div className={`text-sm font-bold flex items-center gap-1.5 ${p.stock_quantity < 10 ? "text-red-600" : "text-gray-700"}`}>
                      {p.stock_quantity < 10 && <AlertCircle className="w-3.5 h-3.5" />}
                      {p.stock_quantity} units
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wide block">Price</span>
                    <div className="flex flex-col items-end">
                      {p.sale_id ? (
                         <>
                           <span className="text-xs text-gray-400 line-through">₹{p.price_retailer}</span>
                           <div className="flex items-center gap-1.5">
                             <span className="text-xs font-medium text-green-600 bg-green-50 px-1 rounded">
                               {p.discount_type === 'percentage' ? `-${p.discount_value}%` : `-₹${p.discount_value}`}
                             </span>
                             <span className="text-base font-bold text-gray-900">
                               ₹{finalPrice.toFixed(0)}
                             </span>
                           </div>
                         </>
                      ) : (
                         <span className="text-base font-bold text-gray-900">
                           {p.price_retailer ? `₹${p.price_retailer}` : <span className="text-gray-400 text-sm">--</span>}
                         </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}