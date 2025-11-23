"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Store, DollarSign, Package, CreditCard, Wallet, CalendarDays } from "lucide-react";
import { getSalesByRange, aggregateTotals } from "@/utils/saleStore";
import { initialStockItems } from "@/components/pos/types";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

// Helper component for consistent stat card display
const StatCard = ({
  icon,
  label,
  value,
  description,
  colorClass = "text-blue-600",
  bgColorClass = "bg-blue-50",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
  colorClass?: string;
  bgColorClass?: string;
}) => (
  <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${bgColorClass} ${colorClass}`}>
            {icon}
          </div>
        </div>
        <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-2">{description}</div>
        )}
      </div>
    </div>
  </Card>
);

const PosDashboardStats: React.FC = () => {
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);
  const startOfCurrentMonth = startOfMonth(today);
  const endOfCurrentMonth = endOfMonth(today);

  const todaySales = React.useMemo(() => getSalesByRange(startOfToday, endOfToday), [startOfToday, endOfToday]);
  const todayTotals = React.useMemo(() => aggregateTotals(todaySales), [todaySales]);

  const monthSales = React.useMemo(() => getSalesByRange(startOfCurrentMonth, endOfCurrentMonth), [startOfCurrentMonth, endOfCurrentMonth]);
  const monthTotals = React.useMemo(() => aggregateTotals(monthSales), [monthSales]);

  const stockValuation = React.useMemo(() => {
    return initialStockItems.reduce((sum, item) => {
      return sum + (item.costPrice * item.quantityOnHand);
    }, 0);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">POS Overview</h2>
          <p className="text-gray-600 text-lg mt-2">
            Key metrics for your Point-of-Sale operations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Link to Store POS */}
        <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
          <CardHeader className="p-0 pb-4">
            <Store className="size-8" />
            <CardTitle className="text-2xl font-bold mt-2">Store POS</CardTitle>
            <CardDescription className="text-white/90">
              Access your Point-of-Sale system
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Link to="/store-pos">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white w-full">
                Go to POS
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Total Sales Today */}
        <StatCard
          icon={<DollarSign className="size-5" />}
          label="Total Sales Today"
          value={`R ${todayTotals.grandTotal.toFixed(2)}`}
          description={`${todayTotals.count} transactions`}
          colorClass="text-green-600"
          bgColorClass="bg-green-50"
        />

        {/* Total Sales This Month */}
        <StatCard
          icon={<CalendarDays className="size-5" />}
          label="Total Sales This Month"
          value={`R ${monthTotals.grandTotal.toFixed(2)}`}
          description={`${monthTotals.count} transactions`}
          colorClass="text-purple-600"
          bgColorClass="bg-purple-50"
        />

        {/* Stock Valuation */}
        <StatCard
          icon={<Package className="size-5" />}
          label="Stock Valuation (Cost)"
          value={`R ${stockValuation.toFixed(2)}`}
          description="Total cost of all items on hand"
          colorClass="text-orange-600"
          bgColorClass="bg-orange-50"
        />

        {/* Cash Sales Today */}
        <StatCard
          icon={<Wallet className="size-5" />}
          label="Cash Sales Today"
          value={`R ${todayTotals.cashTotal.toFixed(2)}`}
          colorClass="text-teal-600"
          bgColorClass="bg-teal-50"
        />

        {/* Card Sales Today */}
        <StatCard
          icon={<CreditCard className="size-5" />}
          label="Card Sales Today"
          value={`R ${todayTotals.cardTotal.toFixed(2)}`}
          colorClass="text-red-600"
          bgColorClass="bg-red-50"
        />
      </div>
    </div>
  );
};

export default PosDashboardStats;