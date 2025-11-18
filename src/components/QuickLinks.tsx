"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  Home,
  Users,
  MessageSquare,
  Upload,
  Store,
  Calendar,
  Clock,
  Settings,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface QuickLinkItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  description: string;
  color: string;
}

const QuickLinks: React.FC = () => {
  const location = useLocation();

  const quickLinks: QuickLinkItem[] = [
    {
      icon: <Home className="size-6" />,
      label: "Dashboard",
      path: "/",
      description: "Overview and analytics",
      color: "bg-blue-500",
    },
    {
      icon: <Users className="size-6" />,
      label: "Groups",
      path: "/groups",
      description: "Manage contact groups",
      color: "bg-green-500",
    },
    {
      icon: <MessageSquare className="size-6" />,
      label: "Messaging",
      path: "/messages",
      description: "Send and manage messages",
      color: "bg-purple-500",
    },
    {
      icon: <Upload className="size-6" />,
      label: "Uploads",
      path: "/uploads",
      description: "File and media uploads",
      color: "bg-orange-500",
    },
    {
      icon: <Store className="size-6" />,
      label: "Store POS",
      path: "/store-pos",
      description: "Point of sale system",
      color: "bg-red-500",
    },
    {
      icon: <Calendar className="size-6" />,
      label: "Scheduler",
      path: "/scheduler",
      description: "Schedule messages",
      color: "bg-indigo-500",
    },
    {
      icon: <Clock className="size-6" />,
      label: "Reminders",
      path: "/reminders",
      description: "Set and manage reminders",
      color: "bg-amber-500",
    },
    {
      icon: <Settings className="size-6" />,
      label: "Settings",
      path: "/settings",
      description: "App configuration",
      color: "bg-gray-500",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
          <p className="text-gray-600 mt-1">
            Jump to different sections of the application
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const active = isActive(link.path);

          return (
            <a key={link.path} href={link.path} className="block group">
              <Card
                className={cn(
                  "p-5 border-2 transition-all duration-300 hover:shadow-lg h-full",
                  active
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "p-3 rounded-xl text-white transition-transform duration-300 group-hover:scale-110",
                        link.color,
                        active && "ring-4 ring-blue-200"
                      )}>
                      {link.icon}
                    </div>
                  </div>
                  <ArrowRight
                    className={cn(
                      "size-5 text-gray-400 transition-all duration-300",
                      active
                        ? "text-blue-500"
                        : "group-hover:text-gray-600 group-hover:translate-x-1"
                    )}
                  />
                </div>

                <div className="mt-4">
                  <h3
                    className={cn(
                      "font-semibold text-lg mb-1",
                      active ? "text-blue-700" : "text-gray-900"
                    )}>
                    {link.label}
                  </h3>
                  <p
                    className={cn(
                      "text-sm",
                      active ? "text-blue-600" : "text-gray-600"
                    )}>
                    {link.description}
                  </p>
                </div>

                {active && (
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Current Page
                    </span>
                  </div>
                )}
              </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default QuickLinks;
