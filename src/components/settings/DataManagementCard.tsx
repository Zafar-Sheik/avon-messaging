"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Trash2 } from "lucide-react";

interface DataManagementCardProps {
  onClearGroups: () => void;
  onClearReminders: () => void;
}

const DataManagementCard: React.FC<DataManagementCardProps> = ({
  onClearGroups,
  onClearReminders,
}) => {
  return (
    <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="p-0 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Database className="size-5 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Data Management
            </CardTitle>
            <CardDescription>
              Manage your local application data
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">
              <strong>Warning:</strong> These actions will permanently
              delete your data. This cannot be undone.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="destructive"
              onClick={onClearGroups}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
              <Trash2 className="size-4" />
              Clear All Groups
            </Button>
            <Button
              variant="destructive"
              onClick={onClearReminders}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
              <Trash2 className="size-4" />
              Clear All Reminders
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-6 px-0">
        <p className="text-xs text-gray-500">
          All data is stored locally in your browser. Clearing data will
          remove everything from this device only.
        </p>
      </CardFooter>
    </Card>
  );
};

export default DataManagementCard;