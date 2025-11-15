"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Image as ImageIcon } from "lucide-react";

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

type StockItemFormValues = z.infer<typeof stockItemSchema>;

const StockItemForm: React.FC = () => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const form = useForm<StockItemFormValues>({
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

  const cost = form.watch("costPrice") || 0;
  const sell = form.watch("sellingPrice") || 0;
  const gpAmount = sell - cost;
  const gpPercent = sell > 0 ? (gpAmount / sell) * 100 : 0;

  const onSubmit = (values: StockItemFormValues) => {
    toast({
      title: "Stock item saved",
      description: `Code ${values.stockCode} • GP ${gpAmount.toFixed(2)} (${gpPercent.toFixed(1)}%)`,
    });
    // Note: Add persistence (database/upload) later as needed.
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">Stock Item</CardTitle>
        <CardDescription>Add item details and upload an image.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image upload */}
        <div className="space-y-2">
          <FormLabel>Item Image</FormLabel>
          <div className="flex items-center gap-4">
            <label
              htmlFor="stock-image"
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-muted"
            >
              <ImageIcon className="size-4" />
              <span>Upload image</span>
            </label>
            <Input id="stock-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-16 w-16 rounded-md object-cover border"
              />
            ) : (
              <div className="h-16 w-16 rounded-md border bg-muted/40 flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="stockCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SKU-001" {...field} />
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
                      <Input placeholder="Item description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category & size */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
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
                      <Input placeholder="e.g. S, M, L or custom size" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>GP</FormLabel>
                <div className="px-3 py-2 border rounded-md bg-muted/40">
                  <div className="text-sm">Amount: {gpAmount.toFixed(2)}</div>
                  <div className="text-sm">Percent: {gpPercent.toFixed(1)}%</div>
                </div>
              </FormItem>
              <FormField
                control={form.control}
                name="vat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Inventory & supplier */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantityOnHand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity On Hand</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="0" {...field} />
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
                      <Input placeholder="Supplier name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" className="w-fit">Save Item</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                Clear
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StockItemForm;