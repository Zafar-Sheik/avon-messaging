"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock } from "lucide-react";
import { getReminders, type Reminder } from "@/utils/reminderStore";

const PendingReminders: React.FC = () => {
  const [reminders, setReminders] = React.useState<Reminder[]>(getReminders());

  React.useEffect(() => {
    // Refresh once on mount
    setReminders(getReminders());
  }, []);

  const rTime = (r: Reminder) => (r.dueAt ? new Date(r.dueAt).getTime() : Number.POSITIVE_INFINITY);

  const pending = React.useMemo(() => {
    return reminders
      .filter((r) => !r.done)
      .sort((a, b) => rTime(a) - rTime(b));
  }, [reminders]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Pending Reminders</h2>
        </div>
        <Badge variant="outline" className="rounded-full">
          {pending.length} pending
        </Badge>
      </div>

      <Card className="p-0 overflow-hidden border shadow-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {pending.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
            <Bell className="size-4" />
            No pending reminders.
          </div>
        ) : (
          <ul className="divide-y">
            {pending.map((r) => {
              const isOverdue = r.dueAt ? new Date(r.dueAt).getTime() < Date.now() : false;
              return (
                <li
                  key={r.id}
                  className="p-4 flex items-center justify-between gap-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="size-3" />
                      <span>{r.dueAt ? new Date(r.dueAt).toLocaleString() : "No due date"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverdue ? (
                      <Badge variant="destructive" className="rounded-full">Overdue</Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-full">Scheduled</Badge>
                    )}
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