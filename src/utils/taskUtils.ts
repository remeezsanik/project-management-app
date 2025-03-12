import { Task } from "@/types/task";

export function isTaskOverdue(task: Task): boolean {
  if (!task.deadline || task.status === "Done") return false;
  const taskDeadline = new Date(task.deadline);
  return !isNaN(taskDeadline.getTime()) && taskDeadline < new Date();
}


export function sortTasks(tasks: Task[]): Task[] {
  return tasks.sort((a, b) => {
    const aIsOverdue = isTaskOverdue(a);
    const bIsOverdue = isTaskOverdue(b);
    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

export function getPriorityColor(priority: string): string {
 switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 hover:text-red-800 hover:bg-white hover:border-red-800/40";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 hover:text-yellow-800 hover:bg-white hover:border-yellow-800/40";
      case "Low":
        return "bg-green-100 text-green-800 hover:text-green-800 hover:bg-white hover:border-green-800/40";
      default:
        return "bg-gray-100 text-gray-800 hover:text-gray-800 hover:bg-white hover:border-gray-800/40";
    }
}

export function getStatusStyles(status: string): {
  gradientClass: string;
  headerBg: string;
  borderColor: string;
  textColor: string;
  badgeClass: string;
} {
  switch (status) {
    case "Todo":
      return {
        gradientClass: "bg-gradient-to-br from-gray-50 to-gray-100",
        headerBg: "bg-white bg-opacity-50",
        borderColor: "border-gray-200",
        textColor: "text-orange-600",
        badgeClass: "bg-orange-200 text-orange-800 hover:text-orange-800 hover:bg-white hover:border-orange-800/40",
      };
    case "InProgress":
      return {
        gradientClass: "bg-gradient-to-br from-blue-50 to-blue-100",
        headerBg: "bg-white bg-opacity-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-700",
        badgeClass: "bg-blue-200 text-blue-800 hover:text-blue-800 hover:bg-white hover:border-blue-800/40",
      };
    case "Done":
      return {
        gradientClass: "bg-gradient-to-br from-green-50 to-green-100",
        headerBg: "bg-white bg-opacity-50",
        borderColor: "border-green-200",
        textColor: "text-green-700",
        badgeClass: "bg-green-200 text-green-800 hover:text-green-800 hover:bg-white hover:border-green-800/40",
      };
    default:
      return {
        gradientClass: "bg-gradient-to-br from-gray-50 to-gray-100",
        headerBg: "bg-white bg-opacity-50",
        borderColor: "border-gray-200",
        textColor: "text-gray-700",
        badgeClass: "bg-gray-200 text-gray-800 hover:text-gray-800 hover:bg-white hover:border-gray-800/40",
      };
  }
}