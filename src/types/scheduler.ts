export type TaskType = "Meeting" | "Rep Visit" | "Group Meeting" | "Customer Meeting";

export type TaskStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";

export interface ScheduleItem {
  id: string;
  dateISO: string; // ISO string for the selected date
  type: TaskType;
  location?: string;
  members: string[];
  status: TaskStatus;
  comments?: string;
  completed: boolean;
  createdAtISO: string;
}