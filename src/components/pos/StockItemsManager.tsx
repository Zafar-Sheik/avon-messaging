"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const stockItemSchema = z.object({
  stockCode: z.string().min(1, "Stock code is required"),
  stockDescr: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  size: z.string().optional(),
  costPrice: z.coerce.number().min(0, "Cost must be 0 or more"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be 0 or more"),
  quantityOnHand: z.coerce.number().min(0, "Quantity must be 0 or more"),
  supplier: z.string().optional(),
  vat: z.coerce.number().min(0, "VAT must be 0 or more").max(100, "VAT must be 100% or less"),
});

type StockItem = z.infer<typeof stockItemSchema>;

const initialData: StockItem[] = [
  {
    stockCode: "SKU-001",
    stockDescr: "Widget A",
    category: "general",
    size: "M",
    costPrice: 100,
    sellingPrice: 150,
    quantityOnHand: 25,
    supplier: "Acme Supplies",
    vat: 15,
  },
  {
    stockCode: "SKU-002",
    stockDescr: "Widget B",
    category: "electronics",
    size: "",
    costPrice: 200,
    sellingPrice: 280,
    quantityOnHand: 12,
    supplier: "Electro Co",
    vat: 15,
  },
];

const StockItemsManager: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = React.useState<StockItem[]>(initialData);
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"add" | "edit">("add");

  const form = useForm<StockItem>({
    resolver: zodResolver(stockItemSchema),
    defaultValues: {
      stockCode: "",
      stockDescr: "",
      category: "",
      size: "",
      costPrice: 0,
      sellingPrice: 0,
      quantityOnHand: 0,
      supplier: "",
      vat: 15,
    },
    mode: "onChange",
  });

  const resetForm = () => {
    form.reset({
      stockCode: "",
      stockDescr: "",
      category: "",
      size: "",
      costPrice: 0,
      sellingPrice: 0,
      quantityOnHand: 0,
      supplier: "",
      vat: 15,
    });
  };

  const openAdd = () => {
    setMode("add");
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = () => {
    if (selectedCodes.length !== 1) {
      toast({ title: "Select one item", description: "Please select exactly one item to edit." });
      return;
    }
    const itm = items.find((i) => i.stockCode === selectedCodes[0]);
    if (!itm) return;
    setMode("edit");
    form.reset(itm);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedCodes.length === 0) {
      toast({ title: "No selection", description: "Please select items to delete." });
      return;
    }
    setItems((prev) => prev.filter((i) => !selectedCodes.includes(i.stockCode)));
    setSelectedCodes([]);
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
    else setSelectedCodes([]);
  };

  const onSubmit = (values: StockItem) => {
    if (mode === "add") {
      // enforce unique stockCode
      if (items.some((i) => i.stockCode.trim().toLowerCase() === values.stockCode.trim().toLowerCase())) {
        toast({ title: "Duplicate code", description: "An item with this stock code already exists." });
        return;
      }
      setItems((prev) => [{ ...values }, ...prev]);
      toast({ title: "Saved", description: `Item ${values.stockCode} added.` });
    } else {
      const code = selectedCodes[0];
      setItems((prev) =>
        prev.map((i) => (i.stockCode === code ? { ...values } : i)),
      );
      toast({ title: "Updated", description: `Item ${values.stockCode} updated.` });
    }
    setDialogOpen(false);
    resetForm();
  };

  const cost = form.watch("costPrice") || 0;
  const sell = form.watch("sellingPrice") || 0;
  const gpAmount = sell - cost;
  const gpPercent = sell > 0 ? (gpAmount / sell) * 100 : 0;

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
        <Button size="sm" variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* Grid */}
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
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Size</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="hidden md:table-cell">Supplier</TableHead>
              <TableHead className="text-right hidden md:table-cell">VAT %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No stock items yet. Click Add to create one.
                </TableCell>
              </TableRow>
            ) : (
              items.map((i) => {
                const checked = selectedCodes.includes(i.stockCode);
                return (
                  <TableRow key={i.stockCode} data-state={checked ? "selected" : undefined}>
                    <TableCell className="w-12">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c: boolean) => toggleRowSelection(i.stockCode, !!c)}
                        aria-label={`Select ${i.stockCode}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono">{i.stockCode}</TableCell>
                    <TableCell className="truncate">{i.stockDescr}</TableCell>
                    <TableCell className="hidden md:table-cell">{i.category}</TableCell>
                    <TableCell className="hidden md:table-cell">{i.size || "-"}</TableCell>
                    <TableCell className="text-right">{i.costPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{i.sellingPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{i.quantityOnHand}</TableCell>
                    <TableCell className="hidden md:table-cell">{i.supplier || "-"}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">{i.vat.toFixed(1)}</TableCell>
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
            <DialogTitle>{mode === "add" ? "Add Stock Item" : "Edit Stock Item"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Basic details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="stockCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SKU-001" {...field} className="h-9 text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stockDescr"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Item description" {...field} className="h-9 text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Category & size */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="grocery">Grocery</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Size</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. S, M, L or custom size" {...field} className="h-9 text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pricing grouped */}
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="mb-2">
                  <FormLabel className="text-sm font-semibold">Pricing</FormLabel>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} className="h-9 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} className="h-9 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel className="text-sm">GP</FormLabel>
                    <div className="px-2 py-1.5 text-sm border rounded-md bg-muted/40">
                      <div>Amount: {gpAmount.toFixed(2)}</div>
                      <div>Percent: {gpPercent.toFixed(1)}%</div>
                    </div>
                  </FormItem>
                  <FormField
                    control={form.control}
                    name="vat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="15" {...field} className="h-9 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Inventory & supplier */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="quantityOnHand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity On Hand</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="0" {...field} className="h-9 text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input placeholder="Supplier name" {...field} className="h-9 text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {mode === "add" ? "Save Item" : "Update Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockItemsManager;