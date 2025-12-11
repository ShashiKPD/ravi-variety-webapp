"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Image as ImageIcon, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner"; 

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type Props = {
  type: "Category" | "Supercategory"; // Removed "Brand"
  parents?: { id: number; name: string }[]; 
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: string }>;
};

export default function TaxonomyForm({ type, parents, onSubmit }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setFileError(null);
    
    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get("image") as File;
    
    // Clean up empty parent selection
    if (formData.get("supercategory_id") === "0") {
      formData.delete("supercategory_id");
    }

    try {
      let uploadedUrl = "";

      if (imageFile && imageFile.size > 0) {
        if (imageFile.size > MAX_FILE_SIZE) {
          throw new Error("File is too large. Max limit is 5MB.");
        }

        const supabase = createClient();
        const fileExt = imageFile.name.split('.').pop();
        const folder = `${type.toLowerCase()}s`; 
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile);

        if (uploadError) throw new Error("Image upload failed: " + uploadError.message);

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
          
        uploadedUrl = data.publicUrl;
      }

      formData.delete("image");
      if (uploadedUrl) {
        formData.append("image_url", uploadedUrl);
      }

      const res = await onSubmit(formData);
      
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`${type} created successfully!`);
        formRef.current?.reset();
        setPreview(null);
        setFileError(null);
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      setFileError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        const msg = "File is too large (Max 5MB).";
        toast.error(msg);
        setFileError(msg);
        e.target.value = ""; 
        setPreview(null);
        return;
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        
        {/* Image Input Section */}
        <div className="w-full sm:w-auto shrink-0 flex flex-col gap-2">
          <Label htmlFor="image" className="text-xs font-medium text-gray-500">
            {type} Icon/Image <span className="text-red-500">*</span>
          </Label>
          
          <div className="flex flex-col gap-2">
            <label 
              className={`flex flex-col items-center justify-center w-32 h-32 sm:w-24 sm:h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden relative ${
                fileError ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-contain p-1" />
              ) : (
                <div className="flex flex-col items-center text-center p-2">
                  <ImageIcon className={`w-6 h-6 ${fileError ? "text-red-400" : "text-gray-400"}`} />
                  <span className="text-[10px] text-gray-500 mt-1 sm:hidden">Tap to upload</span>
                </div>
              )}
              
              <input 
                ref={fileInputRef}
                name="image" 
                type="file" 
                className="hidden" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={handleFileChange} 
              />
            </label>
            
            {fileError && (
              <p className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fileError}
              </p>
            )}
          </div>
        </div>

        {/* Inputs Section */}
        <div className="flex-1 w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{type} Name</Label>
            <Input name="name" placeholder={`e.g. ${type === 'Category' ? 'Pickles' : 'Groceries'}`} required />
          </div>

          {parents && parents.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="supercategory_id" className="text-gray-600">Parent Supercategory</Label>
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
          
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto mt-2 bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Create {type}
          </Button>
        </div>
      </div>
    </form>
  );
}