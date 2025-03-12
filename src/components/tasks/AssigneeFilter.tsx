import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/select";
import { Avatar, AvatarFallback, AvatarImage } from "components/avatar";
import { UserType } from "@/types/task";

export function AssigneeFilter({
  users,
  value,
  onChange,
}: {
  users: UserType[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12 w-48 border-gray-300 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500">
        <SelectValue placeholder="Filter by assignee" />
      </SelectTrigger>
      <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg">
        <SelectItem value="all">All Assignees</SelectItem>
        {users.map((user) => (
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
  );
}