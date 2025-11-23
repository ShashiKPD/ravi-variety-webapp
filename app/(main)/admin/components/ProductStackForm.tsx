"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, Trash2, Save, Loader2, Copy, 
  ChevronDown, ChevronUp, ImageIcon, Star, Box
} from "lucide-react";
import { createProductStack } from "../products/actions";

type Props = {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
};

type ProductInput = {
  id: number;
  isExpanded: boolean;
  name: string;
  description: string;
  sku: string;
  stock: string;
  mrp: string;
  price_retailer: string;
  price_wholesaler: string;
  size_option: string; 
  is_featured: boolean;
  images: File[];
  previewUrls: string[];
};

export default function ProductStackForm({ categories, brands }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  
  const [products, setProducts] = useState<ProductInput[]>([
    { 
      id: Date.now(), 
      isExpanded: true,
      name: "", 
      description: "", 
      sku: "", 
      stock: "", 
      mrp: "", 
      price_retailer: "", 
      price_wholesaler: "", 
      size_option: "", 
      is_featured: false,
      images: [], 
      previewUrls: [] 
    }
  ]);

  // --- Actions ---

  const addVariant = () => {
    const collapsedProducts = products.map(p => ({ ...p, isExpanded: false }));
    const previousProduct = products[products.length - 1];
    
    setProducts([
      ...collapsedProducts, 
      { 
        id: Date.now(), 
        isExpanded: true,
        name: previousProduct.name ? `${previousProduct.name.split(' - ')[0]} - ` : "", 
        description: previousProduct.description || "", 
        sku: "", 
        stock: "", 
        mrp: "", 
        price_retailer: "", 
        price_wholesaler: "", 
        size_option: "", 
        is_featured: false, 
        images: [], 
        previewUrls: [] 
      }
    ]);
  };

  const duplicateProduct = (productToClone: ProductInput) => {
    const collapsedProducts = products.map(p => ({ ...p, isExpanded: false }));
    
    setProducts([
      ...collapsedProducts,
      {
        ...productToClone,
        id: Date.now(),
        isExpanded: true,
        sku: "", 
        name: `${productToClone.name} (Copy)`,
        images: [],
        previewUrls: [] 
      }
    ]);
  };

  const removeProduct = (id: number) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const toggleExpand = (id: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, isExpanded: !p.isExpanded } : p));
  };

  const updateField = (id: number, field: keyof ProductInput, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleImageChange = (id: number, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    const urls = fileArray.map(file => URL.createObjectURL(file));

    setProducts(products.map(p => 
      p.id === id ? { ...p, images: fileArray, previewUrls: urls } : p
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("brand_id", brandId);
    formData.append("category_id", categoryId);

    const productsMeta = products.map(p => ({
      name: p.name,
      description: p.description,
      sku: p.sku,
      stock: p.stock,
      mrp: p.mrp,
      price_retailer: p.price_retailer,
      price_wholesaler: p.price_wholesaler,
      is_featured: p.is_featured,
      options: { size: p.size_option } 
    }));
    formData.append("products_meta", JSON.stringify(productsMeta));

    products.forEach((p, index) => {
      p.images.forEach((file, fileIdx) => {
        formData.append(`product_${index}_image_${fileIdx}`, file);
      });
    });

    const result = await createProductStack(formData);
    setIsSubmitting(false);

    if (result.error) {
      alert(result.error);
    } else {
      alert("Product and variants created successfully!");
      window.location.href = "/admin/products/new";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-20">
      
      {/* --- 1. Global Classification --- */}
      <Card className="border-l-4 border-l-slate-800 shadow-sm gap-2 py-6">
        <CardHeader className=" border-b bg-gray-50/50">
          <CardTitle className="text-base font-medium text-gray-900">Classification</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
          <div>
             <Label className="mb-1.5 block text-xs font-medium text-gray-600">Brand</Label>
             <Select value={brandId} onValueChange={setBrandId} required>
               <SelectTrigger className="w-full h-9 text-sm">
                 <SelectValue placeholder="Select Brand" />
               </SelectTrigger>
               <SelectContent>
                 {brands.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
               </SelectContent>
             </Select>
          </div>
          <div>
             <Label className="mb-1.5 block text-xs font-medium text-gray-600">Category</Label>
             <Select value={categoryId} onValueChange={setCategoryId} required>
               <SelectTrigger className="w-full h-9 text-sm">
                 <SelectValue placeholder="Select Category" />
               </SelectTrigger>
               <SelectContent>
                 {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
               </SelectContent>
             </Select>
          </div>
        </CardContent>
      </Card>

      {/* --- 2. The Product Stack --- */}
      <div className="space-y-3">
        {products.map((p, index) => (
          <Card key={p.id} className={`transition-all duration-200 ${p.isExpanded ? 'ring-1 ring-blue-500/20 shadow-md' : 'opacity-90 hover:opacity-100'} border-l-4 border-l-blue-500 p-6`}>
            
            {/* --- Card Header --- */}
            <div className=" flex items-center justify-between bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => toggleExpand(p.id)}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold w-6 h-6 ${index === 0 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
                  {index === 0 ? <Box className="h-3 w-3" /> : `#${index}`}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate leading-tight">
                    Product #{index + 1}
                  </h3>
                  <div className="text-xs text-gray-500 flex gap-2 items-center mt-0.5 h-4">
                     <span className="truncate max-w-[150px] sm:max-w-[250px]">{p.name || "(New Product)"}</span>
                     {p.size_option && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{p.size_option}</Badge>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                 <Button type="button" size="sm" variant="ghost" onClick={() => duplicateProduct(p)} className="h-7 px-2 text-xs text-gray-600 hover:text-blue-600" title="Copy Details">
                    <Copy className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Copy</span>
                 </Button>
                 <Button type="button" size="icon" variant="ghost" onClick={() => removeProduct(p.id)} disabled={products.length === 1} className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                 </Button>
                 <Button type="button" size="icon" variant="ghost" onClick={() => toggleExpand(p.id)} className="h-7 w-7 text-gray-500">
                    {p.isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                 </Button>
              </div>
            </div>

            {/* --- Expanded Content --- */}
            {p.isExpanded && (
              <CardContent className="p-0 pt-3 border-t space-y-4 bg-white">
                
                {/* Identity Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8">
                    <Label className="mb-1.5 block text-xs font-medium text-gray-700">Product Name</Label>
                    <Input 
                      required 
                      value={p.name} 
                      onChange={e => updateField(p.id, 'name', e.target.value)} 
                      placeholder="e.g. Aachi Mango Achar 1kg Jar"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Label className="mb-1.5 block text-blue-600 font-semibold text-xs">Size / Variant Label</Label>
                    <Input 
                      required 
                      value={p.size_option} 
                      onChange={e => updateField(p.id, 'size_option', e.target.value)} 
                      placeholder="e.g. 1kg" 
                      className="h-9 text-sm border-blue-100 focus-visible:ring-blue-500"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Shown on selection buttons.</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-gray-700">Description</Label>
                  <Textarea 
                    value={p.description} 
                    onChange={e => updateField(p.id, 'description', e.target.value)} 
                    placeholder="Product details..."
                    className="h-20 text-sm resize-none py-2"
                  />
                </div>

                <Separator />

                {/* Pricing & Stock */}
                <div className="bg-slate-50/80 p-3 rounded-md border border-slate-100">
                  <Label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wider">Pricing & Inventory</Label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-[10px] text-slate-500 font-medium mb-1 block">SKU Code</Label>
                      <Input required value={p.sku} onChange={e => updateField(p.id, 'sku', e.target.value)} className="bg-white h-8 text-sm px-2" placeholder="CODE-01" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500 font-medium mb-1 block">Stock</Label>
                      <Input required type="number" value={p.stock} onChange={e => updateField(p.id, 'stock', e.target.value)} className="bg-white h-8 text-sm px-2" placeholder="0" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500 font-medium mb-1 block">Retailer ₹</Label>
                      <Input required type="number" value={p.price_retailer} onChange={e => updateField(p.id, 'price_retailer', e.target.value)} className="bg-white h-8 text-sm px-2" placeholder="0.00" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500 font-medium mb-1 block">Wholesaler ₹</Label>
                      <Input required type="number" value={p.price_wholesaler} onChange={e => updateField(p.id, 'price_wholesaler', e.target.value)} className="bg-white h-8 text-sm px-2" placeholder="0.00" />
                    </div>
                    <div className="col-span-2 lg:col-span-4 mt-1">
                        <div className="w-full lg:w-1/4">
                          <Label className="text-[10px] text-slate-500 font-medium mb-1 block">MRP (Display Price) ₹</Label>
                          <Input required type="number" value={p.mrp} onChange={e => updateField(p.id, 'mrp', e.target.value)} className="bg-white h-8 text-sm px-2" placeholder="0.00" />
                        </div>
                    </div>
                  </div>
                </div>

                {/* Images & Featured */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 block text-xs font-medium text-gray-700">Product Images</Label>
                    <div className="flex flex-col sm:flex-row items-start gap-3">
                       <label className="cursor-pointer flex flex-col items-center justify-center w-full sm:w-24 h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-md hover:bg-white hover:border-blue-400 transition-all group">
                         <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleImageChange(p.id, e.target.files)} />
                         <ImageIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 mb-1" />
                         <span className="text-[10px] text-gray-500 group-hover:text-blue-600 font-medium">Upload</span>
                       </label>
                       
                       {/* Preview Strip */}
                       <div className="flex gap-2 overflow-x-auto py-1 w-full h-20 items-center scrollbar-hide">
                          {p.previewUrls.length > 0 ? (
                            p.previewUrls.map((url, idx) => (
                              <img key={idx} src={url} alt="Preview" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-gray-200 flex-shrink-0 bg-white" />
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic px-2">No images selected</span>
                          )}
                       </div>
                    </div>
                  </div>

                  {/* Featured Toggle */}
                  <div className="flex items-center p-3 border rounded-md bg-yellow-50/40 border-yellow-100/50 h-auto sm:h-20 self-end">
                     <div className="flex items-center gap-3 w-full">
                        <Switch 
                           checked={p.is_featured} 
                           onCheckedChange={v => updateField(p.id, 'is_featured', v)} 
                           id={`feat-${p.id}`}
                           className="data-[state=checked]:bg-yellow-500"
                        />
                        <div className="flex-1">
                           <Label htmlFor={`feat-${p.id}`} className="font-medium cursor-pointer flex items-center gap-1.5 text-gray-900 text-sm">
                             <Star className={`h-3.5 w-3.5 ${p.is_featured ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} /> 
                             Feature on Homepage
                           </Label>
                           <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Show in 'Featured' section.</p>
                        </div>
                     </div>
                  </div>
                </div>

              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* --- Footer Actions --- */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
        <Button type="button" variant="outline" onClick={addVariant} className="h-10 border-dashed border-2 border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 bg-transparent text-sm font-medium">
          <Plus className="h-4 w-4 mr-2" /> Add Variant
        </Button>
        <Button type="submit" className="h-10 px-6 shadow-md font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          Save All
        </Button>
      </div>

    </form>
  );
}