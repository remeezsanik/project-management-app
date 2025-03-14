// pages/api/user/update-password.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import { getSession } from "next-auth/react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get the session to verify the user
    const session = await getSession({ req });
    const UserId = req.body?.userId ?? ""
    console.log("session", session, req.body?.userId);
    
    if (!req.body || !UserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { password } = req.body;
    
    // Validate the password
    if (!password || password.length < 3) {
      return res.status(400).json({ message: "Password must be at least 3 characters long" });
    }

    // Hash the password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
    const { error } = await supabase
      .from("Users")
      .update({ password: hashedPassword })
      .eq("id", UserId);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Password update error:", error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to update password" 
    });
  }
}