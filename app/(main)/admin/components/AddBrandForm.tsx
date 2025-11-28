"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { addBrands } from "../brands/actions"; // Import Brand Action

type InputItem = { id: number; name: string };

export default function AddBrandForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<InputItem[]>([{ id: 1, name: "" }]);

  const addItem = () => setBrands([...brands, { id: Date.now(), name: "" }]);
  
  const removeItem = (id: number) => {
    if (brands.length > 1) setBrands(brands.filter((b) => b.id !== id));
  };

  const updateItem = (id: number, val: string) => {
    setBrands(brands.map((b) => (b.id === id ? { ...b, name: val } : b)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData();
    brands.forEach(b => formData.append("brand_name", b.name));

    startTransition(async () => {
      const result = await addBrands(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage(result.success ?? "");
        setBrands([{ id: 1, name: "" }]);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {brands.map((brand, index) => (
          <div key={brand.id} className="flex items-end gap-2">
            <div className="flex-1">
              <Label className="mb-2 block text-xs font-medium text-gray-500">
                Brand Name #{index + 1}
              </Label>
              <Input
                value={brand.name}
                onChange={(e) => updateItem(brand.id, e.target.value)}
                placeholder="e.g., Aachi"
                required
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeItem(brand.id)}
              disabled={brands.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" /> Add Another
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Brands
        </Button>
      </div>

      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}