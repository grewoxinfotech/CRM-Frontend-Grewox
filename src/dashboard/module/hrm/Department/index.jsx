import React, { useState } from 'react';
import {
    Card, message,
} from 'antd';
import {
    FiPlus, FiDownload,
    FiHome,
} from 'react-icons/fi';
import './department.scss';
import CreateDepartment from './CreateDepartment';
import { Link } from 'react-router-dom';
import DepartmentList from './DepartmentList';
import { useGetAllDepartmentsQuery } from './services/departmentApi';
import PageHeader from '../../../../components/PageHeader';
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetRolesQuery } from "../role/services/roleApi";

const Department = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filters] = useState({
        branch: undefined
    });

    const { data: departmentData, isLoading } = useGetAllDepartmentsQuery({
        search: searchText,
        ...filters
    });

    const loggedInUser = useSelector(selectCurrentUser);
    const { data: rolesData } = useGetRolesQuery(undefined, {
        skip: !loggedInUser || loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client'
    });
    const userRoleData = rolesData?.message?.data?.find(role => role.id === loggedInUser?.role_id);
    const userPermissions = React.useMemo(() => {
        if (!userRoleData?.permissions) return null;
        try {
            return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
        } catch (e) { return null; }
    }, [userRoleData]);
    const hasPermission = React.useCallback((action) => {
        if (!loggedInUser) return false;
        if (loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client') return true;
        if (!userPermissions) return false;
        const perms = userPermissions['extra-hrm-department'];
        if (!perms || perms.length === 0) return false;
        return (perms[0]?.permissions || []).includes(action);
    }, [loggedInUser, userPermissions]);

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="department-page standard-page-container">
            <PageHeader
                title="Departments"
                count={departmentData?.data?.length || 0}
                subtitle="Manage all departments in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "HRM" },
                    { title: "Departments" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search departments..."
                onAdd={hasPermission('create') ? () => setIsCreateModalOpen(true) : undefined}
                addText="Add Department"
                exportMenu={hasPermission('export') ? {
                    items: [
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                } : undefined}
            />

            <Card className="standard-content-card">
                <DepartmentList
                    onEdit={(department) => { setSelectedDepartment(department); setIsEditModalOpen(true); }}
                    searchText={searchText}
                    filters={filters}
                    loading={isLoading}
                    hasPermission={hasPermission}
                />
            </Card>

            <CreateDepartment
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onSubmit={() => { setIsCreateModalOpen(false); message.success('Department created successfully'); }}
            />

            <CreateDepartment
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedDepartment(null);
                }}
                onSubmit={() => { setIsEditModalOpen(false); setSelectedDepartment(null); message.success('Department updated successfully'); }}
                isEditing={true}
                initialValues={selectedDepartment}
            />
        </div>
    );
};

export default Department;
