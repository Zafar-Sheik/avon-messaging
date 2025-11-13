"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/utils/toast";
import { clearAllReminders } from "@/utils/reminderStore";
import { clearAllGroups } from "@/utils/groupStore";

const SettingsPage = () => {
  const clearGroups = () => {
    clearAllGroups();
    showSuccess("All groups cleared.");
  };

  const clearReminders = () => {
    clearAllReminders();
    showSuccess("All reminders cleared.");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <Card className="p-4 space-y-3">
          <h2 className="text-lg font-semibold">Data</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="destructive" onClick={clearGroups}>Clear All Groups</Button>
            <Button variant="destructive" onClick={clearReminders}>Clear All Reminders</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This only affects local storage in your browser.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;