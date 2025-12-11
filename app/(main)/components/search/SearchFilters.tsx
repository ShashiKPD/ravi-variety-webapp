"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle, 
  SheetHeader,
  SheetClose
} from "@/components/ui/sheet";
import { Filter, Search, SlidersHorizontal } from "lucide-react";

// 1. Updated Type: Includes slug
type FilterItem = {
  id: number;
  name: string;
  slug: string; 
};

type FilterProps = {
  categories: FilterItem[];
  brands: FilterItem[];
  sizes: string[];
  hideCategories?: boolean;
};

type FilterState = {
  categories: Set<string>; // Stores slugs
  brands: Set<string>;     // Stores slugs
  sizes: Set<string>;
  priceRange: [number, number];
};

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 10000;

// Helper defined outside (Prevent re-renders)
const FilterList = ({ 
  items, 
  type, 
  searchVal, 
  setSearch,
  isChecked,
  toggleSetItem
}: { 
  items: FilterItem[], 
  type: 'categories' | 'brands', 
  searchVal: string, 
  setSearch: (v: string) => void,
  isChecked: (type: any, slug: string) => boolean,
  toggleSetItem: (type: any, slug: string) => void
}) => (
  <div className="space-y-3 pt-1">
    {items.length > 10 && (
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-gray-400" />
        <Input 
          placeholder={`Search ${type}...`} 
          value={searchVal}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 pl-8 text-xs bg-gray-50 border-gray-200"
        />
      </div>
    )}
    <ScrollArea className="h-full max-h-[240px] pr-3">
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start space-x-2.5 group">
            <Checkbox 
              id={`${type}-${item.id}`} 
              // 2. Updated Logic: Use item.slug
              checked={isChecked(type, item.slug)} 
              onCheckedChange={() => toggleSetItem(type, item.slug)} 
              className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label 
              htmlFor={`${type}-${item.id}`} 
              className="text-sm font-normal text-gray-600 leading-tight cursor-pointer group-hover:text-blue-600 transition-colors select-none"
            >
              {item.name}
            </Label>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-gray-400 py-2">No results found.</p>}
      </div>
    </ScrollArea>
  </div>
);

