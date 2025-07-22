import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export const Header = () => {
  const navigate = useNavigate();




  
  // ✅ Fetch user from localStorage (assuming you store after login)
  const user = JSON.parse(localStorage.getItem("garage_user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("garage_token");
    localStorage.removeItem("garage_user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="h-16 border-b flex items-center px-4 bg-white">
      <SidebarTrigger />

      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full bg-black text-white hover:bg-gray-800"
            >
              <Avatar>
                <AvatarImage src={user.profilePicture || ""} />
                <AvatarFallback className="bg-garage-blue text-white">
                  {user?.fullName
                    ? user.fullName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.fullName || "User"}</span>
                <span className="font-medium text-xs text-muted-foreground">
                  {user?.role.toUpperCase() || "User"}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-500 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
