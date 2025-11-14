"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, MessageCircle, Settings, FolderUp, LayoutDashboard, Bell, Home } from "lucide-react";

type MenuItem = {
  label: string;
  description: string;
  to: string;
  icon: React.ReactNode;
};

const items: MenuItem[] = [
  { label: "Home", description: "Go to home page.", to: "/", icon: <Home className="size-5" /> },
  { label: "Avon Groups", description: "Manage groups and contacts.", to: "/groups", icon: <Users className="size-5" /> },
  { label: "WhatsApp Messages", description: "View sent and pending messages.", to: "/messages", icon: <MessageCircle className="size-5" /> },
  { label: "Settings", description: "App preferences and data tools.", to: "/settings", icon: <Settings className="size-5" /> },
  { label: "Files Uploads", description: "Import contacts from Excel.", to: "/uploads", icon: <FolderUp className="size-5" /> },
  { label: "Dashboard Data", description: "Analytics overview and reminders.", to: "/dashboard", icon: <LayoutDashboard className="size-5" /> },
  { label: "Reminders", description: "Add and track follow-ups.", to: "/reminders", icon: <Bell className="size-5" /> },
];

const HomeMenuCards: React.FC = () => {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Quick Menu</h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Button
            key={item.to}
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-between"
          >
            <Link to={item.to}>
              <span className="flex items-center gap-3">
                <span className="p-2 rounded-md bg-muted text-muted-foreground">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default HomeMenuCards;