import { useState } from "react";
import { signOut } from "next-auth/react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex">
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-gray-800/20 p-4">
            <h1 className="gradient-text overflow-hidden text-xl font-bold text-indigo-500">
              {isSidebarOpen ? "Project X" : "X"}
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={router.pathname === "/home"}
                >
                  <Link href="/home" className="font-semibold">
                    <HomeIcon className="ml-2 mr-2 h-6 w-6" />
                    Home
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={router.pathname === "/tasks"}
                >
                  <Link href="/tasks" className="font-semibold">
                    <ListTodo className="ml-2 mr-2 h-5 w-5" />
                    Tasks
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={router.pathname === "/profile"}
                >
                  <Link href="/profile" className="font-semibold">
                    <User className="ml-2 mr-2 h-5 w-5" />
                    Profile
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="h-12"
            >
              {isSidebarOpen && (
                <h1 className="gradient-text text-md overflow-hidden font-bold text-indigo-500">
                  Log Out
                </h1>
              )}
              <LogOut className="mr-2 h-5 w-5 text-red-600" />
            </Button>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 bg-white p-6">
          <div className="mb-2">
            <SidebarTrigger onClick={toggleSidebar} />
          </div>
          {children}
        </main>
        <Toaster position="top-right" richColors />
      </SidebarProvider>
    </div>
  );
};

export default Layout;
