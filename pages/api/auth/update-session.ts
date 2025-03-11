// File: pages/api/auth/update-session.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current session
    const session = await getServerSession(req, res, authOptions);

    // Check if user is authenticated
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get data from request body
    const { userId, name } = req.body;

    // Verify user is updating their own profile
    if (session.user.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Update user record in your authentication database
    // This depends on how your NextAuth adapter is configured
    // For example, if using a database adapter:
    await supabase
      .from("User")
      .update({ name })
      .eq("id", userId);

    // Update the session in the database
    // The specific implementation depends on your NextAuth configuration
    // This is a generic approach - you might need to adapt this
    // to your specific NextAuth setup
    if (authOptions.adapter) {
      try {
        // Update session directly in the database
        // This is adapter-specific and might need adjustment
        const sessionToken = req.cookies['next-auth.session-token'] || 
                            req.cookies['__Secure-next-auth.session-token'];
        
        if (sessionToken) {
          // Update user in the sessions table
          // The exact SQL might vary based on your database schema
          // This is just an example
          // You might need to use the adapter's methods instead
          await authOptions.adapter.updateUser({ 
            id: userId, 
            name 
          });
        }
      } catch (adapterError) {
        console.error("Adapter update error:", adapterError);
      }
    }

    // Return success
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Session update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}