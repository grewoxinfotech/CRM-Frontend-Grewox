import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import moment from 'moment';

const TrainingList = ({ trainings, loading, onEdit, onDelete }) => {
    const columns = [
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            sorter: (a, b) => a.category.localeCompare(b.category),
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
       
        {
            title: 'Link',
            dataIndex: 'link',
            key: 'link',
            sorter: (a, b) => a.link.localeCompare(b.link),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<FiEdit2 />}
                        onClick={() => onEdit(record)}
                        style={{ color: '#1890ff' }}
                    />
                    <Button
                        type="text"
                        icon={<FiTrash2 />}
                        onClick={() => onDelete(record)}
                        style={{ color: '#ff4d4f' }}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={trainings}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
            }}
        />
    );
};

export default TrainingList; 