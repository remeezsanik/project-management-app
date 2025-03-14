import { useState, useEffect } from "react";
import * as taskService from "../service/taskService";
import type { Task, UserType } from "@/types/task";
import type { Session } from "next-auth";

export function useTasksData(session: Session | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Individual error states
  const [taskError, setTaskError] = useState<string | undefined>();
  const [userError, setUserError] = useState<string | undefined>();
  const [tagError, setTagError] = useState<string | undefined>();

  const fetchData = async () => {
    setIsLoading(true);
    setTaskError(undefined);
    setUserError(undefined);
    setTagError(undefined);

    try {
      const [tasksData, usersData, tagsData] = await Promise.all([
        taskService.getTasks().catch((err) => {
          setTaskError(`TaskError: ${err.message}`);
          return [];
        }),
        taskService.getUsers().catch((err) => {
          setUserError(`UserError: ${err.message}`);
          return [];
        }),
        taskService.getTags().catch((err) => {
          setTagError(`TagError: ${err.message}`);
          return [];
        }),
      ]);

      setTasks(tasksData);
      setUsers(usersData);
      setTags(tagsData);
    } catch (error) {
      console.error("Unexpected error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  return {
    tasks,
    users,
    tags,
    taskError,
    userError,
    tagError,
    isLoading,
    fetchTasks: fetchData,
  };
}
