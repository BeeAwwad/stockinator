import { Routes, Route } from "react-router-dom"
import Dashboard from "@/pages/Dashboard"
import Products from "@/pages/Products"
import Login from "@/pages/Login"
import Transaction from "@/pages/Transaction"
// import ProtectedRoute from "@/auth/ProtectedRoute"
import Register from "@/pages/Register"
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register-business" element={<Register />} />
      <Route
        path="/"
        element={
          //   <ProtectedRoute>
          <Dashboard />
          //   </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          //   <ProtectedRoute>
          <Products />
          //   </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          //   <ProtectedRoute>
          <Transaction />
          //   </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          //   <ProtectedRoute>
          <Products />
          //   </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes
