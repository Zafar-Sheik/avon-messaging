"use client";

import React from "react";
import { useToast } from "@/components/ui/use-toast";
import StockItemsToolbar from "@/components/pos/StockItemsToolbar";
import StockItemsGrid from "@/components/pos/StockItemsGrid";
import StockItemDialog from "@/components/pos/StockItemDialog";
import { initialStockItems, type StockItem } from "@/components/pos/types";

interface StockItemsManagerProps {
  items?: StockItem[];
  onItemsChange?: (items: StockItem[]) => void;
}

const StockItemsManager: React.FC<StockItemsManagerProps> = ({ items: itemsProp, onItemsChange }) => {
  const { toast } = useToast();
  const [internalItems, setInternalItems] = React.useState<StockItem[]>(initialStockItems);
  const items = itemsProp ?? internalItems;
  const setItems = onItemsChange ?? setInternalItems;
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = React.useState<StockItem | undefined>(undefined);

  const resetSelection = () => setSelectedCodes([]);

  const openAdd = () => {
    setMode("add");
    setEditingItem(undefined);
    setDialogOpen(true);
  };

  const openEdit = () => {
    if (selectedCodes.length !== 1) {
      toast({ title: "Select one item", description: "Please select exactly one item to edit." });
      return;
    }
    const itm = items.find((i) => i.stockCode === selectedCodes[0]);
    if (!itm) {
      toast({ title: "Not found", description: "Selected item could not be found." });
      return;
    }
    setMode("edit");
    setEditingItem(itm);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedCodes.length === 0) {
      toast({ title: "No selection", description: "Please select items to delete." });
      return;
    }
    setItems((prev) => prev.filter((i) => !selectedCodes.includes(i.stockCode)));
    resetSelection();
    toast({ title: "Deleted", description: "Selected stock items removed." });
  };

  const toggleRowSelection = (code: string, checked: boolean) => {
    setSelectedCodes((prev) => {
      const set = new Set(prev);
      if (checked) set.add(code);
      else set.delete(code);
      return Array.from(set);
    });
  };

  const allSelected = items.length > 0 && selectedCodes.length === items.length;
  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedCodes(items.map((i) => i.stockCode));
    else resetSelection();
  };

  const handleSubmit = (values: StockItem) => {
    const newCode = values.stockCode.trim().toLowerCase();

    if (mode === "add") {
      if (items.some((i) => i.stockCode.trim().toLowerCase() === newCode)) {
        toast({ title: "Duplicate code", description: "An item with this stock code already exists." });
        return;
      }
      setItems((prev) => [{ ...values }, ...prev]);
      toast({ title: "Saved", description: `Item ${values.stockCode} added.` });
      setDialogOpen(false);
      return;
    }

    // edit mode
    const originalCode = selectedCodes[0]?.trim().toLowerCase();
    if (!originalCode) {
      toast({ title: "No item selected", description: "Please select an item to edit." });
      return;
    }
    if (newCode !== originalCode && items.some((i) => i.stockCode.trim().toLowerCase() === newCode)) {
      toast({ title: "Duplicate code", description: "Another item already uses this stock code." });
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.stockCode.trim().toLowerCase() === originalCode ? { ...values } : i)),
    );
    setSelectedCodes([values.stockCode]);
    toast({ title: "Updated", description: `Item ${values.stockCode} updated.` });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <StockItemsToolbar onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} />

      {/* Grid */}
      <StockItemsGrid
        items={items}
        selectedCodes={selectedCodes}
        onToggleRow={toggleRowSelection}
        allSelected={allSelected}
        onToggleSelectAll={toggleSelectAll}
      />

      {/* Add/Edit Dialog */}
      <StockItemDialog
        open={dialogOpen}
        mode={mode}
        initialValues={editingItem}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default StockItemsManager;