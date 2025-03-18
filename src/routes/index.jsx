import { createBrowserRouter } from "react-router-dom";
import Login from "../auth/login";
import AuthRedirect from "./AuthRedirect/index.jsx";
import Dashboard from "../dashboard";
import SuperAdminLayout from "../superadmin/layout";
import SuperAdminDashboard from "../superadmin/module/dashboard";
import Company from "../superadmin/module/company";
import Profile from "../superadmin/module/profile/index.jsx";
import Currencies from "../superadmin/module/settings/currencies/index.jsx";
import Countries from "../superadmin/module/settings/countries/index.jsx";
import Plans from "../superadmin/module/plans/index.jsx";
import ProtectedRoute from "./ProtectedRoute";

const routes = createBrowserRouter([
    {
        path: "/",
        element: <Login />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/auth-redirect",
        element: <ProtectedRoute><AuthRedirect /></ProtectedRoute>
    },
    {
        path: "/dashboard",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
    },
    {
        path: "/superadmin",
        element: <ProtectedRoute><SuperAdminLayout /></ProtectedRoute>,
        children: [
            {
                path: "",
                element: <SuperAdminDashboard />
            },
            {
                path: "dashboard",
                element: <SuperAdminDashboard />
            },
            {
                path: "company",
                element: <Company />
            },
            {
                path: "profile",
                element: <Profile />
            },
            {
                path: "plans",
                element: <Plans />
            },
            {
                path: "settings/currencies",
                element: <Currencies />
            },
            {
                path: "settings/countries",
                element: <Countries />
            }
        ]
    }
])

export default routes;