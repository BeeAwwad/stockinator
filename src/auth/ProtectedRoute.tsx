import { Navigate } from "react-router-dom";
import { useAuth } from "@/hook/useAuth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, profileLoading } = useAuth();

  if (profileLoading) return <div>Loading...</div>;

  return profile ? children : <Navigate to={"/login"} />;
};

export default ProtectedRoute;
