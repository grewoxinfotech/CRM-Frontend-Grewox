import { createBrowserRouter } from "react-router-dom";
import Login from "../auth/login";
import AuthRedirect from "./AuthRedirect/index.jsx";
import DashboardLayout from "../dashboard/layout";
import Dashboard from "../dashboard";
import SuperAdminLayout from "../superadmin/layout";
import SuperAdminDashboard from "../superadmin/module/dashboard";
import Company from "../superadmin/module/company";
import Policy from "../superadmin/module/policy";
import Profile from "../superadmin/module/profile/index.jsx";
import Currencies from "../superadmin/module/settings/currencies/index.jsx";
import Countries from "../superadmin/module/settings/countries/index.jsx";
import Plans from "../superadmin/module/plans/index.jsx";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "../auth/forgot-password";
import OTPVerification from "../auth/otp";

import RoleBasedRoute from "./RoleBasedRoute";
import Notes from "../superadmin/module/notes/index.jsx";
import ESignature from "../superadmin/module/settings/eSignature/index.jsx";
import Inquiry from "../superadmin/module/inquary/index.jsx";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/otp",
    element: <OTPVerification />,
  },
  {
    path: "/auth-redirect",
    element: (
      <ProtectedRoute>
        <AuthRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={["client"]}>
          <DashboardLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "customers",
        element: <div>Customers Page</div>,
      },
      {
        path: "products",
        element: <div>Products Page</div>,
      },
      {
        path: "analytics",
        element: <div>Analytics Page</div>,
      },
      {
        path: "settings",
        element: <div>Settings Page</div>,
      },
      {
        path: "help",
        element: <div>Help & Support Page</div>,
      },
    ],
  },
  {
    path: "/superadmin",
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={["super-admin"]}>
          <SuperAdminLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <SuperAdminDashboard />,
      },
      {
        path: "dashboard",
        element: <SuperAdminDashboard />,
      },
      {
        path: "company",
        element: <Company />,
      },
      {
        path: "notes",
        element: <Notes />,
      },
      {
        path: "policy",
        element: <Policy />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "plans",
        element: <Plans />,
      },
      {
        path: "settings/currencies",
        element: <Currencies />,
      },
      {
        path: "settings/countries",
        element: <Countries />,
      },
      {
        path: "settings/esignature",
        element: <ESignature />
    },
    {
        path: "inquiry",
        element: <Inquiry />
    }
    ],
  },
]);

export default routes;
