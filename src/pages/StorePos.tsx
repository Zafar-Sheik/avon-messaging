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
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { POS_EXIT_PASSWORD } from "@/utils/posConfig";

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
  const navigate = useNavigate();
  const [exitOpen, setExitOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");

  const onMenuClick = (label: string) => {
    const pathMap: Record<string, string> = {
      "Sales": "/store-pos/sales",
      "Stock Control": "/store-pos/stock-control",
      "Supplier": "/store-pos/supplier",
      "Customer": "/store-pos/customer",
      "Backoffice": "/store-pos/backoffice",
      "Reports": "/store-pos/reports",
      "Settings": "/store-pos/settings",
      "Quick Start": "/store-pos/sales",
      "Documentation": "/store-pos/reports",
    };
    const target = pathMap[label];
    toast({ title: label, description: "Opening " + label.toLowerCase() + "…" });
    if (target) navigate(target);
  };

  const handleConfirmExit = () => {
    if (password === POS_EXIT_PASSWORD) {
      setExitOpen(false);
      setPassword("");
      toast({ title: "Unlocked", description: "Returning to main menu…" });
      navigate("/");
    } else {
      toast({
        title: "Incorrect password",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Modern header card */}
      <Card className="overflow-hidden border-none bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white">
        <CardHeader className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Contact Point-Of-Sale
              </CardTitle>
              <CardDescription className="text-white/90">
                Cloud based System
              </CardDescription>
            </div>
            <Dialog open={exitOpen} onOpenChange={setExitOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter password</DialogTitle>
                  <DialogDescription>
                    Please enter the password to return to the main menu.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="pos-exit-password">Password</Label>
                  <Input
                    id="pos-exit-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setExitOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmExit}>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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