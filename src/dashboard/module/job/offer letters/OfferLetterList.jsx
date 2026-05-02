import React, { useMemo } from 'react';
import { Table, Tag, Dropdown, Button, Typography } from 'antd';
import {
    FiMoreVertical,
    FiEdit2,
    FiTrash2,
    FiUser,
    FiBriefcase,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';
import { useGetAllJobApplicationsQuery } from '../job applications/services/jobApplicationApi';

const { Text } = Typography;

const OfferLetterList = ({ offerLetters = [], onEdit, onDelete, loading, pagination }) => {
    const { data: jobsData } = useGetAllJobsQuery();
    const { data: applicationsData } = useGetAllJobApplicationsQuery();

    const jobMap = useMemo(() => {
        if (!jobsData?.data) return {};
        return jobsData.data.reduce((acc, job) => { acc[job.id] = job; return acc; }, {});
    }, [jobsData]);

    const applicationMap = useMemo(() => {
        if (!applicationsData?.data) return {};
        return applicationsData.data.reduce((acc, app) => { acc[app.id] = app; return acc; }, {});
    }, [applicationsData]);

    const columns = [
        {
            title: 'Candidate',
            dataIndex: 'job_applicant',
            key: 'job_applicant',
            render: (applicantId) => {
                const applicant = applicationMap[applicantId];
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca' }}>
                            <FiUser size={12} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Text strong style={{ fontSize: '13px', color: '#1e293b' }}>{applicant?.name || 'N/A'}</Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>{applicant?.email}</Text>
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Job Title',
            dataIndex: 'job',
            key: 'job',
            render: (jobId) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiBriefcase size={12} style={{ color: '#64748b' }} />
                    <Text style={{ fontSize: '13px' }}>{jobMap[jobId]?.title || 'N/A'}</Text>
                </div>
            )
        },
        {
            title: 'Offer Date',
            dataIndex: 'offer_date',
            key: 'offer_date',
            render: (date) => <Text type="secondary" style={{ fontSize: '12px' }}>{date ? dayjs(date).format('DD MMM YYYY') : '-'}</Text>
        },
        {
            title: 'Expiry Date',
            dataIndex: 'offer_expiry',
            key: 'offer_expiry',
            render: (date) => <Text type="secondary" style={{ fontSize: '12px' }}>{date ? dayjs(date).format('DD MMM YYYY') : '-'}</Text>
        },
        {
            title: 'Salary',
            dataIndex: 'salary',
            key: 'salary',
            render: (salary, record) => <Text strong style={{ fontSize: '13px', color: '#059669' }}>{record.currency} {salary}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                if (status === 'accepted') color = 'success';
                if (status === 'rejected') color = 'error';
                if (status === 'pending') color = 'warning';
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
                            { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => onDelete(record) }
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
                dataSource={offerLetters}
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

export default OfferLetterList;