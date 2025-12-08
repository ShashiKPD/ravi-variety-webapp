"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
  brands: { id: number; name: string }[];
  categories: { id: number; name: string }[];
};

export default function ProductFilters({ brands, categories }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") || "";
  const brand = searchParams.get("brand") || "all";
  const category = searchParams.get("category") || "all";
  const status = searchParams.get("status") || "all";
  const featured = searchParams.get("featured") === "true";

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); 
    router.replace(`/admin/products?${params.toString()}`);
  };

  const handleSearch = (term: string) => {
    updateFilter("q", term);
  };

  let debounceTimer: NodeJS.Timeout;
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => handleSearch(val), 500);
  };

  const clearFilters = () => {
    router.replace("/admin/products");
  };

  // Reusable controls for both Desktop Bar and Mobile Sheet
  const FilterControls = ({ className = "" }: { className?: string }) => (
    <div className={`flex gap-3 ${className}`}>
      
      {/* Brand */}
      <Select value={brand} onValueChange={(val) => updateFilter("brand", val)}>
        <SelectTrigger className="w-full lg:w-[140px] bg-white">
          <SelectValue placeholder="Brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Brands</SelectItem>
          {brands.map((b) => (
            <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category */}
      <Select value={category} onValueChange={(val) => updateFilter("category", val)}>
        <SelectTrigger className="w-full lg:w-[140px] bg-white">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={status} onValueChange={(val) => updateFilter("status", val)}>
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
      <div className="flex items-center gap-2 border rounded-md px-3 h-10 bg-white min-w-fit">
        <Label htmlFor="featured-toggle" className="text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-1.5">
          <Star className={`w-3.5 h-3.5 ${featured ? "fill-amber-400 text-amber-400" : "text-gray-400"}`} />
          Featured
        </Label>
        <Switch 
          id="featured-toggle"
          checked={featured}
          onCheckedChange={(val) => updateFilter("featured", val ? "true" : null)}
        />
      </div>

      {/* Reset */}
      {(brand !== "all" || category !== "all" || status !== "all" || featured || q) && (
        <Button 
          variant="ghost" 
          onClick={clearFilters}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3"
        >
          <X className="w-4 h-4 mr-2 lg:mr-0" />
          <span className="lg:hidden">Reset Filters</span>
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex gap-3 items-center">
      {/* Search (Always visible) */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search SKU or Name..." 
          defaultValue={q}
          onChange={onSearchChange}
          className="pl-9 bg-white"
        />
      </div>

      {/* DESKTOP: Horizontal Bar (Visible on Large screens) */}
      {/* Changed from xl:flex to lg:flex to show on laptops */}
      <div className="hidden lg:flex flex-1 items-center">
        <FilterControls className="flex-row items-center" />
      </div>

      {/* MOBILE: Sheet (Visible on small screens) */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 bg-white relative">
              <Filter className="w-4 h-4 text-gray-600" />
              {(brand !== "all" || category !== "all" || status !== "all" || featured) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Filter Inventory</SheetTitle>
              <SheetDescription>
                Refine by brand, category, or status.
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