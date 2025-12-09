"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Save, Loader2, Layers, ListPlus, Check } from "lucide-react";
import { createProductStack } from "../products/actions";
import { updateProductFamily, deleteProductVariant } from "../products/family-actions";
import { ProductInput, ExistingGroup } from "./product-form/types";
import Classification from "./product-form/Classification";
import ProductCard from "./product-form/ProductCard";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
  existingGroups: ExistingGroup[];
  units: { id: number; name: string; short_name: string }[]; 
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

  // 1. UPDATED INITIALIZATION LOGIC
  const initializeProducts = () => {
    if (initialData && initialData.variants.length > 0) {
      return initialData.variants.map(v => {
        // Filter out the base price tiers (min_qty = 1)
        // The base prices are already mapped to price_retailer/wholesaler fields
        const bulkTiers = v.price_tiers 
          ? v.price_tiers
              .filter((t: any) => t.min_quantity > 1)
              .map((t: any) => ({
                minQuantity: t.min_quantity,
                unitPrice: t.unit_price,
                role: t.role
              }))
          : [];

        return {
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
          unit_id: v.unit_id ? String(v.unit_id) : "", 
          is_featured: v.is_featured,
          images: [],
          previewUrls: v.image_urls || [],
          bulkTiers: bulkTiers // <--- LOAD EXISTING BULK TIERS
        };
      });
    }
    return [{ 
      id: Date.now(), isExpanded: true, name: "", description: "", sku: "", 
      stock: "", mrp: "", price_retailer: "", price_wholesaler: "", 
      size_option: "", unit_id: "", is_featured: false, 
      images: [], previewUrls: [], bulkTiers: [] // <--- DEFAULT EMPTY
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
      unit_id: prev.unit_id || "", 
      is_featured: false, images: [], previewUrls: [], bulkTiers: [] 
    }]);
  };

  const removeProduct = async (id: number | string) => {
    if (String(id).startsWith("temp-")) {
      if (products.length > 1) setProducts(products.filter(p => p.id !== id));
      return;
    }

    if (confirm("Permanently delete this variant?")) {
      const res = await deleteProductVariant(Number(id));
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Variant deleted");
        const newProducts = products.filter(p => p.id !== id);
        setProducts(newProducts);
        
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
    toast.success("Variant duplicated");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditMode && mode === 'existing' && !selectedGroupId) return toast.error("Select a product family.");
    if ((!isEditMode && mode === 'new') && (!brandId || !categoryId)) return toast.error("Select Brand & Category.");
    if (isEditMode && (!brandId || !categoryId)) return toast.error("Brand & Category are required.");

    setIsSubmitting(true);
    const formData = new FormData();

    // 2. UPDATED MAPPING LOGIC
    const mapProductToMeta = (p: ProductInput) => ({
      id: p.id,
      name: p.name, description: p.description, sku: p.sku, stock: p.stock, 
      mrp: p.mrp, price_retailer: p.price_retailer, price_wholesaler: p.price_wholesaler, 
      is_featured: p.is_featured, options: { size: p.size_option }, 
      unit_id: p.unit_id ? Number(p.unit_id) : null,
      image_count: p.images.length,
      new_image_count: p.images.length, 
      existing_images: p.previewUrls.filter(url => url.startsWith("http")),
      
      // SEND BULK TIERS TO SERVER
      bulk_tiers: p.bulkTiers.map(t => ({
        min_quantity: t.minQuantity,
        unit_price: t.unitPrice,
        role: t.role,
        mrp: p.mrp // Inherit MRP from main product
      }))
    });

    const productsMeta = products.map(mapProductToMeta);
    formData.append("products_meta", JSON.stringify(productsMeta));

    products.forEach((p, i) => {
        p.images.forEach((file, j) => formData.append(`product_${i}_image_${j}`, file));
        p.images.forEach((file, j) => formData.append(`product_${i}_new_image_${j}`, file));
    });

    let result;
    if (isEditMode) {
      formData.append("group_id", String(initialData!.groupId));
      formData.append("brand_id", brandId);
      formData.append("category_id", categoryId);
      result = await updateProductFamily(formData);
    } else {
      formData.append("mode", mode);
      if (mode === 'existing') formData.append("group_id", selectedGroupId);
      else { formData.append("brand_id", brandId); formData.append("category_id", categoryId); }
      
      result = await createProductStack(formData);
    }

    setIsSubmitting(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      if (!isEditMode) window.location.href = "/admin/products"; 
    }
  };

  return (
    <div className="space-y-8">
      
      {!isEditMode && (
        <div className="bg-gray-100 p-1.5 rounded-lg inline-flex w-full sm:w-auto">
          <button 
            type="button" 
            onClick={() => setMode('new')} 
            className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${mode === 'new' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {mode === 'new' && <Check className="w-4 h-4" />}
            <Layers className="w-4 h-4" /> Create Family
          </button>
          <button 
            type="button" 
            onClick={() => setMode('existing')} 
            className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${mode === 'existing' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {mode === 'existing' && <Check className="w-4 h-4" />}
            <ListPlus className="w-4 h-4" /> Add to Existing
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        <Classification 
          mode={isEditMode ? 'new' : mode} 
          brands={brands} categories={categories} existingGroups={existingGroups}
          brandId={brandId} setBrandId={setBrandId} categoryId={categoryId} setCategoryId={setCategoryId}
          selectedGroupId={selectedGroupId} setSelectedGroupId={setSelectedGroupId}
        />

        <div className="space-y-4">
           {products.map((p, index) => (
             <ProductCard 
               key={p.id} 
               product={p} 
               index={index} 
               totalCount={products.length} 
               mode={isEditMode ? 'existing' : mode}
               units={units}
               allowDeleteLast={isEditMode}
               onUpdate={updateField} onToggleExpand={toggleExpand} onDuplicate={duplicateProduct} 
               onRemove={removeProduct} onImageUpdate={updateImages}
             />
           ))}
        </div>

        <div className="sticky bottom-4 z-20 flex flex-col sm:flex-row justify-between gap-3 p-4 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg ring-1 ring-black/5">
          <Button 
            type="button" 
            variant="outline" 
            onClick={addVariant} 
            className="h-11 border-dashed border-2 border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 bg-transparent text-sm font-medium active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Variant
          </Button>
          
          <Button 
            type="submit" 
            className="h-11 px-8 shadow-md font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-all" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditMode ? "Update Product Family" : "Save All Products"}
          </Button>
        </div>

      </form>
    </div>
  );
}