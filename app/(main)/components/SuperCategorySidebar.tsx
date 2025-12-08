"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LayoutGrid } from "lucide-react";

type TaxonomyItem = {
  category_id: number;
  category_name: string;
  category_slug: string;
  category_image: string | null;
  brands: { id: number; name: string; image: string | null }[] | null;
};

export default function SuperCategorySidebar({ 
  taxonomy, 
  activeCategorySlug, 
  supercategorySlug 
}: { 
  taxonomy: TaxonomyItem[];
  activeCategorySlug: string | null;
  supercategorySlug: string;
}) {

  if (!taxonomy || taxonomy.length === 0) {
    return <div className="p-4 text-xs text-gray-400 text-center">No categories</div>;
  }

  return (
    <div className="bg-white h-full flex flex-col border-r border-gray-200">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 pt-2">
        
        {/* "All" Option - Clears the category filter */}
        <Link
          href={`/category/${supercategorySlug}`}
          scroll={false} // Prevents scroll jump
          className="flex flex-col items-center justify-center py-3 px-1 cursor-pointer group"
        >
          <div className={cn(
            "relative w-14 h-14 mb-2 overflow-hidden transition-all bg-white flex items-center justify-center",
            // Styling: Square (rounded-md), Dark Border for Active, Light Border for Inactive
            "rounded-md border", 
            !activeCategorySlug 
              ? "border-gray-900 border-2 shadow-sm" // Active: Dark & Thick
              : "border-gray-200 group-hover:border-gray-400" // Inactive
          )}>
            <LayoutGrid className={cn(
              "w-6 h-6 transition-colors", 
              !activeCategorySlug ? "text-gray-900" : "text-gray-400"
            )} />
          </div>
          <span className={cn(
            "text-[10px] md:text-xs text-center font-medium leading-tight",
            !activeCategorySlug ? "text-gray-900 font-bold" : "text-gray-600"
          )}>
            All
          </span>
        </Link>

        {taxonomy.map((item) => {
          const isActive = activeCategorySlug === item.category_slug;

          return (
            <Link
              key={item.category_id}
              // Hybrid URL: Keep Supercategory Context + Switch Category Param
              href={`/category/${supercategorySlug}?category=${item.category_slug}`}
              scroll={false}
              className="flex flex-col items-center justify-center py-3 px-1 cursor-pointer group"
            >
              <div className={cn(
                "relative w-14 h-14 mb-2 overflow-hidden transition-all bg-white",
                "rounded-md border",
                isActive 
                  ? "border-gray-900 border-2 shadow-sm scale-105" 
                  : "border-gray-200 group-hover:border-gray-400"
              )}>
                {item.category_image ? (
                  <Image 
                    src={item.category_image} 
                    alt={item.category_name} 
                    fill 
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 font-bold text-lg">
                    {item.category_name.charAt(0)}
                  </div>
                )}
              </div>

              <span className={cn(
                "text-[10px] md:text-xs text-center font-medium leading-tight line-clamp-2 max-w-[70px]",
                isActive ? "text-gray-900 font-bold" : "text-gray-600"
              )}>
                {item.category_name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}