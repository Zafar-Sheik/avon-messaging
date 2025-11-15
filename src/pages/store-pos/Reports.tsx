"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import PoweredBy from "@/components/PoweredBy";

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="size-6" />
            Reports
          </CardTitle>
          <CardDescription className="text-white/90">
            Analyze sales performance and inventory metrics.
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
          <p className="text-muted-foreground">This section is coming soon.</p>
        </CardContent>
      </Card>
      <PoweredBy className="pt-2" />
    </div>
  );
};

export default ReportsPage;