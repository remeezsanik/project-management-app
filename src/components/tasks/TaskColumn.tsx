import { Card, CardContent, CardHeader, CardTitle } from "components/card";
import { Badge } from "components/badge";
import { TaskCard } from "./TaskCard";
import { List, Clock, CheckCircle } from "lucide-react";
import * as taskUtils from "../../utils/taskUtils";
import type { Task } from "@/types/task";

export function TaskColumn({
  status,
  tasks,
  onUpdateStatus,
  onEdit,
  onDelete,
}: {
  status: string;
  tasks: Task[];
  onUpdateStatus: (id: string, status: "Todo" | "InProgress" | "Done") => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const styles = taskUtils.getStatusStyles(status);
  return (
    <Card
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
            <CardTitle className={`text-lg font-semibold ${styles.textColor}`}>
              {status}
            </CardTitle>
          </div>
          <Badge className={styles.badgeClass}>{tasks.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No tasks</p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateStatus={onUpdateStatus}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
