"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  Truck,
  Users,
  Cog,
  BarChart3,
  Settings as SettingsIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type MenuItem = {
  label: string;
  icon: React.ElementType;
  accentClass?: string;
};

const menuItems: MenuItem[] = [
  { label: "Sales", icon: ShoppingCart, accentClass: "bg-blue-100 text-blue-700" },
  { label: "Stock Control", icon: Package, accentClass: "bg-emerald-100 text-emerald-700" },
  { label: "Supplier", icon: Truck, accentClass: "bg-purple-100 text-purple-700" },
  { label: "Customer", icon: Users, accentClass: "bg-rose-100 text-rose-700" },
  { label: "Backoffice", icon: Cog, accentClass: "bg-orange-100 text-orange-700" },
  { label: "Reports", icon: BarChart3, accentClass: "bg-cyan-100 text-cyan-700" },
  { label: "Settings", icon: SettingsIcon, accentClass: "bg-gray-100 text-gray-700" },
];

const StorePosPage: React.FC = () => {
  const { toast } = useToast();

  const onMenuClick = (label: string) => {
    toast({
      title: label,
      description: "This section is coming soon.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Modern header card */}
      <Card className="overflow-hidden border-none bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Contact Online Cloud Pos System
          </CardTitle>
          <CardDescription className="text-white/90">
            Manage sales, stock, suppliers, customers, backoffice, and reports in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white"
              onClick={() => onMenuClick("Quick Start")}
            >
              Quick Start
            </Button>
            <Button
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white"
              onClick={() => onMenuClick("Documentation")}
            >
              Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Menu grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map(({ label, icon: Icon, accentClass }) => (
          <Card
            key={label}
            className="group cursor-pointer transition hover:shadow-md"
            onClick={() => onMenuClick(label)}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div
                className={`flex items-center justify-center size-12 rounded-xl ${accentClass}`}
              >
                <Icon className="size-6" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg">{label}</div>
                <div className="text-sm text-muted-foreground">
                  Open {label.toLowerCase()} tools
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StorePosPage;