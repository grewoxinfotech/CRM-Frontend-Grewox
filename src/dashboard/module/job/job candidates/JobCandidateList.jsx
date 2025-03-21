import React from 'react';
import { Table, Space, Button, Tag, Tooltip } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiDownload } from 'react-icons/fi';
import moment from 'moment';

const JobCandidateList = ({ candidates, onEdit, onDelete, onView, loading }) => {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Notice Period',
            dataIndex: 'notice_period',
            key: 'notice_period',
            sorter: (a, b) => a.notice_period.localeCompare(b.notice_period),
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            sorter: (a, b) => a.location.localeCompare(b.location),
        },
        {
            title: 'Job',
            dataIndex: 'job',
            key: 'job',
            sorter: (a, b) => a.job.localeCompare(b.job),
        },
        {
            title: 'Current Location',
            dataIndex: 'current_location',
            key: 'current_location',
            sorter: (a, b) => a.current_location.localeCompare(b.current_location),
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            sorter: (a, b) => a.phone.localeCompare(b.phone),
        },
        {
            title: 'Total Experience',
            dataIndex: 'total_experience',
            key: 'total_experience',
            sorter: (a, b) => a.total_experience.localeCompare(b.total_experience),
        },
        {
            title: 'Applied Source',
            dataIndex: 'applied_source',
            key: 'applied_source',
            sorter: (a, b) => a.applied_source.localeCompare(b.applied_source),
        },
        
        {
            title: 'Cover Letter',
            dataIndex: 'cover_letter',
            key: 'cover_letter',
            render: (date) => date.slice(0, 10),
            sorter: (a, b) => moment(a.cover_letter).unix() - moment(b.cover_letter).unix(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                switch (status.toLowerCase()) {
                    case 'shortlisted':
                        color = 'success';
                        break;
                    case 'rejected':
                        color = 'error';
                        break;
                    case 'pending':
                        color = 'warning';
                        break;
                    case 'on hold':
                        color = 'processing';
                        break;
                    default:
                        color = 'default';
                }
                return (
                    <Tag color={color}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Tag>
                );
            },
            sorter: (a, b) => a.status.localeCompare(b.status),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={candidates}
            rowKey="id"
            loading={loading}
            pagination={{
                total: candidates?.length,
                pageSize: 10,
                showTotal: (total) => `Total ${total} candidates`,
                showSizeChanger: true,
                showQuickJumper: true,
            }}
            scroll={{ x: true }}
        />
    );
};

export default JobCandidateList; 