import React, { useState, useEffect } from 'react';
import {
    Card,
    message,
    Row,
    Col,
    Button,
    Space,
} from 'antd';
import {
    FiPlus,
    FiDownload,
    FiHome,
    FiGrid,
    FiList,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from './services/userApi';
import { useGetRolesQuery } from '../../../../dashboard/module/hrm/role/services/roleApi';
import CreateUser from './CreateUser';
import EditUser from './EditUser';
import UserList from './UserList';
import UserCard from './UserCard';
import './users.scss';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import PageHeader from '../../../../components/PageHeader';

const Users = () => {
    const [searchText, setSearchText] = useState('');
    const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
    const [isEditFormVisible, setIsEditFormVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const loggedInUser = useSelector(selectCurrentUser);
    const [viewMode, setViewMode] = useState('table');

    const { data: usersData, isLoading: isLoadingUsers, refetch } = useGetUsersQuery();
    const { data: rolesData } = useGetRolesQuery({ page: 1, pageSize: -1, search: '' });
    const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const [deleteUser] = useDeleteUserMutation();

    useEffect(() => {
        if (usersData?.data) {
            const filteredData = usersData.data.filter(user => user?.created_by === loggedInUser?.username || user?.client_id === loggedInUser?.id);
            const transformedData = filteredData.map(user => ({
                id: user.id,
                username: user.username || 'N/A',
                email: user.email || 'N/A',
                phone: user.phone || 'N/A',
                status: user.status || 'inactive',
                created_at: user.createdAt || '-',
                updated_at: user.updatedAt || null,
                role_name: rolesData?.message?.data?.find(role => role.id === user.role_id)?.role_name || 'N/A',
                role_id: user.role_id,
                created_by: user.created_by,
                updated_by: user.updated_by,
                profilePic: user.profilePic || null,
            }));
            setUsers(transformedData);
        }
    }, [usersData, rolesData, loggedInUser]);

    useEffect(() => {
        const filtered = users.filter(user =>
            user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.role_name?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [users, searchText]);

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="users-page standard-page-container">
            <PageHeader
                title="Users"
                count={filteredUsers.length}
                subtitle="Manage all users in the system"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "User Management" },
                    { title: "Users" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search users..."
                onAdd={() => setIsCreateFormVisible(true)}
                addText="Add User"
                exportMenu={{
                    items: [
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                }}
                extraActions={[
                    <Space key="view-toggle" size={0} style={{ background: '#f1f5f9', padding: '2px', borderRadius: '8px' }}>
                        <Button
                            type={viewMode === 'table' ? 'primary' : 'text'}
                            icon={<FiList size={14} />}
                            onClick={() => setViewMode('table')}
                            size="small"
                            style={{ borderRadius: '6px' }}
                        />
                        <Button
                            type={viewMode === 'card' ? 'primary' : 'text'}
                            icon={<FiGrid size={14} />}
                            onClick={() => setViewMode('card')}
                            size="small"
                            style={{ borderRadius: '6px' }}
                        />
                    </Space>
                ]}
            />

            <Card className="standard-content-card">
                {viewMode === 'table' ? (
                    <UserList
                        users={filteredUsers}
                        loading={isLoadingUsers}
                        onEdit={(user) => { setSelectedUser(user); setIsEditFormVisible(true); }}
                        onDelete={async (record) => {
                            try {
                                await deleteUser(record.id).unwrap();
                                message.success('User deleted successfully');
                            } catch (e) {
                                message.error('Failed to delete user');
                            }
                        }}
                    />
                ) : (
                    <Row gutter={[12, 12]}>
                        {filteredUsers.map(user => (
                            <Col xs={24} sm={12} md={8} lg={6} key={user.id}>
                                <UserCard
                                    user={user}
                                    onEdit={(u) => { setSelectedUser(u); setIsEditFormVisible(true); }}
                                    onDelete={async (record) => {
                                        try {
                                            await deleteUser(record.id).unwrap();
                                            message.success('User deleted successfully');
                                        } catch (e) {
                                            message.error('Failed to delete user');
                                        }
                                    }}
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>

            <CreateUser
                visible={isCreateFormVisible}
                onCancel={() => setIsCreateFormVisible(false)}
                onSubmit={async (data) => {
                    try {
                        await createUser(data).unwrap();
                        message.success('User created');
                        setIsCreateFormVisible(false);
                    } catch (e) {
                        message.error('Failed to create user');
                    }
                }}
                loading={isCreating}
            />

            <EditUser
                visible={isEditFormVisible}
                onCancel={() => setIsEditFormVisible(false)}
                onSubmit={async (data) => {
                    try {
                        await updateUser({ id: data.id, data }).unwrap();
                        message.success('User updated');
                        setIsEditFormVisible(false);
                        refetch();
                    } catch (e) {
                        message.error('Failed to update user');
                    }
                }}
                loading={isUpdating}
                initialValues={selectedUser}
            />
        </div>
    );
};

export default Users;
