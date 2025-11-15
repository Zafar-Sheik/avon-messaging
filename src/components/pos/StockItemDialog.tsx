"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockItemSchema, type StockItem } from "@/components/pos/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface StockItemDialogProps {
  open: boolean;
  mode: "add" | "edit";
  initialValues?: StockItem;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: StockItem) => void;
}

const defaultValues: StockItem = {
  stockCode: "",
  stockDescr: "",
  category: "",
  size: "",
  costPrice: 0,
  sellingPrice: 0,
  quantityOnHand: 0,
  quantityInWarehouse: 0,
  supplier: "",
  vat: 15,
  imageDataUrl: "",
  minLevel: 0,
  maxLevel: 0,
  promotion: false,
  promoStartDate: "",
  promoEndDate: "",
  promoPrice: 0,
  isActive: true,
};

const StockItemDialog: React.FC<StockItemDialogProps> = ({
  open,
  mode,
  initialValues,
  onOpenChange,
  onSubmit,
}) => {
  const form = useForm<StockItem>({
    resolver: zodResolver(stockItemSchema),
    defaultValues,
    mode: "onChange",
  });

  React.useEffect(() => {
    if (mode === "edit" && initialValues) {
      form.reset(initialValues);
    } else {
      form.reset(defaultValues);
    }
  }, [mode, initialValues, form]);

  const cost = form.watch("costPrice") || 0;
  const sell = form.watch("sellingPrice") || 0;
  const gpAmount = sell - cost;
  const gpPercent = sell > 0 ? (gpAmount / sell) * 100 : 0;
  const imagePreview = form.watch("imageDataUrl") || "";
  const promotion = form.watch("promotion") || false;
  const isActive = form.watch("isActive");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <FormItem className="md:col-span-3">
                <FormLabel>Status</FormLabel>
                <div className="flex items-center gap-2 px-2 py-2 rounded-md border bg-muted/40">
                  <span className="text-xs text-muted-foreground">Inactive</span>
                  <Switch checked={!!isActive} onCheckedChange={(v) => form.setValue("isActive", v)} />
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
              </FormItem>
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

            {/* Image upload & smaller preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormItem className="md:col-span-2">
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    className="h-9 text-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        form.setValue("imageDataUrl", String(reader.result), { shouldDirty: true, shouldValidate: false });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </FormControl>
              </FormItem>
              <div className="space-y-1.5">
                <FormLabel>Preview</FormLabel>
                <div className="w-20">
                  <AspectRatio ratio={1} className="rounded-md border bg-muted/40">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Item preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                  </AspectRatio>
                </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                name="quantityInWarehouse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity in Warehouse</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="0" {...field} className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Level</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="0" {...field} className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Level</FormLabel>
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
                  <FormItem className="md:col-span-4">
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input placeholder="Supplier name" {...field} className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Promotion */}
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <FormLabel className="text-sm font-semibold">Promotion</FormLabel>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Off</span>
                  <Switch checked={promotion} onCheckedChange={(v) => form.setValue("promotion", v)} />
                  <span className="text-xs text-muted-foreground">On</span>
                </div>
              </div>
              {promotion && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <FormField
                    control={form.control}
                    name="promoStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="h-9 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="promoEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="h-9 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="promoPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promo Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} className="h-9 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
  );
};

export default StockItemDialog;