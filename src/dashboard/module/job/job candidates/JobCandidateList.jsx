import React from 'react';
import { Table, Tag, Typography } from 'antd';
import { FiUser } from 'react-icons/fi';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';

const { Text } = Typography;

const JobCandidateList = ({ applications = [], loading, pagination }) => {
    const { data: jobs } = useGetAllJobsQuery();

    const getJobTitle = (jobId) => {
        if (!jobs || !jobs.data) return '...';
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
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
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
            title: 'Job Title',
            dataIndex: 'job',
            key: 'job',
            render: (jobId) => <Text style={{ fontSize: '13px' }}>{getJobTitle(jobId)}</Text>
        },
        {
            title: 'Notice Period',
            dataIndex: 'notice_period',
            key: 'notice_period',
            render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text>
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text>
        },
        {
            title: 'Experience',
            dataIndex: 'total_experience',
            key: 'total_experience',
            render: (text) => <Text strong style={{ fontSize: '12px' }}>{text} Years</Text>
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

export default JobCandidateList;