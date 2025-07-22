import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/axios";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all authentication data
    localStorage.removeItem("garage_token");
    localStorage.removeItem("garage_user");
    
    // Clear any other related data
    sessionStorage.clear();
    
    // Clear axios default headers
    delete api.defaults.headers.common['Authorization'];

    // Notify user
    toast.success("Logged out successfully");

    // Redirect to login page immediately
    navigate("/login");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl text-muted-foreground">Logging out...</p>
    </div>
  );
};

export default Logout;
