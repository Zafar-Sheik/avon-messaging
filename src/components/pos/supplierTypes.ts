"use client";

import { z } from "zod";

export const supplierSchema = z.object({
  supplierCode: z.string().min(1, "Supplier code is required"),
  supplierName: z.string().min(1, "Supplier name is required"),
  address: z.string().min(1, "Address is required"),
  cellNumber: z.string().min(1, "Cell number is required"),
  currentBalance: z.coerce.number().min(0, "Current balance must be 0 or more"),
  ageingBalance: z.coerce.number().min(0, "Ageing balance must be 0 or more"),
  contra: z.string().min(1, "Contra is required"),
});

export type Supplier = z.infer<typeof supplierSchema>;

export const initialSuppliers: Supplier[] = [
  {
    supplierCode: "SUP-001",
    supplierName: "Acme Supplies",
    address: "123 Main Street, Cityville",
    cellNumber: "+1 555 123 4567",
    currentBalance: 12050.75,
    ageingBalance: 2050.25,
    contra: "2001-ACME",
  },
  {
    supplierCode: "SUP-002",
    supplierName: "Electro Co",
    address: "42 Tech Park, Silicon City",
    cellNumber: "+1 555 987 6543",
    currentBalance: 8040.0,
    ageingBalance: 950.0,
    contra: "2002-ECO",
  },
];