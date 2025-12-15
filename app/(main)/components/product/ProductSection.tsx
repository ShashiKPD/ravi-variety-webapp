"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard"; 
import { ProductData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type SectionProduct = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  in_stock: boolean;
  pack_size: number;
  unit_name: string;
  variant_name: string | null;
  final_price: number;
  original_price: number;
  mrp: number;
  price_source: 'standard' | 'bulk' | 'sale';
  discount_label: string | null;
  savings_percentage: number;
};

type Props = {
  title: string;
  products: SectionProduct[];
  viewAllLink: string;
};

export default function ProductSection({ title, products, viewAllLink }: Props) {
  const [priceTextSize, setPriceTextSize] = useState<"xs" | "md">("xs");

  useEffect(() => {
    const updateSize = () => {
      // Tailwind's 'sm' breakpoint is 640px
      setPriceTextSize(window.innerWidth < 640 ? "xs" : "md");
    };

    updateSize(); // Set initial size on client-side
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  
  if (!products || products.length === 0) return null;

  return (
    <div className="p-3 sm:p-6 border-t border-gray-100 ">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 sm:px-0">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        
        {/* Desktop View All Link (Hidden on Mobile) */}
        <Link 
          href={viewAllLink} 
          className="hidden sm:flex text-xs font-bold text-blue-600 items-center gap-1 hover:underline"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* GRID: 3 Columns on Mobile, Responsive on Desktop */}
      <div className="
        grid grid-cols-3 gap-2 px-4 -mx-4 sm:mx-0 sm:px-0
        sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4
      ">
        {products.map((p) => {
          const productData: ProductData = {
            id: p.id,
            name: p.name,
            slug: p.slug,
            image_url: p.image_url,
            in_stock: p.in_stock,
            pack_size: p.pack_size || 1,
            unit_name: p.unit_name || 'Unit',
            variant_name: p.variant_name,
            final_price: p.final_price,
            original_price: p.original_price,
            mrp: p.mrp,
            price_source: p.price_source || 'standard',
            discount_label: p.discount_label,
            savings_percentage: p.savings_percentage
          };

          return (
            <div key={p.id} className="h-full">
              <ProductCard 
                product={productData} 
                isLoggedIn={true} 
                isWishlisted={false}
                priceTextSize={priceTextSize}
              />
            </div>
          );
        })}
      </div>

      {/* Mobile Bottom Button (Hidden on Desktop) */}
      <div className="mt-4 px-4 sm:hidden">
        <Button asChild variant="outline" className="w-full text-xs font-bold border-gray-200 h-10">
          <Link href={viewAllLink}>
            See all {title} <ArrowRight className="w-3 h-3 ml-2" />
          </Link>
        </Button>
      </div>

    </div>
  );
}