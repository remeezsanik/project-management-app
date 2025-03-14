import { Input } from "components/input";
import { Textarea } from "components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/select";
import { Avatar, AvatarFallback, AvatarImage } from "components/avatar";
import { Button } from "components/button";
import { CalendarIcon, AlertCircle, Loader2 } from "lucide-react";
import type { Task, UserType } from "@/types/task";
import { useSession } from "next-auth/react";

export function TaskForm({
  task,
  users,
  tags,
  errors,
  onSubmit,
  isSubmitting,
}: {
  task?: Task;
  users: UserType[];
  tags: string[];
  errors: { [key: string]: string | undefined };
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
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
    <form
      onSubmit={onSubmit}
      className="space-y-2 rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          name="title"
          placeholder="Enter task title"
          defaultValue={task?.title ?? ""}
          className={`w-full rounded-lg border-2 ${
            errors.title
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
        />
        <FieldError error={errors.title} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Description
        </label>
        <Textarea
          name="description"
          placeholder="Write a detailed description..."
          className="h-28 w-full rounded-lg border-2 border-gray-300 focus:border-blue-500"
          defaultValue={task?.description ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Priority <span className="text-red-500">*</span>
          </label>
          <Select name="priority" defaultValue={task?.priority ?? "Medium"}>
            <SelectTrigger
              className={`w-full rounded-lg border-2 ${
                errors.priority
                  ? "border-red-500"
                  : "border-gray-300 focus:border-blue-500"
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
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Deadline <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              name="deadline"
              type="date"
              className={`w-full rounded-lg border-2 pl-10 ${
                errors.deadline
                  ? "border-red-500"
                  : "border-gray-300 focus:border-blue-500"
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
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Assign To <span className="text-red-500">*</span>
        </label>
        <Select
          name="assignedTo"
          defaultValue={task?.assignedTo ?? session?.user?.id ?? ""}
        >
          <SelectTrigger
            className={`w-full rounded-lg border-2 ${
              errors.assignedTo
                ? "border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          >
            <SelectValue placeholder="Assign to..." />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center">
                  <Avatar className="mr-2 h-6 w-6">
                    <AvatarImage src={user.image ?? ""} />
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
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Tags
        </label>
        <select
          name="tags"
          multiple
          className="w-full rounded-lg border-2 border-gray-300 p-2 text-sm focus:border-blue-500"
          defaultValue={task?.tags ?? []}
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
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {task ? "Updating..." : "Adding..."}
          </span>
        ) : (
          <>{task ? "Update Task" : "Add Task"}</>
        )}
      </Button>
    </form>
  );
}
