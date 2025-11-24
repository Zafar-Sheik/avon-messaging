"use client";

import React from "react";
import GroupManager from "@/components/GroupManager";

const GroupsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Avon Group Manager</h1>
        <p className="text-sm text-muted-foreground">
          Create groups, import contacts, send WhatsApp messages, and track
          history.
        </p>
        <GroupManager />
      </div>
    </div>
  );
};

export default GroupsPage;
