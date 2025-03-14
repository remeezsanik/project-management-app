import { Button } from "components/button";
import { Avatar, AvatarFallback, AvatarImage } from "components/avatar";
import { Badge } from "components/badge";
import { Clock, Tag, User, Edit, Trash, CheckCircle } from "lucide-react";
import * as taskUtils from "../../utils/taskUtils";
import type { Task } from "@/types/task";

export function TaskCard({
  task,
  onUpdateStatus,
  onEdit,
  onDelete,
}: {
  task: Task;
  onUpdateStatus: (id: string, status: "Todo" | "InProgress" | "Done") => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const isOverdue = taskUtils.isTaskOverdue(task);
  return (
    <div
      className={`rounded-xl border border-gray-100 p-3 shadow-sm transition-shadow hover:shadow-lg sm:p-4 ${
        isOverdue ? "!border-red-300 !bg-red-50" : "bg-white"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-start justify-between">
        <h3 className="truncate font-medium text-gray-900">
          {task.title}
          {isOverdue && (
            <span className="ml-2 text-xs font-medium text-red-600">
              (Overdue)
            </span>
          )}
        </h3>

        <div className="flex flex-wrap items-center gap-1">
          <Badge className={taskUtils.getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
          <Button variant="ghost" onClick={() => onEdit(task)}>
            <Edit size={14} className="text-amber-600" />
          </Button>
          <Button variant="ghost" onClick={() => onDelete(task.id)}>
            <Trash size={14} className="text-red-500" />
          </Button>
        </div>
      </div>

      {task.description && (
        <p className="mb-2 line-clamp-2 text-xs text-gray-600 sm:text-sm">
          {task.description}
        </p>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {task.tags?.map((tag) => (
          <div
            key={tag}
            className="flex items-center rounded bg-gray-100 px-2 py-1 text-xs text-gray-800"
          >
            <Tag size={12} className="mr-1" />
            {tag}
          </div>
        ))}
      </div>

      <div className="mt-2 space-y-1 text-xs text-gray-600 sm:text-sm">
        {task.deadline && (
          <div className="flex items-center">
            <Clock size={12} className="mr-2" />
            <span className="font-medium">Deadline:</span>
            <span className={`ml-1 ${isOverdue ? "text-red-600" : ""}`}>
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          </div>
        )}

        {task.assignedToUser && (
          <div className="flex items-center">
            <User size={12} className="mr-2" />
            <span className="font-medium">Assigned to:</span>
            <Avatar className="ml-1 mr-1 h-4 w-4">
              <AvatarImage src={task.assignedToUser.image ?? ""} />
              <AvatarFallback className="rounded font-semibold text-gray-700">
                {task.assignedToUser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{task.assignedToUser.name}</span>
          </div>
        )}
      </div>

      {task.status !== "Done" && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <Button
            variant="outline"
            className={`w-full text-xs ${
              task.status === "Todo"
                ? "text-blue-600 hover:text-blue-700"
                : "text-green-600 hover:text-green-700"
            }`}
            onClick={() =>
              onUpdateStatus(
                task.id,
                task.status === "Todo" ? "InProgress" : "Done",
              )
            }
          >
            <CheckCircle size={12} className="mr-1" />
            {task.status === "Todo" ? "Start Task" : "Mark Complete"}
          </Button>
        </div>
      )}
    </div>
  );
}
