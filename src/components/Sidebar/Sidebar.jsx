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
        const isLocked = item.isLocked;

        const handleItemClick = (e) => {
            if (isLocked) {
                e.preventDefault();
                if (item.onLockedClick) item.onLockedClick(item);
                return;
            }
            handleNavigation();
        };

        if (item.isDropdown) {
            const isOpen = openDropdowns[item.title];
            const hasActiveChild = item.subItems.some(sub => location.pathname === sub.path);

            return (
                <div key={item.title || index} className={`nav-dropdown ${isOpen ? 'open' : ''} ${hasActiveChild ? 'has-active-child' : ''} ${isLocked ? 'locked' : ''}`}>
                    <div 
                        className={`nav-item dropdown-trigger ${hasActiveChild ? 'parent-active' : ''}`} 
                        onClick={(e) => isLocked ? handleItemClick(e) : toggleDropdown(e, item.title)}
                    >
                        <div className="nav-item-content">
                            <span className="icon">{item.icon}</span>
                            {!isCollapsed && (
                                <>
                                    <span className="title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        {item.title}
                                        {isLocked && <span className="lock-tag" style={{ 
                                            color: '#faad14', 
                                            fontSize: '12px',
                                            background: 'rgba(250, 173, 20, 0.1)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            marginLeft: '8px'
                                        }}>🔒</span>}
                                    </span>
                                    {isLocked ? (
                                        <span className="nav-badge upgrade-badge" style={{
                                            fontSize: '10px',
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                                            color: 'white',
                                            marginLeft: 'auto',
                                            marginRight: '8px',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 4px rgba(250, 173, 20, 0.3)'
                                        }}>
                                            UPGRADE
                                        </span>
                                    ) : item.badge && (
                                        <span className="nav-badge" style={{
                                            fontSize: '10px',
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #ff4d4f 0%, #f5222d 100%)',
                                            color: 'white',
                                            marginLeft: 'auto',
                                            marginRight: '8px',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 4px rgba(255, 77, 79, 0.3)'
                                        }}>
                                            {item.badge}
                                        </span>
                                    )}
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
                                    className={({ isActive }) => `sub-item ${isActive ? 'active' : ''} ${subItem.isLocked ? 'locked' : ''}`}
                                    onClick={(e) => {
                                        if (subItem.isLocked) {
                                            e.preventDefault();
                                            if (subItem.onLockedClick) subItem.onLockedClick(subItem);
                                        } else {
                                            handleNavigation();
                                        }
                                    }}
                                >
                                    <div className="nav-item-content">
                                        <span className="icon">{subItem.icon}</span>
                                        <span className="title" style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                                            {subItem.title}
                                            {subItem.isLocked && (
                                                <span className="nav-badge upgrade-badge" style={{
                                                    fontSize: '9px',
                                                    padding: '1px 5px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(250, 173, 20, 0.15)',
                                                    color: '#faad14',
                                                    marginLeft: 'auto',
                                                    fontWeight: '700',
                                                    border: '1px solid rgba(250, 173, 20, 0.3)'
                                                }}>
                                                    UPGRADE
                                                </span>
                                            )}
                                        </span>
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
                to={isLocked ? '#' : item.path}
                className={({ isActive }) => `nav-item ${!isLocked && isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={handleItemClick}
            >
                <div className="nav-item-content">
                    <span className="icon">{item.icon}</span>
                    {!isCollapsed && (
                        <span className="title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            {item.title}
                            {isLocked && (
                                <span className="nav-badge upgrade-badge" style={{
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                                    color: 'white',
                                    marginLeft: 'auto',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(250, 173, 20, 0.3)'
                                }}>
                                    UPGRADE
                                </span>
                            )}
                        </span>
                    )}
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
                    <div className="nav-item profile-btn logout-btn" onClick={() => { handleLogout(); handleNavigation(); }} style={{ cursor: 'pointer', color: '#ff4d4f' }}>
                        <div className="nav-item-content">
                            <span className="icon" style={{ color: '#ff4d4f' }}><FiLogOut /></span>
                            {!isCollapsed && <span className="title" style={{ color: '#ff4d4f', fontWeight: '500' }}>Logout</span>}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
