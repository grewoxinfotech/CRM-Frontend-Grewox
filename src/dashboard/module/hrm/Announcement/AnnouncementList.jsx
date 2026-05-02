import React from 'react';
import { Table, Button, Dropdown, Typography, Modal, message } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiBell,
} from 'react-icons/fi';
import moment from 'moment';

const { Text } = Typography;

const AnnouncementList = ({
    loading,
    announcements = [],
    pagination = {},
    onEdit,
    onDelete,
}) => {
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Announcement',
            content: 'Are you sure?',
            onOk: () => onDelete(id),
        });
    };

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                        <FiBell size={14} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ color: '#1e293b' }}>{text}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>{record.description?.substring(0, 50)}...</Text>
                    </div>
                </div>
            ),
        },
        {
            title: "Created By",
            dataIndex: "created_by",
            key: "created_by",
            render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text || '-'}</Text>
        },
        {
            title: "Created Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => <Text type="secondary" style={{ fontSize: '12px' }}>{moment(date).format('DD MMM YYYY')}</Text>
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
                            { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit(record) },
                            { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => handleDelete(record.id) }
                        ]
                    }}
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="announcement-list-container">
            <Table
                columns={columns}
                dataSource={announcements}
                loading={loading}
                rowKey="id"
                size="small"
                className="compact-table"
                pagination={{
                    ...pagination,
                    showTotal: (total) => `Total ${total} items`
                }}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default AnnouncementList;