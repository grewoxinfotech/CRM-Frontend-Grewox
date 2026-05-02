import React from 'react';
import { Table, Button, Tag, Dropdown, Avatar, Typography } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiUser } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;

const SubclientList = ({ subclients, loading, onEdit, onDelete }) => {
    const columns = [
        {
            title: 'Subclient',
            dataIndex: 'username',
            key: 'username',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar
                        size="small"
                        src={record.profilePic}
                        icon={!record.profilePic && <FiUser size={12} />}
                        style={{ background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                <Tag color="cyan" style={{ borderRadius: '4px', border: 'none', textTransform: 'capitalize' }}>
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
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit(record) },
                            { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => onDelete(record) }
                        ]
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="subclient-list-container">
            <Table
                dataSource={subclients}
                columns={columns}
                rowKey="id"
                loading={loading}
                size="small"
                className="compact-table"
                pagination={{
                    showTotal: (total) => `Total ${total} items`,
                    pageSize: 10
                }}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default SubclientList;
