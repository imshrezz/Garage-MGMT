import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Customers from "./pages/Customers";
import Billing from "./pages/Billing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import JobCards from "./pages/JobCards";
import Reports from "./pages/Reports";
import Expenses from "./pages/Expenses";
import Vehicles from "./pages/Vehicles";
import Invoices from "./pages/Invoices";
import Users from "./pages/Users";
import Products from "./pages/Products";
import CustomerServiceHistory from "./pages/CustomerServiceHistory";
import { RegisterForm } from "./components/auth/RegisterForm";
import Logout from "./components/auth/Logout";
import BillingHistoryList from "@/components/billinghistory/BillingHistoryList";
import { GarageProvider } from "@/context/GarageContext";
import { AuthProvider } from "@/context/AuthContext";
const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <GarageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/logout" element={<Logout />} />
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/jobcards" element={<JobCards />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/billinghistory" element={<BillingHistoryList />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/products" element={<Products />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/users" element={<Users />} />
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="/customer-service"
                  element={<CustomerServiceHistory />}
                />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GarageProvider>
  </AuthProvider>
);

export default App;
