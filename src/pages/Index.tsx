"use client";
import DashboardStats from "@/components/DashboardStats";
import Reminders from "@/components/Reminders";
import ExcelDashboard from "@/components/ExcelDashboard";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="p-4">
        <DashboardStats />
      </div>
      <div className="p-4">
        <Reminders />
      </div>
      <div className="p-4">
        {" "}
        <ExcelDashboard />
      </div>
    </div>
  );
};

export default Index;
