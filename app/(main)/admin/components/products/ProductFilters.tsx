"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search, Filter, X, Star } from "lucide-react";

type FilterProps = {
  brands: { id: number; name: string; categoryIds: number[] }[];
  categories: { id: number; name: string; brandIds: number[] }[];
};

export default function ProductFilters({ brands, categories }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Initialize Local State from URL
  const initialBrand = searchParams.get("brand") || "all";
  const initialCategory = searchParams.get("category") || "all";
  const initialStatus = searchParams.get("status") || "all";
  const initialFeatured = searchParams.get("featured") === "true";

  const [brand, setBrand] = useState(initialBrand);
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState(initialStatus);
  const [featured, setFeatured] = useState(initialFeatured);

  // Sync state if URL changes externally (e.g. Back button)
  useEffect(() => {
    setBrand(searchParams.get("brand") || "all");
    setCategory(searchParams.get("category") || "all");
    setStatus(searchParams.get("status") || "all");
    setFeatured(searchParams.get("featured") === "true");
  }, [searchParams]);

  // --- FILTERING LOGIC (Using Local State) ---

  // Filter Categories based on selected Brand (Local)
  const filteredCategories = useMemo(() => {
    if (brand === "all") return categories;
    return categories.filter(c => c.brandIds.includes(Number(brand)));
  }, [brand, categories]);

  // Filter Brands based on selected Category (Local)
  const filteredBrands = useMemo(() => {
    if (category === "all") return brands;
    return brands.filter(b => b.categoryIds.includes(Number(category)));
  }, [category, brands]);

  // Auto-Reset Logic for Local State
  useEffect(() => {
    if (brand !== "all" && category !== "all") {
       const cat = categories.find(c => c.id === Number(category));
       // If current category doesn't belong to new brand, reset category
       if (cat && !cat.brandIds.includes(Number(brand))) {
         setCategory("all");
       }
    }
  }, [brand, category, categories]);

  // --- ACTIONS ---

  // Helper to build URL from current LOCAL state
  const buildParams = (newQ?: string) => {
    const params = new URLSearchParams(); // Start fresh or from searchParams? Fresh is cleaner for 'Apply'
    
    const qVal = newQ !== undefined ? newQ : (searchParams.get("q") || "");
    if (qVal) params.set("q", qVal);

    if (brand !== "all") params.set("brand", brand);
    if (category !== "all") params.set("category", category);
    if (status !== "all") params.set("status", status);
    if (featured) params.set("featured", "true");
    
    return params.toString();
  };

  const applyFilters = () => {
    const queryString = buildParams();
    router.replace(`/admin/products?${queryString}`);
  };

  // Search Logic (Updates immediately but includes pending filters)
  const handleSearch = (term: string) => {
    const queryString = buildParams(term);
    router.replace(`/admin/products?${queryString}`);
  };

  let debounceTimer: NodeJS.Timeout;
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => handleSearch(val), 500);
  };

  const clearFilters = () => {
    setBrand("all");
    setCategory("all");
    setStatus("all");
    setFeatured(false);
    router.replace("/admin/products");
  };

  const isDirty = 
    brand !== initialBrand || 
    category !== initialCategory || 
    status !== initialStatus || 
    featured !== initialFeatured;

  const FilterControls = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-col gap-3 lg:flex-row lg:items-center ${className}`}>
      
      {/* Brand Select */}
      <Select value={brand} onValueChange={setBrand}>
        <SelectTrigger className="w-full lg:w-[160px] bg-white">
          <SelectValue placeholder="Brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Brands</SelectItem>
          {filteredBrands.map((b) => (
            <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category Select */}
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full lg:w-[160px] bg-white">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {filteredCategories.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full lg:w-[140px] bg-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any Status</SelectItem>
          <SelectItem value="low">Low Stock</SelectItem>
          <SelectItem value="out">Out of Stock</SelectItem>
        </SelectContent>
      </Select>

      {/* Featured Toggle */}
      <div className="flex items-center gap-2 border rounded-md px-3 h-10 bg-white min-w-fit shadow-sm">
        <Label htmlFor="featured-toggle" className="text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-1.5">
          <Star className={`w-3.5 h-3.5 ${featured ? "fill-amber-400 text-amber-400" : "text-gray-400"}`} />
          Featured
        </Label>
        <Switch 
          id="featured-toggle"
          checked={featured}
          onCheckedChange={setFeatured}
          className="scale-75 data-[state=checked]:bg-amber-500"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          onClick={applyFilters}
          disabled={!isDirty}
          className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 shadow-sm"
        >
          Apply
        </Button>

        {(brand !== "all" || category !== "all" || status !== "all" || featured) && (
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3"
          >
            <X className="w-4 h-4 mr-2 lg:mr-0" />
            <span className="lg:hidden">Reset</span>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search SKU or Name..." 
          defaultValue={searchParams.get("q") || ""}
          onChange={onSearchChange}
          className="pl-9 bg-white"
        />
      </div>

      {/* Desktop Controls */}
      <div className="hidden lg:block">
        <FilterControls className="flex-row" />
      </div>

      {/* Mobile Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 bg-white relative">
              <Filter className="w-4 h-4 text-gray-600" />
              {(initialBrand !== "all" || initialCategory !== "all" || initialStatus !== "all" || initialFeatured) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Filter Inventory</SheetTitle>
              <SheetDescription>
                Select filters and click apply.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterControls className="flex-col" />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}