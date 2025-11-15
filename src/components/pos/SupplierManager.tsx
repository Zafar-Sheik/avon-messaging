"use client";

import React from "react";
import { useToast } from "@/components/ui/use-toast";
import SupplierGrid from "@/components/pos/SupplierGrid";
import StockItemsToolbar from "@/components/pos/StockItemsToolbar";
import { initialSuppliers, type Supplier } from "@/components/pos/supplierTypes";
import SupplierPaymentDialog from "@/components/pos/SupplierPaymentDialog";

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
  const [paymentOpen, setPaymentOpen] = React.useState(false);

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

  const openPay = () => {
    if (selectedCodes.length !== 1) {
      toast({ title: "Select one supplier", description: "Please select exactly one supplier to pay." });
      return;
    }
    setPaymentOpen(true);
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
      <StockItemsToolbar onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} onPay={openPay} />

      {/* Grid */}
      <SupplierGrid
        suppliers={suppliers}
        selectedCodes={selectedCodes}
        onToggleRow={toggleRowSelection}
        allSelected={allSelected}
        onToggleSelectAll={toggleSelectAll}
      />

      {/* Payment Dialog */}
      <SupplierPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        supplier={suppliers.find((s) => s.supplierCode === selectedCodes[0]) ?? null}
        onConfirm={(amount) => {
          const code = selectedCodes[0];
          setSuppliers((prev) =>
            prev.map((s) => {
              if (s.supplierCode !== code) return s;
              const newBalance = Math.max(0, s.currentBalance - amount);
              return { ...s, currentBalance: newBalance };
            })
          );
          setPaymentOpen(false);
          toast({
            title: "Payment recorded",
            description: `Amount ${amount.toFixed(2)} applied to ${code}.`,
          });
        }}
      />
    </div>
  );
};

export default SupplierManager;