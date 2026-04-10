import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header';
import Sidebar from './sidebar';
import Footer from './footer';
import './layout.scss';
import { useGetRolesQuery } from '../module/hrm/role/services/roleApi';
import { selectCurrentUser } from '../../auth/services/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { BASE_URL } from '../../config/config';
import { leadApi } from '../module/crm/lead/services/LeadApi';
import { settingsApi } from '../../superadmin/module/settings/services/settingsApi';

const DashboardLayout = () => {
    const dispatch = useDispatch();
    const inboxSocketRef = useRef(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: rolesData, isLoading: isLoadingRoles, refetch } = useGetRolesQuery({
        skip: !loggedInUser // Skip query if user not logged in
    });


    // Find user's role data
    const userRoleData = rolesData?.message?.data?.find(role => role.id === loggedInUser?.role_id);

    // Parse permissions if they exist - handle both string and object formats
    const userPermissions = React.useMemo(() => {
        if (!userRoleData?.permissions) return null;
        
        try {
            // If it's already an object, return it directly
            if (typeof userRoleData.permissions === 'object') {
                return userRoleData.permissions;
            }
            // If it's a string, try to parse it
            return JSON.parse(userRoleData.permissions);
        } catch (error) {
            console.error('Error parsing permissions:', error);
            return null;
        }
    }, [userRoleData]);

    const handleSidebarToggle = (collapsed) => {
        setSidebarCollapsed(collapsed);
        localStorage.setItem('dashboard_sidebar_collapsed', JSON.stringify(collapsed));
    };

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (!isMobileMenuOpen) {
            document.body.classList.add('sidebar-open');
        } else {
            document.body.classList.remove('sidebar-open');
        }
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024; // Changed from 768 to match our breakpoint
            setIsMobileView(mobile);
            if (mobile) {
                setSidebarCollapsed(true);
            } else {
                const savedState = localStorage.getItem('dashboard_sidebar_collapsed');
                if (savedState !== null) {
                    setSidebarCollapsed(JSON.parse(savedState));
                }
                // Close mobile menu when switching to desktop
                if (isMobileMenuOpen) {
                    setIsMobileMenuOpen(false);
                    document.body.classList.remove('sidebar-open');
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => {
            window.removeEventListener('resize', handleResize);
            document.body.classList.remove('sidebar-open');
        };
    }, [isMobileMenuOpen]);

    // Fetch roles when user logs in
    useEffect(() => {
        if (loggedInUser) {
            refetch();
        }
    }, [loggedInUser, refetch]);

    // WhatsApp webhook → DB: refresh leads / inbox when tenant receives a message
    useEffect(() => {
        if (!loggedInUser?.id) return;

        const baseUrl = BASE_URL.replace(/\/?api\/v1\/?$/, '');
        inboxSocketRef.current = io(baseUrl, {
            withCredentials: true,
            path: '/socket.io',
        });
        inboxSocketRef.current.emit('user_connected', loggedInUser.id);
        inboxSocketRef.current.on('whatsapp_inbox_update', () => {
            dispatch(leadApi.util.invalidateTags(['Lead']));
            dispatch(settingsApi.util.invalidateTags(['WhatsappInbox']));
        });

        return () => {
            inboxSocketRef.current?.disconnect();
            inboxSocketRef.current = null;
        };
    }, [loggedInUser?.id, dispatch]);

    return (
        <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar
                collapsed={sidebarCollapsed}
                onCollapsedChange={handleSidebarToggle}
                userPermissions={userPermissions}
                rolesData={rolesData}
                loggedInUser={loggedInUser}
                isMobileMenuOpen={isMobileMenuOpen}
                onMobileMenuClose={handleMobileMenuToggle}
            />
            <div className="main-content">
                <Header onMobileMenuToggle={handleMobileMenuToggle} />
                <div className="page-content">
                    <Outlet />
                </div>
                <Footer />
            </div>
            {isMobileMenuOpen && (
                <div className="sidebar-overlay" onClick={handleMobileMenuToggle} />
            )}
        </div>
    );
};

export default DashboardLayout;