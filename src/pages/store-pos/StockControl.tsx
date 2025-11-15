"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const StockControlPage: React.FC = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-gradient-to-r from-emerald-600 via-blue-600 to-cyan-500 text-white">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Package className="size-6" />
            Stock Control
          </CardTitle>
          <CardDescription className="text-white/90">
            Track inventory, adjustments, and stock movements.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex gap-3">
          <Link to="/store-pos">
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">Back to Store Pos</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="max-w-sm">
            <label className="text-sm font-medium mb-2 block">Section</label>
            <Select
              onValueChange={(value) => {
                const labelMap: Record<string, string> = {
                  "stock-items": "Stock items",
                  "adjustments": "Adjustments",
                  "supplier-grv": "Supplier Grv",
                  "reports": "Reports",
                };
                toast({
                  title: "Selected",
                  description: labelMap[value] ?? value,
                });
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock-items">Stock items</SelectItem>
                <SelectItem value="adjustments">Adjustments</SelectItem>
                <SelectItem value="supplier-grv">Supplier Grv</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-muted-foreground">This section is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockControlPage;