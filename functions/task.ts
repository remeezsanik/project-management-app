import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function create(event: any) {
  const { title, description } = JSON.parse(event.body || "{}");

  const { data, error } = await supabase
    .from("tasks")
    .insert([{ title, description }]);

  if (error) return { statusCode: 500, body: JSON.stringify(error) };

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Task Created", task: data }),
  };
}

export async function list() {
  const { data, error } = await supabase.from("tasks").select("*");

  if (error) return { statusCode: 500, body: JSON.stringify(error) };

  return {
    statusCode: 200,
    body: JSON.stringify({ tasks: data }),
  };
}
