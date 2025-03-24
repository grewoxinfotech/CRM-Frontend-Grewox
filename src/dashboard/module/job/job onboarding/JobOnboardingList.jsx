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
            dataIndex: 'Interviewer',
            key: 'Interviewer',
            sorter: (a, b) => a.Interviewer?.localeCompare(b.Interviewer || '')
        },
        {
            title: 'Joining Date',
            dataIndex: 'JoiningDate',
            key: 'JoiningDate',
            render: (date) => date ? moment(date).format('DD MMM YYYY') : 'N/A'
        },
        {
            title: 'Days of Week',
            dataIndex: 'DaysOfWeek',
            key: 'DaysOfWeek'
        },
        {
            title: 'Salary',
            dataIndex: 'Salary',
            key: 'Salary'
        },
        {
            title: 'Salary Type',
            dataIndex: 'SalaryType',
            key: 'SalaryType'
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            key: 'Status',
            render: (status) => {
                if (!status) return <Tag color="default">N/A</Tag>;
                
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