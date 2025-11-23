"use client";
import DashboardStats from "@/components/DashboardStats";
import PosDashboardStats from "@/components/PosDashboardStats";

const Index = () => {
  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Welcome!</h1>
      </div>
      <div className="p-4">
        <DashboardStats />
      </div>
      <div className="p-4">
        <PosDashboardStats />
      </div>
    </div>
  );
};

export default Index;