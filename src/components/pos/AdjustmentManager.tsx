"use client";

import React from "react";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Printer,
  Mail,
  MessageCircle,
} from "lucide-react";

type OperationType = "add" | "minus" | "replace";

type AdjustmentItem = {
  code: string;
  name: string;
  operation: OperationType;
  quantity: number;
};

type Adjustment = {
  id: string;
  date: string; // yyyy-mm-dd
  reference: string;
  reason: string;
  items: AdjustmentItem[];
};

// Sample stock items. In a real app, pull from your store or database.
const sampleStockItems: { code: string; name: string }[] = [
  { code: "SKU-001", name: "Widget A" },
  { code: "SKU-002", name: "Widget B" },
  { code: "SKU-003", name: "Widget C" },
  { code: "SKU-004", name: "Gadget X" },
  { code: "SKU-005", name: "Gadget Y" },
];

const AdjustmentManager: React.FC = () => {
  const { toast } = useToast();
  const [adjustments, setAdjustments] = React.useState<Adjustment[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"add" | "edit">("add");

  // Form state
  const [formDate, setFormDate] = React.useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [formReference, setFormReference] = React.useState<string>("");
  const [formReason, setFormReason] = React.useState<string>("");
  const [itemSearch, setItemSearch] = React.useState<string>("");

  // Selected items for the form (map by code for easy toggle)
  const [selectedItems, setSelectedItems] = React.useState<
    Record<string, AdjustmentItem>
  >({});

  const filteredStockItems = React.useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    if (!q) return sampleStockItems;
    return sampleStockItems.filter(
      (s) =>
        s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    );
  }, [itemSearch]);

  const resetForm = () => {
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormReference("");
    setFormReason("");
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
        title: "Select one adjustment",
        description: "Please select exactly one adjustment to edit.",
      });
      return;
    }
    const adj = adjustments.find((a) => a.id === selectedIds[0]);
    if (!adj) return;

    setMode("edit");
    setFormDate(adj.date);
    setFormReference(adj.reference);
    setFormReason(adj.reason);
    const map: Record<string, AdjustmentItem> = {};
    adj.items.forEach((it) => {
      map[it.code] = { ...it };
    });
    setSelectedItems(map);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      toast({
        title: "No selection",
        description: "Please select adjustments to delete.",
      });
      return;
    }
    setAdjustments((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
    setSelectedIds([]);
    toast({ title: "Deleted", description: "Selected adjustments removed." });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    toast({
      title: "Email",
      description: "Email sending is not configured yet.",
    });
  };

  const handleWhatsApp = () => {
    toast({
      title: "WhatsApp",
      description: "WhatsApp sending is not configured yet.",
    });
  };

  const toggleRowSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const set = new Set(prev);
      if (checked) set.add(id);
      else set.delete(id);
      return Array.from(set);
    });
  };

  const toggleItemSelect = (code: string, checked: boolean, name: string) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (checked) {
        next[code] = next[code] || {
          code,
          name,
          operation: "add",
          quantity: 1,
        };
      } else {
        delete next[code];
      }
      return next;
    });
  };

  const updateItemOperation = (code: string, op: OperationType) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[code]) {
        next[code].operation = op;
      }
      return next;
    });
  };

  const updateItemQuantity = (code: string, qty: number) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[code]) {
        next[code].quantity = qty;
      }
      return next;
    });
  };

  const onSave = () => {
    const items = Object.values(selectedItems);
    if (!formDate || !formReference || !formReason) {
      toast({
        title: "Missing fields",
        description: "Please fill date, reference and reason.",
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: "No items selected",
        description: "Select stock items and set their operations.",
      });
      return;
    }

    if (mode === "add") {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newAdj: Adjustment = {
        id,
        date: formDate,
        reference: formReference.trim(),
        reason: formReason.trim(),
        items,
      };
      setAdjustments((prev) => [newAdj, ...prev]);
      toast({ title: "Saved", description: "Adjustment added." });
    } else {
      const id = selectedIds[0];
      setAdjustments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                date: formDate,
                reference: formReference.trim(),
                reason: formReason.trim(),
                items,
              }
            : a,
        ),
      );
      toast({ title: "Updated", description: "Adjustment updated." });
    }

    setDialogOpen(false);
    resetForm();
  };

  const allSelected =
    adjustments.length > 0 && selectedIds.length === adjustments.length;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(adjustments.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
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
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button size="sm" variant="outline" onClick={handleEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button size="sm" variant="outline" onClick={handleWhatsApp}>
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Adjustments Grid */}
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
              <TableHead>Reference</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No adjustments captured yet. Click Add to create one.
                </TableCell>
              </TableRow>
            ) : (
              adjustments.map((a) => {
                const checked = selectedIds.includes(a.id);
                return (
                  <TableRow key={a.id} data-state={checked ? "selected" : undefined}>
                    <TableCell className="w-12">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c: boolean) =>
                          toggleRowSelection(a.id, !!c)
                        }
                        aria-label={`Select ${a.reference}`}
                      />
                    </TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell className="font-medium">{a.reference}</TableCell>
                    <TableCell className="truncate">{a.reason}</TableCell>
                    <TableCell className="text-right">{a.items.length}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "New Adjustment" : "Edit Adjustment"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reference</label>
              <Input
                placeholder="e.g. ADJ-2024-001"
                value={formReference}
                onChange={(e) => setFormReference(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                placeholder="Reason for adjustment"
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
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
                      const checked = !!selectedItems[it.code];
                      return (
                        <TableRow key={it.code}>
                          <TableCell className="w-12">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(c: boolean) =>
                                toggleItemSelect(it.code, !!c, it.name)
                              }
                              aria-label={`Select ${it.code}`}
                            />
                          </TableCell>
                          <TableCell className="font-mono">{it.code}</TableCell>
                          <TableCell>{it.name}</TableCell>
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
                  Choose operation and quantity per item.
                </div>
              </div>
              <div className="max-h-60 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead className="hidden md:table-cell">Name</TableHead>
                      <TableHead>Operation</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.values(selectedItems).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No items selected yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      Object.values(selectedItems).map((it) => (
                        <TableRow key={it.code}>
                          <TableCell className="font-mono">{it.code}</TableCell>
                          <TableCell className="hidden md:table-cell">{it.name}</TableCell>
                          <TableCell>
                            <Select
                              value={it.operation}
                              onValueChange={(val: OperationType) =>
                                updateItemOperation(it.code, val)
                              }
                            >
                              <SelectTrigger className="h-9 w-32">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="add">Add</SelectItem>
                                <SelectItem value="minus">Minus</SelectItem>
                                <SelectItem value="replace">Replace</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step="1"
                              className="h-9 w-24 text-sm"
                              value={it.quantity}
                              onChange={(e) =>
                                updateItemQuantity(
                                  it.code,
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
              {mode === "add" ? "Save Adjustment" : "Update Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdjustmentManager;