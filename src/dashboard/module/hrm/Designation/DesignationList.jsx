import React from 'react';
import { Table, Tag, Button, Space } from 'antd';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import moment from 'moment';

const DesignationList = ({ designations, loading, onEdit, onDelete }) => {
    const columns = [
        {
            title: 'Designation',
            dataIndex: 'designation',
            key: 'designation',
            sorter: (a, b) => a.designation.localeCompare(b.designation),
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            sorter: (a, b) => a.branch.localeCompare(b.branch),
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
            dataSource={designations}
            loading={loading}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
            }}
        />
    );
};

export default DesignationList; 