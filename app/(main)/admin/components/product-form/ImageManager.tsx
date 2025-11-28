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
      <Label className="mb-1.5 block text-xs font-medium text-gray-700">Product Images (Drag to Reorder)</Label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[140px]">
        <div className="flex flex-wrap gap-3">
          
          {/* Image Grid Items */}
          {previewUrls.map((url, idx) => (
            <div 
              key={idx}
              draggable
              onDragStart={() => dragItem.current = idx}
              onDragEnter={() => dragOverItem.current = idx}
              onDragEnd={handleDragSort}
              onDragOver={(e) => e.preventDefault()}
              className="relative w-24 h-24 group bg-white rounded-md shadow-sm border border-gray-200 cursor-move"
            >
              <img src={url} alt="Product" className="w-full h-full object-cover rounded-md" />
              
              {/* Number Badge */}
              <div className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm z-10">
                {idx + 1}
              </div>

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                 <button 
                   type="button" 
                   onClick={() => onRemoveImage(idx)}
                   className="bg-white/90 hover:bg-red-500 hover:text-white text-red-600 p-1.5 rounded-full transition-colors"
                 >
                   <X className="w-4 h-4" />
                 </button>
              </div>
            </div>
          ))}

          {/* Add Button */}
          <label className="cursor-pointer flex flex-col items-center justify-center w-24 h-24 bg-white border border-dashed border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all">
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