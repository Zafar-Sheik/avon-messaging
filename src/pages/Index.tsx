"use client";

import React from "react";
import GroupManager from "@/components/GroupManager";
import { MadeWithDyad } from "@/components/made-with-dyad";
import HomeMenuCards from "@/components/HomeMenuCards";
import DashboardStats from "@/components/DashboardStats";
import Reminders from "@/components/Reminders";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="space-y-3">
            <img
              src="/images/contact-messaging.jpg"
              alt="Contact Messaging"
              className="w-full rounded-md border shadow-sm"
            />
          </SidebarHeader>
          <SidebarContent>
            <HomeMenuCards />
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <div className="py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold">WhatsApp Group Manager</h1>
                <p className="text-sm text-muted-foreground">
                  Create groups, import contacts from Excel, send WhatsApp messages to a group, and track what was sent.
                </p>
              </div>
              <SidebarTrigger className="md:hidden" />
            </div>

            <div className="max-w-6xl mx-auto p-4 space-y-8">
              <DashboardStats />
              <Reminders />
              <GroupManager />
            </div>
          </div>
          <MadeWithDyad />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Index;