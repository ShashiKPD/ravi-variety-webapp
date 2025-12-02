import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import QuickEditForm from "./components/QuickEditForm";

export default async function QuickEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Product
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id, name, sku, stock_quantity, is_featured,
      product_groups ( id, name, brands(name) )
    `)
    .eq("id", id)
    .single();

  if (error || !product) notFound();

  // 2. Fetch Prices
  const { data: prices } = await supabase
    .from("price_tiers")
    .select("*")
    .eq("product_id", id)
    .eq("min_quantity", 1);

  const retailerPrice = prices?.find(p => p.role === 'retailer');
  const wholesalerPrice = prices?.find(p => p.role === 'wholesaler');

  // Prepare simple objects to pass to client component
  const productData = {
    id: product.id,
    name: product.name,
    sku: product.sku,
    stock_quantity: product.stock_quantity,
    is_featured: product.is_featured
  };

  const priceData = {
    retailer: retailerPrice?.unit_price || 0,
    wholesaler: wholesalerPrice?.unit_price || 0,
    mrp: retailerPrice?.mrp || 0
  };

  // Safe access for nested relations (Handling arrays returned by Supabase)
  const group = Array.isArray(product.product_groups) ? product.product_groups[0] : product.product_groups;
  const brands = group?.brands;
  const brand = Array.isArray(brands) ? brands[0] : brands;
  
  const brandName = brand?.name || "Unknown Brand";
  const groupName = group?.name || "Unknown Group";
  
  const groupId = group?.id;
  
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quick Edit</h1>
            <p className="text-sm text-gray-500 font-medium">
              {brandName} • {groupName}
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-gray-600"
          asChild // Use asChild to make it a link
        >
          <Link href={`/admin/products/family/${groupId}/edit`}>
            <ExternalLink className="w-4 h-4" />
            Edit Full Family
          </Link>
        </Button>
      </div>

      {/* Render Client Form */}
      <QuickEditForm product={productData} prices={priceData} />

    </div>
  );
}