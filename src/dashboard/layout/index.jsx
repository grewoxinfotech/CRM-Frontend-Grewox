import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header';
import Footer from './footer';
import Sidebar from '../../components/Sidebar/Sidebar';
import { getDashboardMenuItems } from '../../config/sidebarItems';
import './layout.scss';
import { useGetRolesQuery } from '../module/hrm/role/services/roleApi';
import { selectCurrentUser, selectUserRole } from '../../auth/services/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { BASE_URL } from '../../config/config';
import { leadApi } from '../module/crm/lead/services/LeadApi';
import { settingsApi } from '../../superadmin/module/settings/services/settingsApi';
import { useGetsubcriptionByIdQuery } from '../../superadmin/module/SubscribedUser/services/SubscribedUserApi';
import BrandConfig from '../../utils/brandName';
import moment from 'moment';

import FloatingAIBtn from '../../components/AISupport/FloatingAIBtn';

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

    const userRole = useSelector(selectUserRole);
    const isSuperAdminCompanyLogin = localStorage.getItem('isSuperAdminCompanyLogin') === 'true';
    const subscriptionId = loggedInUser?.client_plan_id;
    const shouldFetchSubscription = subscriptionId && userRole !== 'super-admin' && !isSuperAdminCompanyLogin;
    
    const { data: subscriptionData, isLoading: isSubscriptionLoading } = useGetsubcriptionByIdQuery(subscriptionId, {
      skip: !shouldFetchSubscription
    });
  
    const isSubscriptionExpired = React.useMemo(() => {
      if (userRole === 'super-admin' || isSuperAdminCompanyLogin) return false;
      if (!subscriptionData?.data?.end_date) return false;
      return moment(subscriptionData.data.end_date).isBefore(moment());
    }, [subscriptionData, userRole, isSuperAdminCompanyLogin]);

    const checkPermission = (moduleKey) => {
        if (['settings', 'communication', 'support'].includes(moduleKey?.toLowerCase())) return true;
        if (userRole?.toLowerCase() === 'client') return true;
        if (!userPermissions) return false;
        const modulePermissions = userPermissions[moduleKey];
        return modulePermissions && modulePermissions.length > 0 && modulePermissions[0].permissions.includes('view');
    };

    const shouldShowMenuItem = (item) => {
        if (isSubscriptionExpired) return ['Dashboard', 'Setting'].includes(item.title);
        if (['Setting', 'Communication', 'Support'].includes(item.title)) return true;
        if (userRole?.toLowerCase() === 'client') return true;
        if (!item.permission) return true;
        if (item.subItems?.length > 0) return item.subItems.some(sub => !sub.permission || checkPermission(sub.permission));
        return checkPermission(item.permission);
    };

    const menuItems = React.useMemo(() => {
        return getDashboardMenuItems(checkPermission, isSubscriptionExpired).filter(shouldShowMenuItem);
    }, [userPermissions, userRole, isSubscriptionExpired]);

    return (
        <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar
                menuItems={menuItems}
                brandName={`${BrandConfig.appCapitalName} CRM`}
                profilePath="/dashboard/profile"
                collapsed={sidebarCollapsed}
                onCollapsedChange={handleSidebarToggle}
                isSidebarReady={!shouldFetchSubscription || !isSubscriptionLoading}
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
            <FloatingAIBtn />
        </div>
    );
};

export default DashboardLayout;