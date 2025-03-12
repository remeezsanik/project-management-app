import { Card, CardContent } from "components/card";
import { FilterSelect } from "./FilterSelect";
import { AssigneeFilter } from "./AssigneeFilter";
import { UserType } from "@/types/task";
import { Button } from "components/button";

export function TaskFilters({
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  selectedTag,
  setSelectedTag,
  selectedAssignee,
  setSelectedAssignee,
  users,
  tags,
}: {
  selectedStatus: string | null;
  setSelectedStatus: (value: string | null) => void;
  selectedPriority: string | null;
  setSelectedPriority: (value: string | null) => void;
  selectedTag: string | null;
  setSelectedTag: (value: string | null) => void;
  selectedAssignee: string | null;
  setSelectedAssignee: (value: string | null) => void;
  users: UserType[];
  tags: string[];
}) {
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Todo", label: "Todo" },
    { value: "InProgress", label: "In Progress" },
    { value: "Done", label: "Done" },
  ];
  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];
  const tagOptions = [
    { value: "all", label: "All Tags" },
    ...tags.map((tag) => ({ value: tag, label: tag })),
  ];

  return (
    <Card className="mb-6 rounded-3xl border border-gray-200 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          <FilterSelect
            label="Filter by status"
            options={statusOptions}
            value={selectedStatus || "all"}
            onChange={(value) =>
              setSelectedStatus(value === "all" ? null : value)
            }
          />
          <FilterSelect
            label="Filter by priority"
            options={priorityOptions}
            value={selectedPriority || "all"}
            onChange={(value) =>
              setSelectedPriority(value === "all" ? null : value)
            }
          />
          <FilterSelect
            label="Filter by tag"
            options={tagOptions}
            value={selectedTag || "all"}
            onChange={(value) => setSelectedTag(value === "all" ? null : value)}
          />
          <AssigneeFilter
            users={users}
            value={selectedAssignee || "all"}
            onChange={(value) =>
              setSelectedAssignee(value === "all" ? null : value)
            }
          />
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
  );
}
