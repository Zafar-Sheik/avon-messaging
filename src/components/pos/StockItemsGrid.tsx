"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { StockItem } from "@/components/pos/types";

interface StockItemsGridProps {
  items: StockItem[];
  selectedCodes: string[];
  onToggleRow: (code: string, checked: boolean) => void;
  allSelected: boolean;
  onToggleSelectAll: (checked: boolean) => void;
}

const StockItemsGrid: React.FC<StockItemsGridProps> = ({
  items,
  selectedCodes,
  onToggleRow,
  allSelected,
  onToggleSelectAll,
}) => {
  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Header (desktop) */}
      <div className="hidden md:grid grid-cols-[40px_48px_100px_1fr_100px_72px_72px_72px_72px_72px_120px_72px] items-center gap-1.5 px-2 py-1 bg-gray-200 text-xs font-bold text-black">
        <div className="flex items-center justify-center">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(c: boolean) => onToggleSelectAll(!!c)}
            aria-label="Select all"
          />
        </div>
        <div>Image</div>
        <div>Code</div>
        <div>Description</div>
        <div>Category</div>
        <div>Size</div>
        <div className="text-right">Cost</div>
        <div className="text-right">Price</div>
        <div className="text-right">Qty</div>
        <div className="text-right">Store/Warehouse</div>
        <div>Supplier</div>
        <div className="text-right">VAT %</div>
      </div>

      {items.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground text-sm">
          No stock items yet. Click Add to create one.
        </div>
      ) : (
        <div className="divide-y">
          {items.map((i) => {
            const checked = selectedCodes.includes(i.stockCode);
            return (
              <div key={i.stockCode}>
                {/* Row (desktop) */}
                <div
                  data-state={checked ? "selected" : undefined}
                  className="hidden md:grid grid-cols-[40px_48px_100px_1fr_100px_72px_72px_72px_72px_72px_120px_72px] items-center gap-1.5 px-2 py-1 hover:bg-muted/30 text-xs"
                >
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c: boolean) => onToggleRow(i.stockCode, !!c)}
                      aria-label={`Select ${i.stockCode}`}
                    />
                  </div>
                  <div>
                    <div className="w-10 h-10 overflow-hidden rounded bg-muted">
                      <img
                        src={i.imageDataUrl || "/placeholder.svg"}
                        alt={i.stockDescr}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="font-mono">{i.stockCode}</div>
                  <div className="truncate">{i.stockDescr}</div>
                  <div>{i.category}</div>
                  <div>{i.size || "-"}</div>
                  <div className="text-right">{i.costPrice.toFixed(2)}</div>
                  <div className="text-right">{i.sellingPrice.toFixed(2)}</div>
                  <div className="text-right">{i.quantityOnHand}</div>
                  <div className="text-right">{i.quantityInWarehouse}</div>
                  <div>{i.supplier || "-"}</div>
                  <div className="text-right">{i.vat.toFixed(1)}</div>
                </div>

                {/* Row (mobile) */}
                <div className="md:hidden p-2 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c: boolean) => onToggleRow(i.stockCode, !!c)}
                      aria-label={`Select ${i.stockCode}`}
                    />
                    <span className="font-mono">{i.stockCode}</span>
                    <span className="ml-auto font-semibold">{i.sellingPrice.toFixed(2)}</span>
                  </div>
                  <div>{i.stockDescr}</div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Qty: {i.quantityOnHand}</span>
                    <span>Store: {i.quantityInWarehouse}</span>
                    <span>Cost: {i.costPrice.toFixed(2)}</span>
                    <span>VAT: {i.vat.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 overflow-hidden rounded bg-muted">
                      <img
                        src={i.imageDataUrl || "/placeholder.svg"}
                        alt={i.stockDescr}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-muted-foreground">{i.supplier || "-"}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StockItemsGrid;