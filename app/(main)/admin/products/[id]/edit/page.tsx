import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import { updateProductQuick } from "../../actions"; // Import the new action

export default async function QuickEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Product & Prices
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      product_groups ( id, name, brands(name) )
    `)
    .eq("id", id)
    .single();

  if (error || !product) notFound();

  // 2. Fetch Prices Manually to ensure we get the specific tiers we need to edit
  const { data: prices } = await supabase
    .from("price_tiers")
    .select("*")
    .eq("product_id", id)
    .eq("min_quantity", 1); // We only quick-edit base prices

  const retailerPrice = prices?.find(p => p.role === 'retailer');
  const wholesalerPrice = prices?.find(p => p.role === 'wholesaler');

  // Server Action Wrapper
  async function updateProductAction(formData: FormData) {
    "use server";
    await updateProductQuick(formData);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Quick Edit Product</h1>
            <p className="text-sm text-gray-500">{product.product_groups?.name}</p>
          </div>
        </div>
        
        {/* Link to Full Family Edit (Future Feature) */}
        <Button variant="outline" size="sm" className="gap-2" disabled title="Coming soon">
          <ExternalLink className="w-4 h-4" />
          Edit Entire Family
        </Button>
      </div>

      <form action={updateProductAction}>
        <input type="hidden" name="product_id" value={product.id} />
        
        <Card>
          <CardHeader>
            <CardTitle>Core Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Variant Name</Label>
              <Input name="name" defaultValue={product.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SKU</Label>
                <Input name="sku" defaultValue={product.sku} />
              </div>
              <div>
                <Label>Stock Quantity</Label>
                <Input name="stock" type="number" defaultValue={product.stock_quantity} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Pricing (Base Tier)</CardTitle>
            <CardDescription>Update the standard price for 1 unit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-blue-600">Retailer ₹</Label>
                <Input name="price_retailer" type="number" defaultValue={retailerPrice?.unit_price} />
              </div>
              <div>
                <Label className="text-purple-600">Wholesaler ₹</Label>
                <Input name="price_wholesaler" type="number" defaultValue={wholesalerPrice?.unit_price} />
              </div>
              <div>
                <Label>MRP (Display) ₹</Label>
                <Input name="mrp" type="number" defaultValue={retailerPrice?.mrp} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Switch name="is_featured" defaultChecked={product.is_featured} id="feat" />
               <Label htmlFor="feat">Feature on Homepage</Label>
            </div>
            
            <Button type="submit" className="bg-blue-600">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </form>

    </div>
  );
}