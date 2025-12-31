import { Navigate } from "react-router-dom";
import { useAppContext } from "@/hook/useAppContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, profileLoading } = useAppContext();

  if (profileLoading) return <div>Loading...</div>;

  return profile ? children : <Navigate to={"/login"} />;
};

export default ProtectedRoute;
