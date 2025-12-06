"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  type: "Brand" | "Category" | "Supercategory"; 
  parents?: { id: number; name: string }[]; 
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: string }>;
};

export default function TaxonomyForm({ type, parents, onSubmit }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Clean up "0" value for Supercategory (treat as null)
    if (formData.get("supercategory_id") === "0") {
      formData.delete("supercategory_id");
    }

    const res = await onSubmit(formData);
    
    setIsLoading(false);
    if (res.error) {
      alert(res.error);
    } else {
      formRef.current?.reset();
      setPreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4 items-start">
        {/* Image Input */}
        <div className="shrink-0">
          <Label htmlFor="image" className="block mb-2 text-xs font-medium text-gray-500">
            {type} Logo
          </Label>
          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden transition-colors">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain p-1" />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
            <input name="image" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        <div className="flex-1 space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">{type} Name</Label>
            <Input name="name" placeholder={`e.g. ${type === 'Brand' ? 'Aachi' : type === 'Category' ? 'Pickles' : 'Groceries'}`} required />
          </div>

          {/* Parent Dropdown (Shadcn Select) */}
          {parents && parents.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="supercategory_id" className="text-gray-600">Parent Supercategory (Optional)</Label>
              <Select name="supercategory_id">
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Parent (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0" className="text-gray-500 font-medium">None (Top Level)</SelectItem>
                  {parents.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Button type="submit" disabled={isLoading} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save {type}
          </Button>
        </div>
      </div>
    </form>
  );
}