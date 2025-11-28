"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { updateProductQuick } from "../../../actions"; // Import your server action

type ProductData = {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  is_featured: boolean;
};

type PriceData = {
  retailer: number;
  wholesaler: number;
  mrp: number;
};

export default function QuickEditForm({ 
  product, 
  prices 
}: { 
  product: ProductData, 
  prices: PriceData 
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initial State
  const initialState = {
    name: product.name,
    sku: product.sku,
    stock: product.stock_quantity,
    is_featured: product.is_featured,
    price_retailer: prices.retailer,
    price_wholesaler: prices.wholesaler,
    mrp: prices.mrp
  };

  // Current State
  const [formData, setFormData] = useState(initialState);

  // Check if dirty (naive comparison works well for flat objects)
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialState);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Create FormData object for the Server Action
    const payload = new FormData();
    payload.append("product_id", String(product.id));
    payload.append("name", formData.name);
    payload.append("sku", formData.sku);
    payload.append("stock", String(formData.stock));
    if (formData.is_featured) payload.append("is_featured", "on");
    
    payload.append("price_retailer", String(formData.price_retailer));
    payload.append("price_wholesaler", String(formData.price_wholesaler));
    payload.append("mrp", String(formData.mrp));

    const result = await updateProductQuick(payload);
    
    setIsLoading(false);

    if (result?.error) {
      alert(result.error);
    } else {
      setIsSuccess(true);
      // Small delay to show the "Success" state before redirecting
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Core Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Variant Name</Label>
            <Input 
              id="name"
              value={formData.name} 
              onChange={e => handleChange("name", e.target.value)} 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input 
                id="sku"
                value={formData.sku} 
                onChange={e => handleChange("sku", e.target.value)} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input 
                id="stock"
                type="number" 
                value={formData.stock} 
                onChange={e => handleChange("stock", Number(e.target.value))} 
                required 
              />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-blue-600">Retailer ₹</Label>
              <Input 
                type="number" 
                value={formData.price_retailer} 
                onChange={e => handleChange("price_retailer", Number(e.target.value))}
                required 
              />
            </div>
            <div>
              <Label className="text-purple-600">Wholesaler ₹</Label>
              <Input 
                type="number" 
                value={formData.price_wholesaler} 
                onChange={e => handleChange("price_wholesaler", Number(e.target.value))}
                required 
              />
            </div>
            <div>
              <Label>MRP (Display) ₹</Label>
              <Input 
                type="number" 
                value={formData.mrp} 
                onChange={e => handleChange("mrp", Number(e.target.value))}
                required 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-t-4 border-t-blue-600">
        <CardContent className="pt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Switch 
               id="feat" 
               checked={formData.is_featured} 
               onCheckedChange={v => handleChange("is_featured", v)} 
             />
             <Label htmlFor="feat">Feature on Homepage</Label>
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isLoading || isSuccess}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isDirty || isLoading || isSuccess}
              className={`min-w-[140px] ${isSuccess ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} text-white`}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : isSuccess ? (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}