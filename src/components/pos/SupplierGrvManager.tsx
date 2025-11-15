"use client";

import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { StockItem } from "@/components/pos/types";
import type { Supplier } from "@/components/pos/supplierTypes";
import { Plus, Pencil, Trash2 } from "lucide-react";

type GrvItem = {
  stockCode: string;
  stockDescr: string;
  qty: number;
  costPrice: number;
  sellingPrice: number;
};

type Grv = {
  id: string;
  date: string; // yyyy-mm-dd
  supplierCode: string;
  reference: string;
  note?: string;
  items: GrvItem[];
};

interface SupplierGrvManagerProps {
  items: StockItem[];
  onItemsChange: (items: StockItem[]) => void;
  suppliers: Supplier[];
  onSuppliersChange: (suppliers: Supplier[]) => void;
}

const SupplierGrvManager: React.FC<SupplierGrvManagerProps> = ({
  items,
  onItemsChange,
  suppliers,
  onSuppliersChange,
}) => {
  const { toast } = useToast();

  const [grvs, setGrvs] = React.useState<Grv[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"add" | "edit">("add");

  // Form state
  const [formDate, setFormDate] = React.useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [formSupplierCode, setFormSupplierCode] = React.useState<string>("");
  const [formReference, setFormReference] = React.useState<string>("");
  const [formNote, setFormNote] = React.useState<string>("");
  const [itemSearch, setItemSearch] = React.useState<string>("");

  // Selected items for GRV form (map by stockCode)
  const [selectedItems, setSelectedItems] = React.useState<Record<string, GrvItem>>({});

  const filteredStockItems = React.useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (s) =>
        s.stockCode.toLowerCase().includes(q) ||
        s.stockDescr.toLowerCase().includes(q),
    );
  }, [itemSearch, items]);

  const resetForm = () => {
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormSupplierCode("");
    setFormReference("");
    setFormNote("");
    setItemSearch("");
    setSelectedItems({});
  };

  const openAdd = () => {
    setMode("add");
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = () => {
    if (selectedIds.length !== 1) {
      toast({
        title: "Select one GRV",
        description: "Please select exactly one GRV to edit.",
      });
      return;
    }
    const g = grvs.find((x) => x.id === selectedIds[0]);
    if (!g) return;

    setMode("edit");
    setFormDate(g.date);
    setFormSupplierCode(g.supplierCode);
    setFormReference(g.reference);
    setFormNote(g.note ?? "");
    const map: Record<string, GrvItem> = {};
    g.items.forEach((it) => {
      map[it.stockCode] = { ...it };
    });
    setSelectedItems(map);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      toast({
        title: "No selection",
        description: "Please select GRVs to delete.",
      });
      return;
    }
    setGrvs((prev) => prev.filter((g) => !selectedIds.includes(g.id)));
    setSelectedIds([]);
    toast({ title: "Deleted", description: "Selected GRVs removed." });
  };

  const toggleRowSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const set = new Set(prev);
      if (checked) set.add(id);
      else set.delete(id);
      return Array.from(set);
    });
  };

  const toggleItemSelect = (stockCode: string, checked: boolean, stockDescr: string, baseCost: number, baseSelling: number) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (checked) {
        next[stockCode] =
          next[stockCode] || {
            stockCode,
            stockDescr,
            qty: 0,
            costPrice: baseCost,
            sellingPrice: baseSelling,
          };
      } else {
        delete next[stockCode];
      }
      return next;
    });
  };

  const updateItemQty = (stockCode: string, qty: number) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[stockCode]) next[stockCode].qty = qty;
      return next;
    });
  };

  const updateItemCost = (stockCode: string, cost: number) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[stockCode]) next[stockCode].costPrice = cost;
      return next;
    });
  };

  const updateItemSelling = (stockCode: string, price: number) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[stockCode]) next[stockCode].sellingPrice = price;
      return next;
    });
  };

  const onSave = () => {
    const itemsArr = Object.values(selectedItems);
    if (!formDate || !formSupplierCode || !formReference) {
      toast({
        title: "Missing fields",
        description: "Please fill date, supplier and reference.",
      });
      return;
    }
    if (itemsArr.length === 0) {
      toast({
        title: "No items selected",
        description: "Select stock items to receive.",
      });
      return;
    }
    if (itemsArr.some((it) => !Number.isFinite(it.qty) || it.qty <= 0)) {
      toast({
        title: "Invalid quantities",
        description: "All selected items must have a quantity greater than 0.",
      });
      return;
    }

    // Compute GRV total using costPrice * qty
    const grvTotal = itemsArr.reduce((sum, it) => sum + it.costPrice * it.qty, 0);

    // Update stock items: add qty to On Hand and adjust prices
    onItemsChange(
      items.map((i) => {
        const it = selectedItems[i.stockCode];
        if (!it) return i;
        return {
          ...i,
          quantityOnHand: i.quantityOnHand + it.qty,
          costPrice: it.costPrice,
          sellingPrice: it.sellingPrice,
        };
      }),
    );

    // Update supplier balance: add GRV total
    onSuppliersChange(
      suppliers.map((s) =>
        s.supplierCode === formSupplierCode
          ? { ...s, currentBalance: s.currentBalance + grvTotal }
          : s,
      ),
    );

    if (mode === "add") {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newGrv: Grv = {
        id,
        date: formDate,
        supplierCode: formSupplierCode,
        reference: formReference.trim(),
        note: formNote.trim(),
        items: itemsArr,
      };
      setGrvs((prev) => [newGrv, ...prev]);
      toast({ title: "GRV saved", description: "Stock and supplier balance updated." });
    } else {
      const id = selectedIds[0];
      setGrvs((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                date: formDate,
                supplierCode: formSupplierCode,
                reference: formReference.trim(),
                note: formNote.trim(),
                items: itemsArr,
              }
            : g,
        ),
      );
      toast({ title: "GRV updated", description: "Stock and supplier balance updated." });
    }

    setDialogOpen(false);
    resetForm();
  };

  const allSelected = grvs.length > 0 && selectedIds.length === grvs.length;
  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(grvs.map((g) => g.id));
    else setSelectedIds([]);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
        <Button size="sm" variant="outline" onClick={openEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* GRV Grid */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(c: boolean) => toggleSelectAll(!!c)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Stock Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grvs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No GRVs captured yet. Click Add to create one.
                </TableCell>
              </TableRow>
            ) : (
              grvs.map((g) => {
                const checked = selectedIds.includes(g.id);
                const supplierName =
                  suppliers.find((s) => s.supplierCode === g.supplierCode)?.supplierName ?? g.supplierCode;
                return (
                  <TableRow key={g.id} data-state={checked ? "selected" : undefined}>
                    <TableCell className="w-12">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c: boolean) => toggleRowSelection(g.id, !!c)}
                        aria-label={`Select ${g.reference}`}
                      />
                    </TableCell>
                    <TableCell>{g.date}</TableCell>
                    <TableCell className="font-medium">{supplierName}</TableCell>
                    <TableCell className="truncate">{g.reference}</TableCell>
                    <TableCell className="text-right">{g.items.length}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "New Supplier GRV" : "Edit Supplier GRV"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Date</Label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Supplier</Label>
              <Select value={formSupplierCode} onValueChange={setFormSupplierCode}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.supplierCode} value={s.supplierCode}>
                      <span className="font-mono">{s.supplierCode}</span> – {s.supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Reference</Label>
              <Input
                placeholder="e.g. GRV-2024-001"
                value={formReference}
                onChange={(e) => setFormReference(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-sm font-medium">Note</Label>
              <Textarea
                placeholder="Optional note"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Stock items selection + selected items editor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Items list */}
            <div className="rounded-lg border">
              <div className="flex items-center gap-2 p-3 border-b">
                <Input
                  placeholder="Search items by code or name..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="max-h-60 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStockItems.map((it) => {
                      const checked = !!selectedItems[it.stockCode];
                      return (
                        <TableRow key={it.stockCode}>
                          <TableCell className="w-12">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(c: boolean) =>
                                toggleItemSelect(it.stockCode, !!c, it.stockDescr, it.costPrice, it.sellingPrice)
                              }
                              aria-label={`Select ${it.stockCode}`}
                            />
                          </TableCell>
                          <TableCell className="font-mono">{it.stockCode}</TableCell>
                          <TableCell>{it.stockDescr}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Selected items editor */}
            <div className="rounded-lg border">
              <div className="p-3 border-b">
                <div className="text-sm font-semibold">Selected Items</div>
                <div className="text-xs text-muted-foreground">
                  Enter received quantity and adjust cost/selling price as needed.
                </div>
              </div>
              <div className="max-h-60 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead className="hidden md:table-cell">Name</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Cost Price</TableHead>
                      <TableHead className="text-right">Selling Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.values(selectedItems).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No items selected yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      Object.values(selectedItems).map((it) => (
                        <TableRow key={it.stockCode}>
                          <TableCell className="font-mono">{it.stockCode}</TableCell>
                          <TableCell className="hidden md:table-cell">{it.stockDescr}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              step="1"
                              className="h-9 w-24 text-sm"
                              value={it.qty}
                              onChange={(e) =>
                                updateItemQty(
                                  it.stockCode,
                                  Number(e.target.value || 0),
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              className="h-9 w-28 text-sm"
                              value={it.costPrice}
                              onChange={(e) =>
                                updateItemCost(
                                  it.stockCode,
                                  Number(e.target.value || 0),
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              className="h-9 w-28 text-sm"
                              value={it.sellingPrice}
                              onChange={(e) =>
                                updateItemSelling(
                                  it.stockCode,
                                  Number(e.target.value || 0),
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSave}>
              {mode === "add" ? "Complete GRV" : "Update GRV"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierGrvManager;