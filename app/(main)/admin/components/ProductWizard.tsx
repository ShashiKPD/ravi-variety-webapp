"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { createBulkProduct } from "../products/actions";

// Helper types
type VariantInput = {
  id: number; // Temp ID for UI list
  name: string;
  sku: string;
  stock: string;
  mrp: string;
  price_retailer: string;
  price_wholesaler: string;
};

type Props = {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
};

export default function ProductWizard({ categories, brands }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- State: Parent Product ---
  const [productName, setProductName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // --- State: Variants ---
  const [variants, setVariants] = useState<VariantInput[]>([
    { id: 1, name: "", sku: "", stock: "", mrp: "", price_retailer: "", price_wholesaler: "" }
  ]);

  const addVariantRow = () => {
    setVariants([
      ...variants,
      { id: Date.now(), name: "", sku: "", stock: "", mrp: "", price_retailer: "", price_wholesaler: "" }
    ]);
  };

  const removeVariantRow = (id: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id));
    }
  };

  const updateVariant = (id: number, field: keyof VariantInput, value: string) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("brand_id", brandId);
    formData.append("category_id", categoryId);
    formData.append("description", description);
    if (imageFile) formData.append("image", imageFile);

    // Convert variants to JSON string for the server
    formData.append("variants", JSON.stringify(variants));

    const result = await createBulkProduct(formData);
    setIsSubmitting(false);

    if (result.error) {
      alert(result.error);
    } else {
      alert(result.success);
      // Optional: Reset form or redirect
      window.location.href = "/admin";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* --- Section 1: Parent Product Details --- */}
      <Card>
        <CardHeader>
          <CardTitle>1. Product Group Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label>Product Name (e.g., Aachi Mango Achar)</Label>
            <Input required value={productName} onChange={e => setProductName(e.target.value)} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Brand</Label>
              <Select onValueChange={setBrandId} required>
                <SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger>
                <SelectContent>
                  {brands.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select onValueChange={setCategoryId} required>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea required value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          
          <div>
            <Label>Main Image</Label>
            <Input type="file" accept="image/*" required onChange={e => setImageFile(e.target.files?.[0] || null)} />
          </div>
        </CardContent>
      </Card>

      {/* --- Section 2: Variants --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>2. Add Variants (Sizes)</CardTitle>
          <Button type="button" onClick={addVariantRow} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Variant
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.map((variant, index) => (
            <div key={variant.id} className="border p-4 rounded-lg bg-gray-50 relative">
              <div className="absolute right-2 top-2">
                <Button type="button" variant="ghost" size="icon" onClick={() => removeVariantRow(variant.id)} disabled={variants.length === 1}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              
              <h4 className="text-sm font-bold mb-3 text-gray-500">Variant #{index + 1}</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <Label className="text-xs">Name (e.g. 1kg)</Label>
                  <Input required value={variant.name} onChange={e => updateVariant(variant.id, 'name', e.target.value)} placeholder="1kg" />
                </div>
                <div>
                  <Label className="text-xs">SKU Code</Label>
                  <Input required value={variant.sku} onChange={e => updateVariant(variant.id, 'sku', e.target.value)} placeholder="SKU-001" />
                </div>
                <div>
                  <Label className="text-xs">Stock Qty</Label>
                  <Input required type="number" value={variant.stock} onChange={e => updateVariant(variant.id, 'stock', e.target.value)} placeholder="100" />
                </div>
              </div>

              <Separator className="my-3" />
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">MRP (₹)</Label>
                  <Input required type="number" value={variant.mrp} onChange={e => updateVariant(variant.id, 'mrp', e.target.value)} placeholder="200" />
                </div>
                <div>
                  <Label className="text-xs">Retailer Price (₹)</Label>
                  <Input required type="number" value={variant.price_retailer} onChange={e => updateVariant(variant.id, 'price_retailer', e.target.value)} placeholder="180" />
                </div>
                <div>
                  <Label className="text-xs">Wholesaler Price (₹)</Label>
                  <Input required type="number" value={variant.price_wholesaler} onChange={e => updateVariant(variant.id, 'price_wholesaler', e.target.value)} placeholder="150" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* --- Submit --- */}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Save Product & Variants
      </Button>
    </form>
  );
}