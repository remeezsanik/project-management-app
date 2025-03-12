import { Input } from "components/input";
import { Textarea } from "components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "components/avatar";
import { Button } from "components/button";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { Task, UserType } from "@/types/task";
import { useSession } from "next-auth/react";

export function TaskForm({
  task,
  users,
  tags,
  errors,
  onSubmit,
}: {
  task?: Task;
  users: UserType[];
  tags: string[];
  errors: { [key: string]: string | undefined };
  onSubmit: (e: React.FormEvent) => void;
}) {
  const { data: session } = useSession();
  const FieldError = ({ error }: { error?: string }) =>
    error ? (
      <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
        <AlertCircle size={12} />
        <span>{error}</span>
      </div>
    ) : null;

  return (
    <form onSubmit={onSubmit} className="space-y-6 pt-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          name="title"
          placeholder="Task Title"
          defaultValue={task?.title || ""}
          className={`w-full rounded-md ${
            errors.title
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          }`}
        />
        <FieldError error={errors.title} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          name="description"
          placeholder="Detailed description..."
          className="h-24 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          defaultValue={task?.description || ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Priority <span className="text-red-500">*</span>
          </label>
          <Select name="priority" defaultValue={task?.priority || "Medium"}>
            <SelectTrigger
              className={`w-full rounded-md ${
                errors.priority
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
          <FieldError error={errors.priority} />
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
                errors.deadline
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              defaultValue={
                task?.deadline ? task.deadline.toISOString().split("T")[0] : ""
              }
            />
          </div>
          <FieldError error={errors.deadline} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Assign To <span className="text-red-500">*</span>
        </label>
        <Select
          name="assignedTo"
          defaultValue={task?.assignedTo ?? session?.user?.id ?? ""}
        >
          <SelectTrigger
            className={`w-full rounded-md ${
              errors.assignedTo
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }`}
          >
            <SelectValue placeholder="Assign to..." />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
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
        <FieldError error={errors.assignedTo} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Tags
        </label>
        <select
          name="tags"
          multiple
          className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          defaultValue={task?.tags || []}
        >
          {tags.map((tag) => (
            <option key={tag} value={tag}>
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
      >
        {task ? "Update Task" : "Add Task"}
      </Button>
    </form>
  );
}
