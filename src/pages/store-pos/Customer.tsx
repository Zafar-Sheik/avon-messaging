"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

const CustomerPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-gradient-to-r from-rose-600 via-purple-600 to-cyan-500 text-white">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="size-6" />
            Customer
          </CardTitle>
          <CardDescription className="text-white/90">
            Manage customers, loyalty, and support.
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
    </div>
  );
};

export default CustomerPage;