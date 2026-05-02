import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header';
import Footer from './footer';
import Sidebar from '../../components/Sidebar/Sidebar';
import { getSuperAdminMenuItems } from '../../config/sidebarItems';
import './layout.scss';

import FloatingAIBtn from '../../components/AISupport/FloatingAIBtn';

const SuperAdminLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleSidebarToggle = (collapsed) => {
        setSidebarCollapsed(collapsed);
        localStorage.setItem('superadmin_sidebar_collapsed', JSON.stringify(collapsed));
    };

    useEffect(() => {
        const savedState = localStorage.getItem('superadmin_sidebar_collapsed');
        if (savedState !== null) {
            setSidebarCollapsed(JSON.parse(savedState));
        }
    }, []);

    const menuItems = getSuperAdminMenuItems();

    return (
        <div className={`superadmin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar
                menuItems={menuItems}
                brandName="Super Admin"
                profilePath="/superadmin/profile"
                collapsed={sidebarCollapsed}
                onCollapsedChange={handleSidebarToggle}
            />
            <div className="main-content">
                <Header />
                <div className="page-content">
                    <Outlet />
                </div>
                <Footer />
            </div>
            <FloatingAIBtn />
        </div>
    );
};

export default SuperAdminLayout; 