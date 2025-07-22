import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Settings,
  User,
  Home,
  CreditCard,
  Users,
  Wrench,
  BarChart,
  DollarSign,
  ClipboardList,
  Boxes,
  History,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGarage } from "@/context/GarageContext";
import api from "@/lib/axios";

const mainMenuItems = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard", icon: Home },
  { key: "customers", label: "Customers", path: "/customers", icon: Users },
  { key: "jobcards", label: "Job Cards", path: "/jobcards", icon: Wrench },
  { key: "products", label: "Products", path: "/products", icon: Boxes },
  {
    key: "users",
    label: "Users Management",
    path: "/users",
    icon: ClipboardList,
  },
];

const billingItems = [
  {
    key: "billingHistory",
    label: "Billing History",
    path: "/billinghistory",
    icon: CreditCard,
  },
  { key: "billing", label: "Billing", path: "/billing", icon: CreditCard },
];

const managementItems = [
  { key: "reports", label: "Reports", path: "/reports", icon: BarChart },
  { key: "expenses", label: "Expenses", path: "/expenses", icon: DollarSign },
  {
    key: "customer-service",
    label: "Service History",
    path: "/customer-service",
    icon: History,
  },
];

const accountItems = [
  { key: "settings", label: "Settings", path: "/settings", icon: Settings },
  { key: "profile", label: "Profile", path: "/profile", icon: User },
];

const sidebarAccess: Record<string, string[]> = {
  admin: [
    "dashboard",
    "customers",
    "jobcards",
    "products",
    "users",
    "billing",
    "billingHistory",
    "reports",
    "expenses",
    "customer-service",
    "settings",
    "profile",
  ],
  staff: [
    "dashboard",
    "customers",
    "jobcards",
    "billing",
    "billingHistory",
    "profile",
  ],
  manager: ["dashboard", "reports", "expenses", "profile"],
  mechanic: ["jobcards", "profile"],
};

export const AppSidebar = () => {
  const { user } = useAuth();
  const userRole = user?.role || "staff";
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { garageLogo, setGarageLogo } = useGarage();
  const [garageName, setGarageName] = useState<string>("");

  useEffect(() => {
    const fetchGarageInfo = async () => {
      try {
        const { data } = await api.get("/garage");
        if (data.success && data.garage) {
          if (data.garage.logo) {
            setGarageLogo(`http://localhost:5000${data.garage.logo}`);
          }
          if (data.garage.garageName) {
            setGarageName(data.garage.garageName);
          }
        }
      } catch (error) {
        console.error("Failed to fetch garage info:", error);
      }
    };

    if (!garageLogo || !garageName) {
      fetchGarageInfo();
    }
  }, [garageLogo, setGarageLogo]);

  const canAccess = (key: string) => sidebarAccess[userRole]?.includes(key);
  const isActive = (path: string) =>
    currentPath === path || currentPath.startsWith(path + "/");

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-sidebar-accent text-garage-blue font-medium"
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  const renderMenu = (items: any[]) =>
    items.map(({ key, path, label, icon: Icon }) => {
      const access = canAccess(key);
      return access ? (
        <SidebarMenuItem key={key}>
          <SidebarMenuButton asChild isActive={isActive(path)}>
            <NavLink to={path} className={getNavCls} title={label}>
              <Icon className="h-5 w-5 mr-2" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ) : null;
    });

  return (
    <Sidebar
      className={`${
        collapsed ? "w-16" : "w-64"
      } border-r transition-all duration-300 ease-in-out`}
    >
      <SidebarContent className="flex flex-col">
        <div
          className={`flex items-center justify-center py-4 ${
            collapsed ? "px-2" : "px-6"
          }`}
        >
          {collapsed ? (
            garageLogo ? (
              <img 
                src={garageLogo} 
                alt="Garage Logo" 
                className="w-8 h-8 object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-garage-blue">
                {garageName ? garageName.charAt(0) : "G"}
              </span>
            )
          ) : (
            garageLogo ? (
              <img 
                src={garageLogo} 
                alt="Garage Logo" 
                className="h-10 object-contain"
              />
            ) : (
              <span className="text-xl font-bold text-garage-blue">
                {garageName || "Carageer Garage"}
              </span>
            )
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenu(mainMenuItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Billing Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Billing
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenu(billingItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenu(managementItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account Section */}
        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
              Account
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenu(accountItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
