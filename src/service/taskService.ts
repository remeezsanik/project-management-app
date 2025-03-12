import { Task } from "@/types/task";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getTasks() {
  const { data: taskData, error } = await supabase.from("tasks").select("*");
  if (error) throw error;
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
  return processedTasks;
}

export async function getUsers() {
  const { data, error } = await supabase.from("User").select("id, name, image");
  if (error) throw error;
  return data || [];
}

export async function getTags() {
  const { data, error } = await supabase.from("tags").select("name");
  if (error) throw error;
  return data.map((tag) => tag.name) || [];
}

export async function createTask(formData: {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  deadline?: Date;
  assignedTo?: string;
  tags?: string[];
  userId: string;
}) {
  const newTask = {
    ...formData,
    status: "Todo",
    createdAt: new Date().toISOString(),
    assignedTo: formData.assignedTo || formData.userId,
    deadline: formData.deadline ? formData.deadline.toISOString() : null,
  };
  const { data, error } = await supabase.from("tasks").insert([newTask]).select();
  if (error) throw error;
  return data;
}

export async function updateTask(
  id: string,
  formData: {
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    deadline?: Date;
    assignedTo?: string;
    tags?: string[];
  }
) {
  const updatedTask = {
    ...formData,
    deadline: formData.deadline ? formData.deadline.toISOString() : null,
  };
  const { error } = await supabase.from("tasks").update(updatedTask).eq("id", id);
  if (error) throw error;
}

export async function updateTaskStatus(
  id: string,
  status: "Todo" | "InProgress" | "Done"
) {
  const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}