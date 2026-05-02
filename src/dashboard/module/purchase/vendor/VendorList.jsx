import React, { useState } from 'react';
import { Table, Button, Tag, Dropdown, Typography, Avatar } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiUser, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;

const VendorList = ({
    onEdit,
    onDelete,
    loading,
    data,
    pagination,
    onChange
}) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const columns = [
        {
            title: 'Vendor Name',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            render: (name) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar 
                        size={32} 
                        icon={<FiUser />} 
                        style={{ backgroundColor: '#1890ff' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ color: '#1e293b' }}>{name || "N/A"}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Vendor</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Contact',
            key: 'contact',
            width: 200,
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ fontSize: '13px' }}><FiPhone size={12} /> {record.contact || "N/A"}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}><FiMail size={12} /> {record.email || "N/A"}</Text>
                </div>
            )
        },
        {
            title: 'Location',
            key: 'location',
            width: 200,
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiMapPin size={12} style={{ color: '#64748b' }} />
                    <Text style={{ fontSize: '13px' }}>
                        {[record.city, record.country].filter(Boolean).join(', ') || 'N/A'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const color = status?.toLowerCase() === 'inactive' ? 'error' : 'success';
                return (
                    <Tag color={color} className="status-tag">
                        {status || 'Active'}
                    </Tag>
                );
            }
        },
        {
            title: "Actions",
            key: "actions",
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            { key: 'view', icon: <FiEye />, label: 'View', onClick: () => {} },
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
        <div className="vendor-list-container">
            <Table
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                }}
                columns={columns}
                dataSource={data?.data || []}
                rowKey="id"
                size="small"
                loading={loading}
                className="compact-table"
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} vendors`,
                }}
                onChange={onChange}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default VendorList;