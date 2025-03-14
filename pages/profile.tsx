import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import type { Session } from "next-auth";
import Layout from "@/components/Layout";
import { Button } from "../components/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar";
import { Card, CardContent, CardHeader } from "../components/card";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { toast } from "sonner";
import { User, Loader2 } from "lucide-react";
import { updateUserProfile } from "@/service/userService";

export default function Profile() {
  const { data: session, status, update } = useSession();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

  useEffect(() => {
    setIsChanged(name !== session?.user?.name && name.trim() !== "");
  }, [name, session?.user?.name]);

  const debounceUpdate = useCallback(
    async (newName: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await update({ name: newName });
    },
    [update],
  );

  async function handleUpdateUser(session: Session | null, name: string) {
    try {
      if (!session?.user?.id) {
        throw new Error("User ID is missing");
      }

      const trimmedName = name.trim();
      if (!trimmedName || trimmedName.length < 2) {
        throw new Error("Name must be at least 2 characters long");
      }

      setLoading(true);
      await updateUserProfile(session.user.id, trimmedName);
      setName(trimmedName);
      toast.success("Profile updated successfully");

      debounceUpdate(trimmedName).catch((err) =>
        console.error("Session update error:", err),
      );
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-5 bg-gray-100 p-6">
        <Card className="max-w-md p-6 text-center shadow-lg">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Please Sign In</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-500">
              You need to be signed in to view your profile.
            </p>
            <Button onClick={() => signIn("credentials")} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout>
      <div
        className="relative space-y-6 p-6"
        style={{
          background: "linear-gradient(135deg, #f0f4ff 0%, #e4eaff 100%)",
          borderRadius: "16px",
          maxHeight: "calc(100vh - 160px)",
        }}
      >
        <Card className="mb-6 rounded-2xl bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white shadow-lg">
                <User size={30} />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                  Profile Management
                </h1>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col items-center justify-center py-10">
          <Card className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <CardHeader className="flex flex-col items-center gap-4">
              <Avatar className="h-20 w-20 text-blue-600">
                <AvatarImage src={session?.user?.image ?? ""} />
                <AvatarFallback className="text-2xl font-bold">
                  {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={session?.user?.email ?? ""}
                  disabled
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-gray-300"
                  disabled={loading}
                />
              </div>
              <Button
                onClick={() => handleUpdateUser(session, name)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 shadow-md transition-all hover:scale-105 hover:shadow-lg"
                disabled={loading || !isChanged}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
