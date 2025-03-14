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

export const updateUserPassword = async (userId: string, password: string) => {
  try {
    // Call the API route to handle password hashing server-side
    const response = await fetch("/api/user/update-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password, userId }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to update password");
    }

    return { success: true };
  } catch (error) {
    console.error("Password update error:", error);
    throw error;
  }
};