import { Badge } from "@/components/ui/badge";
import { Tag, Layers, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type PriceProps = {
  finalPrice: number;
  originalPrice: number;
  mrp: number;
  priceSource: 'standard' | 'bulk' | 'sale';
  discountLabel?: string | null;
  savingsPercentage: number;
  unit?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function PriceDisplay({ 
  finalPrice, 
  originalPrice, 
  mrp,
  priceSource,
  discountLabel,
  savingsPercentage,
  unit,
  size = "md",
  className 
}: PriceProps) {
  
  const s = {
    sm: { price: "text-base", sub: "text-[10px]", badge: "text-[9px] px-1 h-4", gap: "gap-0.5" },
    md: { price: "text-lg", sub: "text-xs", badge: "text-[10px] px-1.5 h-5", gap: "gap-1" },
    lg: { price: "text-2xl", sub: "text-sm", badge: "text-xs px-2 h-6", gap: "gap-1.5" }
  }[size];

  // Logic: Only cross out Original if different from Final
  const isDiscounted = finalPrice < originalPrice;
  const hasBadges = priceSource === 'sale' || priceSource === 'bulk' || savingsPercentage > 0;

  return (
    <div className={cn("flex flex-col items-start", className)}>
      
      {/* 1. Badges (Conditionally Rendered Container) */}
      {hasBadges && (
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          {priceSource === 'sale' && (
            <Badge className={cn("bg-red-600 hover:bg-red-700 text-white border-0 flex items-center gap-1 w-fit", s.badge)}>
              <Tag className="w-3 h-3" /> {discountLabel || "Sale"}
            </Badge>
          )}
          
          {priceSource === 'bulk' && (
            <Badge className={cn("bg-blue-600 hover:bg-blue-700 text-white border-0 flex items-center gap-1 w-fit", s.badge)}>
              <Layers className="w-3 h-3" /> {discountLabel || "Bulk Price"}
            </Badge>
          )}

          {savingsPercentage > 0 && (
            <span className={cn("font-bold text-green-700 bg-green-50 px-1.5 rounded border border-green-200 flex items-center", s.badge)}>
              <TrendingDown className="w-3 h-3 mr-0.5" /> {savingsPercentage}% OFF
            </span>
          )}
        </div>
      )}

      {/* 2. Main Price Row */}
      <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0">
        <div className="flex items-baseline gap-1">
          <span className={cn("font-bold text-gray-900 leading-none", s.price)}>
            ₹{finalPrice}
          </span>
          {unit && (
            <span className={cn("text-gray-500 font-medium", s.sub)}>
              / {unit}
            </span>
          )}
        </div>
        
        {/* Strikethrough Original Price */}
        {isDiscounted && (
          <span className={cn("text-gray-400 line-through decoration-gray-300", s.sub)}>
            ₹{originalPrice}
          </span>
        )}
      </div>

      {/* 3. MRP Reference Line */}
      {mrp > finalPrice && (
        <span className={cn("text-gray-400 font-medium mt-0.5", s.sub)}>
          MRP: ₹{mrp}
        </span>
      )}
    </div>
  );
}