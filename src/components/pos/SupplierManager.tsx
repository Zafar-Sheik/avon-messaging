"use client";

import React from "react";
import { useToast } from "@/components/ui/use-toast";
import SupplierGrid from "@/components/pos/SupplierGrid";
import StockItemsToolbar from "@/components/pos/StockItemsToolbar";
import { initialSuppliers, type Supplier } from "@/components/pos/supplierTypes";

interface SupplierManagerProps {
  suppliers?: Supplier[];
  onSuppliersChange?: (suppliers: Supplier[]) => void;
}

const SupplierManager: React.FC<SupplierManagerProps> = ({ suppliers: suppliersProp, onSuppliersChange }) => {
  const { toast } = useToast();
  const [internalSuppliers, setInternalSuppliers] = React.useState<Supplier[]>(initialSuppliers);
  const suppliers = suppliersProp ?? internalSuppliers;
  const setSuppliers = onSuppliersChange ?? setInternalSuppliers;
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>([]);

  const resetSelection = () => setSelectedCodes([]);

  const openAdd = () => {
    toast({ title: "Add supplier", description: "Supplier add dialog coming soon." });
  };

  const openEdit = () => {
    if (selectedCodes.length !== 1) {
      toast({ title: "Select one supplier", description: "Please select exactly one supplier to edit." });
      return;
    }
    toast({ title: "Edit supplier", description: "Supplier edit dialog coming soon." });
  };

  const handleDelete = () => {
    if (selectedCodes.length === 0) {
      toast({ title: "No selection", description: "Please select suppliers to delete." });
      return;
    }
    setSuppliers((prev) => prev.filter((s) => !selectedCodes.includes(s.supplierCode)));
    resetSelection();
    toast({ title: "Deleted", description: "Selected suppliers removed." });
  };

  const toggleRowSelection = (code: string, checked: boolean) => {
    setSelectedCodes((prev) => {
      const set = new Set(prev);
      if (checked) set.add(code);
      else set.delete(code);
      return Array.from(set);
    });
  };

  const allSelected = suppliers.length > 0 && selectedCodes.length === suppliers.length;
  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedCodes(suppliers.map((s) => s.supplierCode));
    else resetSelection();
  };

  return (
    <div className="space-y-3">
      {/* Toolbar (reused from stock items for consistency) */}
      <StockItemsToolbar onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} />

      {/* Grid */}
      <SupplierGrid
        suppliers={suppliers}
        selectedCodes={selectedCodes}
        onToggleRow={toggleRowSelection}
        allSelected={allSelected}
        onToggleSelectAll={toggleSelectAll}
      />
    </div>
  );
};

export default SupplierManager;