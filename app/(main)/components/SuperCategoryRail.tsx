"use client";

import Link from "next/link";
import Image from "next/image";

type SuperCategory = {
  id: number;
  name: string;
  slug?: string; // Optional because some fetching logic might not include it yet
  image_url: string | null;
};

export default function SuperCategoryRail({ data }: { data: SuperCategory[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white py-3 border- border-gray-100">
      <div className="flex overflow-x-auto scrollbar-hide px-4 gap-3 md:justify-center">
        {data.map((item) => (
          <Link 
            key={item.id} 
            // Prefer slug for SEO-friendly URL, fallback to ID if missing
            href={`/category/${item.slug || item.id}`}
            className="flex flex-col items-center gap-1.5 min-w-[60px] flex-shrink-0 group cursor-pointer"
          >
            {/* Square with rounded corners (Squircle) */}
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden group-hover:border-blue-400 group-hover:shadow-sm transition-all">
              {item.image_url ? (
                <Image 
                  src={item.image_url} 
                  alt={item.name} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 48px, 56px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg bg-gray-100">
                  {item.name.charAt(0)}
                </div>
              )}
            </div>
            
            <span className="text-[10px] sm:text-xs font-medium text-gray-700 text-center leading-tight line-clamp-2 max-w-[64px] group-hover:text-blue-600">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}