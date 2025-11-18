"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWhatsAppStats, type Stats } from "@/utils/stats";
import { Send, Clock, Users, LayoutDashboard, RefreshCw } from "lucide-react";
import { showSuccess } from "@/utils/toast";

const StatTile = ({
  icon,
  label,
  value,
  trend,
  color = "blue",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: string;
  color?: "blue" | "green" | "orange" | "purple";
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
  };

  const currentColor = colorClasses[color];

  return (
    <Card className="p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`p-4 rounded-2xl ${currentColor.bg} ${currentColor.icon}`}>
              {icon}
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-600 mb-2">
            {label}
          </div>
          <div className={`text-4xl font-bold ${currentColor.text} mb-2`}>
            {value}
          </div>
          {trend && (
            <div className="text-sm font-medium text-green-600 mt-2 bg-green-50 px-3 py-1 rounded-full inline-block">
              {trend}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const DashboardStats: React.FC = () => {
  const [stats, setStats] = React.useState<Stats>(getWhatsAppStats());
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStats(getWhatsAppStats());
    setIsRefreshing(false);
    showSuccess("Dashboard updated successfully");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Overview</h2>
          <p className="text-gray-600 text-lg mt-2">
            Your WhatsApp campaign statistics at a glance
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatTile
          icon={<Send className="size-7" />}
          label="Messages Sent"
          value={stats.sentCount.toLocaleString()}
          color="green"
        />
        <StatTile
          icon={<Clock className="size-7" />}
          label="Pending Messages"
          value={stats.pendingCount.toLocaleString()}
          color="orange"
        />
        <StatTile
          icon={<Users className="size-7" />}
          label="Total Contacts"
          value={stats.contactCount.toLocaleString()}
          color="blue"
        />
        <StatTile
          icon={<LayoutDashboard className="size-7" />}
          label="Active Groups"
          value={stats.groupCount.toLocaleString()}
          color="purple"
        />
      </div>
    </div>
  );
};

export default DashboardStats;
