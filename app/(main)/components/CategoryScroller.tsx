"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null; // Added image_url
};

export default function CategoryScroller({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="bg-white border-b shadow-sm py-3">
      <div className="flex overflow-x-auto gap-4 px-4 scrollbar-hide">
        {categories.map((category) => {
          return (
            <Link
              href={`/category/${category.id}`}
              key={category.id}
              className="flex flex-col items-center gap-2 w-20 shrink-0 group cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="relative h-14 w-14 rounded-full bg-gray-100 overflow-hidden group-hover:border-blue-500 border border-transparent transition-all">
                {category.image_url ? (
                  <Image 
                    src={category.image_url} 
                    alt={category.name} 
                    fill 
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-gray-400">
                    <LayoutGrid className="h-6 w-6" />
                  </div>
                )}
              </div>
              <span className="text-xs text-center font-medium text-gray-700 leading-tight w-full truncate group-hover:text-blue-600">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}