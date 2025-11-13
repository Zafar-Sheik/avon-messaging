"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, MessageCircle, Settings, FolderUp, LayoutDashboard } from "lucide-react";

type MenuItem = {
  label: string;
  description: string;
  to: string;
  icon: React.ReactNode;
};

const items: MenuItem[] = [
  { label: "Avon Groups", description: "Manage groups and contacts.", to: "/groups", icon: <Users className="size-5" /> },
  { label: "WhatsApp Messages", description: "View sent and pending messages.", to: "/messages", icon: <MessageCircle className="size-5" /> },
  { label: "Settings", description: "App preferences and data tools.", to: "/settings", icon: <Settings className="size-5" /> },
  { label: "Files Uploads", description: "Import contacts from Excel.", to: "/uploads", icon: <FolderUp className="size-5" /> },
  { label: "Dashboard Data", description: "Analytics overview and reminders.", to: "/dashboard", icon: <LayoutDashboard className="size-5" /> },
];

const HomeMenuCards: React.FC = () => {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Quick Menu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <Card key={item.to} className="p-4 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-muted text-muted-foreground">{item.icon}</div>
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </div>
            </div>
            <Link to={item.to}>
              <Button size="sm">Open</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomeMenuCards;