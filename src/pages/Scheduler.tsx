"use client";

import React from "react";
import { format } from "date-fns";
import { CalendarDays, Trash, CheckCircle, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { showError, showSuccess } from "@/utils/toast";
import { addSchedule, getSchedules, toggleCompleted, updateStatus, deleteSchedule } from "@/utils/schedulerStore";
import type { TaskType, TaskStatus, ScheduleItem } from "@/types/scheduler";

const taskTypes: TaskType[] = ["Meeting", "Rep Visit", "Group Meeting", "Customer Meeting"];
const statuses: TaskStatus[] = ["Pending", "Confirmed", "Cancelled", "Completed"];

const SchedulerPage: React.FC = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [taskType, setTaskType] = React.useState<TaskType>("Meeting");
  const [location, setLocation] = React.useState("");
  const [membersRaw, setMembersRaw] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>("Pending");
  const [comments, setComments] = React.useState("");
  const [completed, setCompleted] = React.useState(false);

  const [items, setItems] = React.useState<ScheduleItem[]>([]);

  React.useEffect(() => {
    setItems(getSchedules());
  }, []);

  const parseMembers = (raw: string): string[] =>
    raw
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

  const handleAdd = () => {
    if (!date) {
      showError("Please choose a date.");
      return;
    }
    if (!taskType) {
      showError("Select a task type.");
      return;
    }
    const newItem = addSchedule({
      date,
      type: taskType,
      location,
      members: parseMembers(membersRaw),
      status,
      comments,
      completed,
    });
    setItems((prev) => [newItem, ...prev]);
    showSuccess("Schedule added.");
    // Reset form (keep date to speed up multiple entries)
    setTaskType("Meeting");
    setLocation("");
    setMembersRaw("");
    setStatus("Pending");
    setComments("");
    setCompleted(false);
  };

  const handleToggleCompleted = (id: string) => {
    const updated = toggleCompleted(id);
    if (!updated) return;
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const handleChangeStatus = (id: string, next: TaskStatus) => {
    const updated = updateStatus(id, next);
    if (!updated) return;
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const handleDelete = (id: string) => {
    const ok = deleteSchedule(id);
    if (!ok) {
      showError("Could not delete item.");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    showSuccess("Item deleted.");
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Scheduler</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Task</Label>
              <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="Meeting location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Members</Label>
              <Input
                placeholder="Comma-separated names (e.g., Alice, Bob, Carol)"
                value={membersRaw}
                onChange={(e) => setMembersRaw(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea
                placeholder="Notes or agenda"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <Checkbox
                id="completed"
                checked={completed}
                onCheckedChange={(checked) => setCompleted(Boolean(checked))}
              />
              <Label htmlFor="completed">Mark as completed</Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAdd}>Add schedule</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No schedules yet. Add one above.</div>
          ) : (
            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">Date</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead className="w-40">Status</TableHead>
                    <TableHead className="w-24">Completed</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="whitespace-nowrap">{format(new Date(i.dateISO), "PPP")}</TableCell>
                      <TableCell className="font-medium">{i.type}</TableCell>
                      <TableCell className="truncate">{i.location || "-"}</TableCell>
                      <TableCell className="space-x-1">
                        {i.members.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          i.members.map((m, idx) => (
                            <Badge key={`${i.id}-m-${idx}`} variant="outline" className="max-w-[8rem] truncate align-middle">
                              {m}
                            </Badge>
                          ))
                        )}
                      </TableCell>
                      <TableCell>
                        <Select value={i.status} onValueChange={(v) => handleChangeStatus(i.id, v as TaskStatus)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((s) => (
                              <SelectItem key={`${i.id}-status-${s}`} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={i.completed ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => handleToggleCompleted(i.id)}
                          className="w-full justify-center"
                          title={i.completed ? "Completed" : "Mark completed"}
                        >
                          {i.completed ? (
                            <span className="flex items-center gap-2">
                              <CheckCircle className="size-4 text-green-600" />
                              Done
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Clock className="size-4" />
                              Pending
                            </span>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(i.id)}>
                          <Trash className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulerPage;