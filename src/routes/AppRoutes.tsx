import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Login from "@/pages/Login";
import Transaction from "@/pages/Transaction";
import ProtectedRoute from "@/auth/ProtectedRoute";
import CreateBusiness from "@/pages/CreateBusiness";
import NotFound from "@/pages/NotFound";
import Notifications from "@/pages/Notifications";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* <Route path="/rest-password" element={<ResetPassword />} /> */}
      {/* <Route path="/reset-complete" element={<ResetComplete />} /> */}
      <Route path="/register-business" element={<CreateBusiness />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transaction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
