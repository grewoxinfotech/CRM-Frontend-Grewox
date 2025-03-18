import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../auth/services/authSlice';

const RoleBasedRoute = ({ children, allowedRoles }) => {
    const userRole = useSelector(selectUserRole);
    const location = useLocation();

    if (!userRole || !allowedRoles.includes(userRole.role_name)) {
        if (userRole?.role_name === 'super-admin') {
            return <Navigate to="/superadmin" replace state={{ from: location }} />;
        } else if (userRole?.role_name === 'client') {
            return <Navigate to="/dashboard" replace state={{ from: location }} />;
        } else {
            return <Navigate to="/dashboard" replace state={{ from: location }} />;
        }
    }

    return children;
};

export default RoleBasedRoute; 