import React from 'react';
import { Table, Button, Space, Tooltip, Tag } from 'antd';
import { FiEdit2, FiTrash2, FiLink } from 'react-icons/fi';
import moment from 'moment';

const DocumentList = ({ documents, loading, onEdit, onDelete }) => {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name) => (
                <Tag color="blue">{name}</Tag>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            sorter: (a, b) => a.role.localeCompare(b.role),
            render: (role) => (
                <Tag color="blue">{role}</Tag>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
            render: (description) => (
            <span style={{ color: '#262626' }}>{description}</span>
        ),
       },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space className="action-buttons" size={4}>
                    <Tooltip title="Edit Document">
                        <Button
                            type="text"
                            icon={<FiEdit2 size={16} />}
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Document">
                        <Button
                            type="text"
                            danger
                            icon={<FiTrash2 size={16} />}
                            onClick={() => onDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={documents}
            loading={loading}
            rowKey="id"
            pagination={{
                total: documents?.length || 0,
                pageSize: 10,
                showTotal: (total) => `Total ${total} documents`,
                showSizeChanger: true,
                showQuickJumper: true,
                size: 'default',
                position: ['bottomRight']
            }}
        />
    );
};

export default DocumentList; 