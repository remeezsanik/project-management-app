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
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials:", { credentials });
          return null;
        }

        const { data, error } = await supabase
          .from("User")
          .select("*")
          .eq("email", credentials.email);

        if (error) throw new Error("Database error: " + error.message);
        if (!data || data.length === 0) throw new Error("No user found with this email");

        const user = data[0];
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

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
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        // Fetch latest name from Supabase
        const { data, error } = await supabase
          .from("User")
          .select("name")
          .eq("id", token.sub)
          .single();

        if (error) {
          console.error("Error fetching user name:", error.message);
        } else if (data) {
          session.user.name = data.name;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
});