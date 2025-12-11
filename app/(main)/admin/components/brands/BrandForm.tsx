"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Image as ImageIcon, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type Category = { id: number; name: string };

type Props = {
  categories: Category[];
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: string }>;
  initialData?: any; // For edit mode inside the table later
};

export default function BrandForm({ categories, onSubmit, initialData }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialData?.image_url || null);
  const [selectedCats, setSelectedCats] = useState<number[]>(
    initialData?.brand_categories?.map((bc: any) => bc.category_id) || []
  );
  
  const formRef = useRef<HTMLFormElement>(null);

  const toggleCategory = (id: number) => {
    setSelectedCats(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get("image") as File;
    
    // Append categories manually
    formData.append("categories", JSON.stringify(selectedCats));

    try {
      let uploadedUrl = "";

      // Image Upload Logic (Same as before)
      if (imageFile && imageFile.size > 0) {
        if (imageFile.size > MAX_FILE_SIZE) throw new Error("File too large (Max 5MB)");
        
        const supabase = createClient();
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `brands/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images").upload(fileName, imageFile);

        if (uploadError) throw new Error("Image upload failed");

        const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
        uploadedUrl = data.publicUrl;
      }

      formData.delete("image");
      if (uploadedUrl) formData.append("image_url", uploadedUrl);

      const res = await onSubmit(formData);
      
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success);
        if (!initialData) {
          formRef.current?.reset();
          setPreview(null);
          setSelectedCats([]);
        }
      }

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {initialData && <input type="hidden" name="id" value={initialData.id} />}
      
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        
        {/* Image Upload */}
        <div className="w-full sm:w-auto shrink-0 flex flex-col gap-2">
          <Label className="text-xs font-medium text-gray-500">Brand Logo</Label>
          <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
            <input 
              name="image" type="file" className="hidden" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }} 
            />
          </label>
        </div>

        {/* Fields */}
        <div className="flex-1 w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Brand Name</Label>
            <Input name="name" defaultValue={initialData?.name} placeholder="e.g. Aachi" required />
          </div>

          <div className="space-y-2">
            <Label>Linked Categories</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
              {categories.map(cat => {
                const isSelected = selectedCats.includes(cat.id);
                return (
                  <Badge
                    key={cat.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-all select-none ${isSelected ? "bg-blue-600 hover:bg-blue-700" : "bg-white hover:bg-gray-100"}`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {isSelected && <Check className="w-3 h-3 mr-1" />}
                    {cat.name}
                  </Badge>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-500">Select categories this brand belongs to.</p>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto mt-2 bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {initialData ? "Save Changes" : "Create Brand"}
          </Button>
        </div>
      </div>
    </form>
  );
}