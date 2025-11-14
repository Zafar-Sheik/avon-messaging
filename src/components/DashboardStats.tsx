"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getWhatsAppStats, type Stats } from "@/utils/stats";
import { Send, Clock, Users, LayoutDashboard, TrendingUp } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";

const colorMap = {
  emerald: {
    card: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800",
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200",
    label: "text-emerald-700 dark:text-emerald-200",
    value: "text-emerald-800 dark:text-emerald-100",
  },
  amber: {
    card: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800",
    icon: "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200",
    label: "text-amber-700 dark:text-amber-200",
    value: "text-amber-800 dark:text-amber-100",
  },
  indigo: {
    card: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800",
    icon: "bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200",
    label: "text-indigo-700 dark:text-indigo-200",
    value: "text-indigo-800 dark:text-indigo-100",
  },
  violet: {
    card: "bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border-violet-200 dark:border-violet-800",
    icon: "bg-violet-100 text-violet-700 dark:bg-violet-800 dark:text-violet-200",
    label: "text-violet-700 dark:text-violet-200",
    value: "text-violet-800 dark:text-violet-100",
  },
};

const StatTile = ({
  icon,
  label,
  value,
  color = "indigo",
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: keyof typeof colorMap;
  subtext?: string;
}) => {
  const styles = colorMap[color];
  return (
    <Card
      className={cn(
        "p-4 flex items-center justify-between gap-4 border shadow-sm transition-all duration-200 hover:shadow-md hover:translate-y-0.5",
        styles.card
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-md", styles.icon)}>{icon}</div>
        <div>
          <div className={cn("text-sm", styles.label)}>{label}</div>
          <div className={cn("text-2xl font-semibold", styles.value)}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {subtext && <div className="text-xs mt-1 text-muted-foreground">{subtext}</div>}
        </div>
      </div>
      <TrendingUp className="size-5 text-muted-foreground opacity-60" />
    </Card>
  );
};

const DashboardStats: React.FC = () => {
  const [stats, setStats] = React.useState<Stats>(getWhatsAppStats());

  const refresh = () => {
    setStats(getWhatsAppStats());
    showSuccess("Dashboard stats refreshed.");
  };

  const sentPercent =
    stats.contactCount > 0 ? Math.round((stats.sentCount / stats.contactCount) * 100) : 0;

  return (
    <div className="space-y-4">
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
        <StatTile
          icon={<Send className="size-5" />}
          label="WhatsApp Sent"
          value={stats.sentCount}
          color="emerald"
          subtext={`${sentPercent}% of contacts`}
        />
        <StatTile
          icon={<Clock className="size-5" />}
          label="Pending to Send"
          value={stats.pendingCount}
          color="amber"
          subtext={`${(100 - sentPercent).toFixed(0)}% remaining`}
        />
        <StatTile
          icon={<Users className="size-5" />}
          label="Total Contacts"
          value={stats.contactCount}
          color="indigo"
          subtext="All groups combined"
        />
        <StatTile
          icon={<LayoutDashboard className="size-5" />}
          label="Groups"
          value={stats.groupCount}
          color="violet"
          subtext="Active groups"
        />
      </div>

      <Card className="p-4 border shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-900">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium">Delivery Progress</div>
            <div className="text-xs text-muted-foreground">
              {stats.sentCount.toLocaleString()} of {stats.contactCount.toLocaleString()} contacts sent
            </div>
          </div>
          <div className="text-sm font-semibold">{sentPercent}%</div>
        </div>
        <Progress value={sentPercent} className="h-2" />
      </Card>
    </div>
  );
};

export default DashboardStats;