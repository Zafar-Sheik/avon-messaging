"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  imageUrl: z.string().url("Enter a valid URL").optional(),
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
    imageUrl: "/images/contact-messaging.jpg",
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
    imageUrl: "/images/contact-online-solutions.png",
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
      imageUrl: "",
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
      imageUrl: "",
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
    const newCode = values.stockCode.trim().toLowerCase();
    if (mode === "add") {
      if (items.some((i) => i.stockCode.trim().toLowerCase() === newCode)) {
        toast({ title: "Duplicate code", description: "An item with this stock code already exists." });
        return;
      }
      setItems((prev) => [{ ...values }, ...prev]);
      toast({ title: "Saved", description: `Item ${values.stockCode} added.` });
    } else {
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
    }
    setDialogOpen(false);
    resetForm();
  };

  const cost = form.watch("costPrice") || 0;
  const sell = form.watch("sellingPrice") || 0;
  const gpAmount = sell - cost;
  const gpPercent = sell > 0 ? (gpAmount / sell) * 100 : 0;
  const imagePreview = form.watch("imageUrl") || "";

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

      {/* Flexible Grid Table */}
      <div className="rounded-lg border overflow-hidden">
        {/* Header (desktop) */}
        <div className="hidden md:grid grid-cols-[40px_64px_120px_1fr_120px_80px_80px_80px_80px_140px_80px] items-center gap-2 px-3 py-2 bg-muted/40 text-xs font-medium">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(c: boolean) => toggleSelectAll(!!c)}
              aria-label="Select all"
            />
          </div>
          <div className="text-muted-foreground">Image</div>
          <div>Code</div>
          <div>Description</div>
          <div className="text-muted-foreground">Category</div>
          <div className="text-muted-foreground">Size</div>
          <div className="text-right">Cost</div>
          <div className="text-right">Price</div>
          <div className="text-right">Qty</div>
          <div className="text-muted-foreground">Supplier</div>
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
                    className="hidden md:grid grid-cols-[40px_64px_120px_1fr_120px_80px_80px_80px_80px_140px_80px] items-center gap-2 px-3 py-2 hover:bg-muted/30"
                  >
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c: boolean) => toggleRowSelection(i.stockCode, !!c)}
                        aria-label={`Select ${i.stockCode}`}
                      />
                    </div>
                    <div>
                      <div className="w-12 h-12 overflow-hidden rounded bg-muted">
                        <img
                          src={i.imageUrl || "/placeholder.svg"}
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
                    <div>{i.supplier || "-"}</div>
                    <div className="text-right">{i.vat.toFixed(1)}</div>
                  </div>

                  {/* Row (mobile) */}
                  <div className="md:hidden p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c: boolean) => toggleRowSelection(i.stockCode, !!c)}
                        aria-label={`Select ${i.stockCode}`}
                      />
                      <span className="font-mono">{i.stockCode}</span>
                      <span className="ml-auto text-sm font-semibold">{i.sellingPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-sm">{i.stockDescr}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Qty: {i.quantityOnHand}</span>
                      <span>Cost: {i.costPrice.toFixed(2)}</span>
                      <span>VAT: {i.vat.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 overflow-hidden rounded bg-muted">
                        <img
                          src={i.imageUrl || "/placeholder.svg"}
                          alt={i.stockDescr}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">{i.supplier || "-"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

              {/* Image URL & preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          className="h-9 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-1.5">
                  <FormLabel>Preview</FormLabel>
                  <AspectRatio ratio={1} className="rounded-md border bg-muted/40">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Item preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                  </AspectRatio>
                </div>
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