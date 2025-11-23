"use client";

import { useState } from "react";
import { addProduct } from "../products/actions"; // 1. Import the Server Action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 2. Define the type for the categories we'll receive as a prop
type Category = {
  id: number;
  name: string;
};

// 3. The component accepts the categories as a prop
export default function AddProductForm({
  categories,
}: {
  categories: Category[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);

    // 4. Call the Server Action directly!
    //    No need for fetch() or an API route.
    const result = await addProduct(formData);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage(result.success || "Product added!");
      // Reset the form
      (event.target as HTMLFormElement).reset();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* --- Form Fields --- */}
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" type="text" required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" type="text" required />
      </div>
      <div>
        <Label htmlFor="price_retailer">Retailer Price</Label>
        <Input
          id="price_retailer"
          name="price_retailer"
          type="number"
          step="0.01"
          required
        />
      </div>
      <div>
        <Label htmlFor="price_wholesaler">Wholesaler Price</Label>
        <Input
          id="price_wholesaler"
          name="price_wholesaler"
          type="number"
          step="0.01"
          required
        />
      </div>
      <div>
        <Label htmlFor="category_id">Category</Label>
        <Select name="category_id" required>
          <SelectTrigger id="category_id">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="image">Product Image</Label>
        <Input id="image" name="image" type="file" accept="image/*" required />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Adding Product..." : "Add Product"}
      </Button>

      {/* --- Messages --- */}
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </form>
  );
}