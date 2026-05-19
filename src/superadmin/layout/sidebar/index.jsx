import React from 'react';
import {
    FiHome,
    FiSettings,
    FiBriefcase,
    FiUsers,
    FiFileText,
    FiShield,
    FiMessageSquare,
    FiDollarSign,
    FiGlobe,
    FiCreditCard,
    FiEdit3,
    FiBox,
    FiHardDrive,
    FiHelpCircle,
    FiCpu,
    FiActivity,
    FiLink,
    FiCalendar,
    FiTrendingUp,
    FiAlertCircle
} from 'react-icons/fi';
import CommonSidebar from '../../../components/Sidebar/Sidebar';

const SuperAdminSidebar = ({ collapsed, onCollapsedChange }) => {
    const menuItems = [
        {
            title: 'Dashboard',
            icon: <FiHome />,
            path: '/superadmin/dashboard'
        },
        {
            title: 'Analytics',
            icon: <FiTrendingUp />,
            path: '/superadmin/analytics'
        },
        {
            title: 'Company',
            icon: <FiBriefcase />,
            path: '/superadmin/company'
        },
        {
            title: 'Plans',
            icon: <FiBox />,
            path: '/superadmin/plans'
        },
        {
            title: 'Storage',
            icon: <FiHardDrive />,
            path: '/superadmin/storage'
        },
        {
            title: 'Subscribed Users',
            icon: <FiUsers />,
            path: '/superadmin/subscribed-user'
        },
        {
            title: 'Notes',
            icon: <FiFileText />,
            path: '/superadmin/notes'
        },
        {
            title: 'Policy',
            icon: <FiShield />,
            path: '/superadmin/policy'
        },
        {
            title: 'Setting',
            icon: <FiSettings />,
            isDropdown: true,
            subItems: [
                {
                    title: 'Countries',
                    icon: <FiGlobe />,
                    path: '/superadmin/settings/countries'
                },
                {
                    title: 'Currencies',
                    icon: <FiCreditCard />,
                    path: '/superadmin/settings/currencies'
                },
                {
                    title: 'ESignature',
                    icon: <FiEdit3 />,
                    path: '/superadmin/settings/esignature'
                },
                {
                    title: 'Payment Gateway',
                    icon: <FiDollarSign />,
                    path: '/superadmin/settings/payment-gateway'
                }
            ]
        },
        {
            title: 'Third Party Settings',
            icon: <FiLink />,
            isDropdown: true,
            subItems: [
                {
                    title: 'AI Management',
                    icon: <FiCpu />,
                    path: '/superadmin/settings/ai'
                },
                {
                    title: 'OTP Settings',
                    icon: <FiSettings />,
                    path: '/superadmin/settings/otp'
                },
                {
                    title: 'Maintenance Mode',
                    icon: <FiAlertCircle />,
                    path: '/superadmin/settings/maintenance'
                }
            ]
        },
        {
            title: 'Error Tracking & Logs',
            icon: <FiActivity />,
            path: '/superadmin/system-logs'
        },
        {
            title: 'Inquiry',
            icon: <FiMessageSquare />,
            path: '/superadmin/inquiry'
        },
        {
            title: 'Demo Requests',
            icon: <FiCalendar />,
            path: '/superadmin/demo-requests'
        },
        {
            title: 'Company Tickets',
            icon: <FiHelpCircle />,
            path: '/superadmin/support/ticket'
        }
    ];

    return (
        <CommonSidebar 
            menuItems={menuItems}
            brandName="Super Admin"
            profilePath="/superadmin/profile"
            collapsed={collapsed}
            onCollapsedChange={onCollapsedChange}
        />
    );
};

export default SuperAdminSidebar;
