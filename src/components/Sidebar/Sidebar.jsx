import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiChevronLeft,
    FiChevronRight,
    FiLogOut,
    FiUser,
    FiMenu
} from 'react-icons/fi';
import { useLogout } from '../../hooks/useLogout';
import '../../styles/sidebar-shared.scss';

const Sidebar = ({ 
    menuItems = [], 
    brandName = "Grewox", 
    profilePath = "/profile",
    collapsed = false, 
    onCollapsedChange = () => { },
    isSidebarReady = true
}) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(collapsed);
    const [openDropdowns, setOpenDropdowns] = useState({});
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [floatingDropdown, setFloatingDropdown] = useState(null);
    const floatingDropdownRef = useRef(null);
    const handleLogout = useLogout();

    useEffect(() => {
        setIsCollapsed(collapsed);
    }, [collapsed]);

    // Auto-expand dropdown if a sub-item is active
    useEffect(() => {
        const newOpenDropdowns = {};
        menuItems.forEach(item => {
            if (item.isDropdown && item.subItems) {
                const hasActiveChild = item.subItems.some(sub => location.pathname === sub.path);
                if (hasActiveChild) {
                    newOpenDropdowns[item.title] = true;
                }
            }
        });
        setOpenDropdowns(prev => ({ ...prev, ...newOpenDropdowns }));
    }, [location.pathname, menuItems]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (floatingDropdownRef.current && !floatingDropdownRef.current.contains(event.target)) {
                setFloatingDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        onCollapsedChange(newState);
    };

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        document.body.classList.toggle('sidebar-open');
    };

    const handleNavigation = () => {
        if (isMobileMenuOpen) {
            handleMobileMenuToggle();
        }
    };

    const toggleDropdown = (e, title) => {
        if (isCollapsed) {
            const rect = e.currentTarget.getBoundingClientRect();
            setFloatingDropdown({
                title,
                top: rect.top,
                items: menuItems.find(item => item.title === title)?.subItems || []
            });
        } else {
            setOpenDropdowns(prev => ({
                ...prev,
                [title]: !prev[title]
            }));
        }
    };

    const renderNavItem = (item, index) => {
        if (item.isDropdown) {
            const isOpen = openDropdowns[item.title];
            const hasActiveChild = item.subItems.some(sub => location.pathname === sub.path);

            return (
                <div key={item.title || index} className={`nav-dropdown ${isOpen ? 'open' : ''} ${hasActiveChild ? 'has-active-child' : ''}`}>
                    <div 
                        className={`nav-item dropdown-trigger ${hasActiveChild ? 'parent-active' : ''}`} 
                        onClick={(e) => toggleDropdown(e, item.title)}
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
                            animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {item.subItems.map((subItem, idx) => (
                                <NavLink 
                                    key={subItem.path || idx} 
                                    to={subItem.path}
                                    className={({ isActive }) => `sub-item ${isActive ? 'active' : ''}`}
                                    onClick={handleNavigation}
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
        }

        return (
            <NavLink 
                key={item.path || index} 
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={handleNavigation}
            >
                <div className="nav-item-content">
                    <span className="icon">{item.icon}</span>
                    {!isCollapsed && <span className="title">{item.title}</span>}
                </div>
            </NavLink>
        );
    };

    return (
        <>
            <button className="mobile-menu-toggle" onClick={handleMobileMenuToggle}>
                <FiMenu />
            </button>

            {isMobileMenuOpen && (
                <div className="sidebar-overlay" onClick={handleMobileMenuToggle} />
            )}

            <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        {!isCollapsed && <span className="full-text">{brandName}</span>}
                        {isCollapsed && <span className="full-text">{brandName.charAt(0)}</span>}
                    </div>
                    <button className="collapse-btn" onClick={handleToggleCollapse}>
                        {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                    </button>
                </div>

                <div className="sidebar-nav">
                    {!isSidebarReady ? (
                        <div style={{ padding: '20px' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="skeleton-item" style={{ height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '12px' }} />
                            ))}
                        </div>
                    ) : (
                        menuItems.map((item, index) => renderNavItem(item, index))
                    )}
                </div>

                <AnimatePresence>
                    {isCollapsed && floatingDropdown && (
                        <motion.div
                            ref={floatingDropdownRef}
                            className="floating-dropdown"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            style={{
                                top: `${floatingDropdown.top}px`,
                                left: '70px'
                            }}
                        >
                            <div className="floating-header">{floatingDropdown.title}</div>
                            {floatingDropdown.items.map((subItem, idx) => (
                                <NavLink
                                    key={subItem.path || idx}
                                    to={subItem.path}
                                    className={({ isActive }) => `floating-dropdown-item ${isActive ? 'active' : ''}`}
                                    onClick={() => setFloatingDropdown(null)}
                                >
                                    <span className="icon">{subItem.icon}</span>
                                    <span className="title">{subItem.title}</span>
                                </NavLink>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="sidebar-footer">
                    <NavLink to={profilePath} className="nav-item profile-btn" onClick={handleNavigation}>
                        <div className="nav-item-content">
                            <span className="icon"><FiUser /></span>
                            {!isCollapsed && <span className="title">Profile</span>}
                        </div>
                    </NavLink>
                    <div className="nav-item profile-btn logout-btn" onClick={() => { handleLogout(); handleNavigation(); }} style={{ cursor: 'pointer' }}>
                        <div className="nav-item-content">
                            <span className="icon"><FiLogOut /></span>
                            {!isCollapsed && <span className="title">Logout</span>}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
