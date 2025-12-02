"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";

type Props = {
  type: "Brand" | "Category";
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: string }>;
};

export default function TaxonomyForm({ type, onSubmit }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
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
          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain p-1" />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
            <input name="image" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        {/* Name Input */}
        <div className="flex-1 space-y-2">
          <Label htmlFor="name">{type} Name</Label>
          <Input name="name" placeholder={`e.g. ${type === 'Brand' ? 'Aachi' : 'Pickles'}`} required />
          <Button type="submit" disabled={isLoading} className="mt-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save {type}
          </Button>
        </div>
      </div>
    </form>
  );
}