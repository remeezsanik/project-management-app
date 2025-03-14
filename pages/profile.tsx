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
import { User, Loader2, Key } from "lucide-react";
import { updateUserProfile, updateUserPassword } from "@/service/userService";

export default function Profile() {
  const { data: session, status, update } = useSession();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

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

  async function handleUpdatePassword(session: Session | null) {
    try {
      if (!session?.user?.id) {
        throw new Error("User ID is missing");
      }

      if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      setPasswordLoading(true);
      await updateUserPassword(session.user.id, password);
      toast.success("Password updated successfully");
      setPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (error) {
      console.error("Password update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update password",
      );
    } finally {
      setPasswordLoading(false);
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
          minHeight: showPasswordSection ? "auto" : "calc(100vh - 160px)",
          height: "auto",
          overflow: "hidden",
        }}
      >
        <Card className="mb-6 rounded-2xl bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white shadow-lg">
                <User size={30} />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-lg font-bold text-transparent md:text-xl lg:text-3xl">
                  Profile Management
                </h1>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col items-center justify-center py-6">
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

              {!showPasswordSection ? (
                <Button
                  onClick={() => setShowPasswordSection(true)}
                  variant="outline"
                  className="mt-4 w-full"
                >
                  <Key className="mr-2 h-4 w-4" /> Change Password
                </Button>
              ) : (
                <div className="mt-6 space-y-4 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setPassword("");
                        setConfirmPassword("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div>
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-gray-300"
                      disabled={passwordLoading}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-gray-300"
                      disabled={passwordLoading}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button
                    onClick={() => handleUpdatePassword(session)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                    disabled={
                      passwordLoading ||
                      !password ||
                      password !== confirmPassword ||
                      password.length < 8
                    }
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}