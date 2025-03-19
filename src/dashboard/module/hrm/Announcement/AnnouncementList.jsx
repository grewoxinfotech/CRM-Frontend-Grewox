import React from 'react';
import { Table, Button, Space, Tooltip, Tag } from 'antd';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import moment from 'moment';

const AnnouncementList = ({ announcements, loading, onEdit, onDelete }) => {
    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
            render: (title) => (
                <Tag color="blue">{title}</Tag>
            ),
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            sorter: (a, b) => a.branch.localeCompare(b.branch),
            render: (branch) => (
                <Tag color="blue">{branch}</Tag>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => a.date.localeCompare(b.date),
            render: (date) => (
                <Tag color="blue">{moment(date).format('DD-MM-YYYY')}</Tag>
            ),
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            sorter: (a, b) => a.time.localeCompare(b.time),
            render: (time) => (
                <Tag color="blue">{time}</Tag>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text) => (
                <span style={{ color: '#262626' }}>{text}</span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space className="action-buttons" size={4}>
                    <Tooltip title="Edit Announcement">
                        <Button
                            type="text"
                            icon={<FiEdit2 size={16} />}
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Announcement">
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
            dataSource={announcements}
            loading={loading}
            rowKey="id"
            pagination={{
                total: announcements?.length || 0,
                pageSize: 10,
                showTotal: (total) => `Total ${total} announcements`,
                showSizeChanger: true,
                showQuickJumper: true,
                size: 'default',
                position: ['bottomRight']
            }}
        />
    );
};

export default AnnouncementList; 