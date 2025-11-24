"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWhatsAppStats, type Stats } from "@/utils/stats";
import { getPosStats, type PosStats } from "@/utils/posStats"; // Import new POS stats utility
import { Send, Clock, Users, LayoutDashboard, RefreshCw, DollarSign, CreditCard, Wallet, Package } from "lucide-react"; // Add new icons
import { showSuccess } from "@/utils/toast";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const StatTile = ({
  icon,
  label,
  value,
  trend,
  color = "blue",
  currency = false, // New prop for currency formatting
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: string;
  color?: "blue" | "green" | "orange" | "purple" | "red" | "cyan"; // Added more colors
  currency?: boolean;
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      text: "text-blue-700",
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      text: "text-green-700",
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      text: "text-orange-700",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      text: "text-purple-700",
    },
    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
      text: "text-red-700",
    },
    cyan: {
      bg: "bg-cyan-50",
      icon: "text-cyan-600",
      text: "text-cyan-700",
    },
  };

  const currentColor = colorClasses[color];
  const formattedValue = currency ? `R ${Number(value).toFixed(2)}` : value.toLocaleString();

  return (
    <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`p-3 rounded-lg ${currentColor.bg} ${currentColor.icon}`}> {/* Smaller padding */}
              {icon}
            </div>
          </div>
          <div className="text-base font-semibold text-gray-600 mb-1"> {/* Smaller font */}
            {label}
          </div>
          <div className={`text-3xl font-bold ${currentColor.text} mb-2`}> {/* Smaller font */}
            {formattedValue}
          </div>
          {trend && (
            <div className="text-xs font-medium text-green-600 mt-2 bg-green-50 px-2 py-0.5 rounded-full inline-block"> {/* Smaller font/padding */}
              {trend}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const DashboardStats: React.FC = () => {
  const [whatsAppStats, setWhatsAppStats] = React.useState<Stats>(getWhatsAppStats());
  const [posStats, setPosStats] = React.useState<PosStats>(getPosStats()); // New state for POS stats
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setWhatsAppStats(getWhatsAppStats());
    setPosStats(getPosStats()); // Refresh POS stats
    setIsRefreshing(false);
    showSuccess("Dashboard updated successfully");
  };

  const chartConfig = {
    total: { label: "Total Sales", color: "hsl(var(--primary))" },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Overview</h2>
          <p className="text-gray-600 text-lg mt-2">
            Your application statistics at a glance
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={refresh}
          disabled={isRefreshing}
          className="flex m-2 items-center gap-3 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 text-base font-medium">
          <RefreshCw
            className={`size-5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh Stats"}
        </Button>
      </div>

      {/* WhatsApp Stats */}
      <h3 className="text-xl font-semibold text-gray-900 mt-6">WhatsApp Campaign Stats</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"> {/* Smaller gap */}
        <StatTile
          icon={<Send className="size-6" />} {/* Smaller icon */}
          label="Messages Sent"
          value={whatsAppStats.sentCount}
          color="green"
        />
        <StatTile
          icon={<Clock className="size-6" />} {/* Smaller icon */}
          label="Pending Messages"
          value={whatsAppStats.pendingCount}
          color="orange"
        />
        <StatTile
          icon={<Users className="size-6" />} {/* Smaller icon */}
          label="Total Contacts"
          value={whatsAppStats.contactCount}
          color="blue"
        />
        <StatTile
          icon={<LayoutDashboard className="size-6" />} {/* Smaller icon */}
          label="Active Groups"
          value={whatsAppStats.groupCount}
          color="purple"
        />
      </div>

      {/* Store POS Analytical Data */}
      <h3 className="text-xl font-semibold text-gray-900 mt-8">Store POS Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"> {/* Smaller gap */}
        <StatTile
          icon={<DollarSign className="size-6" />}
          label="Total Sales"
          value={posStats.totalSales}
          color="red"
          currency={true}
        />
        <StatTile
          icon={<CreditCard className="size-6" />}
          label="Card Sales"
          value={posStats.cardSales}
          color="cyan"
          currency={true}
        />
        <StatTile
          icon={<Wallet className="size-6" />}
          label="Cash Sales"
          value={posStats.cashSales}
          color="green"
          currency={true}
        />
        <StatTile
          icon={<Package className="size-6" />}
          label="Stock Valuation"
          value={posStats.totalStockValue}
          color="orange"
          currency={true}
        />
      </div>

      {/* Daily Sales Graph */}
      <h3 className="text-xl font-semibold text-gray-900 mt-8">Daily Sales (Last 7 Days)</h3>
      <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        {posStats.dailySales.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sales data for the last 7 days.
          </div>
        ) : (
          <div className="h-64"> {/* Adjusted height */}
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={posStats.dailySales} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={30}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `R ${value.toFixed(0)}`}
                    fontSize={12}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel formatter={(value: number) => `R ${value.toFixed(2)}`} />}
                  />
                  <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardStats;