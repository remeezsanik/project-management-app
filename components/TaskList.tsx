import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import { Button } from "./button";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function TaskList() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [deadline, setDeadline] = useState("");

  const fetchTasks = async () => {
    const { data } = await supabase.from("tasks").select("*");
    setTasks(data || []);
    setLoading(false);
  };

  const createTask = async () => {
    if (!session) return;
    await supabase.from("tasks").insert({
      title,
      description,
      priority,
      deadline,
      assigned_to: session.user.id,
      project_id: 1, // Hardcoded for simplicity
    });
    setTitle("");
    setDescription("");
    setDeadline("");
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Tasks</h2>
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task Title"
          className="mr-2 border p-2"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="mr-2 border p-2"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="mr-2 border p-2"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="mr-2 border p-2"
        />
        <Button
          onClick={createTask}
          // className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Add Task
        </Button>
      </div>
      {tasks.map((task) => (
        <div key={task.id} className="border-b p-2">
          <h3 className="text-lg">{task.title}</h3>
          <p>{task.description}</p>
          <p>
            Priority: {task.priority} | Deadline: {task.deadline}
          </p>
        </div>
      ))}
    </div>
  );
}
