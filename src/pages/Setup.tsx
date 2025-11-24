"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

const SetupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Setup</h1>
            <p className="text-muted-foreground">
              Configure initial application settings and integrations.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to Setup</CardTitle>
            <CardDescription>
              This page is where you can configure various aspects of your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              More setup options will be added here soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupPage;