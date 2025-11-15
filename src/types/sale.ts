"use client";

export type SaleMethod = "cash" | "card" | "account";
export type SaleType = "new" | "account";

export type SaleRecord = {
  id: string;
  saleNo: string;
  date: string; // ISO string
  saleType: SaleType;
  method: SaleMethod;
  customerCode?: string;
  subtotal: number;
  tax: number;
  total: number;
};