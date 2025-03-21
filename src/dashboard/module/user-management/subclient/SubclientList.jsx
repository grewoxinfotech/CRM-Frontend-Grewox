import React from 'react';
import { Table, Avatar, Dropdown, Button } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiUser, FiMoreVertical } from 'react-icons/fi';
import { useGetAllSubclientsQuery } from './services/subClientApi';

const SubclientList = ({ onEdit, onDelete, onView }) => {
    const { data: subclientsData, isLoading } = useGetAllSubclientsQuery();

    // Transform the data to ensure it's an array
    const subclients = subclientsData?.data || [];

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
            title: 'Profile',
            dataIndex: 'profilePic',
            key: 'profilePic',
            width: 80,
            render: (profilePic, record) => (
                <Avatar
                    size={40}
                    src={profilePic}
                    icon={!profilePic && <FiUser />}
                    style={{
                        backgroundColor: !profilePic ? '#1890ff' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                />
            ),
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username)
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
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
                    overlayClassName="subclient-actions-dropdown"
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

    return (
        <Table
            columns={columns}
            dataSource={subclients}
            // loading={isLoading}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} items`,
            }}
            className="subclient-table"
        />
    );
};

export default SubclientList;
