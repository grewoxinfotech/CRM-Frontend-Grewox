import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsLogin } from '../../auth/services/authSlice';

const RoleBasedRoute = ({ children }) => {
    const userRole = useSelector(selectUserRole);
    const isLogin = useSelector(selectIsLogin);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLogin) {
            navigate('/login', { state: { from: location }, replace: true });
        } else if (userRole) {
            // Check if user is in the wrong dashboard section
            const isSuperAdmin = userRole.role_name === 'super-admin';
            const isInSuperAdminPath = location.pathname.startsWith('/superadmin');
            const isInRegularDashboardPath = location.pathname.startsWith('/dashboard');

            // Redirect if super-admin is in regular dashboard or vice versa
            if (isSuperAdmin && !isInSuperAdminPath) {
                navigate('/superadmin', { replace: true });
            } else if (!isSuperAdmin && !isInRegularDashboardPath) {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [isLogin, userRole, location.pathname]);

    // Show nothing while checking authentication
    if (!isLogin || !userRole) {
        return null;
    }

    return children;
};

export default RoleBasedRoute;