import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUserRole } from "../../auth/services/authSlice";

const AuthRedirect = () => {
    const userRole = useSelector(selectUserRole);

    if (userRole?.role_name === "super-admin") {
        return <Navigate to="/superadmin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
};

export default AuthRedirect;
