"use client";

import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import HomeMenuCards from "@/components/HomeMenuCards";
import DashboardStats from "@/components/DashboardStats";
import Reminders from "@/components/Reminders";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-left pl-2 sm:pl-3">
            <h1 className="text-3xl font-bold text-gray-500">Contact Online Solutions</h1>
            <p className="text-sm text-muted-foreground">
              Create groups, import contacts from Excel, send WhatsApp messages to a group, and track what was sent.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SidebarTrigger className="md:hidden" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4 space-y-8">
          <DashboardStats />
          <Reminders />
        </div>
      </div>
      {/* REMOVED: ExcelDashboard from home screen */}
      <MadeWithDyad />
    </div>
  );
};

export default Index;