"use client";

import React from "react";
import GroupManager from "@/components/GroupManager";
import { MadeWithDyad } from "@/components/made-with-dyad";
import HomeMenuCards from "@/components/HomeMenuCards";
import DashboardStats from "@/components/DashboardStats";
import Reminders from "@/components/Reminders";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">WhatsApp Group Manager</h1>
          <p className="text-sm text-muted-foreground">
            Create groups, import contacts from Excel, send WhatsApp messages to a group, and track what was sent.
          </p>
        </div>

        <div className="max-w-6xl mx-auto p-4 space-y-8">
          <HomeMenuCards />
          <DashboardStats />
          <Reminders />
          <GroupManager />
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;