"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/Sidebar";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  Home,
  Users,
  MessageSquare,
  Upload,
  Clock,
  Settings,
  Calendar,
  Store
} from "lucide-react";

import { cn } from "@/lib/utils";
import React from "react";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import GroupsPage from "./pages/Groups";
import GroupDetailPage from "./pages/GroupDetail";
import MessagesPage from "./pages/Messages";
import UploadsPage from "./pages/Uploads";
import RemindersPage from "./pages/Reminders";
import SettingsPage from "./pages/Settings";
import SchedulerPage from "./pages/Scheduler";
import NotFound from "./pages/NotFound";
import StorePosPage from "./pages/StorePos";
import SalesPage from "./pages/store-pos/Sales";
import StockControlPage from "./pages/store-pos/StockControl";
import SupplierPage from "./pages/store-pos/Supplier";
import CustomerPage from "./pages/store-pos/Customer";
import BackofficePage from "./pages/store-pos/Backoffice";
import ReportsPage from "./pages/store-pos/Reports";
import PosSettingsPage from "./pages/store-pos/PosSettings";

/* =========================================================================
    SIDEBAR NAVIGATION
========================================================================= */

const SidebarNavigation = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const location = useLocation();
  const { setIsMobileOpen } = useSidebar();

  const navigationItems = [
    { icon: Home, label: "Dashboard", path: "/", exact: true },
    { icon: Users, label: "Groups", path: "/groups" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: Upload, label: "Uploads", path: "/uploads" },
    { icon: Store, label: "Store Pos", path: "/store-pos" },
    { icon: Calendar, label: "Scheduler", path: "/scheduler" },
    { icon: Clock, label: "Reminders", path: "/reminders" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (itemPath: string, exact = false) =>
    exact
      ? location.pathname === itemPath
      : location.pathname.startsWith(itemPath);

  const handleClick = () => {
    if (window.innerWidth < 1024) setIsMobileOpen(false);
  };

  return (
    <nav className="flex flex-col space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path, item.exact);

        return (
          <a
            key={item.path}
            href={item.path}
            onClick={handleClick}
            className={cn(
              "flex items-center rounded-xl text-sm font-medium transition-all border border-transparent",
              active
                ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              isCollapsed
                ? "justify-center p-3 size-12"
                : "gap-3 px-4 py-3 min-h-12"
            )}
            title={isCollapsed ? item.label : undefined}>
            <Icon
              className={cn(
                "shrink-0",
                active
                  ? "text-blue-600"
                  : "text-gray-400 group-hover:text-gray-600"
              )}
            />

            {!isCollapsed && (
              <span className="truncate text-base">{item.label}</span>
            )}
          </a>
        );
      })}
    </nav>
  );
};

/* =========================================================================
    APP ROOT
========================================================================= */

const queryClient = new QueryClient();

const App = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <SidebarProvider defaultCollapsed={false}>
              <div className="flex h-screen overflow-hidden">
                {/* SIDEBAR */}
                <Sidebar collapsible="icon" className="bg-white border-r">
                  {/* HEADER */}
                  <SidebarHeader>
                    <div
                      className={cn(
                        "flex items-center gap-3",
                        isCollapsed && "justify-center"
                      )}>
                      <div
                        className={cn(
                          "bg-white rounded-xl overflow-hidden",
                          isCollapsed ? "size-10" : "size-12"
                        )}>
                        <img
                          src="/images/contact-messaging.jpg"
                          className={cn(
                            "object-contain",
                            isCollapsed ? "size-8" : "size-10"
                          )}
                        />
                      </div>

                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <h1 className="font-bold text-gray-900 text-xl truncate">
                            Contact Messaging
                          </h1>
                          <p className="text-sm text-gray-500 truncate mt-1">
                            Send Bulk Messages
                          </p>
                        </div>
                      )}
                    </div>
                  </SidebarHeader>

                  {/* CONTENT */}
                  <SidebarContent>
                    <SidebarNavigation isCollapsed={isCollapsed} />
                  </SidebarContent>

                  {/* FOOTER LOGO */}
                  <SidebarFooter>
                    <div
                      className={cn(
                        "flex items-center transition-all",
                        isCollapsed ? "justify-center" : "justify-start"
                      )}>
                      <img
                        src="/images/logo.png"
                        className={cn(
                          "object-contain transition-all",
                          isCollapsed ? "size-12" : "size-14"
                        )}
                      />
                    </div>
                  </SidebarFooter>
                </Sidebar>

                {/* MAIN CONTENT */}
                <SidebarInset>
                  {/* TOP HEADER */}

                  {/* ROUTES */}
                  <main className="flex-1 overflow-auto p-6">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/groups" element={<GroupsPage />} />
                      <Route path="/groups/:id" element={<GroupDetailPage />} />
                      <Route path="/messages" element={<MessagesPage />} />
                      <Route path="/uploads" element={<UploadsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/scheduler" element={<SchedulerPage />} />
                      <Route path="/reminders" element={<RemindersPage />} />
                      <Route path="/store-pos" element={<StorePosPage />} />
                      <Route path="/store-pos/sales" element={<SalesPage />} />
                      <Route path="/store-pos/stock-control" element={<StockControlPage />} />
                      <Route path="/store-pos/supplier" element={<SupplierPage />} />
                      <Route path="/store-pos/customer" element={<CustomerPage />} />
                      <Route path="/store-pos/backoffice" element={<BackofficePage />} />
                      <Route path="/store-pos/reports" element={<ReportsPage />} />
                      <Route path="/store-pos/settings" element={<PosSettingsPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;