export default function SearchFilters({ categories, brands, sizes, hideCategories = false }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- STATE ---
  const [filters, setFilters] = useState<FilterState>({
    categories: new Set(),
    brands: new Set(),
    sizes: new Set(),
    priceRange: [DEFAULT_MIN, DEFAULT_MAX]
  });
  
  const [brandSearch, setBrandSearch] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // --- SYNC ---
  useEffect(() => {
    // 3. Sync Logic: Reads slugs from URL
    const cats = new Set(searchParams.get("categories")?.split(",").filter(Boolean));
    const brs = new Set(searchParams.get("brands")?.split(",").filter(Boolean));
    const szs = new Set(searchParams.get("sizes")?.split(",").filter(Boolean));
    const min = Number(searchParams.get("min_price")) || DEFAULT_MIN;
    const max = Number(searchParams.get("max_price")) || DEFAULT_MAX;

    setFilters({ categories: cats, brands: brs, sizes: szs, priceRange: [min, max] });
  }, [searchParams]);

  // --- COMPUTED ---
  const activeCount = useMemo(() => {
    let count = filters.categories.size + filters.brands.size + filters.sizes.size;
    if (filters.priceRange[0] !== DEFAULT_MIN || filters.priceRange[1] !== DEFAULT_MAX) count++;
    return count;
  }, [filters]);

  const isDirty = activeCount > 0;

  const filteredBrands = useMemo(() => 
    brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase())), 
  [brands, brandSearch]);

  const filteredCategories = useMemo(() => 
    categories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase())), 
  [categories, catSearch]);

  // --- HANDLERS ---
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

  const clearAll = () => {
    setFilters({
      categories: new Set(),
      brands: new Set(),
      sizes: new Set(),
      priceRange: [DEFAULT_MIN, DEFAULT_MAX]
    });
    router.push(window.location.pathname); 
    setIsOpen(false);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    const updateParam = (key: string, set: Set<string>) => {
      if (set.size > 0) params.set(key, Array.from(set).join(",")); else params.delete(key);
    };

    updateParam("categories", filters.categories);
    updateParam("brands", filters.brands);
    updateParam("sizes", filters.sizes);

    if (filters.priceRange[0] !== DEFAULT_MIN || filters.priceRange[1] !== DEFAULT_MAX) {
      params.set("min_price", filters.priceRange[0].toString());
      params.set("max_price", filters.priceRange[1].toString());
    } else {
      params.delete("min_price");
      params.delete("max_price");
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  // 4. Check Helper
  const isChecked = (key: keyof Omit<FilterState, 'priceRange'>, value: string) => filters[key].has(value);

  // --- MARKUP ---
  const filterMarkup = (
    <div className="space-y-1 divide-y divide-gray-100">
      
      {/* PRICE RANGE */}
      <div className="px-1 py-4">
        <h4 className="text-sm font-semibold mb-4 text-gray-900">Price Range</h4>
        <Slider 
          defaultValue={[DEFAULT_MIN, DEFAULT_MAX]} 
          max={DEFAULT_MAX} 
          step={100} 
          value={filters.priceRange} 
          onValueChange={setPrice} 
          className="mb-5" 
        />
        <div className="flex items-center justify-between text-sm">
          <div className="border border-gray-200 px-3 py-1.5 rounded-md bg-gray-50 w-24 text-center font-medium text-gray-900 shadow-sm">
            ₹{filters.priceRange[0]}
          </div>
          <span className="text-gray-400 font-medium text-xs">TO</span>
          <div className="border border-gray-200 px-3 py-1.5 rounded-md bg-gray-50 w-24 text-center font-medium text-gray-900 shadow-sm">
            ₹{filters.priceRange[1]}+
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      {!hideCategories && (
        <Accordion type="single" collapsible defaultValue="categories" className="border-none">
          <AccordionItem value="categories" className="border-none">
            <AccordionTrigger className="py-4 text-sm font-semibold hover:no-underline text-gray-900">
              Categories
              {filters.categories.size > 0 && <Badge variant="secondary" className="ml-auto mr-2 h-5 px-1.5 text-[10px]">{filters.categories.size}</Badge>}
            </AccordionTrigger>
            <AccordionContent>
              <FilterList 
                items={filteredCategories} 
                type="categories" 
                searchVal={catSearch} 
                setSearch={setCatSearch}
                isChecked={isChecked}
                toggleSetItem={toggleSetItem}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* BRANDS */}
      <Accordion type="single" collapsible defaultValue="brands" className="border-none">
        <AccordionItem value="brands" className="border-none">
          <AccordionTrigger className="py-4 text-sm font-semibold hover:no-underline text-gray-900">
            Brands
            {filters.brands.size > 0 && <Badge variant="secondary" className="ml-auto mr-2 h-5 px-1.5 text-[10px]">{filters.brands.size}</Badge>}
          </AccordionTrigger>
          <AccordionContent>
            <FilterList 
              items={filteredBrands} 
              type="brands" 
              searchVal={brandSearch} 
              setSearch={setBrandSearch}
              isChecked={isChecked}
              toggleSetItem={toggleSetItem}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* SIZES */}
      {sizes.length > 0 && (
        <div className="py-4">
          <div className="flex items-center justify-between mb-3">
             <h4 className="text-sm font-semibold text-gray-900">Pack Size</h4>
             {filters.sizes.size > 0 && <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{filters.sizes.size}</Badge>}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = filters.sizes.has(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleSetItem("sizes", size)}
                  className={`
                    text-xs px-3 py-1.5 rounded-md border transition-all font-medium
                    ${active 
                      ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" 
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex w-[260px] shrink-0 sticky top-24 h-[calc(100vh-120px)] flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" /> Filters
          </h3>
          {isDirty && (
            <button onClick={clearAll} className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline">
              Clear All
            </button>
          )}
        </div>
        
        <ScrollArea className="flex-1 px-4 min-h-0">
          {filterMarkup}
        </ScrollArea>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <Button onClick={applyFilters} className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold">
            Apply Filters
          </Button>
        </div>
      </div>

      {/* MOBILE TRIGGER */}
      <div className="md:hidden mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-white border-gray-300 text-gray-700 h-11 shadow-sm">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </span>
              {activeCount > 0 && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                  {activeCount} Active
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          
          <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col bg-white rounded-t-xl">
            <div className="mx-auto w-12 h-1.5 bg-gray-200 rounded-full mt-3 mb-1 shrink-0" />
            
            <SheetHeader className="px-5 pb-4 pt-2 border-b border-gray-100 flex flex-row items-center justify-between bg-white shrink-0">
              <SheetTitle className="text-lg font-bold">Filter Products</SheetTitle>
              {isDirty && (
                <button onClick={clearAll} className="text-sm font-medium text-red-600 hover:text-red-700 mr-8">
                  Reset
                </button>
              )}
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
              {filterMarkup}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 safe-area-bottom flex gap-3">
              <SheetClose asChild>
                 <Button variant="outline" className="flex-1 border-gray-300">Cancel</Button>
              </SheetClose>
              <Button onClick={applyFilters} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Show Results
              </Button>
            </div>

          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}