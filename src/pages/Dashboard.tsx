"use client";

import React from "react";
import DashboardStats from "@/components/DashboardStats";
import PendingReminders from "@/components/PendingReminders";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <DashboardStats />
        <PendingReminders />
      </div>
    </div>
  );
};

export default DashboardPage;