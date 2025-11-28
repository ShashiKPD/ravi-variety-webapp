"use client";

import Link from "next/link";
import { Leaf, IceCream, Home } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = {
  id: number;
  name: string;
  slug: string;
};

const categoryIcons: Record<string, React.ReactNode> = {
  Aachar: <Leaf className="h-6 w-6 text-green-600" />,
  Spices: <Leaf className="h-6 w-6 text-orange-600" />,
  "Ice Cream": <IceCream className="h-6 w-6 text-pink-500" />,
  Default: <Home className="h-6 w-6 text-blue-500" />,
};

export default function CategoryScroller({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="bg-white border-b shadow-sm py-3">
      <div className="flex overflow-x-auto gap-4 px-4 scrollbar-hide">
        {categories.map((category) => {
          const Icon = categoryIcons[category.name] || categoryIcons.Default;

          return (
            <Link
              href={`/category/${category.id}`}
              key={category.id}
              className="flex flex-col items-center gap-2 w-20 shrink-0 group cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="h-14 w-14 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors border border-transparent group-hover:border-blue-200">
                {Icon}
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