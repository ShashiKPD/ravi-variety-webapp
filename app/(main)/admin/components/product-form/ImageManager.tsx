"use client";

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Plus, X, Image as ImageIcon } from "lucide-react";

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
    <div className="lg:col-span-2 space-y-3">
      <div className="flex justify-between items-end">
        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Product Images</Label>
        <span className="text-[10px] text-gray-400">Drag to reorder</span>
      </div>
      
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 min-h-[120px]">
        <div className="flex flex-wrap gap-4">
          
          {previewUrls.map((url, idx) => (
            <div 
              key={idx}
              draggable
              onDragStart={() => dragItem.current = idx}
              onDragEnter={() => dragOverItem.current = idx}
              onDragEnd={handleDragSort}
              onDragOver={(e) => e.preventDefault()}
              className="relative w-24 h-24 group bg-white rounded-lg shadow-sm border border-gray-200 cursor-move shrink-0 hover:border-blue-400 transition-all overflow-hidden"
            >
              <img src={url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
              
              {/* Number Badge */}
              <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-md backdrop-blur-sm pointer-events-none">
                {idx + 1}
              </div>

              {/* Remove Button */}
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(idx);
                }}
                className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-md shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                title="Remove Image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add Button */}
          <label className="cursor-pointer flex flex-col items-center justify-center w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95 group">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={e => onAddImages(e.target.files)} 
            />
            <div className="bg-blue-50 group-hover:bg-blue-100 p-2 rounded-full mb-1 transition-colors">
              <Plus className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-[10px] font-medium text-gray-500 group-hover:text-blue-600">Add Image</span>
          </label>

        </div>
        
        {previewUrls.length === 0 && (
          <div className="flex flex-col items-center justify-center py-4 text-gray-400 text-xs">
            <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
            <span>No images selected</span>
          </div>
        )}
      </div>
    </div>
  );
}