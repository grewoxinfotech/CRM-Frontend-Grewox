import React, { useMemo } from 'react';
import { Table, Tag, Dropdown, Button } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import moment from 'moment';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';
import { useGetAllJobApplicationsQuery } from '../job applications/services/jobApplicationApi';

const OfferLetterList = ({ offerLetters, onEdit, onDelete, onView, loading }) => {
    // Fetch jobs and applications data
    const { data: jobs, isLoading: jobsLoading } = useGetAllJobsQuery();
    const { data: applicationsData } = useGetAllJobApplicationsQuery();

    // Function to get job title by job ID
    const getJobTitle = (jobId) => {
        if (!jobs) return 'Loading...';
        const job = jobs.data.find(job => job.id === jobId);
        return job ? job.title : 'N/A';
    };

    const applicationMap = useMemo(() => {
        if (!applicationsData?.data) return {};
        return applicationsData.data.reduce((acc, application) => {
            acc[application.id] = application.name || application.applicant_name;
            return acc;
        }, {});
    }, [applicationsData]);

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
            title: 'Job',
            dataIndex: 'job',
            key: 'job',
            render: (jobId) => getJobTitle(jobId)
        },
        {
            title: 'Applicant',
            dataIndex: 'job_applicant',
            key: 'job_applicant',
            render: (applicantId) => {
                const applicantName = applicationMap[applicantId] || 'Unknown Applicant';
                return (
                    <span >
                        {applicantName}
                    </span>
                );
            },
            sorter: (a, b) => {
                const nameA = applicationMap[a.job_applicant] || '';
                const nameB = applicationMap[b.job_applicant] || '';
                return nameA.localeCompare(nameB);
            }
        },
        {
            title: 'Salary',
            dataIndex: 'salary',
            key: 'salary',
            render: (salary) => (
                <span>
                    {typeof salary === 'number' 
                        ? `$${salary.toLocaleString()}`
                        : salary
                    }
                </span>
            ),
            sorter: (a, b) => {
                const salaryA = parseFloat(a.salary) || 0;
                const salaryB = parseFloat(b.salary) || 0;
                return salaryA - salaryB;
            }
        },
        {   
            title: 'Expected Joining Date',
            dataIndex: 'expected_joining_date',
            key: 'expected_joining_date',
            render: (date) => (
                <span>
                    {date ? moment(date).format('DD MMM YYYY') : '-'}
                </span>
            )
        },
        {
            title: 'Offer Expiry Date',
            dataIndex: 'offer_expiry',
            key: 'offer_expiry',
            render: (date) => date ? moment(date).format('DD MMM YYYY') : '-'
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text) => (
                <span style={{ 
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block'
                }}>
                    {text || '-'}
                </span>
            ),
            sorter: (a, b) => (a.description || '').localeCompare(b.description || '')
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
            dataSource={offerLetters}
            rowKey="id"
            scroll={{ x: 1500 }}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} offer letters`
            }}
            style={{ background: '#ffffff', borderRadius: '8px' }}
        />
    );
};

export default OfferLetterList; 