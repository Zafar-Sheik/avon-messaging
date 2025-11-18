"use client";
import DashboardStats from "@/components/DashboardStats";
import QuickLinks from "@/components/QuickLinks";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="p-4">
        <DashboardStats />
      </div>
      <div className="p-4">
        <QuickLinks />
      </div>
    </div>
  );
};

export default Index;
