import React from 'react';
import { Table, Button, Tag, Popconfirm } from 'antd';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import moment from 'moment';

const UserList = ({ users, loading, onEdit, onDelete, currentPage, onPageChange }) => {
    const getRoleColor = (role) => {
        const roleColors = {
            'super-admin': 'purple',
            'client': 'blue',
            'sub-client': 'cyan',
            'employee': 'green',
            'o': 'default'
        };
        return roleColors[role] || 'default';
    };

    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => (a.username || '').localeCompare(b.username || ''),
            render: (text) => (
                <div style={{
                    fontWeight: 500,
                    color: '#262626',
                    fontSize: '14px'
                }}>
                    {text || 'N/A'}
                </div>
            ),
            width: '25%',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => (
                <span style={{ color: '#595959', fontSize: '14px' }}>
                    {text || 'N/A'}
                </span>
            ),
            width: '30%',
        },
        {
            title: 'Role',
            dataIndex: 'role_name',
            key: 'role_name',
            render: (role) => (
                <Tag color={getRoleColor(role)} style={{
                    textTransform: 'capitalize',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px'
                }}>
                    {role || 'N/A'}
                </Tag>
            ),
            sorter: (a, b) => (a.role_name || '').localeCompare(b.role_name || ''),
            width: '15%',
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => (
                <span style={{ color: '#8c8c8c', fontSize: '14px' }}>
                    {date ? moment(date).format('YYYY-MM-DD HH:mm') : '-'}
                </span>
            ),
            sorter: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
            width: '20%',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="action-buttons">
                    <Button
                        type="text"
                        icon={<FiEdit2 size={16} />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(record);
                        }}
                        title="Edit User"
                    />
                    {record.role_name !== 'Super Admin' && (
                        <Popconfirm
                            title="Are you sure you want to delete this user?"
                            onConfirm={(e) => {
                                e.stopPropagation();
                                onDelete(record);
                            }}
                            okText="Yes"
                            cancelText="No"
                            placement="left"
                        >
                            <Button
                                type="text"
                                icon={<FiTrash2 size={16} />}
                                danger
                                title="Delete User"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Popconfirm>
                    )}
                </div>
            ),
            width: '100px',
            align: 'center',
        },
    ];

    return (
        <Table
            dataSource={users}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={{
                current: currentPage,
                pageSize: 10,
                total: users.length,
                showSizeChanger: true,
                showQuickJumper: false,
                onChange: onPageChange,
                showTotal: (total) => `Total ${total} items`,
            }}
        />
    );
};

export default UserList; 