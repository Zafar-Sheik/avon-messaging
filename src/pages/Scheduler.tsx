"use client";

import React from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  Trash2,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  MessageSquare,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { showError, showSuccess } from "@/utils/toast";
import {
  addSchedule,
  getSchedules,
  toggleCompleted,
  updateStatus,
  deleteSchedule,
} from "@/utils/schedulerStore";
import type { TaskType, TaskStatus, ScheduleItem } from "@/types/scheduler";

const taskTypes: TaskType[] = [
  "Meeting",
  "Rep Visit",
  "Group Meeting",
  "Customer Meeting",
];
const statuses: TaskStatus[] = [
  "Pending",
  "Confirmed",
  "Cancelled",
  "Completed",
];

const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const statusConfig = {
    Pending: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
    },
    Confirmed: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CheckCircle,
    },
    Cancelled: { color: "bg-red-100 text-red-800 border-red-200", icon: Clock },
    Completed: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.color} border flex items-center gap-1`}>
      <Icon className="size-3" />
      {status}
    </Badge>
  );
};

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
    showSuccess("Schedule added successfully");
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
    showSuccess("Schedule deleted");
  };

  const todayItems = items.filter(
    (item) =>
      format(new Date(item.dateISO), "yyyy-MM-dd") ===
      format(new Date(), "yyyy-MM-dd")
  );
  const upcomingItems = items.filter(
    (item) =>
      new Date(item.dateISO) > new Date() &&
      format(new Date(item.dateISO), "yyyy-MM-dd") !==
        format(new Date(), "yyyy-MM-dd")
  );
  const pastItems = items.filter(
    (item) =>
      new Date(item.dateISO) < new Date() &&
      format(new Date(item.dateISO), "yyyy-MM-dd") !==
        format(new Date(), "yyyy-MM-dd")
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-full mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CalendarDays className="size-8 text-blue-600" />
              Schedule Manager
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Organize and track your meetings and appointments
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              <span>{items.length} total schedules</span>
            </div>
          </div>
        </div>

        {/* Create Schedule Card */}
        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardHeader className="p-0 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="size-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Create New Schedule
                </CardTitle>
                <CardDescription>
                  Add a new meeting or appointment to your calendar
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-11 border-gray-300 hover:border-gray-400">
                      <CalendarDays className="mr-2 size-4 text-gray-500" />
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
                <Label className="text-sm font-medium text-gray-700">
                  Task Type
                </Label>
                <Select
                  value={taskType}
                  onValueChange={(v) => setTaskType(v as TaskType)}>
                  <SelectTrigger className="h-11 border-gray-300">
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="size-4" />
                  Location
                </Label>
                <Input
                  placeholder="Meeting location or address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-11 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="size-4" />
                  Members
                </Label>
                <Input
                  placeholder="Comma-separated names (e.g., Alice, Bob, Carol)"
                  value={membersRaw}
                  onChange={(e) => setMembersRaw(e.target.value)}
                  className="h-11 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as TaskStatus)}>
                  <SelectTrigger className="h-11 border-gray-300">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  Comments
                </Label>
                <Textarea
                  placeholder="Notes, agenda, or additional details"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="min-h-[80px] border-gray-300 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="completed"
                  checked={completed}
                  onCheckedChange={(checked) => setCompleted(Boolean(checked))}
                  className="border-gray-300 data-[state=checked]:bg-blue-600"
                />
                <Label
                  htmlFor="completed"
                  className="text-sm font-medium text-gray-700 cursor-pointer">
                  Mark as completed
                </Label>
              </div>
              <Button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6">
                <Plus className="size-4" />
                Add Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Schedules
            </h2>
            <Badge variant="secondary" className="text-sm font-medium">
              {items.length} total items
            </Badge>
          </div>

          {items.length === 0 ? (
            <Card className="p-12 text-center bg-gray-50 border border-gray-200 rounded-xl">
              <CalendarDays className="size-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No schedules yet
              </h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Create your first schedule to start organizing your meetings and
                appointments.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Today's Schedule */}
              {todayItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Today's Schedule ({todayItems.length})
                  </h3>
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-green-100 hover:bg-green-100">
                            <TableHead className="font-semibold text-gray-700">
                              Time
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Task
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Location
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Members
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Completed
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {todayItems.map((i) => (
                            <TableRow
                              key={i.id}
                              className="hover:bg-green-50 transition-colors">
                              <TableCell className="whitespace-nowrap text-sm text-gray-900">
                                {format(new Date(i.dateISO), "h:mm a")}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900">
                                {i.type}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {i.location ? (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <MapPin className="size-3" />
                                    {i.location}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                {i.members.length === 0 ? (
                                  <span className="text-gray-400">—</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {i.members.slice(0, 2).map((m, idx) => (
                                      <Badge
                                        key={`${i.id}-m-${idx}`}
                                        variant="outline"
                                        className="text-xs bg-white">
                                        {m}
                                      </Badge>
                                    ))}
                                    {i.members.length > 2 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-white">
                                        +{i.members.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={i.status} />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant={
                                    i.completed ? "secondary" : "outline"
                                  }
                                  size="sm"
                                  onClick={() => handleToggleCompleted(i.id)}
                                  className={`w-full justify-center ${
                                    i.completed
                                      ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                      : "border-gray-300 hover:bg-gray-50"
                                  }`}>
                                  {i.completed ? (
                                    <span className="flex items-center gap-2">
                                      <CheckCircle className="size-4" />
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
                                <div className="flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(i.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Upcoming Schedule */}
              {upcomingItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Upcoming Schedule ({upcomingItems.length})
                  </h3>
                  <Card className="border-gray-200">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="font-semibold text-gray-700">
                              Date
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Task
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Location
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Members
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Completed
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingItems.map((i) => (
                            <TableRow
                              key={i.id}
                              className="hover:bg-gray-50 transition-colors">
                              <TableCell className="whitespace-nowrap text-sm text-gray-900">
                                {format(new Date(i.dateISO), "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900">
                                {i.type}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {i.location ? (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <MapPin className="size-3" />
                                    {i.location}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                {i.members.length === 0 ? (
                                  <span className="text-gray-400">—</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {i.members.slice(0, 2).map((m, idx) => (
                                      <Badge
                                        key={`${i.id}-m-${idx}`}
                                        variant="outline"
                                        className="text-xs">
                                        {m}
                                      </Badge>
                                    ))}
                                    {i.members.length > 2 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs">
                                        +{i.members.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={i.status} />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant={
                                    i.completed ? "secondary" : "outline"
                                  }
                                  size="sm"
                                  onClick={() => handleToggleCompleted(i.id)}
                                  className={`w-full justify-center ${
                                    i.completed
                                      ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                      : "border-gray-300 hover:bg-gray-50"
                                  }`}>
                                  {i.completed ? (
                                    <span className="flex items-center gap-2">
                                      <CheckCircle className="size-4" />
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
                                <div className="flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(i.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Past Schedule */}
              {pastItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">
                    Past Schedule ({pastItems.length})
                  </h3>
                  <Card className="border-gray-200">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="font-semibold text-gray-700">
                              Date
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Task
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Location
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Members
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Completed
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pastItems.map((i) => (
                            <TableRow
                              key={i.id}
                              className="hover:bg-gray-50 transition-colors">
                              <TableCell className="whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(i.dateISO), "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell className="font-medium text-gray-500">
                                {i.type}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate text-gray-500">
                                {i.location || "-"}
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                {i.members.length === 0 ? (
                                  <span className="text-gray-400">—</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {i.members.slice(0, 2).map((m, idx) => (
                                      <Badge
                                        key={`${i.id}-m-${idx}`}
                                        variant="outline"
                                        className="text-xs bg-gray-100">
                                        {m}
                                      </Badge>
                                    ))}
                                    {i.members.length > 2 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-gray-100">
                                        +{i.members.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={i.status} />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant={
                                    i.completed ? "secondary" : "outline"
                                  }
                                  size="sm"
                                  onClick={() => handleToggleCompleted(i.id)}
                                  className={`w-full justify-center ${
                                    i.completed
                                      ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                      : "border-gray-300 hover:bg-gray-50"
                                  }`}>
                                  {i.completed ? (
                                    <span className="flex items-center gap-2">
                                      <CheckCircle className="size-4" />
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
                                <div className="flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(i.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulerPage;
