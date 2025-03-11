import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;  // Return null instead of throwing an error
        }
        if (!credentials || !credentials.email || !credentials.password) {
          console.log("Missing credentials:", { credentials });
          return null;
        }
        
        const { data, error } = await supabase
          .from("User")
          .select("*")
          .eq("email", credentials.email);
        
        if (error) {
          console.error("Supabase error:", error.message);
          throw new Error("Database error: " + error.message);
        }
        
        if (!data || data.length === 0) {
          console.error("No user found with email:", credentials.email);
          throw new Error("No user found with this email");
        }
        
        const user = data[0];
        
        // Using bcrypt to compare passwords
        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValid) {
          console.error("Invalid password for user:", credentials.email);
          throw new Error("Invalid password");
        }
        
        console.log("Authentication successful:", user.email);
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image || null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
});