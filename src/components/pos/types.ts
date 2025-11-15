"use client";

import { z } from "zod";

export const stockItemSchema = z.object({
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

export type StockItem = z.infer<typeof stockItemSchema>;

export const initialStockItems: StockItem[] = [
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