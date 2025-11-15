"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, Boxes, Wrench, Truck, BarChart3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import StockItemsManager from "@/components/pos/StockItemsManager";
import WarehouseTransferManager from "@/components/pos/WarehouseTransferManager";
import { initialStockItems, type StockItem } from "@/components/pos/types";
import AdjustmentManager from "@/components/pos/AdjustmentManager";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import PoweredBy from "@/components/PoweredBy";

const StockControlPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedSection, setSelectedSection] = React.useState<string | null>("stock-items");
  // Shared items for stock sections
  const [items, setItems] = React.useState<StockItem[]>(initialStockItems);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-gradient-to-r from-emerald-600 via-blue-600 to-cyan-500 text-white">
        <CardHeader className="p-2">
          <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
            <Package className="size-4" />
            Stock Control
            <Link to="/store-pos">
              <Button
                variant="secondary"
                size="sm"
                className="ml-1 bg-white/20 hover:bg-white/30 text-white"
                aria-label="Back to Store Pos"
              >
                Back to Store Pos
              </Button>
            </Link>
          </CardTitle>
          <CardDescription className="text-white/90 text-xs">
            Track inventory, adjustments, and stock movements.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <TooltipProvider delayDuration={300}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-1">
              <Button
                variant="secondary"
                size="sm"
                className="justify-start bg-emerald-600 hover:bg-emerald-700 text-white"
                aria-label="Stock items"
                onClick={() => {
                  setSelectedSection("stock-items");
                  toast({ title: "Selected", description: "Stock items" });
                }}
              >
                <Boxes className="mr-1 size-4" />
                <span className="hidden md:inline">Stock items</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="justify-start bg-cyan-600 hover:bg-cyan-700 text-white"
                aria-label="Warehouse Transfer"
                onClick={() => {
                  setSelectedSection("warehouse-transfer");
                  toast({ title: "Selected", description: "Warehouse Transfer" });
                }}
              >
                <Truck className="mr-1 size-4" />
                <span className="hidden md:inline">Warehouse Transfer</span>
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="md:hidden inline-flex">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="justify-start bg-emerald-600 hover:bg-emerald-700 text-white"
                      aria-label="Stock items"
                    >
                      <Boxes className="size-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">Stock items</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="md:hidden inline-flex">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="justify-start bg-cyan-600 hover:bg-cyan-700 text-white"
                      aria-label="Warehouse Transfer"
                    >
                      <Truck className="size-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">Warehouse Transfer</TooltipContent>
              </Tooltip>

              <Button
                variant="secondary"
                size="sm"
                className="justify-start bg-amber-600 hover:bg-amber-700 text-white"
                aria-label="Adjustments"
                onClick={() => {
                  setSelectedSection("adjustments");
                  toast({ title: "Selected", description: "Adjustments" });
                }}
              >
                <Wrench className="mr-1 size-4" />
                <span className="hidden md:inline">Adjustments</span>
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="md:hidden inline-flex">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="justify-start bg-amber-600 hover:bg-amber-700 text-white"
                      aria-label="Adjustments"
                    >
                      <Wrench className="size-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">Adjustments</TooltipContent>
              </Tooltip>

              <Button
                variant="secondary"
                size="sm"
                className="justify-start bg-indigo-600 hover:bg-indigo-700 text-white"
                aria-label="Supplier Grv"
                onClick={() =>
                  toast({ title: "Selected", description: "Supplier Grv" })
                }
              >
                <Truck className="mr-1 size-4" />
                <span className="hidden md:inline">Supplier Grv</span>
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="md:hidden inline-flex">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="justify-start bg-indigo-600 hover:bg-indigo-700 text-white"
                      aria-label="Supplier Grv"
                    >
                      <Truck className="size-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">Supplier Grv</TooltipContent>
              </Tooltip>

              <Button
                variant="secondary"
                size="sm"
                className="justify-start bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                aria-label="Reports"
                onClick={() =>
                  toast({ title: "Selected", description: "Reports" })
                }
              >
                <BarChart3 className="mr-1 size-4" />
                <span className="hidden md:inline">Reports</span>
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="md:hidden inline-flex">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="justify-start bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                      aria-label="Reports"
                    >
                      <BarChart3 className="size-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">Reports</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          {selectedSection === "stock-items" && (
            <StockItemsManager items={items} onItemsChange={setItems} />
          )}
          {selectedSection === "warehouse-transfer" && (
            <WarehouseTransferManager items={items} onItemsChange={setItems} />
          )}
          {selectedSection === "adjustments" && <AdjustmentManager />}
          {!selectedSection && (
            <p className="text-muted-foreground">This section is coming soon.</p>
          )}
        </CardContent>
      </Card>
      <PoweredBy className="pt-2" />
    </div>
  );
};

export default StockControlPage;