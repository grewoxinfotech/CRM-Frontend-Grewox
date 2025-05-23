import React, { useState, useEffect } from 'react';
import { Table, Tag, Dropdown, Button, Input, Space, Typography } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiUser, FiBriefcase, FiPhone, FiClock, FiHash } from 'react-icons/fi';
import moment from 'moment';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';
import { useUpdateJobApplicationMutation } from './services/jobApplicationApi';
import './jobApplications.scss';

const { Text } = Typography;

const JobApplicationList = ({ applications, onEdit, onDelete, loading, pagination }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [updateJobApplication] = useUpdateJobApplicationMutation();
    const { data: jobs, isLoading: jobsLoading } = useGetAllJobsQuery();

    // Clear selections when applications data changes
    useEffect(() => {
        setSelectedRowKeys([]);
    }, [applications]);

    const handleChange = (newPagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
        if (pagination?.onChange) {
            pagination.onChange(newPagination, filters, sorter);
        }
    };

    const clearFilters = () => {
        setFilteredInfo({});
    };

    const clearAll = () => {
        setFilteredInfo({});
        setSortedInfo({});
    };

    // Function to get job title by job ID
    const getJobTitle = (jobId) => {
        if (!jobs) return 'Loading...';
        const job = jobs.data.find(job => job.id === jobId);
        return job ? job.title : 'N/A';
    };

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        await onDelete(selectedRowKeys);
        setSelectedRowKeys([]); // Clear selections after delete
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search candidate name"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Search
                        </Button>
                        <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) =>
                record.name.toLowerCase().includes(value.toLowerCase()),
            render: (text) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{
                            color: "#1890ff",
                            background: "rgba(24, 144, 255, 0.1)",
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <FiUser size={16} />
                        </div>
                        <div className="info-wrapper">
                            <div className="name">{text}</div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Job',
            dataIndex: 'job',
            key: 'job',
            sorter: (a, b) => a.job.localeCompare(b.job),
            render: (jobId) => (
                <div className="column-icon">
                    <div className="icon-bg" style={{
                        color: "#8b5cf6",
                        background: "rgba(139, 92, 246, 0.1)"
                    }}>
                        <FiBriefcase size={16} />
                    </div>
                    <Text>{getJobTitle(jobId)}</Text>
                </div>
            )
        },
        {
            title: 'Notice Period',
            dataIndex: 'notice_period',
            key: 'notice_period',
            sorter: (a, b) => a.notice_period.localeCompare(b.notice_period),
            render: (text) => (
                <div className="column-icon">
                    <div className="icon-bg" style={{
                        color: "#10b981",
                        background: "rgba(16, 185, 129, 0.1)"
                    }}>
                        <FiClock size={16} />
                    </div>
                    <Text>{text}</Text>
                </div>
            )
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            sorter: (a, b) => a.phone.localeCompare(b.phone),
            render: (text) => (
                <div className="column-icon">
                    <div className="icon-bg" style={{
                        color: "#f59e0b",
                        background: "rgba(245, 158, 11, 0.1)"
                    }}>
                        <FiPhone size={16} />
                    </div>
                    <Text>{text}</Text>
                </div>
            )
        },
        {
            title: 'Experience',
            dataIndex: 'total_experience',
            key: 'total_experience',
            sorter: (a, b) => a.total_experience.localeCompare(b.total_experience),
            render: (text) => (
                <div className="column-icon">
                    <div className="icon-bg" style={{
                        color: "#6366f1",
                        background: "rgba(99, 102, 241, 0.1)"
                    }}>
                        <FiHash size={16} />
                    </div>
                    <Text>{text} years</Text>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Shortlisted', value: 'shortlisted' },
                { text: 'Selected', value: 'selected' },
                { text: 'Rejected', value: 'rejected' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                let color;
                let bgColor;
                switch (status?.toLowerCase()) {
                    case 'pending':
                        color = '#faad14';
                        bgColor = '#fff7e6';
                        break;
                    case 'shortlisted':
                        color = '#1890ff';
                        bgColor = '#e6f7ff';
                        break;
                    case 'selected':
                        color = '#52c41a';
                        bgColor = '#f6ffed';
                        break;
                    case 'rejected':
                        color = '#ff4d4f';
                        bgColor = '#fff1f0';
                        break;
                    default:
                        color = '#8c8c8c';
                        bgColor = '#f5f5f5';
                }
                return (
                    <Tag
                        style={{
                            color: color,
                            background: bgColor,
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            textTransform: 'capitalize'
                        }}
                    >
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
            render: (_, record) => {
                const menuItems = [
                    {
                        key: 'edit',
                        icon: <FiEdit2 size={14} />,
                        label: 'Edit',
                        onClick: (e) => {
                            e.domEvent.stopPropagation();
                            onEdit(record);
                        }
                    },
                    {
                        key: 'delete',
                        icon: <FiTrash2 size={14} />,
                        label: 'Delete',
                        danger: true,
                        onClick: (e) => {
                            e.domEvent.stopPropagation();
                            onDelete(record.id);
                        }
                    }
                ];

                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Dropdown
                            menu={{
                                items: menuItems,
                                onClick: (e) => e.domEvent.stopPropagation()
                            }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button
                                type="text"
                                icon={<FiMoreVertical size={16} />}
                                className="action-button"
                            />
                        </Dropdown>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="job-list-container">
            {selectedRowKeys.length > 0 && (
                <div className="bulk-actions">
                    <Button
                        type="primary"
                        danger
                        icon={<FiTrash2 size={16} />}
                        onClick={handleBulkDelete}
                    >
                        Delete Selected ({selectedRowKeys.length})
                    </Button>
                </div>
            )}

            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={applications}
                rowKey="id"
                loading={loading}
                onChange={handleChange}
                pagination={pagination}
                scroll={{ x: 1200, y: ''}}
                className="custom-table"
                style={{
                    width: "100%",
                    minWidth: 0,
                    background: "#ffffff", 
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                }}
            />
        </div>
    );
};

export default JobApplicationList;