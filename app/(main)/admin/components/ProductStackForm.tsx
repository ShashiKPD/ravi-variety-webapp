"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Save, Loader2, Layers, ListPlus } from "lucide-react";
import { createProductStack } from "../products/actions";
import { updateProductFamily, deleteProductVariant } from "../products/family-actions";
import { ProductInput, ExistingGroup } from "./product-form/types";
import Classification from "./product-form/Classification";
import ProductCard from "./product-form/ProductCard";
import { useRouter } from "next/navigation";

type Props = {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
  existingGroups: ExistingGroup[];
  units: { id: number; short_name: string }[]; // <--- NEW PROP
  initialData?: {
    groupId: number;
    brandId: number;
    categoryId: number;
    variants: any[];
  };
};

export default function ProductStackForm({ categories, brands, existingGroups, units, initialData }: Props) {
  const router = useRouter();
  const isEditMode = !!initialData;
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandId, setBrandId] = useState(initialData ? String(initialData.brandId) : "");
  const [categoryId, setCategoryId] = useState(initialData ? String(initialData.categoryId) : "");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const initializeProducts = () => {
    if (initialData && initialData.variants.length > 0) {
      return initialData.variants.map(v => ({
        id: v.id,
        isExpanded: false,
        name: v.name,
        description: v.description || "",
        sku: v.sku,
        stock: String(v.stock_quantity),
        mrp: v.mrp || "", 
        price_retailer: v.price_retailer || "",
        price_wholesaler: v.price_wholesaler || "",
        size_option: v.options?.size || "",
        unit_id: v.unit_id ? String(v.unit_id) : "", // <--- NEW: Initialize Unit
        is_featured: v.is_featured,
        images: [],
        previewUrls: v.image_urls || []
      }));
    }
    return [{ 
      id: Date.now(), isExpanded: true, name: "", description: "", sku: "", 
      stock: "", mrp: "", price_retailer: "", price_wholesaler: "", 
      size_option: "", unit_id: "", is_featured: false, images: [], previewUrls: [] 
    }];
  };

  const [products, setProducts] = useState<ProductInput[]>(initializeProducts);

  const addVariant = () => {
    const collapsed = products.map(p => ({ ...p, isExpanded: false }));
    const prev = products[products.length - 1];
    setProducts([...collapsed, { 
      id: `temp-${Date.now()}` as any, 
      isExpanded: true, 
      name: prev.name ? `${prev.name.split(' - ')[0]} - ` : "", 
      description: prev.description || "", sku: "", stock: "", mrp: "", 
      price_retailer: "", price_wholesaler: "", size_option: "", 
      unit_id: prev.unit_id || "", // <--- Copy unit from previous
      is_featured: false, images: [], previewUrls: [] 
    }]);
  };

  const removeProduct = async (id: number | string) => {
    // Temp items: Just remove from state
    if (String(id).startsWith("temp-")) {
      if (products.length > 1) setProducts(products.filter(p => p.id !== id));
      return;
    }

    // Real DB items (Edit Mode): Delete via Server Action
    if (confirm("Permanently delete this variant? If it's the last one, the group will be deleted.")) {
      const res = await deleteProductVariant(Number(id));
      if (res.error) {
        alert(res.error);
      } else {
        const newProducts = products.filter(p => p.id !== id);
        setProducts(newProducts);
        
        // If we deleted the last variant, redirect out
        if (newProducts.length === 0) {
          router.push("/admin/products");
          router.refresh();
        }
      }
    }
  };

  const toggleExpand = (id: number | string) => {
    setProducts(products.map(p => p.id === id ? { ...p, isExpanded: !p.isExpanded } : p));
  };

  const updateField = (id: number | string, field: keyof ProductInput, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const updateImages = (id: number | string, images: File[], urls: string[]) => {
    setProducts(products.map(p => p.id === id ? { ...p, images, previewUrls: urls } : p));
  };
  
  const duplicateProduct = (p: ProductInput) => {
    const collapsed = products.map(x => ({ ...x, isExpanded: false }));
    setProducts([...collapsed, { 
      ...p, 
      id: `temp-${Date.now()}` as any, 
      isExpanded: true, 
      sku: "", 
      name: `${p.name} (Copy)`, 
      images: [], 
      previewUrls: [] 
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditMode && mode === 'existing' && !selectedGroupId) return alert("Select a product family.");
    if ((!isEditMode && mode === 'new') && (!brandId || !categoryId)) return alert("Select Brand & Category.");
    if (isEditMode && (!brandId || !categoryId)) return alert("Brand & Category are required.");

    setIsSubmitting(true);
    const formData = new FormData();

    // --- MAP DATA (INCLUDING UNIT ID) ---
    const mapProductToMeta = (p: ProductInput) => ({
      id: p.id,
      name: p.name, description: p.description, sku: p.sku, stock: p.stock, 
      mrp: p.mrp, price_retailer: p.price_retailer, price_wholesaler: p.price_wholesaler, 
      is_featured: p.is_featured, options: { size: p.size_option }, 
      unit_id: p.unit_id ? Number(p.unit_id) : null, // <--- ADDED
      image_count: p.images.length,
      new_image_count: p.images.length, 
      existing_images: p.previewUrls.filter(url => url.startsWith("http"))
    });

    const productsMeta = products.map(mapProductToMeta);
    formData.append("products_meta", JSON.stringify(productsMeta));

    // Append images
    products.forEach((p, i) => {
        // For Create Mode uses this key pattern
        p.images.forEach((file, j) => formData.append(`product_${i}_image_${j}`, file));
        // For Edit Mode uses this key pattern
        p.images.forEach((file, j) => formData.append(`product_${i}_new_image_${j}`, file));
    });

    if (isEditMode) {
      formData.append("group_id", String(initialData!.groupId));
      formData.append("brand_id", brandId);
      formData.append("category_id", categoryId);
      const result = await updateProductFamily(formData);
      setIsSubmitting(false);
      if (result.error) alert(result.error); else alert(result.success);
    } else {
      formData.append("mode", mode);
      if (mode === 'existing') formData.append("group_id", selectedGroupId);
      else { formData.append("brand_id", brandId); formData.append("category_id", categoryId); }
      
      const result = await createProductStack(formData);
      setIsSubmitting(false);
      if (result.error) alert(result.error);
      else { alert(result.success); window.location.href = "/admin/products/new"; }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      
      {!isEditMode && (
        <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-lg">
          <button type="button" onClick={() => setMode('new')} className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${mode === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
            <Layers className="w-4 h-4" /> Create New Family
          </button>
          <button type="button" onClick={() => setMode('existing')} className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${mode === 'existing' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
            <ListPlus className="w-4 h-4" /> Add to Existing
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <Classification 
          mode={isEditMode ? 'new' : mode} 
          brands={brands} categories={categories} existingGroups={existingGroups}
          brandId={brandId} setBrandId={setBrandId} categoryId={categoryId} setCategoryId={setCategoryId}
          selectedGroupId={selectedGroupId} setSelectedGroupId={setSelectedGroupId}
        />

        <div className="space-y-3">
           {products.map((p, index) => (
             <ProductCard 
               key={p.id} 
               product={p} 
               index={index} 
               totalCount={products.length} 
               mode={isEditMode ? 'existing' : mode}
               units={units}
               allowDeleteLast={isEditMode} // <--- PASSED TRUE IN EDIT MODE
               onUpdate={updateField} onToggleExpand={toggleExpand} onDuplicate={duplicateProduct} 
               onRemove={removeProduct} onImageUpdate={updateImages}
             />
           ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
          <Button type="button" variant="outline" onClick={addVariant} className="h-10 border-dashed border-2 border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 bg-transparent text-sm font-medium">
            <Plus className="h-4 w-4 mr-2" /> Add Variant
          </Button>
          
          <Button type="submit" className="h-10 px-6 shadow-md font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditMode ? "Update Family" : (mode === 'existing' ? "Save Variants" : "Save Products")}
          </Button>
        </div>
      </form>
    </div>
  );
}