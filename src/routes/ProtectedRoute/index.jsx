import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsLogin, logout } from '../../auth/services/authSlice';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useSelector(selectIsLogin);
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        // Check for token expiration in localStorage
        const checkTokenExpiration = () => {
            const tokenExpiry = localStorage.getItem('tokenExpiry');
            if (tokenExpiry) {
                const currentTime = Date.now();
                const expiryTime = parseInt(tokenExpiry, 10);
                
                // If current time is past or within 30 seconds of expiry, logout
                if (currentTime >= expiryTime - 30000) {
                    console.log('Token expired or about to expire. Logging out.');
                    localStorage.clear(); // Clear all localStorage
                    dispatch(logout()); // Reset Redux state
                }
            }
        };

        // Check token expiration on component mount
        checkTokenExpiration();

        // Optional: Set up an interval to check token expiration periodically
        const intervalId = setInterval(checkTokenExpiration, 30000); // Check every 30 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, [dispatch]);

    if (!isAuthenticated) {
        if (location.pathname === '/login') {
            return children;
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (location.pathname === '/login' && isAuthenticated) {
        return <Navigate to="/auth-redirect" replace />;
    }

    return children;
};

export default ProtectedRoute; 