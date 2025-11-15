"use client";

import { z } from "zod";

export const stockItemSchema = z
  .object({
    stockCode: z.string().min(1, "Stock code is required"),
    stockDescr: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required"),
    size: z.string().optional(),
    costPrice: z.coerce.number().min(0, "Cost must be 0 or more"),
    sellingPrice: z.coerce.number().min(0, "Selling price must be 0 or more"),
    quantityOnHand: z.coerce.number().min(0, "Quantity must be 0 or more"),
    quantityInWarehouse: z.coerce.number().min(0, "Warehouse quantity must be 0 or more"),
    supplier: z.string().optional(),
    vat: z.coerce.number().min(0, "VAT must be 0 or more").max(100, "VAT must be 100% or less"),
    imageDataUrl: z.string().optional(),

    // NEW: stock level thresholds
    minLevel: z.coerce.number().min(0, "Min level must be 0 or more"),
    maxLevel: z.coerce.number().min(0, "Max level must be 0 or more"),

    // NEW: promotion fields
    promotion: z.boolean().default(false),
    promoStartDate: z.string().optional(),
    promoEndDate: z.string().optional(),
    promoPrice: z.coerce.number().min(0, "Promotion price must be 0 or more").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.promotion) {
      if (!data.promoStartDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Promotion start date is required", path: ["promoStartDate"] });
      }
      if (!data.promoEndDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Promotion end date is required", path: ["promoEndDate"] });
      }
      if (data.promoStartDate && data.promoEndDate) {
        const s = new Date(data.promoStartDate);
        const e = new Date(data.promoEndDate);
        if (isNaN(s.getTime())) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid start date", path: ["promoStartDate"] });
        }
        if (isNaN(e.getTime())) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid end date", path: ["promoEndDate"] });
        }
        if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && s > e) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date must be after start date", path: ["promoEndDate"] });
        }
      }
      if (typeof data.promoPrice !== "number") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Promotion price is required", path: ["promoPrice"] });
      }
    }
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
    quantityInWarehouse: 60,
    supplier: "Acme Supplies",
    vat: 15,
    imageDataUrl: "",
    minLevel: 5,
    maxLevel: 50,
    promotion: false,
    promoStartDate: undefined,
    promoEndDate: undefined,
    promoPrice: undefined,
  },
  {
    stockCode: "SKU-002",
    stockDescr: "Widget B",
    category: "electronics",
    size: "",
    costPrice: 200,
    sellingPrice: 280,
    quantityOnHand: 12,
    quantityInWarehouse: 30,
    supplier: "Electro Co",
    vat: 15,
    imageDataUrl: "",
    minLevel: 3,
    maxLevel: 40,
    promotion: false,
    promoStartDate: undefined,
    promoEndDate: undefined,
    promoPrice: undefined,
  },
];