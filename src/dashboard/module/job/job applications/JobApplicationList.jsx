import React from 'react';
import { Table, Tag, Dropdown, Button, Typography } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';

const { Text } = Typography;

const JobApplicationList = ({ applications = [], onEdit, onDelete, loading, pagination }) => {
    const { data: jobs } = useGetAllJobsQuery();

    const getJobTitle = (jobId) => {
        if (!jobs) return '...';
        const job = jobs.data.find(j => j.id === jobId);
        return job ? job.title : 'N/A';
    };

    const columns = [
        {
            title: 'Candidate',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                        <FiUser size={12} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ fontSize: '13px', color: '#1e293b' }}>{text}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>{record.email}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Job Position',
            dataIndex: 'job',
            key: 'job',
            render: (jobId) => <Text style={{ fontSize: '13px' }}>{getJobTitle(jobId)}</Text>
        },
        {
            title: 'Experience',
            dataIndex: 'total_experience',
            key: 'total_experience',
            render: (exp) => <Text type="secondary" style={{ fontSize: '12px' }}>{exp} Years</Text>
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => <Text type="secondary" style={{ fontSize: '12px' }}>{phone}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                if (status === 'selected') color = 'success';
                if (status === 'rejected') color = 'error';
                if (status === 'shortlisted') color = 'processing';
                return (
                    <Tag color={color} style={{ borderRadius: '4px', border: 'none' }}>
                        {status?.toUpperCase()}
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
                dataSource={applications}
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

export default JobApplicationList;