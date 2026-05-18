import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
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
import { useGetMaintenanceQuery } from '../../superadmin/module/settings/services/maintenanceApi';
import BrandConfig from '../../utils/brandName';
import moment from 'moment';

import FloatingAIBtn from '../../components/AISupport/FloatingAIBtn';
import { useFirebaseNotifications } from '../../utils/useFirebaseNotifications';
import LimitReachedModal from '../../components/LimitReachedModal';
import AccountStatusModal from '../../components/AccountStatusModal';
import { useLogout } from '../../hooks/useLogout';

const DashboardLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const inboxSocketRef = useRef(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: rolesData, isLoading: isLoadingRoles, refetch } = useGetRolesQuery({
        skip: !loggedInUser // Skip query if user not logged in
    });

    // Initialize Firebase Push Notifications
    useFirebaseNotifications();


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
        const socket = io(baseUrl, {
            withCredentials: true,
            path: '/socket.io',
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        inboxSocketRef.current = socket;

        const handleConnect = () => {
            socket.emit('user_connected', loggedInUser.id);
        };

        const handleUpdate = (payload) => {
            dispatch(leadApi.util.invalidateTags(['Lead']));
            dispatch(settingsApi.util.invalidateTags(['WhatsappInbox']));
        };

        socket.on('connect', handleConnect);
        socket.on('whatsapp_inbox_update', handleUpdate);

        // Initial connect call in case it's already connected
        if (socket.connected) handleConnect();

        return () => {
            socket.off('connect', handleConnect);
            socket.off('whatsapp_inbox_update', handleUpdate);
            socket.disconnect();
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

    const checkFeature = (featureKey) => {
        if (userRole === 'super-admin' || isSuperAdminCompanyLogin) return true;
        let features = subscriptionData?.data?.Plan?.features || subscriptionData?.data?.plan?.features || subscriptionData?.data?.features;
        
        if (typeof features === 'string') {
            try { features = JSON.parse(features); } catch (e) { features = null; }
        }

        if (!features) return false;
        return !!features[featureKey];
    };

    // Global subscription route gate/protection
    useEffect(() => {
        if (isSubscriptionLoading || !subscriptionData) return;
        if (userRole === 'super-admin' || isSuperAdminCompanyLogin) return;

        const path = location.pathname.toLowerCase();

        // If subscription is expired, force redirect to settings plan page
        if (isSubscriptionExpired && path !== '/dashboard/settings/plan') {
            navigate('/dashboard/settings/plan');
            return;
        }
        
        // Define path-to-feature maps
        const featureRoutes = [
            { path: '/dashboard/crm/automation', feature: 'workflows', name: 'Automated Workflows' },
            { path: '/dashboard/sales/revenue', feature: 'reports', name: 'Revenue Reports' },
            { path: '/dashboard/crm/reports', feature: 'reports', name: 'Advanced Reports' },
            { path: '/dashboard/crm/analytics', feature: 'reports', name: 'Advanced Analytics' },
            { path: '/dashboard/hrm/analytics', feature: 'reports', name: 'HRM Analytics' },
            { path: '/dashboard/whatsapp-chat', feature: 'whatsapp', name: 'WhatsApp Chat' },
            { path: '/dashboard/whatsapp/templates', feature: 'whatsapp', name: 'WhatsApp Message Templates' },
            { path: '/dashboard/whatsapp/broadcast', feature: 'whatsapp', name: 'WhatsApp Broadcast' },
            { path: '/dashboard/whatsapp/messages', feature: 'whatsapp', name: 'WhatsApp Message Log' },
            { path: '/dashboard/settings/whatsapp', feature: 'whatsapp', name: 'WhatsApp API Settings' }
        ];

        // Find match
        const matched = featureRoutes.find(r => path.startsWith(r.path.toLowerCase()));
        if (matched) {
            const hasAccess = checkFeature(matched.feature);
            if (!hasAccess) {
                setLockedFeatureName(matched.name);
                setUpgradeModalVisible(true);
                navigate('/dashboard');
            }
        }
    }, [location.pathname, subscriptionData, isSubscriptionLoading, userRole, isSuperAdminCompanyLogin]);

    const checkPermission = (moduleKey) => {
        if (userRole === 'super-admin' || isSuperAdminCompanyLogin) return true;
        if (['settings', 'communication', 'support'].includes(moduleKey?.toLowerCase())) return true;
        if (userRole?.toLowerCase() === 'client') return true;
        if (!userPermissions) return false;
        const modulePermissions = userPermissions[moduleKey];
        return modulePermissions && modulePermissions.length > 0 && modulePermissions[0].permissions.includes('view');
    };

    const shouldShowMenuItem = (item) => {
        if (item.hidden) return false;
        if (isSubscriptionExpired) return ['Dashboard', 'Setting', 'Subscription'].includes(item.title);
        if (item.subItems && item.subItems.length === 0) return false;
        if (['Setting', 'Communication', 'Support', 'Subscription'].includes(item.title)) return true;
        if (userRole?.toLowerCase() === 'client') return true;
        if (!item.permission) return true;
        if (item.subItems?.length > 0) return item.subItems.some(sub => !sub.permission || checkPermission(sub.permission));
        return checkPermission(item.permission);
    };

    const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
    const [lockedFeatureName, setLockedFeatureName] = useState('');
    const handleLogout = useLogout();

    const isAccountRestricted = Boolean(
        loggedInUser?.status &&
        ['inactive', 'suspended', 'blocked'].includes(loggedInUser.status.toLowerCase()) &&
        userRole !== 'super-admin' &&
        !isSuperAdminCompanyLogin
    );

    const handleLockedClick = (item) => {
        setLockedFeatureName(item.title);
        setUpgradeModalVisible(true);
    };

    const { data: maintenanceData, isLoading: isMaintenanceLoading } = useGetMaintenanceQuery(undefined, {
        pollingInterval: 60000 // Check every minute
    });

    const isMaintenanceActive = React.useMemo(() => {
        if (userRole === 'super-admin' || isSuperAdminCompanyLogin) return false;
        const maintenance = maintenanceData?.data;
        if (!maintenance?.isOn) return false;
        
        if (maintenance.status === 'active') return true;
        if (maintenance.status === 'scheduled' && maintenance.startDate && maintenance.endDate) {
            const now = moment();
            if (now.isAfter(moment(maintenance.startDate)) && now.isBefore(moment(maintenance.endDate))) {
                return true;
            }
        }
        return false;
    }, [maintenanceData, userRole, isSuperAdminCompanyLogin]);

    const menuItems = React.useMemo(() => {
        const rawItems = getDashboardMenuItems(checkPermission, isSubscriptionExpired, checkFeature, userRole);
        
        const filteredItems = rawItems.filter(shouldShowMenuItem);
        
        // Propagate isLocked and add onLockedClick
        return filteredItems.map(item => {
            const isParentLocked = item.isLocked;
            const newItem = { ...item };
            
            if (isParentLocked) {
                newItem.onLockedClick = handleLockedClick;
            }
            
            if (newItem.subItems) {
                newItem.subItems = newItem.subItems.map(sub => {
                    const isSubLocked = sub.isLocked || isParentLocked;
                    return {
                        ...sub,
                        isLocked: isSubLocked,
                        onLockedClick: isSubLocked ? handleLockedClick : undefined
                    };
                });
            }
            return newItem;
        });
    }, [userPermissions, userRole, isSubscriptionExpired, subscriptionData, isSuperAdminCompanyLogin]);

    if (isMaintenanceLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    if (isMaintenanceActive) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f0f2f5',
                textAlign: 'center',
                padding: '24px'
            }}>
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    maxWidth: '600px',
                    width: '100%'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: '#e6f7ff',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '0 auto 24px',
                        animation: 'pulse 2s infinite'
                    }}>
                        <FiSettings size={40} color="#1890ff" style={{ animation: 'spin 4s linear infinite' }} />
                    </div>
                    <h1 style={{ fontSize: '32px', marginBottom: '16px', color: '#1f2937', fontWeight: 'bold' }}>
                        {maintenanceData?.data?.title || 'System Maintenance'}
                    </h1>
                    <p style={{ fontSize: '18px', color: '#6b7280', lineHeight: '1.6', marginBottom: '32px' }}>
                        {maintenanceData?.data?.message || 'The platform is currently undergoing improvements and regular maintenance. Please check back later or contact support if you need immediate assistance.'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                        <a
                            href="mailto:support@grewox.com"
                            style={{
                                background: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #e5e7eb',
                                padding: '12px 32px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                textDecoration: 'none',
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => { e.target.style.background = '#e5e7eb'; e.target.style.color = '#111827'; }}
                            onMouseOut={(e) => { e.target.style.background = '#f3f4f6'; e.target.style.color = '#374151'; }}
                        >
                            Contact Support
                        </a>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: '#1890ff',
                                color: 'white',
                                border: 'none',
                                padding: '12px 32px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'background 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#096dd9'}
                            onMouseOut={(e) => e.target.style.background = '#1890ff'}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
                <style>
                    {`
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4); } 70% { box-shadow: 0 0 0 20px rgba(24, 144, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); } }
                    `}
                </style>
            </div>
        );
    }

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
            
            <LimitReachedModal
                visible={upgradeModalVisible}
                onCancel={() => setUpgradeModalVisible(false)}
                title={`${lockedFeatureName} Locked`}
                message={`The ${lockedFeatureName} feature is not included in your current plan. Upgrade now to unlock automated messaging and advanced features!`}
            />

            <AccountStatusModal
                visible={isAccountRestricted}
                status={loggedInUser?.status}
                userRole={userRole}
                onLogout={handleLogout}
            />
        </div>
    );
};

export default DashboardLayout;