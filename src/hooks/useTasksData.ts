import { useState, useEffect } from "react";
import * as taskService from "../service/taskService";
import { Task, UserType } from "@/types/task";

export function useTasksData(session: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tasksData, usersData, tagsData] = await Promise.all([
        taskService.getTasks(),
        taskService.getUsers(),
        taskService.getTags(),
      ]);
      setTasks(tasksData);
      setUsers(usersData);
      setTags(tagsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error fetching data:", error);
      if (error instanceof Error) {
        setError(error);
      } else {
        setError(new Error("An unknown error occurred"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session?.user?.id]);

  return { tasks, users, tags,error, isLoading, fetchTasks: fetchData };
}