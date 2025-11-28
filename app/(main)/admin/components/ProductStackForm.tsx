"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Save, Loader2, Layers, ListPlus } from "lucide-react";
import { createProductStack } from "../products/actions";
import { ProductInput } from "./product-form/types";
import Classification from "./product-form/Classification";
import ProductCard from "./product-form/ProductCard";
import { ExistingGroup } from "../components/product-form/types";

type Props = {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
  existingGroups: ExistingGroup[];
};

export default function ProductStackForm({ categories, brands, existingGroups }: Props) {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Classification State
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Product Stack State
  const [products, setProducts] = useState<ProductInput[]>([
    { 
      id: Date.now(), isExpanded: true, name: "", description: "", sku: "", 
      stock: "", mrp: "", price_retailer: "", price_wholesaler: "", 
      size_option: "", is_featured: false, images: [], previewUrls: [] 
    }
  ]);

  // --- Logic Helpers ---
  const addVariant = () => {
    const collapsed = products.map(p => ({ ...p, isExpanded: false }));
    const prev = products[products.length - 1];
    setProducts([...collapsed, { 
      id: Date.now(), isExpanded: true, 
      name: prev.name ? `${prev.name.split(' - ')[0]} - ` : "", 
      description: prev.description || "", sku: "", stock: "", mrp: "", 
      price_retailer: "", price_wholesaler: "", size_option: "", 
      is_featured: false, images: [], previewUrls: [] 
    }]);
  };

  const duplicateProduct = (p: ProductInput) => {
    const collapsed = products.map(x => ({ ...x, isExpanded: false }));
    setProducts([...collapsed, { ...p, id: Date.now(), isExpanded: true, sku: "", name: `${p.name} (Copy)`, images: [], previewUrls: [] }]);
  };

  const removeProduct = (id: number) => {
    if (products.length > 1) setProducts(products.filter(p => p.id !== id));
  };

  const toggleExpand = (id: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, isExpanded: !p.isExpanded } : p));
  };

  const updateField = (id: number, field: keyof ProductInput, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const updateImages = (id: number, images: File[], urls: string[]) => {
    setProducts(products.map(p => p.id === id ? { ...p, images, previewUrls: urls } : p));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'existing' && !selectedGroupId) return alert("Select a product family.");
    if (mode === 'new' && (!brandId || !categoryId)) return alert("Select Brand & Category.");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("mode", mode);
    
    if (mode === 'existing') formData.append("group_id", selectedGroupId);
    else {
      formData.append("brand_id", brandId);
      formData.append("category_id", categoryId);
    }

    const productsMeta = products.map(p => ({
      name: p.name, description: p.description, sku: p.sku, stock: p.stock, 
      mrp: p.mrp, price_retailer: p.price_retailer, price_wholesaler: p.price_wholesaler, 
      is_featured: p.is_featured, options: { size: p.size_option }, image_count: p.images.length
    }));
    formData.append("products_meta", JSON.stringify(productsMeta));

    products.forEach((p, i) => {
      p.images.forEach((file, j) => formData.append(`product_${i}_image_${j}`, file));
    });

    const result = await createProductStack(formData);
    setIsSubmitting(false);

    if (result.error) alert(result.error);
    else {
      alert(result.success);
      window.location.href = "/admin/products/new";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      
      {/* 1. Mode Selector */}
      <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-lg">
        <button type="button" onClick={() => setMode('new')} className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${mode === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
          <Layers className="w-4 h-4" /> Create New Family
        </button>
        <button type="button" onClick={() => setMode('existing')} className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${mode === 'existing' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
          <ListPlus className="w-4 h-4" /> Add to Existing
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 2. Classification */}
        <Classification 
          mode={mode} brands={brands} categories={categories} existingGroups={existingGroups}
          brandId={brandId} setBrandId={setBrandId} categoryId={categoryId} setCategoryId={setCategoryId}
          selectedGroupId={selectedGroupId} setSelectedGroupId={setSelectedGroupId}
        />

        {/* 3. Product Stack */}
        <div className="space-y-3">
           {products.map((p, index) => (
             <ProductCard 
               key={p.id} product={p} index={index} totalCount={products.length} mode={mode}
               onUpdate={updateField} onToggleExpand={toggleExpand} onDuplicate={duplicateProduct} 
               onRemove={removeProduct} onImageUpdate={updateImages}
             />
           ))}
        </div>

        {/* 4. Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
          <Button type="button" variant="outline" onClick={addVariant} className="h-10 border-dashed border-2 border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 bg-transparent text-sm font-medium">
            <Plus className="h-4 w-4 mr-2" /> {mode === 'existing' ? "Add Another Variant" : "Add Variant"}
          </Button>
          <Button type="submit" className="h-10 px-6 shadow-md font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            {mode === 'existing' ? "Save Variants" : "Save Products"}
          </Button>
        </div>
      </form>
    </div>
  );
}