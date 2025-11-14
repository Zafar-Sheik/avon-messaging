"use client";

import React from "react";
import DashboardStats from "@/components/DashboardStats";
import PendingReminders from "@/components/PendingReminders";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Upload, Plus, RefreshCcw } from "lucide-react";
import { showSuccess } from "@/utils/toast";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <section className="rounded-xl border shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-900 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/70 dark:bg-black/30">
                <LayoutDashboard className="size-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Overview of groups, contacts, and messaging activity.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => showSuccess("Refreshing data...")}>
                <RefreshCcw className="size-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => showSuccess("Import contacts opened")}>
                <Upload className="size-4 mr-2" />
                Import
              </Button>
              <Button size="sm" onClick={() => showSuccess("New group dialog opened")}>
                <Plus className="size-4 mr-2" />
                New Group
              </Button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DashboardStats />
          </div>
          <div className="space-y-6">
            <PendingReminders />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;