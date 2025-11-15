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
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: string;
}) => (
  <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">{icon}</div>
        </div>
        <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <div className="text-xs font-medium text-green-600 mt-1">{trend}</div>
        )}
      </div>
    </div>
  </Card>
);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
          <p className="text-gray-600 text-sm mt-1">
            Your WhatsApp campaign statistics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw
            className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatTile
          icon={<Send className="size-5" />}
          label="Messages Sent"
          value={stats.sentCount.toLocaleString()}
        />
        <StatTile
          icon={<Clock className="size-5" />}
          label="Pending Messages"
          value={stats.pendingCount.toLocaleString()}
        />
        <StatTile
          icon={<Users className="size-5" />}
          label="Total Contacts"
          value={stats.contactCount.toLocaleString()}
        />
        <StatTile
          icon={<LayoutDashboard className="size-5" />}
          label="Groups"
          value={stats.groupCount.toLocaleString()}
        />
      </div>
    </div>
  );
};

export default DashboardStats;
