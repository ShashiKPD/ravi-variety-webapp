"use client";

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

type Props = {
  images: File[];
  previewUrls: string[];
  onAddImages: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
  onReorder: (newImages: File[], newUrls: string[]) => void;
};

export default function ImageManager({ images, previewUrls, onAddImages, onRemoveImage, onReorder }: Props) {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const _images = [...images];
    const _urls = [...previewUrls];

    const draggedImage = _images.splice(dragItem.current, 1)[0];
    const draggedUrl = _urls.splice(dragItem.current, 1)[0];

    _images.splice(dragOverItem.current, 0, draggedImage);
    _urls.splice(dragOverItem.current, 0, draggedUrl);

    onReorder(_images, _urls);
    
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="lg:col-span-2">
      <Label className="mb-2 block text-xs font-medium text-gray-700">Product Images (Drag to Reorder)</Label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[140px]">
        <div className="flex flex-wrap gap-3">
          
          {previewUrls.map((url, idx) => (
            <div 
              key={idx}
              draggable
              onDragStart={() => dragItem.current = idx}
              onDragEnter={() => dragOverItem.current = idx}
              onDragEnd={handleDragSort}
              onDragOver={(e) => e.preventDefault()}
              className="relative w-24 h-24 group bg-white rounded-md shadow-sm border border-gray-200 cursor-move shrink-0"
            >
              <img src={url} alt="Product" className="w-full h-full object-cover rounded-md" />
              
              {/* Number Badge (Top Left) */}
              <div className="absolute top-1 left-1 bg-blue-600/90 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm z-10 backdrop-blur-sm">
                {idx + 1}
              </div>

              {/* Delete Button (Top Right) - FIXED: Always Visible & Accessible */}
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent drag/click conflict
                  onRemoveImage(idx);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 focus:outline-none z-20 active:scale-95"
                title="Remove Image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <label className="cursor-pointer flex flex-col items-center justify-center w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all active:bg-blue-100">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={e => onAddImages(e.target.files)} 
            />
            <Plus className="h-6 w-6 text-gray-400 mb-1" />
            <span className="text-[10px] font-medium text-gray-500">Add</span>
          </label>

        </div>
      </div>
    </div>
  );
}