import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiHome,
    FiSettings,
    FiLogOut,
    FiChevronLeft,
    FiChevronRight,
    FiBriefcase,
    FiPackage,
    FiUsers,
    FiFileText,
    FiShield,
    FiMessageSquare,
    FiUser,
    FiDollarSign,
    FiGlobe,
    FiCreditCard,
    FiEdit3,
    FiBox,
    FiHardDrive,
    FiMenu
} from 'react-icons/fi';
import { useLogout } from '../../../hooks/useLogout';
import './sidebar.scss';

const Sidebar = ({ collapsed = false, onCollapsedChange = () => { } }) => {
    const [isCollapsed, setIsCollapsed] = useState(collapsed);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const floatingDropdownRef = useRef(null);
    const handleLogout = useLogout();

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

    // Handle mobile menu toggle
    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        document.body.classList.toggle('sidebar-open');
    };

    // Close mobile menu on navigation
    const handleNavigation = () => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
            document.body.classList.remove('sidebar-open');
        }
    };

    // Close mobile menu on outside click
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('sidebar-overlay')) {
            setIsMobileMenuOpen(false);
            document.body.classList.remove('sidebar-open');
        }
    };

    // Clean up body class on unmount
    useEffect(() => {
        return () => {
            document.body.classList.remove('sidebar-open');
        };
    }, []);

    const menuItems = [
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

    const renderSettingsDropdown = (item) => {
        const isSubItemActive = item.subItems.some(subItem => {
            const currentPath = window.location.pathname;
            return currentPath === subItem.path;
        });

        return (
            <div className={`nav-dropdown ${isSettingsOpen ? 'open' : ''}`}>
                <div
                    className={`nav-item dropdown-trigger ${isSettingsOpen || isSubItemActive ? 'active' : ''}`}
                    onClick={() => {
                        if (isCollapsed) {
                            setOpenDropdown(openDropdown === item.title ? null : item.title);
                        } else {
                            setIsSettingsOpen(!isSettingsOpen);
                        }
                    }}
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
                        animate={isSettingsOpen ?
                            {
                                opacity: 1,
                                height: 'auto',
                                marginTop: '4px',
                                marginBottom: '4px',
                                y: 0
                            } :
                            {
                                opacity: 0,
                                height: 0,
                                marginTop: 0,
                                marginBottom: 0,
                                y: -5
                            }
                        }
                        transition={{
                            height: {
                                duration: 0.4,
                                ease: [0.4, 0, 0.2, 1]
                            },
                            opacity: {
                                duration: 0.25,
                                ease: "easeInOut"
                            },
                            y: {
                                duration: 0.3,
                                ease: [0.4, 0, 0.2, 1]
                            },
                            marginTop: {
                                duration: 0.25,
                                ease: "easeInOut"
                            },
                            marginBottom: {
                                duration: 0.25,
                                ease: "easeInOut"
                            }
                        }}
                    >
                        {item.subItems.map((subItem, index) => (
                            <NavLink
                                key={subItem.path}
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
    };

    const handleDropdownToggle = (item) => {
        if (isCollapsed) {
            if (item.isDropdown) {
                setOpenDropdown(openDropdown === item.title ? null : item.title);
            }
        } else {
            if (item.isDropdown) {
                setIsSettingsOpen(!isSettingsOpen);
            }
        }
    };

    const handleFloatingDropdownClose = () => {
        setOpenDropdown(null);
    };

    return (
        <>
            <button className="mobile-menu-toggle" onClick={handleMobileMenuToggle}>
                <FiMenu />
            </button>

            {isMobileMenuOpen && (
                <div className="sidebar-overlay" onClick={handleOverlayClick} />
            )}

            <aside className={`superadmin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                        <span className="full-text" style={{ display: isCollapsed ? 'none' : 'inline' }}>Super Admin</span>
                </div>
                    <button className="collapse-btn" onClick={handleToggleCollapse}>
                    {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
                    <button className="mobile-close-btn" onClick={handleMobileMenuToggle}>
                        <FiChevronLeft />
                    </button>
            </div>

                <div className="sidebar-nav">
                    {menuItems.map((item) => (
                        item.isDropdown ? (
                            renderSettingsDropdown(item)
                        ) : (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                onClick={handleNavigation}
                            >
                                <div className="nav-item-content">
                                    <span className="icon">{item.icon}</span>
                                    {!isCollapsed && <span className="title">{item.title}</span>}
                                </div>
                                </NavLink>
                        )
                        ))}
                </div>

            <div className="sidebar-footer">
                    <NavLink to="/superadmin/profile" className="nav-item profile-btn" onClick={handleNavigation}>
                    <div className="nav-item-content">
                        <span className="icon"><FiUser /></span>
                        {!isCollapsed && <span className="title">Profile</span>}
                    </div>
                </NavLink>
                <NavLink
                    to="/logout"
                        onClick={(e) => {
                            e.preventDefault();
                            handleNavigation();
                            handleLogout();
                        }}
                        className="nav-item profile-btn"
                >
                    <div className="nav-item-content">
                        <span className="icon">
                            <FiLogOut />
                        </span>
                        {!isCollapsed && <span className="title">Logout</span>}
                    </div>
                </NavLink>
            </div>
            </aside>
        </>
    );
};

export default Sidebar;
