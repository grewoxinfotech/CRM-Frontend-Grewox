import React from 'react';
import { Table, Button, Tag, Dropdown } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye } from 'react-icons/fi';
import { useGetAllJobsQuery } from './services/jobApi';
import moment from 'moment';

const JobList = ({ onEdit, onDelete, onView }) => {
    const { data: jobsData, isLoading } = useGetAllJobsQuery();

    // Ensure we have an array of jobs, even if empty
    const jobs = React.useMemo(() => {
        if (!jobsData) return [];
        return Array.isArray(jobsData) ? jobsData : jobsData.data || [];
    }, [jobsData]);

    // Define action items for dropdown
    const getActionItems = (record) => [
        {
            key: 'view',
            icon: <FiEye />,
            label: 'View Details',
            onClick: () => onView?.(record)
        },
        {
            key: 'edit',
            icon: <FiEdit2 />,
            label: 'Edit Job',
            onClick: () => onEdit?.(record)
        },
        {
            key: 'delete',
            icon: <FiTrash2 />,
            label: 'Delete Job',
            danger: true,
            onClick: () => onDelete?.(record)
        }
    ];

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => (a.title || '').localeCompare(b.title || '')
        },
        {
            title: 'Department',
            dataIndex: 'category',
            key: 'category',
            sorter: (a, b) => (a.category || '').localeCompare(b.category || '')
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location'
        },
        {
            title: 'Experience',
            dataIndex: 'workExperience',
            key: 'workExperience'
        },
        {
            title: 'Salary',
            key: 'salary',
            render: (record) => (
                <span>{record.currency || ''} {record.expectedSalary || 'N/A'}</span>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'blue';
                switch (status?.toLowerCase()) {
                    case 'active':
                        color = 'green';
                        break;
                    case 'inactive':
                        color = 'red';
                        break;
                    case 'draft':
                        color = 'orange';
                        break;
                    default:
                        color = 'blue';
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
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={{ 
                        items: getActionItems(record)
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical className="text-lg" />}
                        className="action-button"
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>
            ),
        },
    ];

    // Transform the jobs data to ensure each row has a unique key
    const tableData = React.useMemo(() => {
        return jobs.map(job => ({
            ...job,
            key: job.id
        }));
    }, [jobs]);

    return (
        <Table
            columns={columns}
            dataSource={tableData}
            loading={isLoading}
            pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} jobs`,
            }}
            className="custom-table"
            scroll={{ x: 1000 }}
            style={{
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
        />
    );
};

export default JobList; 