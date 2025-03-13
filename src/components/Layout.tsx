import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "../../components/sidebar";
import { Button } from "../../components/button";
import { Home as HomeIcon, ListTodo, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Toaster } from "../../components/sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarProvider defaultOpen={true}>
        <Sidebar
          collapsible="icon"
          className="border-r border-gray-100 bg-white shadow-sm"
        >
          <SidebarHeader className="border-b border-gray-200 p-4">
            <h1 className="pointer-events-none overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              {isSidebarOpen ? "Project X" : "X"}
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="mt-4">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={router.pathname === "/home"}
                  className="mx-2 my-1 rounded-lg transition-all duration-200 hover:bg-indigo-50"
                >
                  <Link
                    href="/home"
                    className="flex items-center gap-3 px-4 py-3 font-medium"
                  >
                    <HomeIcon className="h-5 w-5 text-indigo-500" />
                    <span className="text-gray-700">Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={router.pathname === "/tasks"}
                  className="mx-2 my-1 rounded-lg transition-all duration-200 hover:bg-indigo-50"
                >
                  <Link
                    href="/tasks"
                    className="flex items-center gap-3 px-4 py-3 font-medium"
                  >
                    <ListTodo className="h-5 w-5 text-indigo-500" />
                    <span className="text-gray-700">Tasks</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={router.pathname === "/profile"}
                  className="mx-2 my-1 rounded-lg transition-all duration-200 hover:bg-indigo-50"
                >
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 font-medium"
                  >
                    <User className="h-5 w-5 text-indigo-500" />
                    <span className="text-gray-700">Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-gray-200 p-2">
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-50"
            >
              {isSidebarOpen && (
                <span className="gradient-text font-medium text-gray-700">
                  Log Out
                </span>
              )}
              <LogOut className="text-red-400" />
            </Button>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger
                  onClick={toggleSidebar}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                />
                <h2 className="gradient-text pointer-events-none text-xl font-semibold">
                  {router.pathname === "/home" && "Dashboard"}
                  {router.pathname === "/tasks" && "Tasks"}
                  {router.pathname === "/profile" && "User Profile"}
                </h2>
              </div>

              <Link
                href="/profile"
                className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-transform duration-300 hover:scale-105 hover:bg-white md:mr-2"
              >
                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 bg-white md:h-8 md:w-8">
                  <User className="h-5 w-5 cursor-pointer text-indigo-500 md:h-4 md:w-4" />
                </div>
                <h2 className="gradient-text text-md hidden cursor-pointer font-semibold md:block">
                  {session?.user?.name}
                </h2>
              </Link>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              {children}
            </div>
          </div>
          <Toaster position="top-right" richColors />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
