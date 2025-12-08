"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trash2, ChevronUp, ChevronDown, Plus, Image as ImageIcon, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { createBanner, deleteBanner, reorderBanners } from "@/app/(main)/admin/banners/actions";
import { toast } from "sonner";

type Banner = {
  id: number;
  image_url: string;
  title: string | null;
  sort_order: number;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function BannerManager({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [isUploading, setIsUploading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // --- 1. ADD BANNER ---
  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isUploading) return;
    setIsUploading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("image") as File;
    const title = formData.get("title") as string;

    try {
      if (!file || file.size === 0) throw new Error("Please select an image");
      
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
      
      const { error: uploadError } = await supabase.storage.from("banners").upload(path, file);
      if (uploadError) throw new Error("Upload failed");

      const { data: urlData } = supabase.storage.from("banners").getPublicUrl(path);

      const submitData = new FormData();
      submitData.append("image_url", urlData.publicUrl);
      submitData.append("title", title);

      const res = await createBanner(submitData);
      if (res.error) throw new Error(res.error);

      toast.success("Banner added");
      formRef.current?.reset();
      setPreview(null);
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File too large (Max 5MB)");
        e.target.value = "";
        return;
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (formRef.current) formRef.current.reset();
  };

  // --- 2. DELETE ---
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this banner?")) return;
    
    // Optimistic Delete
    const previous = [...banners];
    setBanners(prev => prev.filter(b => b.id !== id));
    
    const res = await deleteBanner(id);
    if (res.error) {
      toast.error(res.error);
      setBanners(previous); // Rollback
    } else {
      toast.success("Banner deleted");
    }
  };

  // --- 3. REORDER (With Rollback) ---
  const moveBanner = async (index: number, direction: 'up' | 'down') => {
    if (isReordering) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    // 1. Snapshot previous state for rollback
    const previousBanners = [...banners];

    // 2. Optimistic Update
    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[newIndex];
    newBanners[newIndex] = temp;
    setBanners(newBanners);

    setIsReordering(true);
    
    try {
      // 3. Prepare payload with correct indices
      const updates = newBanners.map((b, idx) => ({
        id: b.id,
        sort_order: idx, // This ensures the DB matches the visual list order
        image_url: b.image_url, // <--- ADDED THIS
        title: b.title
      }));

      const res = await reorderBanners(updates);
      
      if (res.error) {
        throw new Error(res.error);
      }
    } catch (error: any) {
      // 4. Rollback on Error
      toast.error("Failed to save order");
      console.error(error);
      setBanners(previousBanners);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* ADD FORM */}
      <Card className="border-dashed border-2 shadow-none bg-gray-50/50">
        <CardContent className="pt-6">
          <form ref={formRef} onSubmit={handleAdd} className="flex flex-col gap-6">
            
            {/* Large Preview Area (1:2.5 Ratio) */}
            <div className="w-full relative group">
              <label 
                className={`block w-full aspect-[2.5/1] rounded-xl border-2 border-dashed cursor-pointer overflow-hidden relative transition-all
                  ${preview ? "border-transparent shadow-md" : "border-gray-300 bg-white hover:bg-gray-50"}
                `}
              >
                {preview ? (
                  <Image src={preview} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-medium uppercase tracking-wider">Tap to Upload Banner</span>
                    <span className="text-[10px] text-gray-400 mt-1">Rec: 1200 x 480px (2.5:1)</span>
                  </div>
                )}
                <input name="image" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>

              {preview && (
                <button 
                  type="button" 
                  onClick={clearPreview}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Inputs & Action */}
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <Input name="title" placeholder="Banner Title (Optional)" className="bg-white" />
              </div>
              <Button type="submit" disabled={isUploading} className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* BANNER LIST */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Active Banners ({banners.length})</h2>
        
        <div className="grid gap-6">
          {banners.map((banner, index) => (
            <div key={banner.id} className="group bg-white border rounded-xl p-4 shadow-sm transition-all hover:shadow-md">
              
              {/* Image (Large, Fixed Aspect Ratio) */}
              <div className="relative w-full aspect-[2.5/1] bg-gray-100 rounded-lg overflow-hidden border border-gray-100 mb-4">
                <Image src={banner.image_url} alt="Banner" fill className="object-cover" />
                
                {/* Title Overlay */}
                {banner.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-2 truncate">
                    {banner.title}
                  </div>
                )}
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between">
                
                {/* Reorder Controls */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                  <div className="flex gap-0.5">
                    <Button 
                      variant="ghost" size="icon" className="h-8 w-8 hover:bg-white active:scale-90 text-gray-500" 
                      disabled={index === 0 || isReordering}
                      onClick={() => moveBanner(index, 'up')}
                    >
                      <ChevronUp className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" size="icon" className="h-8 w-8 hover:bg-white active:scale-90 text-gray-500"
                      disabled={index === banners.length - 1 || isReordering}
                      onClick={() => moveBanner(index, 'down')}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </Button>
                  </div>
                  {/* Position Number */}
                  <span className="text-sm font-bold text-gray-900 px-2 min-w-[2rem] text-center border-l border-gray-200">
                    {index + 1}
                  </span>
                </div>

                {/* Delete */}
                <Button 
                  variant="ghost" size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 active:scale-95 gap-2"
                  onClick={() => handleDelete(banner.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only sm:not-sr-only">Delete</span>
                </Button>
              </div>

            </div>
          ))}

          {banners.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <p className="text-gray-500">No banners found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}