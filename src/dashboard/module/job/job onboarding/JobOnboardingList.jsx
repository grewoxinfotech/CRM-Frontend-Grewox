import React from 'react';
import { Table, Tag, Dropdown, Button } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import moment from 'moment';

const JobOnboardingList = ({ onboardings, onEdit, onDelete, onView, loading }) => {
    // Function to get menu items for each row
    const getActionItems = (record) => [
        {
            key: 'view',
            icon: <FiEye style={{ fontSize: '16px' }} />,
            label: 'View',
            onClick: () => onView(record)
        },
        {
            key: 'edit',
            icon: <FiEdit2 style={{ fontSize: '16px' }} />,
            label: 'Edit',
            onClick: () => onEdit(record)
        },
        {
            key: 'delete',
            icon: <FiTrash2 style={{ fontSize: '16px', color: '#ff4d4f' }} />,
            label: 'Delete',
            danger: true,
            onClick: () => onDelete(record)
        }
    ];

    const columns = [
        {
            title: 'Interviewer',
            dataIndex: 'interviewer',
            key: 'interviewer',
            sorter: (a, b) => a.interviewer.localeCompare(b.interviewer)
        },
        {
            title: 'Joining Date',
            dataIndex: 'joining_date',
            key: 'joining_date',
            render: (date) => moment(date).format('DD MMM YYYY')
        },
        {
            title: 'Days of Week',
            dataIndex: 'days_of_week',
            key: 'days_of_week'
        },
        {
            title: 'Salary',
            dataIndex: 'salary',
            key: 'salary'
        },
        {
            title: 'Salary Type',
            dataIndex: 'salary_type',
            key: 'salary_type'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color;
                switch (status.toLowerCase()) {
                    case 'pending':
                        color = 'gold';
                        break;
                    case 'in_progress':
                        color = 'blue';
                        break;
                    case 'completed':
                        color = 'green';
                        break;
                    case 'delayed':
                        color = 'red';
                        break;
                    default:
                        color = 'default';
                }
                return (
                    <Tag color={color} style={{ textTransform: 'capitalize' }}>
                        {status.replace(/_/g, ' ')}
                    </Tag>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={{ items: getActionItems(record) }}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayStyle={{ minWidth: '150px' }}
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical style={{ fontSize: '18px' }} />}
                        style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0f2f5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    />
                </Dropdown>
            )
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={onboardings}
            loading={loading}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} onboardings`
            }}
            style={{ background: '#ffffff', borderRadius: '8px' }}
        />
    );
};

export default JobOnboardingList; 