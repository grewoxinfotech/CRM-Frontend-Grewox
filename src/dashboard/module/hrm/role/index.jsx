import React, { useState, useEffect, useCallback } from 'react';
import { message, Space, Button, Dropdown, Menu } from 'antd';
import { FiPlus, FiDownload, FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } from './services/roleApi';
import CreateRole from './CreateRole';
import EditRole from './EditRole';
import RoleList from './RoleList';
import './role.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import PageHeader from '../../../../components/PageHeader';

const Role = () => {
    const [searchText, setSearchText] = useState('');
    const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
    const [isEditFormVisible, setIsEditFormVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [roles, setRoles] = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);

    const currentUser = useSelector(state => state.auth.user);
    const { data: rolesData, isLoading: isLoadingRoles, refetch } = useGetRolesQuery({
        page: 1,
        pageSize: 100,
        search: searchText
    });
    const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
    const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

    const debouncedSearch = useCallback(
        debounce((value) => setSearchText(value), 500),
        []
    );

    useEffect(() => {
        if (rolesData?.message?.data) {
            const transformedData = rolesData.message.data.map(role => ({
                id: role.id,
                role_name: role.role_name || 'N/A',
                permissions: role.permissions,
                client_id: role.client_id,
                created_by: role.created_by,
                updated_by: role.updated_by,
                createdAt: role.createdAt,
                updatedAt: role.updatedAt
            }));
            const filteredData = transformedData.filter(role =>
                role.created_by === currentUser?.username
            );
            setRoles(filteredData);
            setFilteredRoles(filteredData);
        }
    }, [rolesData, currentUser]);

    useEffect(() => {
        const filtered = roles.filter(role =>
            role.role_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            role.created_by?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredRoles(filtered);
    }, [roles, searchText]);

    const handleEditRole = (role) => {
        setSelectedRole({
            id: role.id,
            role_name: role.role_name,
            permissions: typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions || {}
        });
        setIsEditFormVisible(true);
    };

    const handleDeleteRole = async (roleId) => {
        try {
            await deleteRole(roleId).unwrap();
            message.success('Role deleted successfully');
            refetch();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to delete role');
        }
    };

    const handleCreateSubmit = async (formData) => {
        try {
            await createRole(formData).unwrap();
            message.success('Role created successfully');
            setIsCreateFormVisible(false);
            refetch();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to create role');
        }
    };

    const handleEditSubmit = async (formData) => {
        try {
            await updateRole({ id: formData.id, data: { role_name: formData.role_name, permissions: formData.permissions } }).unwrap();
            message.success('Role updated successfully');
            setIsEditFormVisible(false);
            setSelectedRole(null);
            refetch();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to update role');
        }
    };

    const handleExport = (type) => {
        const data = roles.map(role => ({
            'Role Name': role.role_name,
            'Created By': role.created_by,
            'Created Date': moment(role.createdAt).format('YYYY-MM-DD'),
        }));
        if (type === 'excel') {
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Roles');
            XLSX.writeFile(wb, 'roles_export.xlsx');
        } else if (type === 'pdf') {
            const doc = new jsPDF('l', 'pt', 'a4');
            doc.autoTable({ head: [Object.keys(data[0])], body: data.map(item => Object.values(item)) });
            doc.save('roles_export.pdf');
        }
        message.success(`Successfully exported as ${type.toUpperCase()}`);
    };

    const exportMenu = (
        <Menu>
            <Menu.Item key="excel" onClick={() => handleExport('excel')}>Excel</Menu.Item>
            <Menu.Item key="pdf" onClick={() => handleExport('pdf')}>PDF</Menu.Item>
        </Menu>
    );

    return (
        <div className="role-page standard-page-container">
            <PageHeader
                title="Roles"
                subtitle="Manage all roles and permissions in the system"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Roles" },
                ]}
                searchText={searchText}
                onSearch={debouncedSearch}
                onAdd={() => setIsCreateFormVisible(true)}
                addText="Add Role"
                extraActions={[
                    <Dropdown key="export" overlay={exportMenu} trigger={['click']}>
                        <Button icon={<FiDownload />}>Export</Button>
                    </Dropdown>
                ]}
            />

            <div className="standard-content-card" style={{ marginTop: '12px' }}>
                <RoleList
                    roles={filteredRoles}
                    loading={isLoadingRoles || isDeleting}
                    onEdit={handleEditRole}
                    onDelete={handleDeleteRole}
                    searchText={searchText}
                />
            </div>

            <CreateRole visible={isCreateFormVisible} onCancel={() => setIsCreateFormVisible(false)} onSubmit={handleCreateSubmit} loading={isCreating} />
            <EditRole visible={isEditFormVisible} onCancel={() => { setIsEditFormVisible(false); setSelectedRole(null); }} onSubmit={handleEditSubmit} loading={isUpdating} initialValues={selectedRole} />
        </div>
    );
};

export default Role;
