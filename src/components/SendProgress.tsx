"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

type Props = {
  current: number;
  total: number;
  title?: string;
  onCancel?: () => void;
};

const SendProgress: React.FC<Props> = ({ current, total, title = "Sending", onCancel }) => {
  const value = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="rounded-md border p-3 space-y-2 bg-card">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{title}</div>
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{current} / {total}</span>
      </div>
      <Progress value={value} />
    </div>
  );
};

export default SendProgress;