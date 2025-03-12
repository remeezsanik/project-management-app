import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  List,
  ArrowRight,
  Activity,
} from "lucide-react";
import { Button } from "../components/button";
import { Progress } from "../components/progress";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [taskStats, setTaskStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    highPriority: 0,
    overdue: 0,
    assignedToMe: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTaskStats = async () => {
      if (!session) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch all tasks
        const { data: allTasks, error: allTasksError } = await supabase
          .from("tasks")
          .select("*");

        if (allTasksError) {
          console.error("Error fetching all tasks:", allTasksError);
          setError("Failed to fetch tasks");
          return;
        }

        const assignedTasks = allTasks.filter(
          (task) => task.assignedTo === session?.user?.id,
        );
        const today = new Date();
        const stats = {
          total: allTasks.length,
          todo: allTasks.filter((task) => task.status === "Todo").length,
          inProgress: allTasks.filter((task) => task.status === "InProgress")
            .length,
          done: allTasks.filter((task) => task.status === "Done").length,
          highPriority: allTasks.filter((task) => task.priority === "High")
            .length,
          overdue: allTasks.filter((task) => {
            const deadline = task.deadline ? new Date(task.deadline) : null;
            return deadline && deadline < today && task.status !== "Done";
          }).length,
          assignedToMe: assignedTasks.length,
        };
        setTaskStats(stats);
      } catch (error) {
        console.error("Error in fetchTaskStats:", error);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTaskStats();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-lg font-medium text-indigo-700">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const completionRate =
    taskStats.total > 0
      ? Math.round((taskStats.done / taskStats.total) * 100)
      : 0;

  return (
    <Layout>
      <div
        className="relative space-y-6 p-6"
        style={{
          background: "linear-gradient(135deg, #f0f4ff 0%, #e4eaff 100%)",
          borderRadius: "16px",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute right-0 top-0 -z-10 h-64 w-64 rounded-full bg-purple-200 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl"></div>

        <div className="mb-6 rounded-2xl border border-white/40 bg-white bg-opacity-80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white shadow-lg">
                <Activity size={32} />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-600">Dashboard</p>
                <h1 className="bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-3xl font-bold text-transparent">
                  Welcome, {session?.user?.name || "User"}
                </h1>
              </div>
            </div>
            <Button
              onClick={() => router.push("/tasks")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 shadow-md transition-all hover:scale-105 hover:shadow-lg"
            >
              <span className="flex items-center gap-2">
                Go to Task Management <ArrowRight size={16} />
              </span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 animate-pulse rounded-2xl border border-red-200 bg-red-100 p-5 text-red-700 shadow-md">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        <Card className="mb-6 overflow-hidden rounded-2xl border-none bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl transition-shadow duration-300 hover:shadow-2xl">
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 font-medium text-blue-100">
                  Overall Completion
                </p>
                <h2 className="text-5xl font-bold">{completionRate}%</h2>
                <p className="mt-2 text-blue-100">
                  {completionRate < 30
                    ? "Just getting started. Keep going!"
                    : completionRate < 70
                      ? "Making good progress!"
                      : "Almost there! Great job!"}
                </p>
              </div>
              <div className="rounded-full bg-white bg-opacity-20 p-5 shadow-lg backdrop-blur-sm">
                <CheckCircle size={40} />
              </div>
            </div>
            <div className="mt-6">
              <Progress value={completionRate} variant="rainbow" height="md" />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center rounded-2xl bg-white p-12 shadow-lg">
            <div className="space-y-3 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
              <p className="text-lg font-medium text-indigo-600">
                Loading statistics...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="group overflow-hidden rounded-2xl border-none bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Total Tasks
                    </p>
                    <h3 className="mt-1 text-4xl font-bold text-gray-800">
                      {taskStats.total}
                    </h3>
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white shadow-md transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                    <List size={28} />
                  </div>
                </div>
                <div className="mt-4 h-1 w-full rounded-full bg-blue-200">
                  <div className="h-1 w-full rounded-full bg-blue-500"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-2xl border-none bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">
                      In Progress
                    </p>
                    <h3 className="mt-1 text-4xl font-bold text-gray-800">
                      {taskStats.inProgress}
                    </h3>
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 text-white shadow-md transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                    <Clock size={28} />
                  </div>
                </div>
                <div className="mt-4 h-1 w-full rounded-full bg-yellow-200">
                  <div
                    className="h-1 rounded-full bg-yellow-500 transition-all duration-1000"
                    style={{
                      width: `${
                        taskStats.total > 0
                          ? (taskStats.inProgress / taskStats.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-2xl border-none bg-gradient-to-br from-green-50 to-green-100 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Completed
                    </p>
                    <h3 className="mt-1 text-4xl font-bold text-gray-800">
                      {taskStats.done}
                    </h3>
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-green-400 to-green-500 p-4 text-white shadow-md transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                    <CheckCircle size={28} />
                  </div>
                </div>
                <div className="mt-4 h-1 w-full rounded-full bg-green-200">
                  <div
                    className="h-1 rounded-full bg-green-500 transition-all duration-1000"
                    style={{
                      width: `${
                        taskStats.total > 0
                          ? (taskStats.done / taskStats.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="overflow-hidden rounded-2xl border-none bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardHeader className="border-b border-purple-200 bg-white bg-opacity-50 pb-2">
              <CardTitle className="text-lg font-bold text-purple-700">
                My Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-4xl font-bold text-purple-600">
                  {taskStats.assignedToMe}
                </h3>
                <div className="rounded-full bg-gradient-to-r from-purple-400 to-purple-600 p-4 text-white shadow-md">
                  <List size={28} />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-700">
                {taskStats.assignedToMe > 0
                  ? "Tasks currently assigned to you"
                  : "No tasks assigned to you currently"}
              </p>
              {taskStats.assignedToMe > 0 && (
                <Button
                  onClick={() =>
                    router.push({
                      pathname: "/tasks",
                      query: { assigned_to: session?.user?.id },
                    })
                  }
                  variant="outline"
                  className="mt-4 w-full border-purple-400 text-purple-600 transition-all hover:bg-purple-50 hover:shadow"
                >
                  View My Tasks
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-none bg-gradient-to-br from-red-50 to-red-100 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardHeader className="border-b border-red-200 bg-white bg-opacity-50 pb-2">
              <CardTitle className="text-lg font-bold text-red-700">
                High Priority Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-4xl font-bold text-red-600">
                  {taskStats.highPriority}
                </h3>
                <div className="rounded-full bg-gradient-to-r from-red-400 to-red-600 p-4 text-white shadow-md">
                  <AlertTriangle size={28} />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-700">
                {taskStats.highPriority > 0
                  ? "These tasks need immediate attention"
                  : "No high priority tasks at the moment"}
              </p>
              {taskStats.highPriority > 0 && (
                <Button
                  onClick={() =>
                    router.push({
                      pathname: "/tasks",
                      query: { priority: "High" },
                    })
                  }
                  variant="outline"
                  className="mt-4 w-full border-red-400 text-red-600 transition-all hover:bg-red-50 hover:shadow"
                >
                  View High Priority Tasks
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-none bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardHeader className="border-b border-orange-200 bg-white bg-opacity-50 pb-2">
              <CardTitle className="text-lg font-bold text-orange-700">
                Overdue Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-4xl font-bold text-orange-600">
                  {taskStats.overdue}
                </h3>
                <div className="rounded-full bg-gradient-to-r from-orange-400 to-orange-600 p-4 text-white shadow-md">
                  <Clock size={28} />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-700">
                {taskStats.overdue > 0
                  ? "Tasks that have passed their deadline"
                  : "No overdue tasks at the moment"}
              </p>
              {taskStats.overdue > 0 && (
                <Button
                  onClick={() => router.push("/tasks")}
                  variant="outline"
                  className="mt-4 w-full border-orange-400 text-orange-600 transition-all hover:bg-orange-50 hover:shadow"
                >
                  Go to Tasks
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden rounded-2xl border-none bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="border-b bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 pb-4">
            <CardTitle className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-xl font-bold text-transparent">
              Task Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-700">Todo</span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 shadow-sm">
                    {taskStats.todo}
                  </span>
                </div>
                <Progress
                  value={
                    taskStats.total > 0
                      ? (taskStats.todo / taskStats.total) * 100
                      : 0
                  }
                  variant="dynamic"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-700">In Progress</span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 shadow-sm">
                    {taskStats.inProgress}
                  </span>
                </div>
                <Progress
                  value={
                    taskStats.total > 0
                      ? (taskStats.inProgress / taskStats.total) * 100
                      : 0
                  }
                  variant="dynamic"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-700">Completed</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 shadow-sm">
                    {taskStats.done}
                  </span>
                </div>
                <Progress
                  value={
                    taskStats.total > 0
                      ? (taskStats.done / taskStats.total) * 100
                      : 0
                  }
                  variant="dynamic"
                />
              </div>
            </div>
            <div className="mt-8">
              <Button
                onClick={() => router.push("/tasks")}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 py-2 shadow-md transition-all hover:scale-105 hover:shadow-lg"
              >
                View All Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
