import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiHome,
    FiSettings,
    FiLogOut,
    FiChevronLeft,
    FiChevronRight,
    FiUsers,
    FiFolder,
    FiDollarSign,
    FiShoppingBag,
    FiShoppingCart,
    FiTarget,
    FiFileText,
    FiCalendar,
    FiMail,
    FiMessageSquare,
    FiUser,
    FiHelpCircle,
    FiTool,
    FiGrid,
    FiBarChart2,
    FiCheckSquare,
    FiDatabase,
    FiBriefcase,
    FiTrendingUp,
    FiUserCheck,
    FiShield,
    FiMapPin,
    FiTag,
    FiClock,
    FiVideo,
    FiBell,
    FiFile,
    FiBookOpen,
} from 'react-icons/fi';
import './sidebar.scss';

const Sidebar = ({ collapsed = false, onCollapsedChange = () => { } }) => {
    const [isCollapsed, setIsCollapsed] = useState(collapsed);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSystemSetupOpen, setIsSystemSetupOpen] = useState(false);
    const [isCommunicationOpen, setCommunicationOpen] = useState(false);
    const [isCrmOpen, setCrmOpen] = useState(false);
    const [isUserManagementOpen, setUserManagementOpen] = useState(false);
    const [isHrmOpen, setHrmOpen] = useState(false);
    const [isSupportOpen, setSupportOpen] = useState(false);
    const [isJobOpen, setJobOpen] = useState(false);

    // Sync local state with props
    useEffect(() => {
        setIsCollapsed(collapsed);
    }, [collapsed]);

    // Handle sidebar collapse toggle
    const handleToggleCollapse = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);
        onCollapsedChange(newCollapsedState);
    };

    const menuItems = [
        {
            title: 'Dashboard',
            icon: <FiHome />,
            path: '/dashboard'
        },
        {
            title: 'CRM',
            icon: <FiUsers />,
            isDropdown: true,
            subItems: [
                {
                    title: 'Project',
                    icon: <FiFolder />,
                    path: '/dashboard/project'
                },
                {
                    title: 'Sales',
                    icon: <FiDollarSign />,
                    path: '/dashboard/sales'
                },
                {
                    title: 'Banking',
                    icon: <FiBarChart2 />,
                    path: '/dashboard/banking'
                },
                {
                    title: 'Purchase',
                    icon: <FiShoppingCart />,
                    path: '/dashboard/purchase'
                },
                {
                    title: 'Leads',
                    icon: <FiTarget />,
                    path: '/dashboard/leads'
                },
                {
                    title: 'Deals',
                    icon: <FiShoppingBag />,
                    path: '/dashboard/deals'
                },
                {
                    title: 'Proposal',
                    icon: <FiFileText />,
                    path: '/dashboard/proposal'
                },
                {
                    title: 'Task',
                    icon: <FiCheckSquare />,
                    path: '/dashboard/task'
                },
                {
                    title: 'Task Calendar',
                    icon: <FiCalendar />,
                    path: '/dashboard/task-calendar'
                },
                {
                    title: 'CRM System Setup',
                    icon: <FiSettings />,
                    path: '/dashboard/crm-setup'
                }
            ]
        },
        {
            title: 'User Management',
            icon: <FiUsers />,
            isDropdown: true,
            subItems: [
                {
                    title: 'Users',
                    icon: <FiUser />,
                    path: '/dashboard/user-management/users'
                },
                {
                    title: 'Clients',
                    icon: <FiBriefcase />,
                    path: '/dashboard/clients'
                }
            ]
        },
        {
            title: 'Communication',
            icon: <FiMessageSquare />,
            isDropdown: true,
            subItems: [
                {
                    title: 'Mail',
                    icon: <FiMail />,
                    path: '/dashboard/mail'
                },
                {
                    title: 'Chat',
                    icon: <FiMessageSquare />,
                    path: '/dashboard/chat'
                },
                {
                    title: 'Calendar',
                    icon: <FiCalendar />,
                    path: '/dashboard/calendar'
                }
            ]
        },
        {
            title: 'HRM',
            icon: <FiUsers />,
            isDropdown: true,
            subItems: [
                {
                    title: 'Employee',
                    icon: <FiUsers />,
                    path: '/dashboard/hrm/employee'
                },
                {
                    title: 'PayRoll',
                    icon: <FiDollarSign />,
                    path: '/dashboard/hrm/payroll'
                },
                {
                    title: 'Performance',
                    icon: <FiTrendingUp />,
                    path: '/dashboard/hrm/performance'
                },
                {
                    title: 'Role',
                    icon: <FiShield />,
                    path: '/dashboard/hrm/role'
                },
                {
                    title: 'Branch',
                    icon: <FiMapPin />,
                    path: '/dashboard/hrm/branch'
                },
                {
                    title: 'Designation',
                    icon: <FiTag />,
                    path: '/dashboard/hrm/designation'
                },
                {
                    title: 'Department',
                    icon: <FiGrid />,
                    path: '/dashboard/hrm/department'
                },
                {
                    title: 'Attendance',
                    icon: <FiClock />,
                    path: '/dashboard/hrm/attendance'
                },
                {
                    title: 'Leave Management',
                    icon: <FiCalendar />,
                    path: '/dashboard/hrm/leave'
                },
                {
                    title: 'Meeting',
                    icon: <FiVideo />,
                    path: '/dashboard/hrm/meeting'
                },
                {
                    title: 'Announcement',
                    icon: <FiBell />,
                    path: '/dashboard/hrm/announcement'
                },
                {
                    title: 'Job',
                    icon: <FiBriefcase />,
                    path: '/dashboard/hrm/job'
                },
                {
                    title: 'Document',
                    icon: <FiFile />,
                    path: '/dashboard/hrm/document'
                },
                {
                    title: 'Training Setup',
                    icon: <FiBookOpen />,
                    path: '/dashboard/hrm/training'
                }
            ]
        },
        {
            title: 'Job',
            icon: <FiBriefcase />,
            isDropdown: true,
            subItems: [
                {
                    title: 'Jobs',
                    icon: <FiBriefcase />,
                    path: '/dashboard/job/jobs'
                },
                {
                    title: 'Job Candidates',
                    icon: <FiUsers />,
                    path: '/dashboard/job/job-candidates'
                },
                {
                    title: 'Job On-Boarding',
                    icon: <FiUserCheck />,
                    path: '/dashboard/job/job-onboarding'
                },
                {
                    title: 'Job Applications',
                    icon: <FiFileText />,
                    path: '/dashboard/job/job-applications'
                },
                {
                    title: 'Offer Letters',
                    icon: <FiFile />,
                    path: '/dashboard/job/offer-letters'
                },
                {
                    title: 'Interviews',
                    icon: <FiCalendar />,
                    path: '/dashboard/job/interviews'
                }
            ]
        },
        {
            title: 'Settings',
            icon: <FiSettings />,
            isDropdown: true,
            subItems: []
        },
        {
            title: 'Support',
            icon: <FiHelpCircle />,
            isDropdown: true,
            subItems: [
                {
                    title: 'Ticket',
                    icon: <FiMessageSquare />,
                    path: '/dashboard/support/ticket'
                }
            ]
        }
    ];

    const renderNavItem = (item) => (
        <NavLink
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
            <div className="nav-item-content">
                <span className="icon">{item.icon}</span>
                {!isCollapsed && <span className="title">{item.title}</span>}
            </div>
        </NavLink>
    );

    const renderDropdown = (item, isOpen, setIsOpen) => (
        <div className={`nav-dropdown ${isOpen ? 'open' : ''}`}>
            <div
                className={`nav-item dropdown-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="nav-item-content">
                    <span className="icon">{item.icon}</span>
                    {!isCollapsed && (
                        <>
                            <span className="title">{item.title}</span>
                            <FiChevronRight className="arrow" />
                        </>
                    )}
                </div>
            </div>
            {!isCollapsed && (
                <motion.div
                    className="dropdown-menu"
                    initial={false}
                    animate={isOpen ? {
                        opacity: 1,
                        height: 'auto',
                        marginTop: '4px',
                        marginBottom: '4px',
                        y: 0
                    } : {
                        opacity: 0,
                        height: 0,
                        marginTop: 0,
                        marginBottom: 0,
                        y: -5
                    }}
                    transition={{
                        height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.25, ease: "easeInOut" }
                    }}
                >
                    {item.subItems.map((subItem, index) => (
                        <NavLink
                            key={subItem.path || `${item.title}-${index}`}
                            to={subItem.path}
                            className={({ isActive }) =>
                                `nav-item sub-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <div className="nav-item-content">
                                <span className="icon">{subItem.icon}</span>
                                <span className="title">{subItem.title}</span>
                            </div>
                        </NavLink>
                    ))}
                </motion.div>
            )}
        </div>
    );

    return (
        <motion.aside
            className={`superadmin-sidebar ${isCollapsed ? 'collapsed' : ''}`}
            initial={false}
        >
            <div className="sidebar-header">
                <div className="logo">
                    {!isCollapsed && <span>CRM System</span>}
                </div>
                <button
                    className="collapse-btn"
                    onClick={handleToggleCollapse}
                >
                    {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                    <motion.div
                        key={item.path || index}
                        initial={false}
                    >
                        {!item.isDropdown ? (
                            renderNavItem(item)
                        ) : item.title === 'CRM' ? (
                            renderDropdown(item, isCrmOpen, setCrmOpen)
                        ) : item.title === 'User Management' ? (
                            renderDropdown(item, isUserManagementOpen, setUserManagementOpen)
                        ) : item.title === 'Communication' ? (
                            renderDropdown(item, isCommunicationOpen, setCommunicationOpen)
                        ) : item.title === 'HRM' ? (
                            renderDropdown(item, isHrmOpen, setHrmOpen)
                        ) : item.title === 'Settings' ? (
                            renderDropdown(item, isSettingsOpen, setIsSettingsOpen)
                        ) : item.title === 'Support' ? (
                            renderDropdown(item, isSupportOpen, setSupportOpen)
                        ) : item.title === 'Job' ? (
                            renderDropdown(item, isJobOpen, setJobOpen)
                        ) : (
                            renderDropdown(item, false, () => { })
                        )}
                    </motion.div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/dashboard/profile" className="nav-item profile-btn">
                    <div className="nav-item-content">
                        <span className="icon"><FiUser /></span>
                        {!isCollapsed && <span className="title">Profile</span>}
                    </div>
                </NavLink>
                <NavLink to="/logout" className="nav-item logout-btn">
                    <div className="nav-item-content">
                        <span className="icon"><FiLogOut /></span>
                        {!isCollapsed && <span className="title">Logout</span>}
                    </div>
                </NavLink>
            </div>
        </motion.aside>
    );
};

export default Sidebar; 