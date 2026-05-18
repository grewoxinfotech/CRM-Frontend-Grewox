import React, { useState } from 'react';
import { Card, message } from 'antd';
import { FiPlus, FiHome, FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import CreateDesignation from './CreateDesignation';
import DesignationList from './DesignationList';
import './designation.scss';
import { useGetAllDesignationsQuery } from './services/designationApi';
import PageHeader from '../../../../components/PageHeader';
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetRolesQuery } from "../role/services/roleApi";

const Designation = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDesignation, setSelectedDesignation] = useState(null);
    const [searchText, setSearchText] = useState('');

    const { data: designationData, isLoading } = useGetAllDesignationsQuery();

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
        const perms = userPermissions['extra-hrm-designation'];
        if (!perms || perms.length === 0) return false;
        return (perms[0]?.permissions || []).includes(action);
    }, [loggedInUser, userPermissions]);

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="designation-page standard-page-container">
            <PageHeader
                title="Designations"
                count={designationData?.message?.data?.length || 0}
                subtitle="Manage all designations in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "HRM" },
                    { title: "Designation" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search designations..."
                onAdd={hasPermission('create') ? () => { setIsEditing(false); setSelectedDesignation(null); setIsModalOpen(true); } : undefined}
                addText="Add Designation"
                exportMenu={hasPermission('export') ? {
                    items: [
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                } : undefined}
            />

            <Card className="standard-content-card">
                <DesignationList
                    onEdit={(record) => { setSelectedDesignation(record); setIsEditing(true); setIsModalOpen(true); }}
                    searchText={searchText}
                    loading={isLoading}
                    hasPermission={hasPermission}
                />
            </Card>

            <CreateDesignation
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedDesignation(null);
                    setIsEditing(false);
                }}
                onSubmit={() => { setIsModalOpen(false); setSelectedDesignation(null); setIsEditing(false); }}
                isEditing={isEditing}
                initialValues={selectedDesignation}
            />
        </div>
    );
};

export default Designation;
