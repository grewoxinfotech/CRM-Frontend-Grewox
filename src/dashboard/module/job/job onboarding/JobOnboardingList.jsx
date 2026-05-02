import React from 'react';
import { Table, Tag, Dropdown, Button, Typography } from 'antd';
import {
    FiMoreVertical,
    FiEdit2,
    FiTrash2,
    FiUser,
    FiCalendar,
} from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;

const JobOnboardingList = ({ onboardings = [], onEdit, onDelete, loading, pagination }) => {
    const columns = [
        {
            title: 'Employee',
            dataIndex: 'Interviewer',
            key: 'Interviewer',
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                        <FiUser size={12} />
                    </div>
                    <Text strong style={{ fontSize: '13px', color: '#1e293b' }}>{text}</Text>
                </div>
            ),
        },
        {
            title: 'Joining Date',
            dataIndex: 'JoiningDate',
            key: 'JoiningDate',
            render: (date) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCalendar size={12} style={{ color: '#64748b' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>{dayjs(date).format('DD MMM YYYY')}</Text>
                </div>
            ),
        },
        {
            title: 'Salary',
            dataIndex: 'Salary',
            key: 'Salary',
            render: (salary, record) => <Text strong style={{ fontSize: '13px', color: '#059669' }}>{record.Currency} {salary}</Text>
        },
        {
            title: 'Salary Type',
            dataIndex: 'SalaryType',
            key: 'SalaryType',
            render: (text) => <Text type="secondary" style={{ fontSize: '12px', textTransform: 'capitalize' }}>{text}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            key: 'Status',
            render: (status) => {
                let color = 'default';
                if (status === 'completed') color = 'success';
                if (status === 'delayed') color = 'error';
                if (status === 'in_progress') color = 'processing';
                if (status === 'pending') color = 'warning';
                return (
                    <Tag color={color} style={{ borderRadius: '4px', border: 'none' }}>
                        {status?.replace(/_/g, ' ')?.toUpperCase()}
                    </Tag>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit(record) },
                            { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => onDelete(record.id) }
                        ]
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
                </Dropdown>
            )
        }
    ];

    return (
        <div className="job-list-container">
            <Table
                columns={columns}
                dataSource={onboardings}
                rowKey="id"
                loading={loading}
                size="small"
                className="compact-table"
                pagination={{
                    ...pagination,
                    showTotal: (total) => `Total ${total} items`
                }}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default JobOnboardingList;