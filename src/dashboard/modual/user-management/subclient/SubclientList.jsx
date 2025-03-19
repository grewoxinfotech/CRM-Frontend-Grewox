import React from 'react';
import { Table, Avatar } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiUser } from 'react-icons/fi';
import { useGetAllSubclientsQuery } from './services/subClientApi';

const SubclientList = ({ onEdit, onDelete, onView }) => {
    const { data: subclientsData, isLoading } = useGetAllSubclientsQuery();

    // Transform the data to ensure it's an array
    const subclients = subclientsData?.data || [];

    const columns = [
        {
            title: 'Profile',
            dataIndex: 'profilePic',
            key: 'profilePic',
            width: 80,
            render: (profilePic, record) => (
                <Avatar
                    size={40}
                    src={profilePic}
                    icon={!profilePic && <FiUser />}
                    style={{
                        backgroundColor: !profilePic ? '#1890ff' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                />
            ),
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username)
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => onView(record)}
                        className="action-button view"
                        style={{
                            border: 'none',
                            background: 'rgba(24, 144, 255, 0.1)',
                            color: '#1890ff',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <FiEye size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(record)}
                        className="action-button edit"
                        style={{
                            border: 'none',
                            background: 'rgba(24, 144, 255, 0.1)',
                            color: '#1890ff',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <FiEdit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(record)}
                        className="action-button delete"
                        style={{
                            border: 'none',
                            background: 'rgba(255, 77, 79, 0.1)',
                            color: '#ff4d4f',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <FiTrash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={subclients}
            loading={isLoading}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} items`,
            }}
            className="subclient-table"
        />
    );
};

export default SubclientList;
