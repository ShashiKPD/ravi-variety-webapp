"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Filter } from "lucide-react";

type FilterProps = {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
  sizes: string[];
  hideCategories?: boolean;
};

type FilterState = {
  categories: Set<string>;
  brands: Set<string>;
  sizes: Set<string>;
  priceRange: [number, number];
};

export default function SearchFilters({ categories, brands, sizes, hideCategories = false }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Local State
  const [filters, setFilters] = useState<FilterState>({
    categories: new Set(),
    brands: new Set(),
    sizes: new Set(),
    priceRange: [0, 5000]
  });

  // 2. Sync from URL
  useEffect(() => {
    const cats = new Set(searchParams.get("categories")?.split(",").filter(Boolean));
    const brs = new Set(searchParams.get("brands")?.split(",").filter(Boolean));
    const szs = new Set(searchParams.get("sizes")?.split(",").filter(Boolean));
    const min = Number(searchParams.get("min_price")) || 0;
    const max = Number(searchParams.get("max_price")) || 5000;

    setFilters({ categories: cats, brands: brs, sizes: szs, priceRange: [min, max] });
  }, [searchParams]);

  // 3. Logic
  const isDirty = useMemo(() => {
    const urlCats = new Set(searchParams.get("categories")?.split(",").filter(Boolean));
    const urlBrs = new Set(searchParams.get("brands")?.split(",").filter(Boolean));
    const urlSzs = new Set(searchParams.get("sizes")?.split(",").filter(Boolean));
    const urlMin = Number(searchParams.get("min_price")) || 0;
    const urlMax = Number(searchParams.get("max_price")) || 5000;

    const setsEqual = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every(v => b.has(v));
    const priceEqual = filters.priceRange[0] === urlMin && filters.priceRange[1] === urlMax;

    return !(setsEqual(filters.categories, urlCats) && setsEqual(filters.brands, urlBrs) && setsEqual(filters.sizes, urlSzs) && priceEqual);
  }, [filters, searchParams]);

  const toggleSetItem = (key: keyof Omit<FilterState, 'priceRange'>, value: string) => {
    setFilters(prev => {
      const newSet = new Set(prev[key]);
      if (newSet.has(value)) newSet.delete(value); else newSet.add(value);
      return { ...prev, [key]: newSet };
    });
  };

  const setPrice = (val: number[]) => {
    setFilters(prev => ({ ...prev, priceRange: [val[0], val[1]] }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    const updateParam = (key: string, set: Set<string>) => {
      if (set.size > 0) params.set(key, Array.from(set).join(",")); else params.delete(key);
    };

    updateParam("categories", filters.categories);
    updateParam("brands", filters.brands);
    updateParam("sizes", filters.sizes);

    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 5000) {
      params.set("min_price", filters.priceRange[0].toString());
      params.set("max_price", filters.priceRange[1].toString());
    } else {
      params.delete("min_price");
      params.delete("max_price");
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const isChecked = (key: keyof Omit<FilterState, 'priceRange'>, value: string) => filters[key].has(value);

  // NOTE: Removed Button from here to place it manually in layouts
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price */}
      <div className="px-1">
        <h4 className="text-sm font-semibold mb-3">Price Range</h4>
        <Slider defaultValue={[0, 5000]} max={5000} step={50} value={filters.priceRange} onValueChange={setPrice} className="mb-4" />
        <div className="flex items-center justify-between text-sm">
          <div className="border border-gray-300 px-3 py-1 rounded bg-white w-20 text-center font-medium text-gray-700">₹{filters.priceRange[0]}</div>
          <span className="text-gray-400 text-xs">to</span>
          <div className="border border-gray-300 px-3 py-1 rounded bg-white w-20 text-center font-medium text-gray-700">₹{filters.priceRange[1]}+</div>
        </div>
      </div>

      {/* Categories */}
      {!hideCategories && (
        <Accordion type="single" collapsible defaultValue="categories">
          <AccordionItem value="categories" className="border-b border-gray-100 last:border-0">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">Categories</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-1 pb-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox id={`cat-${cat.id}`} checked={isChecked("categories", String(cat.id))} onCheckedChange={() => toggleSetItem("categories", String(cat.id))} className="h-4 w-4" />
                    <Label htmlFor={`cat-${cat.id}`} className="text-sm font-normal cursor-pointer text-gray-700">{cat.name}</Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Brands */}
      <Accordion type="single" collapsible defaultValue="brands">
        <AccordionItem value="brands" className="border-b border-gray-100 last:border-0">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">Brands</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1 pb-2">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox id={`brand-${brand.id}`} checked={isChecked("brands", String(brand.id))} onCheckedChange={() => toggleSetItem("brands", String(brand.id))} className="h-4 w-4" />
                  <Label htmlFor={`brand-${brand.id}`} className="text-sm font-normal cursor-pointer text-gray-700">{brand.name}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Sizes */}
      {sizes.length > 0 && (
        <Accordion type="single" collapsible defaultValue="sizes">
          <AccordionItem value="sizes" className="border-none">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">Size / Type</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 pt-1">
                {sizes.map((size) => (
                  <div key={size} onClick={() => toggleSetItem("sizes", size)} className={`text-xs px-3 py-1.5 border rounded-full cursor-pointer transition-all ${filters.sizes.has(size) ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"}`}>
                    {size}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block w-64 shrink-0 space-y-6 pr-6 border-r h-fit sticky top-24">
        <div>
          <h3 className="text-lg font-bold mb-4">Filters</h3>
          <FilterContent />
          <div className="pt-6">
            <Button onClick={applyFilters} disabled={!isDirty} className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium">Apply Filters</Button>
          </div>
        </div>
      </div>
      
      {/* MOBILE DRAWER (Improved Layout) */}
      <div className="lg:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 w-full sm:w-auto"><Filter className="h-4 w-4" /> Filter Products</Button>
          </SheetTrigger>
          
          {/* Use 'flex flex-col p-0' to control layout manually */}
          <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0 flex flex-col h-full bg-white">
            
            {/* 1. Header (Fixed) */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <SheetTitle className="text-xl font-bold">Filters</SheetTitle>
              <SheetDescription className="sr-only">Filter products</SheetDescription>
            </div>

            {/* 2. Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <FilterContent />
            </div>

            {/* 3. Footer (Fixed) */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 safe-area-bottom">
              <Button 
                onClick={applyFilters} 
                disabled={!isDirty} 
                className="w-full h-12 text-base bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-sm"
              >
                Apply Filters
              </Button>
            </div>

          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}