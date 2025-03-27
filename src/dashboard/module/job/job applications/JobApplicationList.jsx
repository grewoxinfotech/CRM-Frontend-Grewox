import React from 'react';
import { Table, Tag, Dropdown, Button, message } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import moment from 'moment';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';
import { useUpdateJobApplicationMutation } from './services/jobApplicationApi';


const JobApplicationList = ({ applications, onEdit, onDelete, onView, loading }) => {
    const [updateJobApplication] = useUpdateJobApplicationMutation();
    const { data: jobs, isLoading: jobsLoading } = useGetAllJobsQuery();
    

    // Function to get job title by job ID
    const getJobTitle = (jobId) => {
        if (!jobs) return 'Loading...';
        const job = jobs.data.find(job => job.id === jobId);
        return job ? job.title : 'N/A';
    };

 

    // Function to get menu items for each row
    const getActionItems = (record) => [
        {
            key: 'view',
            icon: <FiEye style={{ fontSize: '16px' }} />,
            label: 'View',
            onClick: () => onView?.(record)
        },
        {
            key: 'edit',
            icon: <FiEdit2 style={{ fontSize: '16px' }} />,
            label: 'Edit',
            onClick: () => onEdit?.(record)
        },
        {
            key: 'delete',
            icon: <FiTrash2 style={{ fontSize: '16px', color: '#ff4d4f' }} />,
            label: 'Delete',
            danger: true,
            onClick: () => onDelete?.(record)
        }
    ];

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name)
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
            render: (jobId) => getJobTitle(jobId)
        },
        {
            title: 'Current Location',
            dataIndex: 'current_location',
            key: 'current_location'
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
           
        },
        {
            title: 'Experience',
            dataIndex: 'total_experience',
            key: 'total_experience'
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
                let color;
                switch (status?.toLowerCase()) {
                    case 'pending': color = 'gold'; break;
                    case 'shortlisted': color = 'blue'; break;
                    case 'selected': color = 'green'; break;
                    case 'rejected': color = 'red'; break;
                    default: color = 'default';
                }
                return (
                    <Tag color={color} style={{ textTransform: 'capitalize' }}>
                        {status?.replace(/_/g, ' ') || 'N/A'}
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
            dataSource={applications}
            rowKey="id"
            scroll={{ x: 1500 }}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} applications`
            }}
            style={{ background: '#ffffff', borderRadius: '8px' }}
        />
    );
};

export default JobApplicationList;