"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { updateProductQuick } from "@/app/(main)/admin/products/actions"; // Check path
import BulkPricingManager from "../../../../components/product-form/BulkPricingManager"; // Import this
import { toast } from "sonner";

type ProductData = {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  is_featured: boolean;
};

type PriceData = {
  retailer: number;
  wholesaler: number;
  mrp: number;
  bulkTiers: any[];
};

export default function QuickEditForm({ product, prices }: { product: ProductData, prices: PriceData }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    stock: product.stock_quantity,
    is_featured: product.is_featured,
    price_retailer: prices.retailer,
    price_wholesaler: prices.wholesaler,
    mrp: prices.mrp,
    bulkTiers: prices.bulkTiers
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = new FormData();
    payload.append("product_id", String(product.id));
    payload.append("name", formData.name);
    payload.append("sku", formData.sku);
    payload.append("stock", String(formData.stock));
    if (formData.is_featured) payload.append("is_featured", "on");
    
    payload.append("price_retailer", String(formData.price_retailer));
    payload.append("price_wholesaler", String(formData.price_wholesaler));
    payload.append("mrp", String(formData.mrp));
    
    payload.append("bulk_tiers", JSON.stringify(formData.bulkTiers.map(t => ({
      min_quantity: t.minQuantity,
      unit_price: t.unitPrice,
      role: t.role,
      mrp: formData.mrp
    }))));

    const result = await updateProductQuick(payload);
    
    setIsLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Product updated successfully");
      router.refresh();
    }
  };

  // Shared Input Class for mobile consistency
  const inputClass = "h-9 text-sm sm:text-base mt-1.5 bg-white transition-all focus:ring-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      
      {/* 1. Core Info */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Core Details
          </h3>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <Label htmlFor="name" className="text-xs text-gray-500 uppercase font-bold tracking-wider">Product Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={e => handleChange("name", e.target.value)} 
              required 
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div>
              <Label htmlFor="sku" className="text-xs text-gray-500 uppercase font-bold tracking-wider">SKU Code</Label>
              <Input 
                id="sku" 
                value={formData.sku} 
                onChange={e => handleChange("sku", e.target.value)} 
                required 
                className={`${inputClass} font-mono text-gray-700`}
              />
            </div>
            <div>
              <Label htmlFor="stock" className="text-xs text-gray-500 uppercase font-bold tracking-wider">Stock Qty</Label>
              <Input 
                id="stock" type="number" 
                value={formData.stock} 
                onChange={e => handleChange("stock", Number(e.target.value))} 
                required 
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pricing */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Pricing
          </h3>
        </div>
        <div className="p-4 sm:p-6 space-y-5">
          {/* Base Prices Grid - Tighter on mobile */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <div>
              <Label className="text-[10px] sm:text-xs text-blue-600 font-bold uppercase block truncate">Retailer ₹</Label>
              <Input 
                type="number" 
                value={formData.price_retailer} 
                onChange={e => handleChange("price_retailer", Number(e.target.value))}
                required 
                className={`${inputClass} font-medium border-blue-200 focus:border-blue-400`}
              />
            </div>
            <div>
              <Label className="text-[10px] sm:text-xs text-purple-600 font-bold uppercase block truncate">Wholesaler ₹</Label>
              <Input 
                type="number" 
                value={formData.price_wholesaler} 
                onChange={e => handleChange("price_wholesaler", Number(e.target.value))}
                required 
                className={`${inputClass} font-medium border-purple-200 focus:border-purple-400`}
              />
            </div>
            <div>
              <Label className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase block truncate">MRP (Show) ₹</Label>
              <Input 
                type="number" 
                value={formData.mrp} 
                onChange={e => handleChange("mrp", Number(e.target.value))}
                required 
                className={inputClass}
              />
            </div>
          </div>

          <div className="pt-2">
            <BulkPricingManager 
              tiers={formData.bulkTiers || []} 
              onChange={newTiers => handleChange("bulkTiers", newTiers)} 
            />
          </div>
        </div>
      </div>

      {/* 3. Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-gray-100/50">
         <div className="flex items-center gap-3 bg-amber-50 px-4 py-2.5 rounded-lg border border-amber-100 w-full sm:w-auto">
            <Switch 
              id="feat" 
              checked={formData.is_featured} 
              onCheckedChange={v => handleChange("is_featured", v)} 
              className="data-[state=checked]:bg-amber-500"
            />
            <div className="flex-1">
              <Label htmlFor="feat" className="text-xs sm:text-sm font-bold text-amber-800 cursor-pointer block">Feature Product</Label>
              <span className="text-[10px] text-amber-700/70 block">Show on homepage</span>
            </div>
         </div>

         <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              type="button" variant="outline" 
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1 sm:flex-none h-10 active:scale-95 transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 min-w-[140px] h-10 active:scale-95 transition-all shadow-md text-white font-medium"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Update
            </Button>
         </div>
      </div>

    </form>
  );
}