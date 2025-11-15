"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Supplier } from "@/components/pos/supplierTypes";

interface SupplierGridProps {
  suppliers: Supplier[];
  selectedCodes: string[];
  onToggleRow: (code: string, checked: boolean) => void;
  allSelected: boolean;
  onToggleSelectAll: (checked: boolean) => void;
}

const SupplierGrid: React.FC<SupplierGridProps> = ({
  suppliers,
  selectedCodes,
  onToggleRow,
  allSelected,
  onToggleSelectAll,
}) => {
  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Header (desktop) */}
      <div className="hidden md:grid grid-cols-[40px_120px_1fr_1fr_140px_120px_120px_120px] items-center gap-1.5 px-2 py-1 bg-gray-200 text-xs font-bold text-black">
        <div className="flex items-center justify-center">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(c: boolean) => onToggleSelectAll(!!c)}
            aria-label="Select all suppliers"
          />
        </div>
        <div>Supplier Code</div>
        <div>Supplier Name</div>
        <div>Address</div>
        <div>Cell Number</div>
        <div className="text-right">Current Balance</div>
        <div className="text-right">Ageing Balance</div>
        <div>Contra</div>
      </div>

      {suppliers.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground text-sm">
          No suppliers yet.
        </div>
      ) : (
        <div className="divide-y">
          {suppliers.map((s) => {
            const checked = selectedCodes.includes(s.supplierCode);
            return (
              <div key={s.supplierCode}>
                {/* Row (desktop) */}
                <div
                  data-state={checked ? "selected" : undefined}
                  className="hidden md:grid grid-cols-[40px_120px_1fr_1fr_140px_120px_120px_120px] items-center gap-1.5 px-2 py-1 hover:bg-muted/30 text-xs"
                >
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c: boolean) => onToggleRow(s.supplierCode, !!c)}
                      aria-label={`Select ${s.supplierCode}`}
                    />
                  </div>
                  <div className="font-mono">{s.supplierCode}</div>
                  <div className="truncate">{s.supplierName}</div>
                  <div className="truncate">{s.address}</div>
                  <div className="truncate">{s.cellNumber}</div>
                  <div className="text-right">{s.currentBalance.toFixed(2)}</div>
                  <div className="text-right">{s.ageingBalance.toFixed(2)}</div>
                  <div className="truncate">{s.contra}</div>
                </div>

                {/* Row (mobile) */}
                <div className="md:hidden p-2 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c: boolean) => onToggleRow(s.supplierCode, !!c)}
                      aria-label={`Select ${s.supplierCode}`}
                    />
                    <span className="font-mono">{s.supplierCode}</span>
                    <span className="ml-auto font-semibold">{s.currentBalance.toFixed(2)}</span>
                  </div>
                  <div className="truncate">{s.supplierName}</div>
                  <div className="text-muted-foreground truncate">{s.address}</div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Cell: {s.cellNumber}</span>
                    <span>Ageing: {s.ageingBalance.toFixed(2)}</span>
                  </div>
                  <div className="text-muted-foreground">Contra: {s.contra}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupplierGrid;