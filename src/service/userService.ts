import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const updateUserProfile = async (userId: string, name: string) => {
  const { error } = await supabase
    .from("Users")
    .update({ name })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
};