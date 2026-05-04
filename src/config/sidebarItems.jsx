import React from 'react';
import {
    FiHome,
    FiSettings,
    FiUsers,
    FiShoppingBag,
    FiShoppingCart,
    FiTarget,
    FiFileText,
    FiCalendar,
    FiMail,
    FiMessageSquare,
    FiBriefcase,
    FiPhone,
    FiPackage,
    FiTrendingUp,
    FiTruck,
    FiCreditCard,
    FiCheckSquare,
    FiShield,
    FiMapPin,
    FiTag,
    FiClock,
    FiVideo,
    FiBell,
    FiFile,
    FiEdit3,
    FiBookOpen,
    FiGlobe,
    FiPercent,
    FiList,
    FiUserCheck,
    FiSliders,
    FiHelpCircle,
    FiBox,
    FiHardDrive,
    FiGrid,
    FiDollarSign
} from "react-icons/fi";

export const getDashboardMenuItems = (checkPermission, isSubscriptionExpired) => [
    { title: "Dashboard", icon: <FiHome />, path: "/dashboard" },
    {
      title: "CRM",
      icon: <FiUsers />,
      isDropdown: true,
      permission: 'dashboards-crm',
      subItems: [
        { title: "Leads", icon: <FiTarget />, path: "/dashboard/crm/leads", permission: "dashboards-lead" },
        { title: "Deals", icon: <FiShoppingBag />, path: "/dashboard/crm/deals", permission: "dashboards-deal" },
        { title: "Company", icon: <FiBriefcase />, path: "/dashboard/crm/company-account", permission: "dashboards-crm-company-account" },
        { title: "Contact", icon: <FiFileText />, path: "/dashboard/crm/contact", permission: "dashboards-crm-contact" },
        { title: "Custom Form", icon: <FiFileText />, path: "/dashboard/crm/custom-form", permission: "dashboards-custom-form" },
        { title: "Task", icon: <FiCheckSquare />, path: "/dashboard/crm/tasks", permission: "dashboards-task" },
        { title: "Task Calendar", icon: <FiCalendar />, path: "/dashboard/crm/task-calendar", permission: "dashboards-TaskCalendar" },
        { title: "CRM System Setup", icon: <FiSettings />, path: "/dashboard/crm-setup", permission: "dashboards-systemsetup" }
      ].filter(item => !item.permission || checkPermission(item.permission))
    },
    {
      title: "Sales",
      icon: <FiShoppingCart />,
      isDropdown: true,
      permission: 'dashboards-sales',
      subItems: [
        { title: "Product & Services", icon: <FiPackage />, path: "/dashboard/sales/product-services", permission: "dashboards-sales-product-services" },
        { title: "Customer", icon: <FiUsers />, path: "/dashboard/sales/customer", permission: "dashboards-sales-customer" },
        { title: "Invoice", icon: <FiFileText />, path: "/dashboard/sales/invoice", permission: "dashboards-sales-invoice" },
        { title: "Credit Notes", icon: <FiFile />, path: "/dashboard/sales/credit-notes", permission: "dashboards-sales-credit-notes" },
        { title: "Revenue", icon: <FiTrendingUp />, path: "/dashboard/sales/revenue", permission: "dashboards-sales-revenue" }
      ].filter(item => !item.permission || checkPermission(item.permission))
    },
    {
      title: "Purchase",
      icon: <FiShoppingBag />,
      isDropdown: true,
      permission: 'dashboards-purchase',
      subItems: [
        { title: "Vendor", icon: <FiTruck />, path: "/dashboard/purchase/vendor", permission: "dashboards-purchase-vendor" },
        { title: "Billing", icon: <FiCreditCard />, path: "/dashboard/purchase/billing", permission: "dashboards-purchase-billing" },
        { title: "Debit Note", icon: <FiFileText />, path: "/dashboard/purchase/debit-note", permission: "dashboards-purchase-debit-note" }
      ].filter(item => !item.permission || checkPermission(item.permission))
    },
    {
      title: "User Management",
      icon: <FiUsers />,
      isDropdown: true,
      permission: 'extra-users',
      subItems: [
        { title: "Users", icon: <FiUserCheck />, path: "/dashboard/user-management/users", permission: "extra-users-list" }
      ].filter(item => !item.permission || checkPermission(item.permission))
    },
    {
      title: "Communication",
      icon: <FiMessageSquare />,
      isDropdown: true,
      subItems: [
        { title: "Mail", icon: <FiMail />, path: "/dashboard/communication/mail", permission: "dashboards-communication" },
        { title: "Chat", icon: <FiMessageSquare />, path: "/dashboard/communication/chat", permission: "dashboards-communication" }
      ].filter(item => !item.permission || checkPermission(item.permission))
    },
    {
      title: "WhatsApp",
      icon: <FiPhone />,
      isDropdown: true,
      permission: "dashboards-communication",
      subItems: [
        { title: "Inbox", icon: <FiMessageSquare />, path: "/dashboard/whatsapp/inbox", permission: "dashboards-communication" },
        { title: "Business setup", icon: <FiSettings />, path: "/dashboard/settings/whatsapp", permission: "dashboards-communication" },
        { title: "Message log", icon: <FiList />, path: "/dashboard/whatsapp/messages", permission: "dashboards-communication" }
      ].filter(item => !item.permission || checkPermission(item.permission))
    },
    {
      title: "HRM",
      icon: <FiUsers />,
      isDropdown: true,
      permission: 'extra-hrm',
      subItems: [
        { title: "Employee", icon: <FiUsers />, path: "/dashboard/hrm/employee", permission: "extra-hrm-employee" },
        { title: "PayRoll", icon: <FiDollarSign />, path: "/dashboard/hrm/payroll", permission: "extra-hrm-payroll" },
        { title: "Role", icon: <FiShield />, path: "/dashboard/hrm/role", permission: "extra-hrm-role" },
        { title: "Branch", icon: <FiMapPin />, path: "/dashboard/hrm/branch", permission: "extra-hrm-branch" },
        { title: "Designation", icon: <FiTag />, path: "/dashboard/hrm/designation", permission: "extra-hrm-designation" },
        { title: "Department", icon: <FiGrid />, path: "/dashboard/hrm/department", permission: "extra-hrm-department" },
        { title: "Attendance", icon: <FiClock />, path: "/dashboard/hrm/attendance", permission: "extra-hrm-attendance-attendancelist" },
        { title: "Holiday", icon: <FiCalendar />, path: "/dashboard/hrm/holiday", permission: "extra-hrm-holiday" },
        { title: "Leave Management", icon: <FiCalendar />, path: "/dashboard/hrm/leave", permission: "extra-hrm-leave-leavelist" },
        { title: "Calendar", icon: <FiCalendar />, path: "/dashboard/hrm/calendar", permission: "extra-hrm-calendar" },
        { title: "Meeting", icon: <FiVideo />, path: "/dashboard/hrm/meeting", permission: "extra-hrm-meeting" },
        { title: "Announcement", icon: <FiBell />, path: "/dashboard/hrm/announcement", permission: "extra-hrm-announcement" },
        { title: "Document", icon: <FiFile />, path: "/dashboard/hrm/document", permission: "extra-hrm-document" },
        { title: "Training Setup", icon: <FiBookOpen />, path: "/dashboard/hrm/training", permission: "extra-hrm-trainingSetup" }
      ].filter(item => !item.permission || checkPermission(item.permission))
    },
    {
      title: "Job",
      icon: <FiBriefcase />,
      isDropdown: true,
      permission: "extra-hrm-jobs-joblist",
      subItems: [
        { title: "Jobs", icon: <FiBriefcase />, path: "/dashboard/job/jobs", permission: "extra-hrm-jobs-joblist" },
        { title: "Job Candidates", icon: <FiUsers />, path: "/dashboard/job/job-candidates", permission: "extra-hrm-jobs-jobcandidate" },
        { title: "Job On-Boarding", icon: <FiUserCheck />, path: "/dashboard/job/job-onboarding", permission: "extra-hrm-jobs-jobonbording" },
        { title: "Job Applications", icon: <FiFileText />, path: "/dashboard/job/job-applications", permission: "extra-hrm-jobs-jobapplication" },
        { title: "Offer Letters", icon: <FiFile />, path: "/dashboard/job/offer-letters", permission: "extra-hrm-jobs-jobofferletter" },
        { title: "Interviews", icon: <FiCalendar />, path: "/dashboard/job/interviews", permission: "extra-hrm-jobs-interview" }
      ].filter(item => !item.permission || checkPermission(item.permission))
    },
    {
      title: 'Setting',
      icon: <FiSettings />,
      isDropdown: true,
      subItems: [
        { title: 'General', icon: <FiSliders />, path: '/dashboard/settings/general' },
        { title: 'Plan', icon: <FiBookOpen />, path: '/dashboard/settings/plan' },
        { title: 'Payment', icon: <FiDollarSign />, path: '/dashboard/settings/payment' },
        { title: 'Countries', icon: <FiGlobe />, path: '/dashboard/settings/countries' },
        { title: 'Currencies', icon: <FiCreditCard />, path: '/dashboard/settings/currencies' },
        { title: 'Tax', icon: <FiPercent />, path: '/dashboard/settings/tax' },
        { title: 'ESignature', icon: <FiEdit3 />, path: '/dashboard/settings/esignature' }
      ].filter(sub => isSubscriptionExpired ? sub.title === 'Plan' : true)
    },
    {
      title: "Support",
      icon: <FiHelpCircle />,
      isDropdown: true,
      subItems: [
        { title: "Ticket", icon: <FiMessageSquare />, path: "/dashboard/support/ticket" },
        { title: "Help Support", icon: <FiHelpCircle />, path: "/dashboard/support/help-support" }
      ].filter(item => !item.permission || checkPermission(item.permission))
    }
];

export const getSuperAdminMenuItems = () => [
    {
        title: 'Dashboard',
        icon: <FiHome />,
        path: '/superadmin/dashboard'
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
        title: 'Inquiry',
        icon: <FiMessageSquare />,
        path: '/superadmin/inquiry'
    },
    {
        title: 'Company Tickets',
        icon: <FiHelpCircle />,
        path: '/superadmin/support/ticket'
    }
];
