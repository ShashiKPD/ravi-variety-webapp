"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Save, CheckSquare, Edit, ArrowRight, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch"; // Import Switch
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useInventoryLogic, type SaleOption, type ProductRow } from "./inventory/useInventoryLogic";

type Props = {
  products: ProductRow[];
  sales: SaleOption[];
  totalCount: number;
  filterParams: any;
};

// ... Sub-components (Resizer, FieldWrapper) remain the same ...
const Resizer = ({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) => (
  <div onMouseDown={onMouseDown} className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize z-20 group flex justify-center -mr-2">
    <div className="w-[1px] h-full bg-gray-200 group-hover:bg-blue-500 group-hover:w-[2px] transition-all" />
  </div>
);

const FieldWrapper = ({ dirty, onRevert, originalVal, children }: { dirty: boolean, onRevert: () => void, originalVal: any, children: React.ReactNode }) => (
  <div className="relative group/field h-full flex items-center w-full">
    {children}
    {dirty && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger onClick={(e) => { e.stopPropagation(); onRevert(); }} className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 shadow-sm ring-2 ring-white z-20">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Original: <span className="font-mono">{String(originalVal ?? "None")}</span></p>
            <p className="text-[10px] text-gray-400">Click to reset</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

export default function InventoryDesktopTable(props: Props) {
  const { sales, totalCount } = props;
  const [showConfirm, setShowConfirm] = useState(false);

  const logic = useInventoryLogic(props.products, props.totalCount, props.filterParams);
  const { 
    isEditing, setIsEditing, localData, colWidths, selectedIds, selectMode, dirtyFields, bulkChanges, setBulkChanges, isSaving,
    handleResize, toggleSelectAll, toggleRow, handleLocalChange, revertField, isDirty, getOriginalValue, applyBulkToLocal, handleSave,
    setSelectMode, setSelectedIds
  } = logic;

  const canSave = Object.keys(dirtyFields).length > 0 || Object.keys(bulkChanges).length > 0;

  return (
    <div className="space-y-4">
      {/* 1. TOOLBAR */}
      <div className="flex justify-between items-end pb-2 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Button variant={isEditing ? "secondary" : "outline"} onClick={() => setIsEditing(!isEditing)} className="w-32 shadow-sm">
            {isEditing ? "Cancel Edit" : "Enable Editing"}
          </Button>
          {isEditing && (
            <div className="flex items-center gap-2 animate-in fade-in">
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">{Object.keys(dirtyFields).length} modified</span>
              {selectMode === "global" && <Badge variant="destructive" className="animate-pulse">Updating ALL {totalCount} Products</Badge>}
            </div>
          )}
        </div>
        {isEditing && (
          <Button onClick={() => setShowConfirm(true)} className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm" disabled={!canSave}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
          </Button>
        )}
      </div>

      {/* 2. BULK EDIT BAR */}
      {isEditing && selectedIds.size > 0 && (
        <div className="sticky top-0 z-30 bg-blue-50/95 backdrop-blur border-b-2 border-blue-200 shadow-md mb-4 animate-in slide-in-from-top-2 overflow-hidden rounded-md">
          <div className="flex items-center justify-between px-4 py-2 bg-blue-100/50 text-xs border-b border-blue-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold text-blue-900">Bulk Edit Mode: {selectMode === "global" ? totalCount : selectedIds.size} Selected</span>
              {selectedIds.size > 0 && selectedIds.size < totalCount && (
                <>
                  <span className="text-blue-300">|</span>
                  <button onClick={() => setSelectMode(selectMode === "page" ? "global" : "page")} className="underline text-blue-700 hover:text-blue-900">
                    {selectMode === "page" ? `Switch to select all ${totalCount} matching?` : "Switch to select page only"}
                  </button>
                </>
              )}
            </div>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} className="h-5 text-[10px] text-blue-700 hover:text-blue-900 px-2">Cancel Selection</Button>
          </div>

          <div className="flex items-end p-1 overflow-x-auto min-w-fit">
            <div style={{ width: colWidths.select + colWidths.img }} className="shrink-0" />
            
            {/* Label Space */}
            <div style={{ width: colWidths.product }} className="p-2 shrink-0 flex items-center text-xs text-blue-400 font-medium">
              <ArrowRight className="w-3 h-3 mr-1" /> Set Values
            </div>

            {/* Featured Bulk */}
            <div style={{ width: colWidths.featured }} className="p-2 shrink-0 flex justify-center">
              {/* Note: Switch is tricky for bulk tristate (on/off/unset). We use a Select for bulk boolean */}
              <Select onValueChange={(v) => setBulkChanges(prev => ({...prev, isFeatured: v === 'true'}))}>
                <SelectTrigger className="h-8 w-12 text-xs p-1 bg-white"><SelectValue placeholder="-" /></SelectTrigger>
                <SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent>
              </Select>
            </div>

            <div style={{ width: colWidths.stock }} className="p-2 shrink-0">
              <Input placeholder="Stock" type="number" min={0} className="h-8 text-xs bg-white text-right" onChange={(e) => setBulkChanges(prev => ({...prev, stock: parseInt(e.target.value)}))} />
            </div>
            <div style={{ width: colWidths.priceR }} className="p-2 shrink-0">
              <Input placeholder="Retailer" type="number" min={0} className="h-8 text-xs bg-white text-right" onChange={(e) => setBulkChanges(prev => ({...prev, price_retailer: parseFloat(e.target.value)}))} />
            </div>
            <div style={{ width: colWidths.priceW }} className="p-2 shrink-0">
              <Input placeholder="Whole" type="number" min={0} className="h-8 text-xs bg-white text-right" onChange={(e) => setBulkChanges(prev => ({...prev, price_wholesaler: parseFloat(e.target.value)}))} />
            </div>
            <div style={{ width: colWidths.sale }} className="p-2 shrink-0 flex gap-1">
              <Select onValueChange={(v) => setBulkChanges(prev => ({...prev, saleId: parseInt(v)}))}>
                <SelectTrigger className="h-8 text-xs bg-white border-blue-200 flex-1"><SelectValue placeholder="Set Sale" /></SelectTrigger>
                <SelectContent>{sales.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select defaultValue="percentage" onValueChange={(v) => setBulkChanges(prev => ({...prev, discountType: v as any}))}>
                <SelectTrigger className="h-8 w-[60px] text-[10px] px-1 bg-white border-blue-200"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="percentage">%</SelectItem><SelectItem value="fixed_price">₹</SelectItem></SelectContent>
              </Select>
              <Input placeholder="Val" type="number" min={0} className="h-8 text-xs w-16 bg-white border-blue-200 text-right" onChange={(e) => setBulkChanges(prev => ({...prev, discountValue: parseFloat(e.target.value), discountType: prev.discountType || 'percentage'}))} />
            </div>
            <div style={{ width: colWidths.actions }} className="p-2 shrink-0 flex justify-center">
              <Button size="sm" onClick={applyBulkToLocal} className="bg-blue-600 hover:bg-blue-700 h-8 w-full text-xs px-0">Apply</Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. RESIZABLE TABLE */}
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm overflow-x-auto">
        <div className="min-w-fit">
          {/* Header Row */}
          <div className="flex bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div style={{ width: colWidths.select }} className="relative p-3 flex items-center justify-center shrink-0 border-r border-gray-200">
              <Checkbox checked={selectedIds.size > 0 && selectedIds.size === localData.length} onCheckedChange={toggleSelectAll} disabled={!isEditing} />
            </div>
            <div style={{ width: colWidths.img }} className="relative p-3 shrink-0 border-r border-gray-200">Img</div>
            <div style={{ width: colWidths.product }} className="relative p-3 shrink-0 border-r border-gray-200">Product Details <Resizer onMouseDown={(e) => handleResize(e, "product")} /></div>
            <div style={{ width: colWidths.featured }} className="relative p-3 shrink-0 border-r border-gray-200 flex justify-center"><Star className="w-3.5 h-3.5" /> <Resizer onMouseDown={(e) => handleResize(e, "featured")} /></div>
            <div style={{ width: colWidths.stock }} className="relative p-3 text-right shrink-0 border-r border-gray-200">Stock <Resizer onMouseDown={(e) => handleResize(e, "stock")} /></div>
            <div style={{ width: colWidths.priceR }} className="relative p-3 text-right shrink-0 border-r border-gray-200">Retail ₹ <Resizer onMouseDown={(e) => handleResize(e, "priceR")} /></div>
            <div style={{ width: colWidths.priceW }} className="relative p-3 text-right shrink-0 border-r border-gray-200 bg-blue-50/20">Whole ₹ <Resizer onMouseDown={(e) => handleResize(e, "priceW")} /></div>
            <div style={{ width: colWidths.sale }} className="relative p-3 shrink-0 border-r border-gray-200">Sale Config <Resizer onMouseDown={(e) => handleResize(e, "sale")} /></div>
            <div style={{ width: colWidths.actions }} className="relative p-3 shrink-0 flex justify-center">Edit</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {localData.map((row) => {
              const isRowDirty = dirtyFields[row.id] !== undefined;
              const isSelected = selectedIds.has(row.id);

              return (
                <div key={row.id} className={`flex transition-colors items-center ${isSelected ? 'bg-blue-50/40' : 'hover:bg-gray-50/40'} ${isRowDirty ? 'bg-green-50/20' : ''}`}>
                  <div style={{ width: colWidths.select }} className="p-3 flex items-center justify-center shrink-0 border-r border-transparent">
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleRow(row.id)} disabled={!isEditing} />
                  </div>

                  <div style={{ width: colWidths.img }} className="p-3 shrink-0 border-r border-transparent">
                    <div className="w-10 h-10 rounded border bg-gray-50 relative overflow-hidden">
                      {row.image_url && <Image src={row.image_url} alt="" fill className="object-cover" />}
                    </div>
                  </div>

                  {/* Enhanced Product Details */}
                  <div style={{ width: colWidths.product }} className="p-3 shrink-0 border-r border-transparent">
                    <div className="flex flex-col pr-4">
                      <span className="font-medium text-gray-900 text-sm line-clamp-1" title={row.name}>{row.name}</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                        <Badge variant="outline" className="text-[10px] h-4 px-1 bg-gray-50 text-gray-600 border-gray-300 rounded-sm font-normal">
                          {row.pack_size > 1 ? `${row.pack_size} x ` : ""}{row.variant_name} / {row.unit_name}
                        </Badge>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[10px] text-gray-600 font-medium truncate max-w-[80px]" title={row.brand_name}>{row.brand_name}</span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[10px] text-gray-500 truncate max-w-[80px]" title={row.category_name}>{row.category_name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono mt-1">{row.sku}</span>
                    </div>
                  </div>

                  {/* Featured Toggle */}
                  <div style={{ width: colWidths.featured }} className="p-3 shrink-0 flex justify-center border-r border-transparent">
                    {isEditing ? (
                      <FieldWrapper dirty={isDirty(row.id, 'is_featured')} onRevert={() => revertField(row.id, 'is_featured')} originalVal={getOriginalValue(row.id, 'is_featured')}>
                        <Switch 
                          checked={row.is_featured} 
                          onCheckedChange={(v) => handleLocalChange(row.id, "is_featured", v)}
                          className="scale-75 data-[state=checked]:bg-amber-500"
                        />
                      </FieldWrapper>
                    ) : (
                      row.is_featured && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    )}
                  </div>

                  {/* Stock */}
                  <div style={{ width: colWidths.stock }} className="p-3 shrink-0 flex justify-end border-r border-transparent">
                    {isEditing ? (
                      <FieldWrapper dirty={isDirty(row.id, 'stock_quantity')} onRevert={() => revertField(row.id, 'stock_quantity')} originalVal={getOriginalValue(row.id, 'stock_quantity')}>
                        <Input type="number" min={0} value={row.stock_quantity} onChange={(e) => handleLocalChange(row.id, "stock_quantity", parseInt(e.target.value))} className={`h-8 w-full text-xs text-right ${isDirty(row.id, 'stock_quantity') ? 'border-green-500 bg-green-50/50' : ''}`} />
                      </FieldWrapper>
                    ) : <span className={`text-sm ${row.stock_quantity < 10 ? "text-red-600 font-bold" : "text-gray-700"}`}>{row.stock_quantity}</span>}
                  </div>

                  {/* Retailer Price */}
                  <div style={{ width: colWidths.priceR }} className="p-3 shrink-0 flex justify-end border-r border-transparent">
                    {isEditing ? (
                      <FieldWrapper dirty={isDirty(row.id, 'price_retailer')} onRevert={() => revertField(row.id, 'price_retailer')} originalVal={getOriginalValue(row.id, 'price_retailer')}>
                        <Input type="number" min={0} value={row.price_retailer} onChange={(e) => handleLocalChange(row.id, "price_retailer", parseFloat(e.target.value))} className={`h-8 w-full text-xs text-right ${isDirty(row.id, 'price_retailer') ? 'border-green-500 bg-green-50/50' : ''}`} />
                      </FieldWrapper>
                    ) : <span className="text-sm font-medium">₹{row.price_retailer}</span>}
                  </div>

                  {/* Wholesaler Price */}
                  <div style={{ width: colWidths.priceW }} className="p-3 shrink-0 flex justify-end border-r border-transparent bg-blue-50/30">
                    {isEditing ? (
                      <FieldWrapper dirty={isDirty(row.id, 'price_wholesaler')} onRevert={() => revertField(row.id, 'price_wholesaler')} originalVal={getOriginalValue(row.id, 'price_wholesaler')}>
                        <Input type="number" min={0} value={row.price_wholesaler} onChange={(e) => handleLocalChange(row.id, "price_wholesaler", parseFloat(e.target.value))} className={`h-8 w-full text-xs text-right ${isDirty(row.id, 'price_wholesaler') ? 'border-green-500 bg-green-50/50' : ''}`} />
                      </FieldWrapper>
                    ) : <span className="text-sm font-medium text-gray-600">₹{row.price_wholesaler}</span>}
                  </div>

                  {/* Sale Config */}
                  <div style={{ width: colWidths.sale }} className="p-3 shrink-0 border-r border-transparent">
                    {isEditing ? (
                      <div className="flex gap-1 items-center h-full">
                        <div className="relative group/field h-full flex-1">
                           <Select value={row.sale_id ? String(row.sale_id) : "none"} onValueChange={(v) => handleLocalChange(row.id, "sale_id", v === "none" ? null : parseInt(v))}>
                             <SelectTrigger className={`h-8 w-full text-[10px] ${isDirty(row.id, 'sale_id') ? 'border-green-500 bg-green-50/50' : ''}`}><SelectValue placeholder="None" /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="none">None</SelectItem>
                               {sales.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                             </SelectContent>
                           </Select>
                           {isDirty(row.id, 'sale_id') && <div onClick={() => revertField(row.id, 'sale_id')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-green-500 rounded-full cursor-pointer hover:scale-110 shadow-sm ring-2 ring-white z-20" />}
                        </div>
                        {row.sale_id && (
                          <>
                            <Select value={row.discount_type || "percentage"} onValueChange={(v) => handleLocalChange(row.id, "discount_type", v)}>
                              <SelectTrigger className="h-8 w-[60px] text-[10px] px-1"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="percentage">%</SelectItem><SelectItem value="fixed_price">₹</SelectItem></SelectContent>
                            </Select>
                            <FieldWrapper dirty={isDirty(row.id, 'discount_value')} onRevert={() => revertField(row.id, 'discount_value')} originalVal={getOriginalValue(row.id, 'discount_value')}>
                              <Input type="number" min={0} value={row.discount_value || 0} onChange={(e) => handleLocalChange(row.id, "discount_value", parseFloat(e.target.value))} className={`h-8 w-16 text-xs text-right ${isDirty(row.id, 'discount_value') ? 'border-green-500 bg-green-50/50' : ''}`} />
                            </FieldWrapper>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs">
                        {row.sale_id ? <span className="text-green-700 font-medium bg-green-50 px-2 py-1 rounded border border-green-100 inline-block">{row.discount_type === 'percentage' ? `${row.discount_value}% Off` : `₹${row.discount_value} Off`}</span> : <span className="text-gray-300">-</span>}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ width: colWidths.actions }} className="p-3 shrink-0 flex justify-center">
                    <Link href={`/admin/products/${row.id}/edit`} className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirm Updates</AlertDialogTitle><AlertDialogDescription>This will update <span className="font-bold text-gray-900">{selectMode === "global" ? totalCount : Object.keys(dirtyFields).length}</span> products.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Confirm</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}