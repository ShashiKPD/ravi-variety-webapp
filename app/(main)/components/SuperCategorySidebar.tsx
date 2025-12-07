"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LayoutGrid } from "lucide-react";

type TaxonomyItem = {
  category_id: number;
  category_name: string;
  category_slug: string; // Added slug to type
  category_image: string | null;
  brands: { id: number; name: string; image: string | null }[] | null;
};

export default function SuperCategorySidebar({ 
  taxonomy, 
  activeCategoryId, 
  supercategorySlug 
}: { 
  taxonomy: TaxonomyItem[];
  activeCategoryId: string | null;
  supercategorySlug: string;
}) {

  if (!taxonomy || taxonomy.length === 0) {
    return <div className="p-4 text-xs text-gray-400 text-center">No categories</div>;
  }

  return (
    <div className="bg-gray-50 h-full flex flex-col border-r border-gray-200">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        
        {/* "All" Option */}
        <Link
          href={`/category/${supercategorySlug}`}
          scroll={false}
          className="flex flex-col items-center justify-center py-4 px-2 cursor-pointer group"
        >
          <div className={cn(
            "relative w-12 h-12 md:w-14 md:h-14 mb-2 rounded-xl overflow-hidden transition-all bg-white flex items-center justify-center border border-gray-200",
            // Active state: Darker border, slight scale
            !activeCategoryId 
              ? "ring-2 ring-orange-500 border-transparent shadow-sm" 
              : "group-hover:border-gray-300"
          )}>
            <LayoutGrid className={cn(
              "w-6 h-6 transition-colors", 
              !activeCategoryId ? "text-orange-600" : "text-gray-400"
            )} />
          </div>
          <span className={cn(
            "text-[10px] md:text-xs text-center font-medium leading-tight",
            !activeCategoryId ? "text-gray-900 font-bold" : "text-gray-500"
          )}>
            All
          </span>
        </Link>

        {taxonomy.map((item) => {
          const isActive = activeCategoryId === String(item.category_id);

          return (
            <Link
              key={item.category_id}
              href={`/category/${item.category_slug}`}
              scroll={false}
              className="flex flex-col items-center justify-center py-4 px-2 cursor-pointer group"
            >
              <div className={cn(
                "relative w-12 h-12 md:w-14 md:h-14 mb-2 rounded-xl overflow-hidden transition-all bg-white border border-gray-200",
                // Active state: Thicker, darker ring. No grayscale on inactive.
                isActive 
                  ? "ring-2 ring-orange-500 border-transparent shadow-sm scale-105" 
                  : "group-hover:border-gray-300"
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
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-lg">
                    {item.category_name.charAt(0)}
                  </div>
                )}
              </div>

              <span className={cn(
                "text-[10px] md:text-xs text-center font-medium leading-tight line-clamp-2 max-w-[70px]",
                isActive ? "text-gray-900 font-bold" : "text-gray-500"
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