import React from 'react';
import { Table, Avatar, Tag, Tooltip, Button, Dropdown } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiUser, FiMoreVertical } from 'react-icons/fi';
import { useGetAllEmployeesQuery } from './services/employeeApi';
import moment from 'moment';

const EmployeeList = ({ onEdit, onDelete, onView }) => {
    const { data: employeesData, isLoading } = useGetAllEmployeesQuery({
        page: 1,
        limit: 10,
        search: '',
        branchId: '',
        department: '',
        designation: '',
        status: ''
    });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye  />,
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
            width: 60,
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
            title: 'Name',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => (a.username || '').localeCompare(b.username || ''),
            render: (username, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span>{username || 'N/A'}</span>
                </div>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: email => email || 'N/A'
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: phone => phone || 'N/A'
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            render: department => department || 'N/A',
        },
        {
            title: 'Designation',
            dataIndex: 'designation',
            key: 'designation',
            render: designation => designation || 'N/A'
        },
        {
            title: 'Branch',
            dataIndex: ['branch', 'name'],
            key: 'branch',
            render: (branchName) => branchName || 'N/A'
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={getDropdownItems(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="employee-actions-dropdown"
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
            dataSource={employeesData?.data || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} employees`,
            }}
            scroll={{ x: 1200 }}
            size="middle"
            className="employee-table"
        />
    );
};

export default EmployeeList;
