import React from 'react';
import { Table, Avatar, Dropdown, Button } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiUser, FiMoreVertical } from 'react-icons/fi';

const LeadList = ({ onEdit, onDelete, onView }) => {
    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView(record),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit',
                onClick: () => onEdit(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete',
                onClick: () => onDelete(record),
                danger: true,
            },
        ],
    });

    const columns = [
        {
            title: 'Lead Title',
            dataIndex: 'leadTitle',
            key: 'leadTitle',
            sorter: (a, b) => a.leadTitle.localeCompare(b.leadTitle)
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email)
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            sorter: (a, b) => a.phone.localeCompare(b.phone)
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={getDropdownItems(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="lead-actions-dropdown"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
                        className="action-dropdown-button"
                        onClick={(e) => e.preventDefault()}
                    />
                </Dropdown>
            ),
        },
    ];

    // Dummy data for demonstration
    const dummyData = [
        {
            id: 1,
            leadTitle: 'Update Lead',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            status: 'New',
        },
        // Add more dummy data as needed
    ];

    return (
        <Table
            columns={columns}
            dataSource={dummyData}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} items`,
            }}
            className="lead-table"
        />
    );
};

export default LeadList; 