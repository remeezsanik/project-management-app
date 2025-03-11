import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Textarea } from "../components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../components/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar";
import { Badge } from "../components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import {
  CalendarIcon,
  CheckCircle,
  Clock,
  Tag,
  User,
  Edit,
  List,
  PlusCircle,
  ListTodo,
  Trash,
  PlusCircleIcon,
  AlertCircle,
} from "lucide-react";
import Layout from "@/components/Layout";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { toast } from "sonner";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

type Task = {
  id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Todo" | "InProgress" | "Done";
  deadline?: Date;
  assignedTo?: string;
  assignedToUser?: { id: string; name: string; image?: string };
  tags?: string[];
  createdAt: Date;
};

type User = {
  id: string;
  name: string;
  image?: string;
};

type FormErrors = {
  title?: string;
  priority?: string;
  deadline?: string;
  assignedTo?: string;
};

export default function Home() {
  const { data: session } = useSession();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const router = useRouter();

  // Function to check if a task is overdue
  const isTaskOverdue = (task: Task) => {
    if (!task.deadline || task.status === "Done") return false;
    return new Date(task.deadline) < new Date();
  };

  // Sorting function for tasks
  const sortTasks = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      // Check if tasks are overdue
      const aIsOverdue = isTaskOverdue(a);
      const bIsOverdue = isTaskOverdue(b);

      // Sort overdue tasks first
      if (aIsOverdue && !bIsOverdue) return -1;
      if (!aIsOverdue && bIsOverdue) return 1;

      // If both are overdue or neither are overdue, sort by priority
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  useEffect(() => {
    const { priority } = router.query;
    const { assigned_to } = router.query;
    if (priority && typeof priority === "string") {
      setSelectedPriority(priority);
    }
    if (assigned_to && typeof assigned_to === "string") {
      setSelectedAssignee(assigned_to);
    }
  }, [router.query]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTasks(), fetchUsers(), fetchTags()]);
      setIsLoading(false);
    };
    if (session) fetchData();
  }, [session]);

  useEffect(() => {
    if (isDialogOpen) {
      setFormErrors({});
    }
  }, [isDialogOpen]);

  const fetchTasks = async () => {
    const { data: taskData, error } = await supabase.from("tasks").select("*");
    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }
    const processedTasks: Task[] = [];
    for (const task of taskData) {
      const enhancedTask: Task = {
        ...task,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        createdAt: new Date(task.createdAt),
        tags: task.tags || [],
      };
      if (task.assignedTo) {
        const { data: userData, error } = await supabase
          .from("User")
          .select("id, name, image")
          .eq("id", task.assignedTo)
          .single();
        if (!error && userData) enhancedTask.assignedToUser = userData;
      }
      processedTasks.push(enhancedTask);
    }
    setTasks(processedTasks);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("User")
      .select("id, name, image");
    if (error) {
      console.error("Error fetching users:", error);
      return;
    }
    setUsers(data || []);
  };

  const fetchTags = async () => {
    const { data, error } = await supabase.from("tags").select("name");
    if (error) {
      console.error("Error fetching tags:", error);
      return;
    }
    setTags(data.map((tag) => tag.name) || []);
  };

  const validateForm = (formData: {
    title: string;
    priority: string;
    deadline?: Date;
    assignedTo?: string;
  }): boolean => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.priority) {
      errors.priority = "Priority is required";
    }

    if (!formData.deadline) {
      errors.deadline = "Deadline is required";
    }

    if (!formData.assignedTo) {
      errors.assignedTo = "Task must be assigned to someone";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createTask = async (formData: {
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    deadline?: Date;
    assignedTo?: string;
    tags?: string[];
  }) => {
    setIsCreatingTask(true);
    const newTask = {
      ...formData,
      status: "Todo" as const,
      createdAt: new Date().toISOString(),
      userId: session?.user?.id,
      assignedTo: formData.assignedTo || session?.user?.id,
      deadline: formData.deadline ? formData.deadline.toISOString() : null,
    };
    console.log("newTask : ", newTask);

    const { data, error } = await supabase
      .from("tasks")
      .insert([newTask])
      .select();
    if (error) {
      console.error("Error creating task:", error);
      setIsCreatingTask(false);
      return;
    }
    await fetchTasks();
    setIsCreatingTask(false);
    setIsDialogOpen(false);
    toast.success("Task Created Successfully");
  };

  const updateTask = async (
    id: string,
    formData: {
      title: string;
      description: string;
      priority: "Low" | "Medium" | "High";
      deadline?: Date;
      assignedTo?: string;
      tags?: string[];
    },
  ) => {
    setIsUpdatingTask(true);
    const updatedTask = {
      ...formData,
      deadline: formData.deadline ? formData.deadline.toISOString() : null,
    };
    const { error } = await supabase
      .from("tasks")
      .update(updatedTask)
      .eq("id", id);
    if (error) {
      console.error("Error updating task:", error);
      setIsUpdatingTask(false);
      return;
    }
    await fetchTasks();
    setIsUpdatingTask(false);
    setEditingTask(null);
    setIsDialogOpen(false);
    toast.success("Task Updated Successfully");
  };

  const updateTaskStatus = async (
    id: string,
    status: "Todo" | "InProgress" | "Done",
  ) => {
    setIsUpdatingTask(true);
    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", id);
    if (error) {
      console.error("Error updating task status:", error);
      setIsUpdatingTask(false);
      return;
    }
    await fetchTasks();
    setIsUpdatingTask(false);
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) throw error;
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete);
      toast.success("Task deleted successfully");
      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const tagValues = Array.from(
      (form.tags as HTMLSelectElement).selectedOptions,
    ).map((option) => option.value);

    const deadlineValue = form.deadline.value
      ? new Date(form.deadline.value)
      : undefined;

    const taskData = {
      title: form.title.value,
      description: form.description.value,
      priority: form.priority.value as "Low" | "Medium" | "High",
      deadline: deadlineValue,
      assignedTo: form.assignedTo.value || undefined,
      tags: tagValues,
    };

    // Validate the form
    if (!validateForm(taskData)) {
      return; // Stop submission if validation fails
    }

    if (editingTask) updateTask(editingTask.id, taskData);
    else createTask(taskData);
  };

  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
        <AlertCircle size={12} />
        <span>{error}</span>
      </div>
    );
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

  const filteredTasks = tasks.filter((task: Task) => {
    if (selectedTag && !task.tags?.includes(selectedTag)) return false;
    if (selectedStatus && task.status !== selectedStatus) return false;
    if (selectedPriority && task.priority !== selectedPriority) return false;
    if (selectedAssignee && task.assignedTo !== selectedAssignee) return false;
    return true;
  });

  const tasksByStatus = {
    Todo: sortTasks(
      filteredTasks.filter((task: Task) => task.status === "Todo"),
    ),
    InProgress: sortTasks(
      filteredTasks.filter((task: Task) => task.status === "InProgress"),
    ),
    Done: sortTasks(
      filteredTasks.filter((task: Task) => task.status === "Done"),
    ),
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Todo":
        return {
          gradientClass: "bg-gradient-to-br from-gray-50 to-gray-100",
          headerBg: "bg-white bg-opacity-50",
          borderColor: "border-gray-200",
          textColor: "text-orange-600",
          badgeClass: "bg-orange-200 text-orange-800",
        };
      case "InProgress":
        return {
          gradientClass: "bg-gradient-to-br from-blue-50 to-blue-100",
          headerBg: "bg-white bg-opacity-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-700",
          badgeClass: "bg-blue-200 text-blue-800",
        };
      case "Done":
        return {
          gradientClass: "bg-gradient-to-br from-green-50 to-green-100",
          headerBg: "bg-white bg-opacity-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          badgeClass: "bg-green-200 text-green-800",
        };
      default:
        return {
          gradientClass: "bg-gradient-to-br from-gray-50 to-gray-100",
          headerBg: "bg-white bg-opacity-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-700",
          badgeClass: "bg-gray-200 text-gray-800",
        };
    }
  };

  const handleSelectChange =
    (setter: (value: string | null) => void) => (value: string) =>
      setter(value === "all" ? null : value);

  return (
    <Layout>
      <div
        className="mt-2 space-y-6 p-4"
        style={{
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4eaf5 100%)",
          borderRadius: "12px",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingTask(null);
              setFormErrors({});
            }
          }}
        >
          <Card className="mb-6 rounded-2xl bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white shadow-lg">
                    <ListTodo size={30} />
                  </div>
                  <div>
                    <h1 className="bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-3xl font-bold text-transparent">
                      Task Management
                    </h1>
                  </div>
                </div>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 shadow-md transition-all hover:scale-105 hover:shadow-lg">
                    <span className="flex items-center gap-2">
                      Create Task <PlusCircleIcon size={16} />
                    </span>
                  </Button>
                </DialogTrigger>
              </div>
            </CardContent>
          </Card>

          <DialogContent
            className="max-w-md md:max-w-xl"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
              borderRadius: "16px",
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
              {editingTask ? (
                <Edit className="h-6 w-6 text-blue-600" />
              ) : (
                <PlusCircle className="h-6 w-6 text-blue-600" />
              )}
              {editingTask ? "Edit Task" : "Create New Task"}
            </DialogTitle>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  placeholder="Task Title"
                  defaultValue={editingTask ? editingTask.title : ""}
                  className={`w-full rounded-md ${
                    formErrors.title
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                <FieldError error={formErrors.title} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  name="description"
                  placeholder="Detailed description..."
                  className="h-24 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  defaultValue={editingTask ? editingTask.description : ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="priority"
                    defaultValue={editingTask ? editingTask.priority : "Medium"}
                  >
                    <SelectTrigger
                      className={`w-full rounded-md ${
                        formErrors.priority
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                    >
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError error={formErrors.priority} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Deadline <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      name="deadline"
                      type="date"
                      className={`w-full rounded-md pl-10 ${
                        formErrors.deadline
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                      defaultValue={
                        editingTask?.deadline
                          ? editingTask.deadline.toISOString().split("T")[0]
                          : ""
                      }
                    />
                  </div>
                  <FieldError error={formErrors.deadline} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <Select
                  name="assignedTo"
                  defaultValue={
                    editingTask?.assignedTo ?? session?.user?.id ?? ""
                  }
                >
                  <SelectTrigger
                    className={`w-full rounded-md ${
                      formErrors.assignedTo
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  >
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user: User) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center">
                          <Avatar className="mr-2 h-6 w-6">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback>
                              {user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {user.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError error={formErrors.assignedTo} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <select
                  name="tags"
                  multiple
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  defaultValue={editingTask?.tags || []}
                >
                  {tags.map((tag: string) => (
                    <option
                      key={tag}
                      value={tag}
                      selected={editingTask?.tags?.includes(tag) || false}
                    >
                      {tag}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl/Cmd to select multiple tags
                </p>
              </div>
              <div className="text-xs text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isCreatingTask || isUpdatingTask}
              >
                {editingTask
                  ? isUpdatingTask
                    ? "Updating..."
                    : "Update Task"
                  : isCreatingTask
                    ? "Adding..."
                    : "Add Task"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <hr />
            <p className="text-gray-700">
              Are you sure you want to delete this task?
              <br /> This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="mb-6 rounded-3xl border border-gray-200 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              {/* Status Filter */}
              <Select
                value={selectedStatus || "all"}
                onValueChange={handleSelectChange(setSelectedStatus)}
              >
                <SelectTrigger className="h-12 w-44 border-gray-300 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Todo">Todo</SelectItem>
                  <SelectItem value="InProgress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select
                value={selectedPriority || "all"}
                onValueChange={handleSelectChange(setSelectedPriority)}
              >
                <SelectTrigger className="h-12 w-44 border-gray-300 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg">
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Tag Filter */}
              <Select
                value={selectedTag || "all"}
                onValueChange={handleSelectChange(setSelectedTag)}
              >
                <SelectTrigger className="h-12 w-44 border-gray-300 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg">
                  <SelectItem value="all">All Tags</SelectItem>
                  {tags.map((tag: string) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Assignee Filter */}
              <Select
                value={selectedAssignee || "all"}
                onValueChange={handleSelectChange(setSelectedAssignee)}
              >
                <SelectTrigger className="h-12 w-48 border-gray-300 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by assignee" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg">
                  <SelectItem value="all">All Assignees</SelectItem>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-gray-300 shadow-sm">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback className="bg-gray-100 text-gray-600">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-gray-700">{user.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              {(selectedStatus ||
                selectedPriority ||
                selectedTag ||
                selectedAssignee) && (
                <Button
                  variant="outline"
                  className="ml-auto h-12 border-red-300 px-6 text-sm font-semibold hover:bg-gray-100"
                  onClick={() => {
                    setSelectedStatus(null);
                    setSelectedPriority(null);
                    setSelectedTag(null);
                    setSelectedAssignee(null);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="space-y-2 text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <p className="text-sm text-gray-500">Loading tasks...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
              const styles = getStatusStyles(status);
              return (
                <Card
                  key={status}
                  className={`group overflow-hidden rounded-2xl border-none shadow-lg transition-all hover:shadow-xl ${styles.gradientClass}`}
                >
                  <CardHeader
                    className={`${styles.headerBg} border-b ${styles.borderColor} p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {status === "Todo" && (
                          <List size={20} className={styles.textColor} />
                        )}
                        {status === "InProgress" && (
                          <Clock size={20} className={styles.textColor} />
                        )}
                        {status === "Done" && (
                          <CheckCircle size={20} className={styles.textColor} />
                        )}
                        <CardTitle
                          className={`text-lg font-semibold ${styles.textColor}`}
                        >
                          {status}
                        </CardTitle>
                      </div>
                      <Badge className={styles.badgeClass}>
                        {statusTasks.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {statusTasks.length === 0 ? (
                        <p className="py-8 text-center text-gray-500">
                          No tasks
                        </p>
                      ) : (
                        statusTasks.map((task: Task) => (
                          <div
                            key={task.id}
                            className={`rounded-xl border border-gray-100 p-4 shadow-sm transition-shadow hover:shadow-lg ${
                              isTaskOverdue(task)
                                ? "border-red-300 bg-red-50"
                                : "bg-white"
                            }`}
                          >
                            <div className="mb-2 flex items-start justify-between">
                              <h3 className="font-medium text-gray-900">
                                {task.title}
                                {isTaskOverdue(task) && (
                                  <span className="ml-2 text-xs font-medium text-red-600">
                                    (Overdue)
                                  </span>
                                )}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getPriorityColor(task.priority)}
                                >
                                  {task.priority}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-500 hover:text-gray-700"
                                  onClick={() => {
                                    setEditingTask(task);
                                    setIsDialogOpen(true);
                                  }}
                                >
                                  <Edit size={16} className="text-amber-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteClick(task.id)}
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </div>
                            {task.description && (
                              <p className="mb-3 line-clamp-2 text-sm text-gray-600">
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
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {task.deadline && (
                                <div className="flex items-center">
                                  <Clock size={14} className="mr-2" />
                                  <span className="font-medium">Deadline:</span>
                                  <span
                                    className={`ml-1 ${isTaskOverdue(task) ? "text-red-600" : ""}`}
                                  >
                                    {new Date(
                                      task.deadline,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {task.assignedToUser && (
                                <div className="flex items-center">
                                  <User size={14} className="mr-2" />
                                  <span className="font-medium">
                                    Assigned to:
                                  </span>
                                  <Avatar className="ml-1 mr-1 h-5 w-5">
                                    <AvatarImage
                                      src={task.assignedToUser.image || ""}
                                    />
                                    <AvatarFallback className="rounded font-semibold text-gray-700">
                                      {task.assignedToUser.name
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{task.assignedToUser.name}</span>
                                </div>
                              )}
                            </div>
                            {status !== "Done" && (
                              <div className="mt-3 border-t border-gray-100 pt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`w-full text-xs ${
                                    status === "Todo"
                                      ? "text-blue-600 hover:text-blue-700"
                                      : "text-green-600 hover:text-green-700"
                                  }`}
                                  disabled={isUpdatingTask}
                                  onClick={() =>
                                    updateTaskStatus(
                                      task.id,
                                      status === "Todo" ? "InProgress" : "Done",
                                    )
                                  }
                                >
                                  <CheckCircle size={14} className="mr-1" />
                                  {status === "Todo"
                                    ? "Start Task"
                                    : "Mark Complete"}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
