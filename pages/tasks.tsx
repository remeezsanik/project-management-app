import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Button } from "../components/button";
import type { FormErrors, Task } from "@/types/task";
import { useTasksData } from "@/hooks/useTasksData";
import { TaskHeader } from "@/components/tasks/TaskHeader";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskColumn } from "@/components/tasks/TaskColumn";
import { DeleteConfirmationDialog } from "@/components/tasks/DeleteConfirmationDialog";
import * as taskService from "../src/service/taskService";
import * as taskUtils from "../src/utils/taskUtils";

export default function TasksPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { tasks, users, tags, isLoading, fetchTasks } = useTasksData(session);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    const { priority, assigned_to } = router.query;
    if (priority && typeof priority === "string") setSelectedPriority(priority);
    if (assigned_to && typeof assigned_to === "string")
      setSelectedAssignee(assigned_to);
  }, [router.query]);

  useEffect(() => {
    if (isDialogOpen) setFormErrors({});
  }, [isDialogOpen]);

  const validateForm = (formData: {
    title: string;
    priority: string;
    deadline?: Date;
    assignedTo?: string;
  }): boolean => {
    const errors: FormErrors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.priority) errors.priority = "Priority is required";
    if (!formData.deadline) errors.deadline = "Deadline is required";
    if (!formData.assignedTo)
      errors.assignedTo = "Task must be assigned to someone";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    deadline?: Date;
    assignedTo?: string;
    tags?: string[];
  }) => {
    if (!validateForm(formData)) return;
    if (editingTask) {
      setIsUpdatingTask(true);
      try {
        await taskService.updateTask(editingTask.id, formData);
        await fetchTasks();
        setIsDialogOpen(false);
        toast.success("Task updated successfully");
      } catch (error) {
        console.error("Error updating task:", error);
        toast.error("Failed to update task");
      } finally {
        setIsUpdatingTask(false);
      }
    } else {
      setIsCreatingTask(true);
      try {
        await taskService.createTask({ ...formData, userId: session!.user.id });
        await fetchTasks();
        setIsDialogOpen(false);
        toast.success("Task created successfully");
      } catch (error) {
        console.error("Error creating task:", error);
        toast.error("Failed to create task");
      } finally {
        setIsCreatingTask(false);
      }
    }
  };

  const updateTaskStatus = async (
    id: string,
    status: "Todo" | "InProgress" | "Done",
  ) => {
    setIsUpdatingTask(true);
    try {
      await taskService.updateTaskStatus(id, status);
      await fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await taskService.deleteTask(taskToDelete);
      await fetchTasks();
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  if (!session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-5">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">Please sign in</h2>
          <p className="text-gray-500">
            You need to be signed in to view and manage tasks
          </p>
        </div>
        <Button onClick={() => signIn("credentials")}>Login</Button>
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) => {
    if (selectedTag && !task.tags?.includes(selectedTag)) return false;
    if (selectedStatus && task.status !== selectedStatus) return false;
    if (selectedPriority && task.priority !== selectedPriority) return false;
    if (selectedAssignee && task.assignedTo !== selectedAssignee) return false;
    return true;
  });

  const tasksByStatus = {
    Todo: taskUtils.sortTasks(filteredTasks.filter((t) => t.status === "Todo")),
    InProgress: taskUtils.sortTasks(
      filteredTasks.filter((t) => t.status === "InProgress"),
    ),
    Done: taskUtils.sortTasks(filteredTasks.filter((t) => t.status === "Done")),
  };

  return (
    <Layout>
      <div
        className="space-y-6 p-6"
        style={{
          background: "linear-gradient(135deg, #f0f4ff 0%, #e4eaff 100%)",
          borderRadius: "16px",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        <TaskHeader onCreateClick={() => setIsDialogOpen(true)} />
        <TaskFilters
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          selectedAssignee={selectedAssignee}
          setSelectedAssignee={setSelectedAssignee}
          users={users}
          tags={tags}
        />
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="space-y-2 text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <p className="text-sm text-gray-500">Loading tasks...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {["Todo", "InProgress", "Done"].map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status as keyof typeof tasksByStatus]}
                onUpdateStatus={updateTaskStatus}
                onEdit={(task: Task) => {
                  setEditingTask(task);
                  setIsDialogOpen(true);
                }}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
        <TaskDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingTask(undefined);
          }}
          task={editingTask}
          onSubmit={handleSubmit}
          formErrors={formErrors}
          users={users}
          tags={tags}
          isSubmitting={isCreatingTask || isUpdatingTask}
        />
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
      </div>
    </Layout>
  );
}
