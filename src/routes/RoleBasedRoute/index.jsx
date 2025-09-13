import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserRole, selectIsLogin, logout } from '../../auth/services/authSlice';
import { Spin, Result } from 'antd';

const RoleBasedRoute = ({ children }) => {
    const userRole = useSelector(selectUserRole);
    const isLogin = useSelector(selectIsLogin);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const checkTokenExpiration = () => {
            const tokenExpiry = localStorage.getItem('tokenExpiry');
            if (tokenExpiry) {
                const currentTime = Date.now();
                const expiryTime = parseInt(tokenExpiry, 10);
                
                // If current time is past or within 30 seconds of expiry, logout
                if (currentTime >= expiryTime - 30000) {
                    console.log('Token expired or about to expire. Logging out.');
                    localStorage.removeItem('persist:root');
                    localStorage.clear(); // Clear all localStorage
                    dispatch(logout()); // Reset Redux state
                    navigate('/login', { state: { from: location }, replace: true });
                    return;
                }
            }
        };

        const checkAndRedirect = () => {
            // First check token expiration
            checkTokenExpiration();

            // Then proceed with existing role-based redirection logic
            if (!isLogin) {
                localStorage.removeItem('persist:root');
                navigate('/login', { state: { from: location }, replace: true });
                return;
            }

            if (userRole) {
                const isSuperAdmin = userRole === 'super-admin';
                const isInSuperAdminPath = location.pathname.startsWith('/superadmin');
                const isInRegularDashboardPath = location.pathname.startsWith('/dashboard');

                // Redirect based on role
                if (isSuperAdmin && !isInSuperAdminPath && location.pathname !== '/auth-redirect') {
                    navigate('/superadmin', { replace: true });
                } else if (!isSuperAdmin && !isInRegularDashboardPath && location.pathname !== '/auth-redirect') {
                    navigate('/dashboard', { replace: true });
                }
            }
        };

        checkAndRedirect();

        // Optional: Set up an interval to check token expiration periodically
        const intervalId = setInterval(checkTokenExpiration, 30000); // Check every 30 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, [isLogin, userRole, location.pathname, navigate, dispatch]);

    if (!isLogin) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f0f2f5'
            }}>
                <Result
                    status="403"
                    title="Not Authenticated"
                    subTitle="Please log in to access this page"
                    extra={
                        <Spin size="large" />
                    }
                />
            </div>
        );
    }

    // Show error if no role is assigned
    if (!userRole) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f0f2f5'
            }}>
                <Result
                    status="error"
                    title="No Role Assigned"
                    subTitle="You don't have any role assigned. Please contact your administrator."
                />
            </div>
        );
    }

    return children;
};

export default RoleBasedRoute;