"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { bulkUpdateInventory, updateInventoryRows } from "@/app/(main)/admin/products/actions";

export type SaleOption = { id: number; name: string };

// 1. Updated Row Definition
export type ProductRow = {
  id: number;
  name: string;
  sku: string;
  image_url: string | null;
  stock_quantity: number;
  price_retailer: number;
  price_wholesaler: number;
  sale_id: number | null;
  discount_type: "percentage" | "fixed_price" | null;
  discount_value: number | null;
  is_featured: boolean;
  // Readonly Fields
  pack_size: number;
  unit_name: string;
  variant_name: string;
  brand_name: string;
  category_name: string;
};

export type DirtyState = Record<number, Partial<Record<keyof ProductRow, boolean>>>;

// 2. Updated Widths (Wider Product column, added Featured)
export const DEFAULT_WIDTHS = {
  select: 48, img: 64, product: 320, featured: 50, stock: 100, priceR: 110, priceW: 110, sale: 240, actions: 50
};

export function useInventoryLogic(initialProducts: ProductRow[], totalCount: number, filterParams: any) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectMode, setSelectMode] = useState<"page" | "global">("page");
  const [localData, setLocalData] = useState<ProductRow[]>(initialProducts);
  const [dirtyFields, setDirtyFields] = useState<DirtyState>({});
  
  // 3. Updated Bulk Changes
  const [bulkChanges, setBulkChanges] = useState<{
    stock?: number;
    price_retailer?: number;
    price_wholesaler?: number;
    saleId?: number;
    discountType?: "percentage" | "fixed_price";
    discountValue?: number;
    isFeatured?: boolean; // NEW
  }>({});

  const [colWidths, setColWidths] = useState(DEFAULT_WIDTHS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalData(initialProducts);
    setDirtyFields({});
    setSelectedIds(new Set());
    setSelectMode("page");
  }, [initialProducts]);

  const getOriginalValue = (id: number, field: keyof ProductRow) => {
    const originalRow = initialProducts.find(p => p.id === id);
    return originalRow ? originalRow[field] : null;
  };

  const isDirty = (id: number, field: keyof ProductRow) => !!dirtyFields[id]?.[field];

  const handleLocalChange = (id: number, field: keyof ProductRow, value: any) => {
    if (typeof value === 'number' && value < 0) return;

    const originalVal = getOriginalValue(id, field);
    let extraUpdates: Partial<ProductRow> = {};

    if (field === "sale_id") {
      if (value === null) extraUpdates = { discount_type: null, discount_value: null };
      else if (!localData.find(p => p.id === id)?.discount_type) extraUpdates = { discount_type: "percentage" };
    }

    setLocalData(prev => prev.map(p => p.id === id ? { ...p, [field]: value, ...extraUpdates } : p));
    
    setDirtyFields(prev => {
      const rowDirty = { ...(prev[id] || {}) };
      
      if (value === originalVal) delete rowDirty[field];
      else rowDirty[field] = true;

      Object.entries(extraUpdates).forEach(([k, v]) => {
         const key = k as keyof ProductRow;
         if (v !== getOriginalValue(id, key)) rowDirty[key] = true; else delete rowDirty[key];
      });

      if (Object.keys(rowDirty).length === 0) {
        const newDirty = { ...prev };
        delete newDirty[id];
        return newDirty;
      }
      return { ...prev, [id]: rowDirty };
    });
  };

  const revertField = (id: number, field: keyof ProductRow) => {
    const originalVal = getOriginalValue(id, field);
    handleLocalChange(id, field, originalVal === undefined ? null : originalVal);
  };

  const applyBulkToLocal = () => {
    const idsToUpdate = selectMode === "page" ? Array.from(selectedIds) : localData.map(p => p.id);
    
    setLocalData(prev => prev.map(p => {
      if (!idsToUpdate.includes(p.id)) return p;
      const updates: any = {};
      
      if (bulkChanges.stock !== undefined) updates.stock_quantity = bulkChanges.stock;
      if (bulkChanges.price_retailer !== undefined) updates.price_retailer = bulkChanges.price_retailer;
      if (bulkChanges.price_wholesaler !== undefined) updates.price_wholesaler = bulkChanges.price_wholesaler;
      if (bulkChanges.isFeatured !== undefined) updates.is_featured = bulkChanges.isFeatured; // NEW
      
      if (bulkChanges.saleId !== undefined) {
        updates.sale_id = bulkChanges.saleId;
        if (!bulkChanges.discountValue) { updates.discount_value = 0; updates.discount_type = "percentage"; }
      }
      if (bulkChanges.discountType) updates.discount_type = bulkChanges.discountType;
      if (bulkChanges.discountValue !== undefined) updates.discount_value = bulkChanges.discountValue;

      setDirtyFields(prevDirty => {
        const rowDirty = { ...(prevDirty[p.id] || {}) };
        Object.keys(updates).forEach(key => { rowDirty[key as keyof ProductRow] = true; });
        return { ...prevDirty, [p.id]: rowDirty };
      });

      return { ...p, ...updates };
    }));
    toast.info(`Applied to ${idsToUpdate.length} rows. Save to persist.`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    let result;

    if (selectMode === "global") {
      result = await bulkUpdateInventory({ scope: "all_matching", filterParams, changes: bulkChanges });
    } else if (selectedIds.size > 0 && Object.keys(bulkChanges).length > 0) {
      result = await bulkUpdateInventory({ scope: "selection", selectedIds: Array.from(selectedIds), changes: bulkChanges });
    } else {
      const dirtyIds = Object.keys(dirtyFields).map(Number);
      if (dirtyIds.length === 0) { setIsSaving(false); return; }

      const updates = dirtyIds.map(id => {
        const row = localData.find(p => p.id === id);
        if (!row) return null;
        
        const dirtyKeys = dirtyFields[id] || {};
        const changes: any = {};
        
        if (dirtyKeys.stock_quantity) changes.stock = row.stock_quantity;
        if (dirtyKeys.price_retailer) changes.price_retailer = row.price_retailer;
        if (dirtyKeys.price_wholesaler) changes.price_wholesaler = row.price_wholesaler;
        if (dirtyKeys.is_featured) changes.isFeatured = row.is_featured; // NEW
        
        if (dirtyKeys.sale_id || dirtyKeys.discount_value || dirtyKeys.discount_type) {
          changes.saleId = row.sale_id;
          if (row.sale_id) { changes.discountType = row.discount_type; changes.discountValue = row.discount_value; }
        }
        return { id, changes };
      }).filter(Boolean) as any[];

      result = await updateInventoryRows(updates);
    }

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Updated ${result?.count || 0} products`);
      setIsEditing(false); setDirtyFields({}); setBulkChanges({}); setSelectMode("page"); setSelectedIds(new Set());
      router.refresh();
    }
    setIsSaving(false);
  };

  const handleResize = (e: React.MouseEvent, colKey: keyof typeof DEFAULT_WIDTHS) => {
    e.preventDefault(); const startX = e.clientX; const startWidth = colWidths[colKey];
    const onMouseMove = (moveEvent: MouseEvent) => setColWidths(prev => ({ ...prev, [colKey]: Math.max(50, startWidth + (moveEvent.clientX - startX)) }));
    const onMouseUp = () => { document.removeEventListener("mousemove", onMouseMove); document.removeEventListener("mouseup", onMouseUp); };
    document.addEventListener("mousemove", onMouseMove); document.addEventListener("mouseup", onMouseUp);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === localData.length && selectMode === "page") setSelectedIds(new Set());
    else setSelectedIds(new Set(localData.map(p => p.id)));
    setSelectMode("page");
  };

  const toggleRow = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
    setSelectMode("page");
  };

  return {
    isEditing, setIsEditing, selectedIds, setSelectedIds, selectMode, setSelectMode, localData, dirtyFields, colWidths, bulkChanges, setBulkChanges, isSaving,
    isDirty, getOriginalValue, handleLocalChange, revertField, applyBulkToLocal, handleSave, handleResize, toggleSelectAll, toggleRow
  };
}