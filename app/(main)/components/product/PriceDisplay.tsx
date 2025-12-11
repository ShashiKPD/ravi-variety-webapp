import { Badge } from "@/components/ui/badge";
import { Tag, Layers } from "lucide-react";
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
  
  // UPDATED SIZES: Larger Strikethrough, Larger Final Price
  const s = {
    sm: { 
      price: "text-lg",       // Increased from base
      original: "text-xs",    // Readable but smaller
      badge: "text-[9px] px-1 h-4", 
      unit: "text-[10px]" 
    },
    md: { 
      price: "text-xl",       // Increased from lg
      original: "text-sm", 
      badge: "text-[10px] px-1.5 h-5", 
      unit: "text-xs" 
    },
    lg: { 
      price: "text-3xl", 
      original: "text-lg", 
      badge: "text-xs px-2 h-6", 
      unit: "text-sm" 
    }
  }[size];

  const isDiscounted = finalPrice < originalPrice;
  // We remove savingsPercentage from here since it's now on the image
  const hasBadges = priceSource === 'sale' || priceSource === 'bulk';

  return (
    <div className={cn("flex flex-col items-start", className)}>
      
      {/* 1. Badges (RESTORED: Shows Sale Name or Bulk Label) */}
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
        </div>
      )}

      {/* 2. Main Price Row (UPDATED ORDER) */}
      <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0">
        
        {/* Final Price */}
        <span className={cn("font-bold text-gray-900 leading-none", s.price)}>
          ₹{finalPrice}
        </span>

        {/* Strikethrough (Larger now) */}
        {isDiscounted && (
          <span className={cn("text-gray-400 line-through decoration-gray-300 font-medium", s.original)}>
            ₹{originalPrice}
          </span>
        )}

        {/* Unit (Moved to end) */}
        {unit && (
          <span className={cn("text-gray-500 font-medium", s.unit)}>
            / {unit}
          </span>
        )}
      </div>

      {/* 3. MRP Reference Line */}
      {mrp > finalPrice && (
        <span className={cn("text-gray-400 font-medium mt-0.5", s.unit)}>
          MRP: ₹{mrp}
        </span>
      )}
    </div>
  );
}