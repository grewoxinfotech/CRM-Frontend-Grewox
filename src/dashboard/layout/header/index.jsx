import React, { useState, useRef, useEffect } from 'react';
import { Input, Badge, Dropdown, Avatar, Tooltip, Space, List, Typography, Button } from 'antd';
import {
    FiBell,
    FiSearch,
    FiUser,
    FiLogOut,
    FiArrowRight,
    FiMenu,
    FiZap
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectUserRole } from '../../../auth/services/authSlice';
import { useLogout } from '../../../hooks/useLogout';
import { useNavigate } from 'react-router-dom';
import Notifications from '../../../common/notifacations';
import moment from 'moment';
import { useGetsubcriptionByIdQuery } from '../../../superadmin/module/SubscribedUser/services/SubscribedUserApi';
import './header.scss';

const { Text } = Typography;

const Header = () => {
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const user = useSelector(selectCurrentUser);
    const userRole = useSelector(selectUserRole);
    const handleLogout = useLogout();
    const navigate = useNavigate();

    const isSuperAdminCompanyLogin = localStorage.getItem('isSuperAdminCompanyLogin') === 'true';
    const showUpgradeBtn = userRole !== 'super-admin' && !isSuperAdminCompanyLogin;

    const subscriptionId = user?.client_plan_id;
    const shouldFetchSubscription = subscriptionId && userRole !== 'super-admin' && !isSuperAdminCompanyLogin;
    
    const { data: subscriptionData } = useGetsubcriptionByIdQuery(subscriptionId, {
      skip: !shouldFetchSubscription
    });

    const headerAiLimit = subscriptionData?.data?.ai_credits_limit || subscriptionData?.data?.Plan?.ai_credits || 0;

    const subscriptionDaysLeft = React.useMemo(() => {
      if (userRole === 'super-admin' || isSuperAdminCompanyLogin) return null;
      if (!subscriptionData?.data?.end_date) return null;
      
      const end = moment(subscriptionData.data.end_date).startOf('day');
      const now = moment().startOf('day');
      const days = end.diff(now, 'days');
      return days >= 0 ? days : null;
    }, [subscriptionData, userRole, isSuperAdminCompanyLogin]);

    const isSubscriptionExpired = React.useMemo(() => {
      if (userRole === 'super-admin' || isSuperAdminCompanyLogin) return false;
      if (!subscriptionData?.data?.end_date) return false;
      return moment(subscriptionData.data.end_date).isBefore(moment());
    }, [subscriptionData, userRole, isSuperAdminCompanyLogin]);

    // Define searchable items
    const searchableItems = [
        // CRM
        { title: "Projects", path: "/dashboard/crm/project", parent: "CRM" },
        { title: "Leads", path: "/dashboard/crm/leads", parent: "CRM" },
        { title: "Deals", path: "/dashboard/crm/deals", parent: "CRM" },
        { title: "Proposals", path: "/dashboard/crm/proposal", parent: "CRM" },
        { title: "Tasks", path: "/dashboard/crm/tasks", parent: "CRM" },
        { title: "Task Calendar", path: "/dashboard/crm/task-calendar", parent: "CRM" },
        { title: "CRM Setup", path: "/dashboard/crm-setup", parent: "CRM" },

        // HRM
        { title: "Employees", path: "/dashboard/hrm/employee", parent: "HRM" },
        { title: "Payroll", path: "/dashboard/hrm/payroll", parent: "HRM" },
        { title: "Leave", path: "/dashboard/hrm/leave", parent: "HRM" },
        { title: "Branch", path: "/dashboard/hrm/branch", parent: "HRM" },
        { title: "Designation", path: "/dashboard/hrm/designation", parent: "HRM" },
        { title: "Department", path: "/dashboard/hrm/department", parent: "HRM" },
        { title: "Training", path: "/dashboard/hrm/training", parent: "HRM" },
        { title: "Documents", path: "/dashboard/hrm/document", parent: "HRM" },
        { title: "Announcements", path: "/dashboard/hrm/announcement", parent: "HRM" },
        { title: "Roles", path: "/dashboard/hrm/role", parent: "HRM" },
        { title: "Meetings", path: "/dashboard/hrm/meeting", parent: "HRM" },
        { title: "Attendance", path: "/dashboard/hrm/attendance", parent: "HRM" },
        { title: "Holidays", path: "/dashboard/hrm/holiday", parent: "HRM" },
        { title: "Calendar", path: "/dashboard/hrm/calendar", parent: "HRM" },

        // Job
        { title: "Jobs", path: "/dashboard/job/jobs", parent: "Job" },
        { title: "Job Candidates", path: "/dashboard/job/job-candidates", parent: "Job" },
        { title: "Job Onboarding", path: "/dashboard/job/job-onboarding", parent: "Job" },
        { title: "Job Applications", path: "/dashboard/job/job-applications", parent: "Job" },
        { title: "Offer Letters", path: "/dashboard/job/offer-letters", parent: "Job" },
        { title: "Interviews", path: "/dashboard/job/interviews", parent: "Job" },

        // Sales
        { title: "Products & Services", path: "/dashboard/sales/product-services", parent: "Sales" },
        { title: "Customers", path: "/dashboard/sales/customer", parent: "Sales" },
        { title: "Invoices", path: "/dashboard/sales/invoice", parent: "Sales" },
        { title: "Credit Notes", path: "/dashboard/sales/credit-notes", parent: "Sales" },
        { title: "Revenue", path: "/dashboard/sales/revenue", parent: "Sales" },


        // Purchase
        { title: "Vendors", path: "/dashboard/purchase/vendor", parent: "Purchase" },
        { title: "Billing", path: "/dashboard/purchase/billing", parent: "Purchase" },
        { title: "Debit Notes", path: "/dashboard/purchase/debit-note", parent: "Purchase" },

        // Communication
        { title: "Chat", path: "/dashboard/communication/chat", parent: "Communication" },
        { title: "WhatsApp Chat", path: "/dashboard/whatsapp-chat", parent: "Communication" },
        { title: "Mail", path: "/dashboard/communication/mail", parent: "Communication" },

        // Support
        { title: "Tickets", path: "/dashboard/support/ticket", parent: "Support" },

        // Settings
        { title: "Currencies", path: "/dashboard/settings/currencies", parent: "Settings" },
        { title: "Countries", path: "/dashboard/settings/countries", parent: "Settings" },
        { title: "E-Signature", path: "/dashboard/settings/esignature", parent: "Settings" },
        { title: "Tax", path: "/dashboard/settings/tax", parent: "Settings" },

        // Others
        { title: "Profile", path: "/dashboard/profile" },
        { title: "Dashboard", path: "/dashboard" }
    ];

    const searchInputRef = useRef(null);
    const searchResultsRef = useRef(null);

    // Handle search input change
    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase().trim();
        setSearchQuery(query);

        // Show results even if query is empty
        let results = searchableItems;

        if (query.length > 0) {
            // Match by title or parent
            results = searchableItems.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.parent?.toLowerCase().includes(query)
            );

            // Sort results
            results.sort((a, b) => {
                // Exact matches first
                const aExactMatch = a.title.toLowerCase() === query;
                const bExactMatch = b.title.toLowerCase() === query;
                if (aExactMatch && !bExactMatch) return -1;
                if (!aExactMatch && bExactMatch) return 1;

                // Then by parent
                if (a.parent && b.parent) {
                    return a.parent.localeCompare(b.parent);
                }
                if (a.parent) return -1;
                if (b.parent) return 1;

                // Finally by title
                return a.title.localeCompare(b.title);
            });
        }

        setSearchResults(results);
        setShowResults(true);
    };

    // Handle search result click
    const handleResultClick = (path) => {
        navigate(path);
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
    };

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchResultsRef.current && !searchResultsRef.current.contains(event.target) &&
                searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus search input when search is shown
    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showSearch]);

    return (
        <header className="dashboard-header">
            <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h1>Dashboard</h1>
                {userRole !== 'super-admin' && !isSuperAdminCompanyLogin && (isSubscriptionExpired || (subscriptionDaysLeft !== null && subscriptionDaysLeft <= 7)) && (
                    <div className="subscription-header-banner" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px 12px',
                        background: isSubscriptionExpired 
                            ? 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' 
                            : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                        border: isSubscriptionExpired 
                            ? '1px solid #fecdd3' 
                            : '1px solid #fde68a',
                        borderRadius: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                            {isSubscriptionExpired ? '🚨' : '⚠️'}
                        </span>
                        <Text strong style={{ 
                            fontSize: '11px', 
                            color: isSubscriptionExpired ? '#be123c' : '#b45309',
                            margin: 0
                        }}>
                            {isSubscriptionExpired 
                                ? 'Your plan has expired!' 
                                : subscriptionDaysLeft === 0 
                                    ? 'Your plan expires today!' 
                                    : `Your plan expires in ${subscriptionDaysLeft} days!`}
                        </Text>
                        <Button 
                            type="primary" 
                            size="small" 
                            onClick={() => navigate('/dashboard/settings/plan')}
                            style={{
                                background: isSubscriptionExpired ? '#e11d48' : '#d97706',
                                borderColor: isSubscriptionExpired ? '#e11d48' : '#d97706',
                                borderRadius: '12px',
                                fontSize: '10px',
                                height: '20px',
                                padding: '0 8px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                lineHeight: 1
                            }}
                        >
                            Upgrade Now
                        </Button>
                    </div>
                )}
            </div>

            <div className="header-center">
                <div className="global-search-container">
                    <Input
                        ref={searchInputRef}
                        prefix={<FiSearch className="search-icon" />}
                        placeholder="Search modules (Leads, Projects, WhatsApp...)"
                        className="global-search-input"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onClick={() => setShowResults(true)}
                        onFocus={() => setShowResults(true)}
                        onPressEnter={() => {
                            if (searchResults.length > 0) {
                                handleResultClick(searchResults[0].path);
                            }
                        }}
                    />
                    {showResults && searchQuery.length > 0 && (
                        <div className="search-results" ref={searchResultsRef}>
                            <List
                                size="small"
                                dataSource={searchResults}
                                renderItem={item => (
                                    <List.Item
                                        className="search-result-item"
                                        onClick={() => handleResultClick(item.path)}
                                    >
                                        <div className="search-result-content">
                                            <div className="search-result-title">
                                                <Text strong>{item.title}</Text>
                                                {item.parent && (
                                                    <Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
                                                        in {item.parent}
                                                    </Text>
                                                )}
                                            </div>
                                            <FiArrowRight className="search-result-arrow" />
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="header-right">
                <div className="header-actions">
                    {showUpgradeBtn && (
                        <Button
                            type="primary"
                            icon={<FiZap style={{ color: '#fff', fontSize: '14px' }} />}
                            onClick={() => navigate('/dashboard/settings/plan')}
                            style={{
                                background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                                border: 'none',
                                borderRadius: '20px',
                                fontWeight: '600',
                                fontSize: '13px',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                height: '32px',
                                padding: '0 16px',
                                boxShadow: '0 2px 8px rgba(250, 173, 20, 0.4)',
                                transition: 'all 0.3s ease',
                            }}
                            className="upgrade-btn-header"
                        >
                            <span className="upgrade-text">Upgrade</span>
                        </Button>
                    )}
                    {shouldFetchSubscription && subscriptionData?.data && (
                        <Tooltip title={`AI Credits: ${subscriptionData.data.ai_credits_used || 0} used of ${headerAiLimit}`}>
                            <div style={{
                                background: 'linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%)',
                                border: '1px solid #c7d2fe',
                                color: '#4f46e5',
                                padding: '0 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                height: '32px',
                                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.05)',
                                transition: 'all 0.3s ease'
                            }}
                            onClick={() => navigate('/dashboard/settings/plan')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(79, 70, 229, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(79, 70, 229, 0.05)';
                            }}
                            >
                                <FiZap style={{ display: 'flex', alignItems: 'center', color: '#4f46e5', fontSize: '13px' }} />
                                <span style={{ whiteSpace: 'nowrap' }}>AI Credits: {Math.max(0, headerAiLimit - (subscriptionData.data.ai_credits_used || 0))}</span>
                            </div>
                        </Tooltip>
                    )}
                    <Notifications />
                    <div className="header-divider" />
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'profile',
                                    label: 'Profile',
                                    icon: <FiUser />,
                                    onClick: () => navigate('/dashboard/profile')
                                },
                                {
                                    type: 'divider'
                                },
                                {
                                    key: 'logout',
                                    label: 'Logout',
                                    icon: <FiLogOut />,
                                    danger: true,
                                    onClick: handleLogout
                                }
                            ]
                        }}
                        placement="bottomRight"
                        trigger={['click']}
                    >
                        <div className="user-avatar">
                            <Avatar size={32} style={{ cursor: 'pointer' }}>
                                {getInitials(user?.username)}
                            </Avatar>
                        </div>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
};

export default Header;