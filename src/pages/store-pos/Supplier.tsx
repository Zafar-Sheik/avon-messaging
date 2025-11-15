"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";
import PoweredBy from "@/components/PoweredBy";
import SupplierManager from "@/components/pos/SupplierManager";

const SupplierPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white">
        <CardHeader className="p-3">
          <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
            <Truck className="size-4" />
            Supplier
          </CardTitle>
          <CardDescription className="text-white/90 text-xs">
            Manage suppliers, purchase orders, and deliveries.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex gap-3">
          <Link to="/store-pos">
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">Back to Store Pos</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <SupplierManager />
        </CardContent>
      </Card>
      <PoweredBy className="pt-2" />
    </div>
  );
};

export default SupplierPage;