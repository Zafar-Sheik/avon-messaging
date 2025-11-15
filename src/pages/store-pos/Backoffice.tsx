"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cog } from "lucide-react";
import PoweredBy from "@/components/PoweredBy";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSalesByRange, aggregateTotals, getRecentSales } from "@/utils/saleStore";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

const BackofficePage: React.FC = () => {
  const [period, setPeriod] = React.useState<"today" | "week" | "month">("today");

  const range = React.useMemo(() => {
    const now = new Date();
    if (period === "week") {
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    }
    if (period === "month") {
      return { start: startOfMonth(now), end: endOfMonth(now) };
    }
    // today
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start, end };
  }, [period]);

  const totals = React.useMemo(() => aggregateTotals(getSalesByRange(range.start, range.end)), [range]);

  const recent = React.useMemo(() => getRecentSales(10), []);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-gradient-to-r from-orange-600 via-purple-600 to-cyan-500 text-white">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Cog className="size-6" />
            Backoffice
          </CardTitle>
          <CardDescription className="text-white/90">
            Configure products, pricing, taxes, and teams.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex gap-3">
          <Link to="/store-pos">
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">Back to Store Pos</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Sales Overview */}
      <Card>
        <CardHeader className="p-6 pb-0">
          <CardTitle className="text-lg font-semibold">Sales Overview</CardTitle>
          <CardDescription className="text-xs">Totals per selected period</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={period === "today" ? "default" : "outline"}
              onClick={() => setPeriod("today")}
            >
              Today
            </Button>
            <Button
              variant={period === "week" ? "default" : "outline"}
              onClick={() => setPeriod("week")}
            >
              Weekly Sales
            </Button>
            <Button
              variant={period === "month" ? "default" : "outline"}
              onClick={() => setPeriod("month")}
            >
              Monthly Sales
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Total Cash Sales</div>
              <div className="text-2xl font-bold">R {totals.cashTotal.toFixed(2)}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Total Card Sales</div>
              <div className="text-2xl font-bold">R {totals.cardTotal.toFixed(2)}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Transactions</div>
              <div className="text-2xl font-bold">{totals.count}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Transactions */}
      <Card>
        <CardHeader className="p-6 pb-0">
          <CardTitle className="text-lg font-semibold">Recent Sales Transactions</CardTitle>
          <CardDescription className="text-xs">Last 10 sales</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No sales recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recent.map((s) => {
                    const d = new Date(s.date);
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono">{s.saleNo}</TableCell>
                        <TableCell className="text-sm">
                          {d.toLocaleDateString()} {d.toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              s.method === "cash"
                                ? "secondary"
                                : s.method === "card"
                                ? "default"
                                : "outline"
                            }
                          >
                            {s.method.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">R {s.total.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PoweredBy className="pt-2" />
    </div>
  );
};

export default BackofficePage;