import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import QuickEditForm from "./components/QuickEditForm";
import BackButton from "@/app/(main)/components/BackButton";

export default async function QuickEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Product
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id, name, sku, stock_quantity, is_featured, description, unit_id,
      product_groups ( id, name, brands(name) )
    `)
    .eq("id", id)
    .single();

  if (error || !product) notFound();

  // 2. Fetch Prices (All Tiers)
  const { data: prices } = await supabase
    .from("price_tiers")
    .select("*")
    .eq("product_id", id);

  // Extract Base Prices
  const retailerPrice = prices?.find(p => p.role === 'retailer' && p.min_quantity === 1);
  const wholesalerPrice = prices?.find(p => p.role === 'wholesaler' && p.min_quantity === 1);

  // Extract Bulk Tiers
  const bulkTiers = prices
    ?.filter(p => p.min_quantity > 1)
    .map(p => ({
      minQuantity: p.min_quantity,
      unitPrice: p.unit_price,
      role: p.role
    })) || [];

  const productData = {
    id: product.id,
    name: product.name,
    sku: product.sku,
    stock_quantity: product.stock_quantity,
    is_featured: product.is_featured,
    description: product.description || ""
  };

  const priceData = {
    retailer: retailerPrice?.unit_price || 0,
    wholesaler: wholesalerPrice?.unit_price || 0,
    mrp: retailerPrice?.mrp || 0,
    bulkTiers: bulkTiers as any[] // Pass bulk tiers
  };
  
  // Safe access for nested relations
  // Supabase might return brands as an array [{name: "..."}] or an object {name: "..."}
  const groupRaw = product.product_groups;
  // @ts-ignore - Handle single or array return from Supabase
  const group = Array.isArray(groupRaw) ? groupRaw[0] : groupRaw;
  
  const brandsRaw = group?.brands;
  // @ts-ignore
  const brand = Array.isArray(brandsRaw) ? brandsRaw[0] : brandsRaw;
  
  const brandName = brand?.name || "Unknown Brand";
  const groupName = group?.name || "Unknown Group";
  const groupId = group?.id;
  
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <BackButton href="/admin/products" label="Back to Inventory" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quick Edit</h1>
            <p className="text-sm text-gray-500 font-medium">
              {brandName} • {groupName}
            </p>
          </div>
          
          {groupId && (
            <Button variant="outline" size="sm" className="gap-2 bg-white" asChild>
              <Link href={`/admin/products/family/${groupId}/edit`}>
                <ExternalLink className="w-4 h-4" /> Edit Family
              </Link>
            </Button>
          )}
        </div>
      </div>

      <QuickEditForm product={productData} prices={priceData} />

    </div>
  );
}