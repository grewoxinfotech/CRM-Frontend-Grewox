import React from 'react';
import { Table, Space, Button, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';

const PolicyList = ({ loading, policies = [], onEditPolicy, onDeletePolicy, onView, pagination }) => {
    const columns = [
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            sorter: (a, b) => (a.branch || '').localeCompare(b.branch || ''),
            render: (text) => text || 'N/A',
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
            render: (text) => text || 'N/A',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text) => text || 'N/A',
        },
        {
            title: 'Created By',
            dataIndex: 'created_by',
            key: 'created_by',
            render: (text) => text || 'N/A',
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? moment(date).format('YYYY-MM-DD') : 'N/A',
            sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <Button 
                            type="text" 
                            icon={<EyeOutlined />}
                            onClick={() => onView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button 
                            type="text" 
                            icon={<EditOutlined />}
                            onClick={() => onEditPolicy(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={() => onDeletePolicy(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={policies}
            rowKey="id"
            pagination={pagination}
            locale={{
                emptyText: 'No policies found'
            }}
        />
    );
};

export default PolicyList; 