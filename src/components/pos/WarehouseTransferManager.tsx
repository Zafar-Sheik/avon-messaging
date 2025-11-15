"use client";

import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { type StockItem } from "@/components/pos/types";

interface WarehouseTransferManagerProps {
  items: StockItem[];
  onItemsChange: (items: StockItem[]) => void;
}

const WarehouseTransferManager: React.FC<WarehouseTransferManagerProps> = ({ items, onItemsChange }) => {
  const { toast } = useToast();
  const [selectedCode, setSelectedCode] = React.useState<string>("");
  const [direction, setDirection] = React.useState<"warehouse_to_store" | "store_to_warehouse">("warehouse_to_store");
  const [qty, setQty] = React.useState<number>(0);

  const selectedItem = items.find((i) => i.stockCode === selectedCode);

  const handleTransfer = () => {
    const quantity = Number(qty);
    if (!selectedItem) {
      toast({ title: "No item selected", description: "Please choose a stock item." });
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast({ title: "Invalid quantity", description: "Enter a positive quantity to transfer." });
      return;
    }

    if (direction === "warehouse_to_store") {
      if (selectedItem.quantityInWarehouse < quantity) {
        toast({ title: "Not enough in warehouse", description: "Warehouse quantity is insufficient." });
        return;
      }
      onItemsChange(
        items.map((i) =>
          i.stockCode === selectedItem.stockCode
            ? {
                ...i,
                quantityInWarehouse: i.quantityInWarehouse - quantity,
                quantityOnHand: i.quantityOnHand + quantity,
              }
            : i,
        ),
      );
      toast({ title: "Transferred", description: `Moved ${quantity} from Warehouse to Store.` });
    } else {
      if (selectedItem.quantityOnHand < quantity) {
        toast({ title: "Not enough in store", description: "On hand quantity is insufficient." });
        return;
      }
      onItemsChange(
        items.map((i) =>
          i.stockCode === selectedItem.stockCode
            ? {
                ...i,
                quantityOnHand: i.quantityOnHand - quantity,
                quantityInWarehouse: i.quantityInWarehouse + quantity,
              }
            : i,
        ),
      );
      toast({ title: "Transferred", description: `Moved ${quantity} from Store to Warehouse.` });
    }

    setQty(0);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Warehouse Transfer</CardTitle>
        <CardDescription className="text-xs">Move stock between Warehouse and Store (On Hand).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 space-y-1">
            <Label>Item</Label>
            <Select value={selectedCode} onValueChange={setSelectedCode}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((i) => (
                  <SelectItem key={i.stockCode} value={i.stockCode}>
                    <span className="font-mono">{i.stockCode}</span> – {i.stockDescr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Quantity</Label>
            <Input
              type="number"
              step="1"
              min={0}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="h-9 text-sm"
              placeholder="0"
            />
          </div>

          <div className="space-y-1">
            <Label>Direction</Label>
            <RadioGroup
              value={direction}
              onValueChange={(v) => setDirection(v as typeof direction)}
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              <div className="flex items-center gap-2 rounded-md border px-2 py-1.5">
                <RadioGroupItem id="w2s" value="warehouse_to_store" />
                <Label htmlFor="w2s">Warehouse → Store</Label>
              </div>
              <div className="flex items-center gap-2 rounded-md border px-2 py-1.5">
                <RadioGroupItem id="s2w" value="store_to_warehouse" />
                <Label htmlFor="s2w">Store → Warehouse</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {selectedItem && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border bg-muted/40 px-2 py-1.5">
              <div className="text-muted-foreground">On Hand</div>
              <div className="font-semibold">{selectedItem.quantityOnHand}</div>
            </div>
            <div className="rounded-md border bg-muted/40 px-2 py-1.5">
              <div className="text-muted-foreground">Warehouse</div>
              <div className="font-semibold">{selectedItem.quantityInWarehouse}</div>
            </div>
          </div>
        )}

        <Button onClick={handleTransfer}>Transfer</Button>
      </CardContent>
    </Card>
  );
};

export default WarehouseTransferManager;