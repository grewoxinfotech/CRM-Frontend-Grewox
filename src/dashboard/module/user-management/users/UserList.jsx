import React, { useState } from 'react';
import { Table, Button, Tag, Dropdown, Avatar, message, Typography, Space } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiUser, FiLogIn, FiLock } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useAdminLoginMutation } from '../../../../auth/services/authApi';
import ResetPasswordModal from '../../../../superadmin/module/company/ResetPasswordModal';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';

const { Text } = Typography;

const UserList = ({ users, onEdit, onDelete, loading }) => {
    const navigate = useNavigate();
    const [adminLogin] = useAdminLoginMutation();
    const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const currentUser = useSelector(selectCurrentUser);

    const handleAdminLogin = async (user) => {
        try {
            const response = await adminLogin({ email: user.email, isClientPage: true }).unwrap();
            if (response?.success) {
                message.success('Logged in successfully');
                navigate('/dashboard');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to login');
        }
    };

    const columns = [
        {
            title: 'User',
            dataIndex: 'username',
            key: 'username',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar
                        size="small"
                        src={record.profilePic}
                        icon={!record.profilePic && <FiUser size={12} />}
                        style={{ background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ fontSize: '13px', color: '#1e293b' }}>{text}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>{record.email}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role_name',
            key: 'role_name',
            render: (role) => (
                <Tag color="blue" style={{ borderRadius: '4px', border: 'none', textTransform: 'capitalize' }}>
                    {role || 'N/A'}
                </Tag>
            )
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text || '-'}</Text>
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => <Text type="secondary" style={{ fontSize: '12px' }}>{date !== '-' ? dayjs(date).format('DD MMM YYYY') : '-'}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'success' : 'default'} style={{ borderRadius: '4px', border: 'none' }}>
                    {status?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space>
                    {record.role_name !== 'super-admin' && (
                        <Button
                            type="text"
                            icon={<FiLogIn />}
                            size="small"
                            onClick={() => handleAdminLogin(record)}
                            title="Login as User"
                            style={{ color: '#6366f1' }}
                        />
                    )}
                    <Dropdown
                        menu={{
                            items: [
                                { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit(record) },
                                { key: 'reset', icon: <FiLock />, label: 'Reset Password', onClick: () => { setSelectedUser(record); setResetPasswordModalVisible(true); } },
                                { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, disabled: record.role_name === 'super-admin', onClick: () => onDelete(record) }
                            ]
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    return (
        <div className="user-list-container">
            <Table
                dataSource={users}
                columns={columns}
                rowKey="id"
                loading={loading}
                size="small"
                className="compact-table"
                pagination={{
                    showTotal: (total) => `Total ${total} users`,
                    pageSize: 10
                }}
                scroll={{ x: 'max-content' }}
            />
            <ResetPasswordModal
                visible={resetPasswordModalVisible}
                onCancel={() => setResetPasswordModalVisible(false)}
                company={selectedUser}
                currentUserEmail={currentUser?.email}
            />
        </div>
    );
};

export default UserList;