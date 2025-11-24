"use client";

import React from "react";
import DashboardStats from "@/components/DashboardStats";
import PendingReminders from "@/components/PendingReminders"; // Changed from Reminders to PendingReminders for a more focused dashboard view
import QuickLinks from "@/components/QuickLinks"; // Added QuickLinks back for a comprehensive dashboard

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <DashboardStats />
        <PendingReminders /> {/* Display pending reminders */}
        <QuickLinks /> {/* Display quick access links */}
      </div>
    </div>
  );
};

export default DashboardPage;