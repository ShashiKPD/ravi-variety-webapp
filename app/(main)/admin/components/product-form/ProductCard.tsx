"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Box, Copy, Trash2, ChevronUp, ChevronDown, Star } from "lucide-react";
import { ProductInput } from "./types";
import ImageManager from "./ImageManager";

type Props = {
  product: ProductInput;
  index: number;
  totalCount: number;
  mode: 'new' | 'existing';
  allowDeleteLast?: boolean; // <--- NEW PROP
  units: { id: number; short_name: string }[];
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
  
  // Logic: Can delete if there's more than 1 OR if specific permission is given (Edit Mode)
  const canDelete = totalCount > 1 || allowDeleteLast;

  return (
    <Card className={`transition-all duration-200 ${product.isExpanded ? 'ring-1 ring-blue-500/20 shadow-md' : 'opacity-90 hover:opacity-100'} border-l-4 border-l-blue-500 p-6`}>
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => onToggleExpand(product.id)}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold w-6 h-6 ${index === 0 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
            {index === 0 ? <Box className="h-3 w-3" /> : `#${index}`}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate leading-tight">
              {mode === 'existing' ? `New Variant #${index + 1}` : `Product #${index + 1}`}
            </h3>
            <div className="text-xs text-gray-500 flex gap-2 items-center mt-0.5 h-4">
              <span className="truncate max-w-[150px] sm:max-w-[250px]">{product.name || "(New Product)"}</span>
              {product.size_option && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{product.size_option}</Badge>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <Button type="button" size="sm" variant="ghost" onClick={() => onDuplicate(product)} className="h-7 px-2 text-xs text-gray-600 hover:text-blue-600">
            <Copy className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            onClick={() => onRemove(product.id)} 
            disabled={!canDelete} // <--- UPDATED CHECK
            className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" variant="ghost" onClick={() => onToggleExpand(product.id)} className="h-7 w-7 text-gray-500">
            {product.isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* EXPANDED CONTENT */}
      {product.isExpanded && (
        <CardContent className="p-0 pt-3 border-t space-y-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <Label className="mb-1.5 block text-xs font-medium text-gray-700">Product Name</Label>
              <Input required value={product.name} onChange={e => onUpdate(product.id, 'name', e.target.value)} placeholder="e.g. Aachi Mango Achar 1kg Jar" className="h-9 text-sm" />
            </div>
            <div className="md:col-span-4">
              <Label className="mb-1.5 block text-blue-600 font-semibold text-xs">Size / Variant Label</Label>
              <Input required value={product.size_option} onChange={e => onUpdate(product.id, 'size_option', e.target.value)} placeholder="e.g. 1kg" className="h-9 text-sm border-blue-100 focus-visible:ring-blue-500" />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-medium text-gray-700">Description</Label>
            <Textarea value={product.description} onChange={e => onUpdate(product.id, 'description', e.target.value)} placeholder="Product details..." className="h-20 text-sm resize-none py-2" />
          </div>

          <Separator />

          <div className="bg-slate-50/80 p-3 rounded-md border border-slate-100">
            <Label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wider">Pricing & Inventory</Label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div><Label className="text-[10px] text-slate-500 font-medium mb-1">SKU Code</Label><Input required value={product.sku} onChange={e => onUpdate(product.id, 'sku', e.target.value)} className="bg-white h-8 text-sm px-2" placeholder="CODE-01" /></div>
              <div><Label className="text-[10px] text-slate-500 font-medium mb-1">Stock</Label><Input required type="number" value={product.stock} onChange={e => onUpdate(product.id, 'stock', e.target.value)} className="bg-white h-8 text-sm px-2" placeholder="0" /></div>
              <div><Label className="text-[10px] text-slate-500 font-medium mb-1">Retailer ₹</Label><Input required type="number" value={product.price_retailer} onChange={e => onUpdate(product.id, 'price_retailer', e.target.value)} className="bg-white h-8 text-sm px-2" placeholder="0.00" /></div>
              <div><Label className="text-[10px] text-slate-500 font-medium mb-1">Wholesaler ₹</Label><Input required type="number" value={product.price_wholesaler} onChange={e => onUpdate(product.id, 'price_wholesaler', e.target.value)} className="bg-white h-8 text-sm px-2" placeholder="0.00" /></div>
              <div className="col-span-2 lg:col-span-4 mt-1 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] text-slate-500 font-medium mb-1 block">MRP (Display) ₹</Label>
                  <Input required type="number" value={product.mrp} onChange={e => onUpdate(product.id, 'mrp', e.target.value)} className="bg-white h-8 text-sm px-2" placeholder="0.00" />
                </div>
                
                {/* --- NEW UNIT SELECTOR --- */}
                <div>
                  <Label className="text-[10px] text-slate-500 font-medium mb-1 block">Selling Unit</Label>
                  <select 
                    className="flex h-8 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={product.unit_id}
                    onChange={e => onUpdate(product.id, 'unit_id', e.target.value)}
                  >
                    <option value="">Select...</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.short_name}</option>)}
                  </select>
                </div>
                {/* ------------------------- */}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

            <div className="lg:col-span-2 flex items-center p-3 border rounded-md bg-yellow-50/40 border-yellow-100/50">
              <div className="flex items-center gap-3 w-full">
                <Switch checked={product.is_featured} onCheckedChange={v => onUpdate(product.id, 'is_featured', v)} id={`feat-${product.id}`} className="data-[state=checked]:bg-yellow-500" />
                <div className="flex-1">
                  <Label htmlFor={`feat-${product.id}`} className="font-medium cursor-pointer flex items-center gap-1.5 text-gray-900 text-sm">
                    <Star className={`h-3.5 w-3.5 ${product.is_featured ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} /> Feature on Homepage
                  </Label>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Show in 'Featured' section.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}