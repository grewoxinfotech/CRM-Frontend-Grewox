import React, { useState } from 'react';
import {
    Card,
    message,
} from 'antd';
import {
    FiPlus,
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import './announcement.scss';
import CreateAnnouncement from './CreateAnnouncement';
import AnnouncementList from './AnnouncementList';
import { Link } from 'react-router-dom';
import { useCreateAnnouncementMutation, useUpdateAnnouncementMutation, useDeleteAnnouncementMutation, useGetAnnouncementsQuery } from './services/announcementApi';
import PageHeader from '../../../../components/PageHeader';
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetRolesQuery } from "../role/services/roleApi";

const Announcement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [createAnnouncement] = useCreateAnnouncementMutation();
    const [updateAnnouncement] = useUpdateAnnouncementMutation();
    const [deleteAnnouncement] = useDeleteAnnouncementMutation();

    const { data: response, isLoading } = useGetAnnouncementsQuery({
        page: currentPage,
        pageSize,
        search: searchText
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
        const perms = userPermissions['extra-hrm-announcement'];
        if (!perms || perms.length === 0) return false;
        return (perms[0]?.permissions || []).includes(action);
    }, [loggedInUser, userPermissions]);

    const announcements = response?.message?.data || [];
    const pagination = response?.message?.pagination || { total: 0 };

    const handleFormSubmit = async (formData) => {
        try {
            if (editingAnnouncement) {
                await updateAnnouncement({ id: editingAnnouncement.id, data: formData }).unwrap();
                message.success('Announcement updated successfully');
            } else {
                await createAnnouncement(formData).unwrap();
                message.success('Announcement created successfully');
            }
            setIsModalOpen(false);
            setEditingAnnouncement(null);
        } catch (error) {
            message.error(error?.data?.message || 'Operation failed');
        }
    };

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="announcement-page standard-page-container">
            <PageHeader
                title="Announcements"
                count={pagination.total}
                subtitle="Manage all announcements in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
                    { title: "HRM" },
                    { title: "Announcements" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search announcements..."
                onAdd={hasPermission('create') ? () => { setEditingAnnouncement(null); setIsModalOpen(true); } : undefined}
                addText="Create Announcement"
                exportMenu={hasPermission('export') ? {
                    items: [
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                } : undefined}
            />

            <Card className="standard-content-card">
                <AnnouncementList
                    loading={isLoading}
                    announcements={announcements}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: pagination.total,
                        onChange: setCurrentPage,
                        onSizeChange: (size) => { setPageSize(size); setCurrentPage(1); }
                    }}
                    onEdit={(record) => { setEditingAnnouncement(record); setIsModalOpen(true); }}
                    onDelete={async (id) => {
                        try {
                            await deleteAnnouncement(id).unwrap();
                            message.success('Deleted successfully');
                        } catch (error) {
                            message.error('Failed to delete');
                        }
                    }}
                    hasPermission={hasPermission}
                />
            </Card>

            <CreateAnnouncement
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); setEditingAnnouncement(null); }}
                onSubmit={handleFormSubmit}
                isEditing={!!editingAnnouncement}
                initialValues={editingAnnouncement}
            />
        </div>
    );
};

export default Announcement;
