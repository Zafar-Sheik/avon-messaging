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
  useSidebar,
} from "@/components/Sidebar";

import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  Home,
  Users,
  MessageSquare,
  Upload,
  Clock,
  Settings,
  Calendar,
  Store,
  Cog,
} from "lucide-react";

import { cn } from "@/lib/utils";
import React from "react";

// Pages
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
import SetupPage from "./pages/Setup";

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
    { icon: Cog, label: "Setup", path: "/setup" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path: string, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleClick = () => {
    if (window.innerWidth < 1024) setIsMobileOpen(false);
  };

  return (
    <nav className="flex flex-col space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path, item.exact);

        return (
          <Link
            key={item.path}
            to={item.path}
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
                active ? "text-blue-600" : "text-gray-400"
              )}
            />
            {!isCollapsed && (
              <span className="truncate text-base">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

/* =========================================================================
    SIDEBAR CONTENT COMPONENT
========================================================================= */

const SidebarContentWithToggle = () => {
  const { isCollapsed, setIsCollapsed, setIsMobileOpen } = useSidebar();

  const handleLogoClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      if (window.innerWidth < 1024) {
        setIsMobileOpen(true);
      }
    }
  };

  const handleToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);

    if (window.innerWidth < 1024) {
      if (!newCollapsedState) {
        setIsMobileOpen(true);
      } else {
        setIsMobileOpen(false);
      }
    }
  };

  return (
    <Sidebar collapsible="icon" className="bg-blue-50 border-r">
      <SidebarHeader>
        <div
          className={cn(
            "flex items-center gap-3 relative",
            isCollapsed && "justify-center"
          )}>
          <div
            onClick={isCollapsed ? handleLogoClick : undefined}
            className={cn(
              "bg-white rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-105",
              isCollapsed ? "size-12" : "size-12",
              isCollapsed && "hover:shadow-md"
            )}
            title={isCollapsed ? "Click to expand" : undefined}>
            <img
              src="/images/contact-messaging.jpg"
              className={cn(
                "object-contain",
                isCollapsed ? "size-10" : "size-10"
              )}
            />
          </div>

          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-red-500 truncate mt-1">
                  <span className="text-blue-500">Contact</span> Messaging
                </p>
              </div>

              <button
                onClick={handleToggle}
                className="p-2 rounded-full hover:bg-gray-200 transition shrink-0"
                title="Collapse sidebar">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 15 15"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6.5 3.5L3.5 7.5L6.5 11.5M8.5 3.5L11.5 7.5L8.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </SidebarHeader>

      {!isCollapsed && (
        <SidebarContent>
          <SidebarNavigation isCollapsed={isCollapsed} />
        </SidebarContent>
      )}

      <SidebarFooter>
        {isCollapsed ? (
          <div className="flex justify-center">
            <img
              src="/images/logo.png"
              className="size-12 object-contain cursor-pointer hover:scale-105 transition-transform"
              onClick={handleLogoClick}
              title="Click to expand"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <img src="/images/logo.png" className="size-15 object-contain" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

/* =========================================================================
    MOBILE TOGGLE BUTTON (for when sidebar is hidden on mobile)
========================================================================= */

const MobileSidebarToggle = () => {
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  if (isMobileOpen) return null;

  return (
    <button
      onClick={() => setIsMobileOpen(true)}
      className="lg:hidden fixed top-4 left-4 z-40 p-3 rounded-lg bg-blue-600 text-white shadow-lg">
      <svg
        width="20"
        height="20"
        viewBox="0 0 15 15"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2.5 4H12.5M2.5 7H12.5M2.5 10H12.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
};

/* =========================================================================
    APP ROOT
========================================================================= */

const queryClient = new QueryClient();

/* Routed layout */
const RoutedApp = () => {
  const location = useLocation();
  const hideSidebar = location.pathname.startsWith("/store-pos");

  return (
    <div className="flex h-screen overflow-hidden">
      {!hideSidebar && <SidebarContentWithToggle />}

      {!hideSidebar && <MobileSidebarToggle />}

      <SidebarInset>
        <main className="flex-1 overflow-auto p-6 lg:p-6 pt-16 lg:pt-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
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
            <Route
              path="/store-pos/stock-control"
              element={<StockControlPage />}
            />
            <Route path="/store-pos/supplier" element={<SupplierPage />} />
            <Route path="/store-pos/customer" element={<CustomerPage />} />
            <Route path="/store-pos/backoffice" element={<BackofficePage />} />
            <Route path="/store-pos/reports" element={<ReportsPage />} />
            <Route path="/store-pos/settings" element={<PosSettingsPage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </SidebarInset>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider defaultCollapsed={false}>
              <RoutedApp />
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;