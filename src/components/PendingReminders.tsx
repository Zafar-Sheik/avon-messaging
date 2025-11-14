"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Bell, Clock } from "lucide-react";
import { getReminders, type Reminder } from "@/utils/reminderStore";

const PendingReminders: React.FC = () => {
  const [reminders, setReminders] = React.useState<Reminder[]>(getReminders());

  React.useEffect(() => {
    // Refresh once on mount
    setReminders(getReminders());
  }, []);

  const pending = React.useMemo(() => {
    return reminders
      .filter((r) => !r.done)
      .sort((a, b) => {
        const aTime = rTime(a);
        const bTime = rTime(b);
        return aTime - bTime;
      });
  }, [reminders]);

  const rTime = (r: Reminder) => (r.dueAt ? new Date(r.dueAt).getTime() : Number.POSITIVE_INFINITY);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Pending Reminders</h2>
      </div>

      <Card className="p-0 overflow-hidden">
        {pending.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No pending reminders.</div>
        ) : (
          <ul className="divide-y">
            {pending.map((r) => {
              const isOverdue = r.dueAt ? new Date(r.dueAt).getTime() < Date.now() : false;
              return (
                <li key={r.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      <span>{r.dueAt ? new Date(r.dueAt).toLocaleString() : "No due date"}</span>
                      {isOverdue && <span className="ml-2 text-red-600">Overdue</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default PendingReminders;