import { Dialog, DialogContent, DialogTitle } from "components/dialog";
import { TaskForm } from "./TaskForm";
import { Edit, PlusCircle } from "lucide-react";
import type { Task, UserType } from "@/types/task";

export function TaskDialog({
  isOpen,
  onClose,
  task,
  onSubmit,
  formErrors,
  users,
  tags,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  onSubmit: (formData: {
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    deadline?: Date;
    assignedTo?: string;
    tags?: string[];
  }) => void;
  formErrors: Record<string, string | undefined>;
  users: UserType[];
  tags: string[];
  isSubmitting: boolean;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(e.currentTarget);
    const tagValues = Array.from(
      (form.tags as HTMLSelectElement).selectedOptions,
    ).map((option) => option.value);
    const deadlineValue = form.deadline.value
      ? new Date(form.deadline.value)
      : undefined;
    const taskData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priority: formData.get("priority") as "Low" | "Medium" | "High",
      deadline: deadlineValue,
      assignedTo: form.assignedTo.value ?? undefined,
      tags: tagValues,
    };
    onSubmit(taskData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md md:max-w-2xl"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
          borderRadius: "16px",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <DialogTitle className="gradient-text flex items-center gap-2 text-lg font-bold lg:text-xl">
          {task ? (
            <Edit className="h-5 w-5 text-indigo-600" />
          ) : (
            <PlusCircle className="h-5 w-5 text-indigo-600" />
          )}
          {task ? "Edit Task" : "Create New Task"}
        </DialogTitle>
        <TaskForm
          key={task ? `edit-${task.id}` : "create-new"}
          task={task}
          users={users}
          tags={tags}
          errors={formErrors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
