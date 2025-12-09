"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Box, Copy, Trash2, ChevronDown, Tag, PackageOpen } from "lucide-react";
import { ProductInput } from "./types";
import ImageManager from "./ImageManager";
import BulkPricingManager from "./BulkPricingManager";
import AdminScannerInput from "@/components/scanner/AdminScannerInput";

type Props = {
  product: ProductInput;
  index: number;
  totalCount: number;
  mode: 'new' | 'existing';
  allowDeleteLast?: boolean;
  units: { id: number; name: string; short_name: string }[]; 
  onUpdate: (id: number | string, field: keyof ProductInput, value: any) => void;
  onToggleExpand: (id: number | string) => void;
  onDuplicate: (product: ProductInput) => void;
  onRemove: (id: number | string) => void;
  onImageUpdate: (id: number | string, images: File[], urls: string[]) => void;
};

export default function ProductCard({ 
  product, index, totalCount, mode, allowDeleteLast = false, units,
  onUpdate, onToggleExpand, onDuplicate, onRemove, onImageUpdate 
}: Props) {
  
  const canDelete = totalCount > 1 || allowDeleteLast;

  return (
    <div className={`
      bg-white rounded-xl border border-gray-200 transition-all duration-300
      ${product.isExpanded ? 'shadow-lg ring-1 ring-blue-500/20 border-blue-200' : 'hover:border-blue-300 hover:shadow-sm'}
    `}>
      
      {/* HEADER BAR */}
      <div 
        className="flex items-center justify-between p-3 sm:p-4 cursor-pointer select-none group" 
        onClick={() => onToggleExpand(product.id)}
      >
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
          <div className={`flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-bold w-8 h-8 sm:w-10 sm:h-10 transition-colors
            ${index === 0 ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-700'}
          `}>
            {index === 0 ? <Box className="h-4 w-4" /> : `#${index + 1}`}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {product.name || <span className="text-gray-400 italic">New Variant</span>}
              </h3>
              {product.size_option && (
                <Badge variant="secondary" className="hidden sm:flex text-[10px] h-5 px-1.5 font-medium bg-gray-100 text-gray-600">
                  {product.size_option}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
              <span className="font-mono bg-gray-50 px-1 rounded border border-gray-100">
                {product.sku || "NO SKU"}
              </span>
              <span>•</span>
              <span className={!product.stock || product.stock === '0' ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                {product.stock || 0} in stock
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 pl-2" onClick={e => e.stopPropagation()}>
          <Button 
            type="button" size="icon" variant="ghost" 
            onClick={() => onDuplicate(product)} 
            className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button 
            type="button" size="icon" variant="ghost" 
            onClick={() => onRemove(product.id)} 
            disabled={!canDelete} 
            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all disabled:opacity-30"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <div className={`transition-transform duration-300 ${product.isExpanded ? 'rotate-180' : ''}`}>
             <Button type="button" size="icon" variant="ghost" onClick={() => onToggleExpand(product.id)} className="h-8 w-8 text-gray-400">
               <ChevronDown className="h-5 w-5" />
             </Button>
          </div>
        </div>
      </div>

      {/* EXPANDED FORM BODY */}
      {product.isExpanded && (
        <div className="border-t border-gray-100 p-4 sm:p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
          
          {/* Identity Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-1.5">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</Label>
              <Input 
                required 
                value={product.name} 
                onChange={e => onUpdate(product.id, 'name', e.target.value)} 
                placeholder="e.g. Aachi Mango Achar" 
                className="bg-gray-50/50 focus:bg-white transition-colors placeholder:text-xs sm:placeholder:text-sm"
              />
            </div>
            <div className="md:col-span-4 space-y-1.5">
              <Label className="text-xs font-medium text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" /> Size / Variant
              </Label>
              <Input 
                required 
                value={product.size_option} 
                onChange={e => onUpdate(product.id, 'size_option', e.target.value)} 
                placeholder="e.g. 1kg" 
                className="bg-blue-50/30 border-blue-100 focus:border-blue-300 focus:ring-blue-200 placeholder:text-xs sm:placeholder:text-sm" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</Label>
            <Textarea 
              value={product.description} 
              onChange={e => onUpdate(product.id, 'description', e.target.value)} 
              placeholder="Product ingredients, usage..." 
              className="h-20 resize-none bg-gray-50/50 focus:bg-white placeholder:text-xs sm:placeholder:text-sm" 
            />
          </div>

          {/* Pricing & Inventory Block */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-200 bg-gray-100/50">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Inventory & Pricing</span>
            </div>
            <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">SKU Code</Label>
                <Input 
                  required 
                  value={product.sku} 
                  onChange={e => onUpdate(product.id, 'sku', e.target.value)} 
                  className="font-mono text-sm bg-white placeholder:text-xs sm:placeholder:text-sm" 
                  placeholder="CODE-01" 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 flex items-center gap-1">Barcode (Optional)</Label>
                <AdminScannerInput
                  value={product.barcode}
                  onChange={(val) => onUpdate(product.id, 'barcode', val)}
                  className="font-mono text-sm bg-white placeholder:text-xs"
                  placeholder="EAN / UPC"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Stock Qty</Label>
                <Input 
                  required type="number" 
                  value={product.stock} 
                  onChange={e => onUpdate(product.id, 'stock', e.target.value)} 
                  className="bg-white placeholder:text-xs sm:placeholder:text-sm" 
                  placeholder="0" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Retailer Price (₹)</Label>
                <Input 
                  required type="number" 
                  value={product.price_retailer} 
                  onChange={e => onUpdate(product.id, 'price_retailer', e.target.value)} 
                  className="bg-white font-medium text-gray-900 placeholder:text-xs sm:placeholder:text-sm" 
                  placeholder="0.00" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Wholesaler Price (₹)</Label>
                <Input 
                  required type="number" 
                  value={product.price_wholesaler} 
                  onChange={e => onUpdate(product.id, 'price_wholesaler', e.target.value)} 
                  className="bg-white font-medium text-gray-900 placeholder:text-xs sm:placeholder:text-sm" 
                  placeholder="0.00" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">MRP (Display) ₹</Label>
                <Input 
                  required type="number" 
                  value={product.mrp} 
                  onChange={e => onUpdate(product.id, 'mrp', e.target.value)} 
                  className="bg-white text-gray-500 placeholder:text-xs sm:placeholder:text-sm" 
                  placeholder="0.00" 
                />
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-4 bg-white p-2 rounded border border-gray-100">
                 <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Selling Unit</Label>
                    <Select value={product.unit_id || ""} onValueChange={(val) => onUpdate(product.id, 'unit_id', val)}>
                      <SelectTrigger className="h-9 w-full bg-gray-50 text-xs sm:text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.short_name})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>

                 {/* NEW: Pack Size */}
                 <div className="space-y-1.5">
                    <Label className="text-xs text-blue-600 font-medium flex items-center gap-1">
                       <PackageOpen className="w-3 h-3" /> Items per Unit
                    </Label>
                    <div className="relative">
                       <Input 
                         type="number" 
                         min="1"
                         value={product.pack_size} 
                         onChange={e => onUpdate(product.id, 'pack_size', e.target.value)} 
                         className="bg-blue-50/50 border-blue-100 text-sm h-9 placeholder:text-xs" 
                         placeholder="1" 
                       />
                       <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 pointer-events-none">
                         pcs
                       </span>
                    </div>
                 </div>
              </div>

            </div>
          </div>
          {/*  BULK PRICING SECTION */}
          <div className="mt-4">
            <BulkPricingManager 
              tiers={product.bulkTiers || []} 
              onChange={(newTiers) => onUpdate(product.id, 'bulkTiers', newTiers)} 
            />
          </div>

          {/* Media & Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ImageManager 
              images={product.images} 
              previewUrls={product.previewUrls}
              onAddImages={(files) => {
                 if(!files) return;
                 const newFiles = Array.from(files);
                 const newUrls = newFiles.map(f => URL.createObjectURL(f));
                 onImageUpdate(product.id, [...product.images, ...newFiles], [...product.previewUrls, ...newUrls]);
              }}
              onRemoveImage={(idx) => {
                 onImageUpdate(product.id, product.images.filter((_, i) => i !== idx), product.previewUrls.filter((_, i) => i !== idx));
              }}
              onReorder={(newImgs, newUrls) => {
                 onImageUpdate(product.id, newImgs, newUrls);
              }}
            />

            <div className="lg:col-span-2">
              <div className="flex items-center p-4 border rounded-xl bg-amber-50/50 border-amber-100 transition-colors hover:bg-amber-50">
                <div className="flex items-center gap-4 w-full">
                  <Switch 
                    checked={product.is_featured} 
                    onCheckedChange={v => onUpdate(product.id, 'is_featured', v)} 
                    id={`feat-${product.id}`} 
                    className="data-[state=checked]:bg-amber-500" 
                  />
                  <div className="flex-1 cursor-pointer" onClick={() => onUpdate(product.id, 'is_featured', !product.is_featured)}>
                    <Label htmlFor={`feat-${product.id}`} className="font-semibold text-gray-900 text-sm flex items-center gap-2 cursor-pointer">
                      Feature on Homepage
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">This item will appear in the 'Featured' carousel.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}