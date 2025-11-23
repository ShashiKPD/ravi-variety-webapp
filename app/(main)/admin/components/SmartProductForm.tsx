"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch"; // You might need to install this
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
// import { createProductSmart } from "../products/actions";

type Props = {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
};

type VariantRow = {
  id: number;
  name: string; // "1kg"
  description: string;
  sku: string;
  stock: string;
  mrp: string;
  price_retailer: string;
  price_wholesaler: string;
  images: File[]; // Store files locally
};

export default function SmartProductForm({ categories, brands }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVariable, setIsVariable] = useState(false); // THE TOGGLE

  // Base Data
  const [baseData, setBaseData] = useState({
    name: "",
    brand_id: "",
    category_id: "",
    description: "",
  });
  const [mainImage, setMainImage] = useState<File | null>(null);

  // Simple Product Data
  const [simpleData, setSimpleData] = useState({
    sku: "", stock: "", mrp: "", price_r: "", price_w: ""
  });

  // Variable Product Data
  const [variants, setVariants] = useState<VariantRow[]>([
    { id: 1, name: "", description: "", sku: "", stock: "", mrp: "", price_retailer: "", price_wholesaler: "", images: [] }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("is_variable", String(isVariable));
    formData.append("name", baseData.name);
    formData.append("brand_id", baseData.brand_id);
    formData.append("category_id", baseData.category_id);
    formData.append("description", baseData.description);
    if (mainImage) formData.append("main_image", mainImage);

    if (!isVariable) {
      // Append Simple Data
      formData.append("simple_sku", simpleData.sku);
      formData.append("simple_stock", simpleData.stock);
      formData.append("simple_mrp", simpleData.mrp);
      formData.append("simple_price_r", simpleData.price_r);
      formData.append("simple_price_w", simpleData.price_w);
    } else {
      // Append Variable Data
      // 1. Send the data structure as JSON
      const variantsJson = variants.map(v => ({
        name: v.name,
        description: v.description,
        sku: v.sku,
        stock: v.stock,
        mrp: v.mrp,
        price_retailer: v.price_retailer,
        price_wholesaler: v.price_wholesaler
      }));
      formData.append("variants_json", JSON.stringify(variantsJson));

      // 2. Append Files manually mapped by index
      variants.forEach((v, index) => {
        v.images.forEach((file, fileIndex) => {
          formData.append(`variant_${index}_image_${fileIndex}`, file);
        });
      });
    }

    const result = await createProductSmart(formData);
    setIsSubmitting(false);
    if (result.error) alert(result.error);
    else {
        alert("Success");
        window.location.href = "/admin";
    }
  };

  // ... Helpers for updating state ...
  const addVariant = () => setVariants([...variants, { id: Date.now(), name: "", description: "", sku: "", stock: "", mrp: "", price_retailer: "", price_wholesaler: "", images: [] }]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* 1. General Information (Always Visible) */}
      <Card>
        <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <Input placeholder="Product Name (e.g. Aachi Mango Achar)" required value={baseData.name} onChange={e => setBaseData({...baseData, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
             {/* Brand/Category Selects (Simplified for brevity, implement using Select component) */}
             <select className="border p-2 rounded" required onChange={e => setBaseData({...baseData, brand_id: e.target.value})}>
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
             </select>
             <select className="border p-2 rounded" required onChange={e => setBaseData({...baseData, category_id: e.target.value})}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          <Textarea placeholder="Description" required value={baseData.description} onChange={e => setBaseData({...baseData, description: e.target.value})} />
          <div>
            <Label>Main Image</Label>
            <Input type="file" accept="image/*" required onChange={e => setMainImage(e.target.files?.[0] || null)} />
          </div>
        </CardContent>
      </Card>

      {/* 2. The Toggle */}
      <div className="flex items-center space-x-2 bg-white p-4 rounded-lg border">
        <Switch id="variable-mode" checked={isVariable} onCheckedChange={setIsVariable} />
        <Label htmlFor="variable-mode">This product has variants (Size, Color, etc.)</Label>
      </div>

      {/* 3A. Simple Product Fields */}
      {!isVariable && (
        <Card>
          <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Input placeholder="SKU" required value={simpleData.sku} onChange={e => setSimpleData({...simpleData, sku: e.target.value})} />
            <Input placeholder="Stock Qty" type="number" required value={simpleData.stock} onChange={e => setSimpleData({...simpleData, stock: e.target.value})} />
            <Input placeholder="MRP" type="number" required value={simpleData.mrp} onChange={e => setSimpleData({...simpleData, mrp: e.target.value})} />
            <Input placeholder="Retailer Price" type="number" required value={simpleData.price_r} onChange={e => setSimpleData({...simpleData, price_r: e.target.value})} />
            <Input placeholder="Wholesaler Price" type="number" required value={simpleData.price_w} onChange={e => setSimpleData({...simpleData, price_w: e.target.value})} />
          </CardContent>
        </Card>
      )}

      {/* 3B. Variable Product Fields */}
      {isVariable && (
        <Card>
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>Variants</CardTitle>
            <Button type="button" onClick={addVariant} size="sm"><Plus className="w-4 h-4 mr-2" /> Add Variant</Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {variants.map((v, idx) => (
              <div key={v.id} className="border p-4 rounded bg-slate-50 relative">
                 {/* Implement detailed fields for Name, SKU, Stock, Prices, Description here.
                     Add an <Input type="file" multiple /> for the 'images' field. 
                 */}
                 <h4 className="font-bold mb-2">Variant {idx + 1}</h4>
                 <div className="grid grid-cols-2 gap-3 mb-3">
                   <Input placeholder="Variant Name (e.g. 1kg)" value={v.name} onChange={e => {
                      const newV = [...variants]; newV[idx].name = e.target.value; setVariants(newV);
                   }} />
                   {/* ... Repeat for other fields ... */}
                   <Input type="file" multiple accept="image/*" onChange={e => {
                      const newV = [...variants]; 
                      if (e.target.files) newV[idx].images = Array.from(e.target.files); 
                      setVariants(newV);
                   }} />
                 </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Product"}
      </Button>
    </form>
  );
}