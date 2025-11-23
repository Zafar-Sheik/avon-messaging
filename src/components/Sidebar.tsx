"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* =========================================================================
   CONTEXT
   ========================================================================= */

interface SidebarContextValue {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined
);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside SidebarProvider");
  return ctx;
}

export const SidebarProvider = ({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

/* =========================================================================
   SIDEBAR WRAPPER
   ========================================================================= */

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  collapsible?: "icon" | "none";
  onCollapse?: () => void;
  onExpand?: () => void;
}

export const Sidebar = ({
  children,
  className,
  collapsible = "icon",
  onCollapse,
  onExpand,
}: SidebarProps) => {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } =
    useSidebar();

  // collapse handler
  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    next ? onCollapse?.() : onExpand?.();
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed z-50 lg:relative flex flex-col h-full bg-white border-r transition-all duration-300",
          isCollapsed && collapsible === "icon" ? "w-20" : "w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}>
        {/* Allow internal components to toggle collapse */}
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as any, { toggleCollapse })
            : child
        )}
      </aside>
    </>
  );
};

/* =========================================================================
   SIDEBAR HEADER
   ========================================================================= */

export const SidebarHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("px-5 py-4 border-b", className)}>{children}</div>;

/* =========================================================================
   SIDEBAR CONTENT (scrollable)
   ========================================================================= */

export const SidebarContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex-1 overflow-y-auto px-3 py-4 space-y-2", className)}>
    {children}
  </div>
);

/* =========================================================================
   SIDEBAR BOTTOM AREA (logo)
   ========================================================================= */

export const SidebarFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("px-5 py-4 border-t", className)}>{children}</div>;

/* =========================================================================
   SIDEBAR TRIGGER
   ========================================================================= */

export const SidebarTrigger = ({ className }: { className?: string }) => {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } =
    useSidebar();

  const handleClick = () => {
    if (window.innerWidth < 1024) setIsMobileOpen(!isMobileOpen);
    else setIsCollapsed(!isCollapsed);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "size-10 flex items-center justify-center rounded-xl border bg-white hover:bg-gray-100",
        className
      )}>
      <svg
        width="18"
        height="18"
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
   MAIN CONTENT WRAPPER
   ========================================================================= */

export const SidebarInset = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex-1 flex flex-col bg-white relative", // Removed "lg:ml-0 transition-all"
      className
    )}>
    {children}
  </div>
);