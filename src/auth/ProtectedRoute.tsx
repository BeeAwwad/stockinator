import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../lib/firebase"
import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, loading] = useAuthState(auth)

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />

  return <>{children}</>
}

export default ProtectedRoute
