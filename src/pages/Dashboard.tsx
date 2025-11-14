"use client";

import React from "react";
import DashboardStats from "@/components/DashboardStats";
import PendingReminders from "@/components/PendingReminders";
import ExcelDashboard from "@/components/ExcelDashboard";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <DashboardStats />
        <PendingReminders />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Dashboard Data</h2>
          <ExcelDashboard />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;