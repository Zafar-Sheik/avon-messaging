"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/utils/toast";
import {
  getReminders,
  addReminder,
  toggleReminderDone,
  deleteReminder,
  type Reminder,
} from "@/utils/reminderStore";
import {
  Bell,
  Trash2,
  CheckCircle2,
  Plus,
  Calendar,
  Clock,
} from "lucide-react";

//
// ─────────────────────────────────────────────
//   Reminder Item
// ─────────────────────────────────────────────
//

const ReminderItem = ({
  reminder,
  onToggle,
  onDelete,
}: {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const isOverdue =
    reminder.dueAt && new Date(reminder.dueAt) < new Date() && !reminder.done;

  return (
    <div
      className={`p-4 border-l-4 rounded-r-lg transition-colors duration-200 ${
        reminder.done
          ? "border-l-green-500 bg-green-50"
          : isOverdue
          ? "border-l-red-500 bg-red-50"
          : "border-l-blue-500 bg-blue-50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={() => onToggle(reminder.id)}
            className={`mt-1 p-1 rounded-full transition-colors ${
              reminder.done
                ? "text-green-600 bg-green-100"
                : "text-gray-400 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <CheckCircle2 className="size-5" />
          </button>

          <div className="flex-1 space-y-1">
            <div
              className={`font-medium ${
                reminder.done ? "text-gray-500 line-through" : "text-gray-900"
              }`}
            >
              {reminder.title}
            </div>

            {reminder.dueAt && (
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="size-3 text-gray-500" />
                <span
                  className={
                    isOverdue && !reminder.done
                      ? "text-red-600 font-medium"
                      : "text-gray-600"
                  }
                >
                  {new Date(reminder.dueAt).toLocaleString()}
                  {isOverdue && !reminder.done && " • Overdue"}
                </span>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(reminder.id)}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
};

//
// ─────────────────────────────────────────────
//   Date + Time Picker (Aligned Version)
// ─────────────────────────────────────────────
//

const DateTimePicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const datePart = value?.split("T")[0] || "";
  const timePart = value?.split("T")[1] || "12:00";

  return (
    <div className="grid grid-cols-2 gap-3 mt-1">
      {/* Date */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Calendar className="size-4" /> Date
        </Label>
        <Input
          type="date"
          value={datePart}
          onChange={(e) => {
            const newDate = e.target.value;
            onChange(`${newDate}T${timePart}`);
          }}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Time */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Clock className="size-4" /> Time
        </Label>
        <Input
          type="time"
          value={timePart}
          onChange={(e) => {
            const newTime = e.target.value;
            const date = datePart || new Date().toISOString().split("T")[0];
            onChange(`${date}T${newTime}`);
          }}
        />
      </div>
    </div>
  );
};

//
// ─────────────────────────────────────────────
//   MAIN REMINDERS COMPONENT
// ─────────────────────────────────────────────
//

const Reminders: React.FC = () => {
  const [reminders, setReminders] = React.useState<Reminder[]>(getReminders());
  const [title, setTitle] = React.useState("");
  const [dueAt, setDueAt] = React.useState<string>("");
  const [isAdding, setIsAdding] = React.useState(false);

  const refresh = () => setReminders(getReminders());

  const onAdd = async () => {
    if (!title.trim()) return showError("Please enter a reminder title");

    setIsAdding(true);
    await new Promise((r) => setTimeout(r, 400));

    addReminder(
      title.trim(),
      dueAt ? new Date(dueAt).toISOString() : undefined
    );

    setTitle("");
    setDueAt("");

    refresh();
    showSuccess("Reminder added successfully");
    setIsAdding(false);
  };

  const pending = reminders.filter((r) => !r.done);
  const completed = reminders.filter((r) => r.done);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="size-5 text-blue-600" />
          Reminders
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Stay on top of your important tasks
        </p>
      </div>

      {/* Add Reminder */}
      <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-end">
          {/* Title */}
          <div className="lg:col-span-5 space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700"
            >
              Reminder Title
            </Label>
            <Input
              id="title"
              placeholder="Follow up with group about campaign..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Date + Time */}
          <div className="lg:col-span-5 space-y-2">
            <DateTimePicker value={dueAt} onChange={setDueAt} />
          </div>

          {/* Add Button */}
          <div className="lg:col-span-2 flex items-end">
            <Button
              onClick={onAdd}
              disabled={isAdding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <Plus className="size-4" />
              {isAdding ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Reminders List */}
      <div className="space-y-8">
        {/* Pending */}
        {pending.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-medium text-gray-900">
              Pending ({pending.length})
            </h3>
            <div className="space-y-3">
              {pending.map((r) => (
                <ReminderItem
                  key={r.id}
                  reminder={r}
                  onToggle={(id) => {
                    toggleReminderDone(id);
                    refresh();
                  }}
                  onDelete={(id) => {
                    deleteReminder(id);
                    refresh();
                    showSuccess("Reminder deleted");
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-medium text-gray-500">
              Completed ({completed.length})
            </h3>
            <div className="space-y-3">
              {completed.map((r) => (
                <ReminderItem
                  key={r.id}
                  reminder={r}
                  onToggle={(id) => {
                    toggleReminderDone(id);
                    refresh();
                  }}
                  onDelete={(id) => {
                    deleteReminder(id);
                    refresh();
                    showSuccess("Reminder deleted");
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {reminders.length === 0 && (
          <Card className="p-8 text-center bg-gray-50 border border-gray-200 rounded-xl">
            <Bell className="size-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No reminders yet</h3>
            <p className="text-gray-600 text-sm">
              Add a reminder to stay organized
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reminders;
