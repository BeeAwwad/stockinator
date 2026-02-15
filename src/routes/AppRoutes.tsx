import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Login from "@/pages/Login";
import Transaction from "@/pages/Transaction";
import ProtectedRoute, { ProtectDashboard } from "@/auth/ProtectedRoute";
import CreateBusiness from "@/pages/CreateBusiness";
import NotFound from "@/pages/NotFound";
import Notifications from "@/pages/Notifications";
import ResetPassword from "@/pages/ResetPassword";
import ForgotPassword from "@/pages/ForgotPassword";
import { Settings } from "@/pages/Settings";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <ProtectDashboard>
            <Dashboard />
          </ProtectDashboard>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/register-business"
        element={
          <ProtectedRoute>
            <CreateBusiness />
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
