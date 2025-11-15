"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, Boxes, Wrench, Truck, BarChart3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import StockItemForm from "@/components/pos/StockItemForm";

const StockControlPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedSection, setSelectedSection] = React.useState<string | null>(null);

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
          {/* Buttons replacing dropdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                setSelectedSection("stock-items");
                toast({ title: "Selected", description: "Stock items" });
              }}
            >
              <Boxes className="mr-2" />
              Stock items
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() =>
                toast({ title: "Selected", description: "Adjustments" })
              }
            >
              <Wrench className="mr-2" />
              Adjustments
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() =>
                toast({ title: "Selected", description: "Supplier Grv" })
              }
            >
              <Truck className="mr-2" />
              Supplier Grv
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() =>
                toast({ title: "Selected", description: "Reports" })
              }
            >
              <BarChart3 className="mr-2" />
              Reports
            </Button>
          </div>

          {selectedSection === "stock-items" ? (
            <StockItemForm />
          ) : (
            <p className="text-muted-foreground">This section is coming soon.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockControlPage;