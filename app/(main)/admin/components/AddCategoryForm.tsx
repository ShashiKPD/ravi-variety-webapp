"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { addCategories } from "../categories/actions"; // Import our new Server Action

type CategoryInput = {
  id: number;
  name: string;
};

export default function AddCategoryForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Manage a dynamic list of category inputs
  const [categories, setCategories] = useState<CategoryInput[]>([
    { id: 1, name: "" },
  ]);

  // 2. Function to add a new, empty input field
  const addCategoryInput = () => {
    setCategories([...categories, { id: Date.now(), name: "" }]);
  };

  // 3. Function to remove an input field
  const removeCategoryInput = (id: number) => {
    // Always leave at least one input
    if (categories.length > 1) {
      setCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  // 4. Function to update the text in an input
  const handleNameChange = (id: number, newName: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, name: newName } : cat
      )
    );
  };

  // 5. Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    // Manually build FormData from our state
    const formData = new FormData();
    for (const category of categories) {
      formData.append("category_name", category.name);
    }

    startTransition(async () => {
      const result = await addCategories(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage(result.success);
        setCategories([{ id: 1, name: "" }]); // Reset form on success
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={category.id} className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor={`category_${category.id}`} className="mb-2 block">
                Category Name {index + 1}
              </Label>
              <Input
                id={`category_${category.id}`}
                name="category_name" // This name is used in formData.getAll()
                type="text"
                value={category.name}
                onChange={(e) => handleNameChange(category.id, e.target.value)}
                placeholder="e.g., Spices"
                required
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeCategoryInput(category.id)}
              disabled={categories.length <= 1} // Don't allow removing the last one
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={addCategoryInput}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Save Categories
        </Button>
      </div>

      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}