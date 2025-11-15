"use client";

import { parseISO } from "date-fns";
import type { SaleRecord, SaleMethod, SaleType } from "@/types/sale";

const STORAGE_KEY = "dyad_sales";

const uuid = () => {
  if ("crypto" in window && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const loadSales = (): SaleRecord[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SaleRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveSales = (sales: SaleRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
};

export const getSales = (): SaleRecord[] => loadSales();

export const recordSale = (sale: Omit<SaleRecord, "id">): SaleRecord => {
  const rec: SaleRecord = { ...sale, id: uuid() };
  const sales = loadSales();
  sales.unshift(rec);
  saveSales(sales);
  return rec;
};

export const getSalesByRange = (start: Date, end: Date): SaleRecord[] => {
  const s = start.getTime();
  const e = end.getTime();
  return loadSales().filter((rec) => {
    const t = parseISO(rec.date).getTime();
    return t >= s && t <= e;
  });
};

export const aggregateTotals = (sales: SaleRecord[]) => {
  const totals = {
    count: sales.length,
    cashTotal: 0,
    cardTotal: 0,
    accountTotal: 0,
    grandTotal: 0,
  };
  for (const s of sales) {
    if (s.method === "cash") totals.cashTotal += s.total;
    else if (s.method === "card") totals.cardTotal += s.total;
    else totals.accountTotal += s.total;
    totals.grandTotal += s.total;
  }
  return totals;
};

export const getRecentSales = (limit = 10): SaleRecord[] => {
  const sales = loadSales();
  return sales.slice(0, limit);
};