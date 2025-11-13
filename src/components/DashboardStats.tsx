"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWhatsAppStats, type Stats } from "@/utils/stats";
import { Send, Clock, Users, LayoutDashboard } from "lucide-react";
import { showSuccess } from "@/utils/toast";

const StatTile = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) => (
  <Card className="p-4 flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-md bg-muted text-muted-foreground">{icon}</div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
    </div>
  </Card>
);

const DashboardStats: React.FC = () => {
  const [stats, setStats] = React.useState<Stats>(getWhatsAppStats());

  const refresh = () => {
    setStats(getWhatsAppStats());
    showSuccess("Dashboard stats refreshed.");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <LayoutDashboard className="size-5 text-muted-foreground" />
          Dashboard Overview
        </h2>
        <Button variant="secondary" size="sm" onClick={refresh}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile icon={<Send className="size-5" />} label="WhatsApp Sent" value={stats.sentCount} />
        <StatTile icon={<Clock className="size-5" />} label="Pending to Send" value={stats.pendingCount} />
        <StatTile icon={<Users className="size-5" />} label="Total Contacts" value={stats.contactCount} />
        <StatTile icon={<LayoutDashboard className="size-5" />} label="Groups" value={stats.groupCount} />
      </div>
    </div>
  );
};

export default DashboardStats;