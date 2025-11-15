"use client";

import React from "react";
import DashboardStats from "@/components/DashboardStats";
import Reminders from "@/components/Reminders";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <DashboardStats />
        <Reminders />
      </div>
    </div>
  );
};

export default DashboardPage;
