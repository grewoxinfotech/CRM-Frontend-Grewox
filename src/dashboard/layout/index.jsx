import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header';
import Sidebar from './sidebar';
import Footer from './footer';
import './layout.scss';
import { useGetRolesQuery } from '../module/hrm/role/services/roleApi';
import { selectCurrentUser } from '../../auth/services/authSlice';
import { useSelector } from 'react-redux';

const DashboardLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { data: rolesData, isLoading: isLoadingRoles, refetch } = useGetRolesQuery();
    const loggedInUser = useSelector(selectCurrentUser);

    // Find user's role data
    const userRoleData = rolesData?.data?.find(role => role.id === loggedInUser?.role_id);
    
    // Parse permissions if they exist
    const userPermissions = userRoleData?.permissions ? JSON.parse(userRoleData.permissions) : null;

    console.log("User Role Data:", userRoleData);
    console.log("User Permissions:", userPermissions);

    const handleSidebarToggle = (collapsed) => {
        setSidebarCollapsed(collapsed);
        localStorage.setItem('dashboard_sidebar_collapsed', JSON.stringify(collapsed));
    };

    useEffect(() => {
        const savedState = localStorage.getItem('dashboard_sidebar_collapsed');
        if (savedState !== null) {
            setSidebarCollapsed(JSON.parse(savedState));
        }
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar
                collapsed={sidebarCollapsed}
                onCollapsedChange={handleSidebarToggle}
                userPermissions={userPermissions}
            />
            <div className="main-content">
                <Header />
                <div className="page-content">
                    <Outlet />
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default DashboardLayout; 