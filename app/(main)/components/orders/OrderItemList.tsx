import Image from "next/image";
import Link from "next/link";
import { Package, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type OrderItemSnapshot = {
  id: number;
  product_id: number | null;
  product_name: string;
  variant_name: string | null;
  pack_size: number; // <--- NEW FIELD
  slug?: string; 
  snapshot_image: string | null;
  sku: string | null;
  unit_name: string;
  unit_price: number;
  mrp: number;
  quantity: number;
  total_price: number;
};

export default function OrderItemList({ items }: { items: OrderItemSnapshot[] }) {
  return (
    <ul className="divide-y divide-gray-100">
      {items.map((item) => {
        // 1. Savings Calculation
        const isDiscounted = item.mrp > item.unit_price;
        const savingsPercent = isDiscounted 
          ? Math.round(((item.mrp - item.unit_price) / item.mrp) * 100) 
          : 0;

        // 2. Variant Label Logic ("12 x 100ml")
        let displayVariant = item.variant_name;
        if (item.pack_size > 1) {
          if (item.variant_name) {
            displayVariant = `${item.pack_size} x ${item.variant_name}`;
          } else {
            displayVariant = `Pack of ${item.pack_size}`;
          }
        }

        const ItemWrapper = ({ children }: { children: React.ReactNode }) => 
          item.product_id && item.slug 
            ? <Link href={`/p/${item.slug}/${item.product_id}`} className="block">{children}</Link> 
            : <div className="block">{children}</div>;

        return (
          <li key={item.id} className="flex gap-4 py-4 px-4 sm:px-6 hover:bg-gray-50/30 transition-colors group">
            
            {/* Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm">
              <ItemWrapper>
                {item.snapshot_image ? (
                   <Image
                     src={item.snapshot_image}
                     alt={item.product_name}
                     fill
                     className="object-contain p-1 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                   />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-300">
                     <Package className="w-8 h-8" />
                   </div>
                )}
              </ItemWrapper>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col sm:flex-row gap-4 min-w-0">
              
              <div className="flex-1 space-y-1.5">
                <ItemWrapper>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-blue-600 transition-colors">
                    {item.product_name}
                  </h3>
                </ItemWrapper>
                
                {/* Variant & Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {displayVariant && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium bg-gray-100 text-gray-600 border-gray-200 whitespace-nowrap">
                      {displayVariant}
                    </Badge>
                  )}
                  {isDiscounted && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-bold bg-green-50 text-green-700 border-green-100 whitespace-nowrap gap-1">
                      <Tag className="w-3 h-3" /> {savingsPercent}% OFF
                    </Badge>
                  )}
                </div>

                {/* Price */}
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mt-1">
                  <span className="text-base font-bold text-gray-900">
                    ₹{item.unit_price}
                  </span>

                  {isDiscounted ? (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{item.mrp}
                    </span>
                  ) : null}
                  
                  <span className="text-xs text-gray-400">/ {item.unit_name}</span>
                </div>
              </div>

              {/* Totals (Right side on desktop, bottom on mobile) */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 mt-1 sm:mt-0">
                <div className="flex items-center justify-center text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded px-2.5 py-1">
                   Qty: {item.quantity}
                </div>
                <div className="text-right">
                   <p className="font-bold text-base sm:text-lg text-gray-900">
                     ₹{item.total_price.toFixed(2)}
                   </p>
                </div>
              </div>

            </div>
          </li>
        );
      })}
    </ul>
  );
}