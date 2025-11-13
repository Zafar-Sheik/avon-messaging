"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/utils/toast";
import { getReminders, addReminder, toggleReminderDone, deleteReminder, type Reminder } from "@/utils/reminderStore";
import { Bell, Trash2, CheckCircle2 } from "lucide-react";

const Reminders: React.FC = () => {
  const [reminders, setReminders] = React.useState<Reminder[]>(getReminders());
  const [title, setTitle] = React.useState("");
  const [dueAt, setDueAt] = React.useState<string>("");

  const refresh = () => setReminders(getReminders());

  const onAdd = () => {
    const t = title.trim();
    if (!t) {
      showError("Please enter a reminder title.");
      return;
    }
    addReminder(t, dueAt ? new Date(dueAt).toISOString() : undefined);
    setTitle("");
    setDueAt("");
    refresh();
    showSuccess("Reminder added.");
  };

  const onToggle = (id: string) => {
    toggleReminderDone(id);
    refresh();
  };

  const onDelete = (id: string) => {
    deleteReminder(id);
    refresh();
    showSuccess("Reminder deleted.");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Reminders</h2>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="rem-title">Title</Label>
            <Input id="rem-title" placeholder="Follow up with group..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rem-due">Due at</Label>
            <Input id="rem-due" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={onAdd} className="w-full">Add Reminder</Button>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {reminders.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No reminders yet.</div>
        ) : (
          <ul className="divide-y">
            {reminders.map((r) => (
              <li key={r.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.dueAt ? new Date(r.dueAt).toLocaleString() : "No due date"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant={r.done ? "secondary" : "default"} size="sm" onClick={() => onToggle(r.id)}>
                    <CheckCircle2 className="size-4" />
                    <span>{r.done ? "Mark Undone" : "Mark Done"}</span>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(r.id)}>
                    <Trash2 className="size-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default Reminders;