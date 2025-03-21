import React from 'react';
import { Table, Avatar, Dropdown, Button } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiUser, FiMoreVertical } from 'react-icons/fi';

const DealList = ({ onEdit, onDelete, onView }) => {
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
            title: 'Deal Name',
            dataIndex: 'dealName',
            key: 'dealName',
            sorter: (a, b) => a.dealName.localeCompare(b.dealName)
        },
        {
            title: 'Pipeline',
            dataIndex: 'pipeline',
            key: 'pipeline',
            sorter: (a, b) => a.pipeline.localeCompare(b.pipeline)
        },
        {
            title: 'Stage',
            dataIndex: 'stage',
            key: 'stage',
            sorter: (a, b) => a.stage.localeCompare(b.stage)
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            sorter: (a, b) => a.currency.localeCompare(b.currency)
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            sorter: (a, b) => a.price - b.price
        },
        {
            title: 'Closed Date',
            dataIndex: 'closedDate',
            key: 'closedDate',
            sorter: (a, b) => a.closedDate - b.closedDate
        },
        {
            title: 'Project',
            dataIndex: 'project',
            key: 'project',
            sorter: (a, b) => a.project.localeCompare(b.project)
        },
        {
            title: 'Client',
            dataIndex: 'client_id',
            key: 'client_id',
            sorter: (a, b) => a.client_id.localeCompare(b.client_id)
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
                    overlayClassName="deal-actions-dropdown"
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
            leadTitle: 'New Software Deal',
            dealName: '50000',
            pipeline: 'Deal',
            stage: 'Negotiation',
            currency: '75',
            price: 'John Smith',
            closedDate: 'john@example.com',
            project: '+1234567890',
            client_id: 'Active',
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
            className="deal-table"
        />
    );
};

export default DealList; 