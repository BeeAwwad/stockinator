import { Navigate } from "react-router-dom";
import { useProfile } from "@/queries/useProfile";
import { Spinner } from "@/components/ui/spinner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: profile, isLoading: profileLoading } = useProfile();
  if (profileLoading) return <Spinner />;

  return profile ? children : <Navigate to={"/login"} />;
};

export default ProtectedRoute;
