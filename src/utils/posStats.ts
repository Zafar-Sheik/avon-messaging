"use client";

import { initialStockItems, type StockItem } from "@/components/pos/types";
import { getSales, aggregateTotals, SaleRecord } from "@/utils/saleStore";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export type PosStats = {
  totalStockValue: number;
  totalSales: number;
  cardSales: number;
  cashSales: number;
  dailySales: { date: string; total: number }[];
};

export const getPosStats = (): PosStats => {
  // Stock Valuation
  const totalStockValue = initialStockItems.reduce(
    (sum, item) => sum + (item.quantityOnHand + item.quantityInWarehouse) * item.costPrice,
    0
  );

  // Sales Data
  const allSales = getSales();
  const aggregated = aggregateTotals(allSales);

  // Daily Sales for the last 7 days
  const dailySalesMap = new Map<string, number>();
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const formattedDate = format(date, "MMM dd");
    dailySalesMap.set(formattedDate, 0); // Initialize with 0
  }

  allSales.forEach(sale => {
    const saleDate = new Date(sale.date);
    // Only consider sales within the last 7 days for the chart
    if (saleDate >= startOfDay(subDays(today, 6)) && saleDate <= endOfDay(today)) {
      const formattedDate = format(saleDate, "MMM dd");
      dailySalesMap.set(formattedDate, (dailySalesMap.get(formattedDate) || 0) + sale.total);
    }
  });

  const dailySales = Array.from(dailySalesMap.entries()).map(([date, total]) => ({
    date,
    total,
  }));

  return {
    totalStockValue,
    totalSales: aggregated.grandTotal,
    cardSales: aggregated.cardTotal,
    cashSales: aggregated.cashTotal,
    dailySales,
  };
};