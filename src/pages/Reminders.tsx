"use client";

import React from "react";
import Reminders from "@/components/Reminders";

const RemindersPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <Reminders />
      </div>
    </div>
  );
};

export default RemindersPage;
