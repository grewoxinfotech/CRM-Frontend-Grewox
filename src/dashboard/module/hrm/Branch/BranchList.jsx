import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import moment from 'moment';

const BranchList = ({ branches, loading, onEdit, onDelete, onView }) => {
    const columns = [
        {
            title: 'Branch',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Branch Manager',
            dataIndex: 'manager',
            key: 'manager',
            sorter: (a, b) => a.manager.localeCompare(b.manager),
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
            sorter: (a, b) => a.address.localeCompare(b.address),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle" className="action-buttons">
                    <Button
                        type="text"
                        icon={<FiEye size={16} />}
                        onClick={() => onView(record)}
                        title="View"
                    />
                    <Button
                        type="text"
                        icon={<FiEdit2 size={16} />}
                        onClick={() => onEdit(record)}
                        title="Edit"
                    />
                    <Button
                        type="text"
                        danger
                        icon={<FiTrash2 size={16} />}
                        onClick={() => onDelete(record)}
                        title="Delete"
                    />
                </Space>
            ),
        },
    ];

    return (
        <Table
            className="branch-list-table"
            columns={columns}
            dataSource={branches}
            rowKey="id"
            loading={loading}
            pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: false,
            }}
        />
    );
};

export default BranchList; 