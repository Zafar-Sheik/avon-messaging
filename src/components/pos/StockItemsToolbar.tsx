"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface StockItemsToolbarProps {
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  // NEW: optional payment action for supplier pages
  onPay?: () => void;
}

const StockItemsToolbar: React.FC<StockItemsToolbarProps> = ({ onAdd, onEdit, onDelete, onPay }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Add
      </Button>
      <Button size="sm" variant="outline" onClick={onEdit}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>
      {/* NEW: Payment button only renders if onPay is provided */}
      {onPay && (
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onPay}>
          {/* Reusing Pencil icon to avoid adding new imports; ideally use a money icon */}
          <Pencil className="mr-2 h-4 w-4" />
          Payment
        </Button>
      )}
      <Button size="sm" variant="destructive" onClick={onDelete}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  );
};

export default StockItemsToolbar;