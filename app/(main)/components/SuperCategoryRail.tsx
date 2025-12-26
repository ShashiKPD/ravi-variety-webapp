"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";

type SuperCategory = {
  id: number;
  name: string;
  slug?: string;
  image_url: string | null;
};

// ✅ Sub-component to handle individual image error states
function CategoryCard({ item }: { item: SuperCategory }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link 
      href={`/category/${item.slug || item.id}`}
      className="flex flex-col items-center gap-1.5 min-w-[72px] flex-shrink-0 group cursor-pointer select-none"
    >
      <div className="relative w-16 h-16 md:w-18 md:h-18 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden transition-all duration-200 group-hover:border-blue-400 group-hover:shadow-md group-active:scale-95 group-active:border-blue-500">
        
        {item.image_url && !imageError ? (
          <Image 
            src={item.image_url} 
            alt={item.name} 
            fill 
            className="object-cover p-0.5 rounded-2xl transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 72px, 80px"
            draggable={false}
            onError={() => setImageError(true)} // ✅ Triggers fallback on failure
          />
        ) : (
          // ✅ Fallback Placeholder (shown if URL is null OR onError fired)
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-1">
             {/* Show first letter prominently */}
            <span className="font-bold text-xl uppercase">
              {item.name.charAt(0)}
            </span>
            {/* Optional: Show tiny full name if you really want it inside, but usually initials are cleaner */}
          </div>
        )}
      </div>
      
      <span className="text-[11px] sm:text-xs font-medium text-gray-700 text-center leading-tight line-clamp-2 max-w-[76px] group-hover:text-blue-600 transition-colors">
        {item.name}
      </span>
    </Link>
  );
}

export default function SuperCategoryRail({ data }: { data: SuperCategory[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white py-4 border-b border-gray-100">
      <div className="flex overflow-x-auto scrollbar-hide px-3 gap-2 md:gap-6 md:justify-center items-start">
        
        {/* 'View All' Card */}
        <Link 
          href="/categories"
          className="flex flex-col items-center gap-1.5 min-w-[72px] flex-shrink-0 group cursor-pointer select-none"
        >
          <div className="relative w-16 h-16 md:w-18 md:h-18 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center transition-all duration-200 shadow-sm group-hover:bg-blue-600 group-hover:border-blue-600 group-active:scale-95 group-active:bg-blue-700">
            <LayoutGrid className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-200" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-blue-700 text-center leading-tight">
            View All
          </span>
        </Link>

        {/* Dynamic Categories */}
        {data.map((item) => (
          <CategoryCard key={item.id} item={item} />
        ))}
        
      </div>
    </div>
  );
}