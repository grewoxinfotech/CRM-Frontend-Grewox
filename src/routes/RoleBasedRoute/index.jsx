import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsLogin } from '../../auth/services/authSlice';

const RoleBasedRoute = ({ children, allowedRoles }) => {
    const userRole = useSelector(selectUserRole);
    const isLogin = useSelector(selectIsLogin);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLogin) {
            navigate('/login', { state: { from: location }, replace: true });
        } else if (userRole && !allowedRoles.includes(userRole.role_name)) {
            const redirectPath = userRole.role_name === 'super-admin' ? '/superadmin' : '/dashboard';
            navigate(redirectPath, { replace: true });
        }
    }, [isLogin, userRole, allowedRoles, location, navigate]);

    // Show nothing while checking authentication and role
    if (!isLogin || (userRole && !allowedRoles.includes(userRole.role_name))) {
        return null;
    }

    return children;
};

export default RoleBasedRoute; 