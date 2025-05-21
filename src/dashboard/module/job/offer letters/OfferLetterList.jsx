import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Dropdown, Button, Input, Space, Typography, Menu } from 'antd';
import {
    FiMoreVertical,
    FiEdit2,
    FiTrash2,
    FiSearch,
    FiUser,
    FiBriefcase,
    FiFileText,
    FiEye,
    FiCalendar,
    FiDollarSign,
    FiClock
} from 'react-icons/fi';
import moment from 'moment';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';
import { useGetAllJobApplicationsQuery } from '../job applications/services/jobApplicationApi';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';
import './offerLetters.scss';

const { Text } = Typography;

const OfferLetterList = ({ offerLetters = [], onEdit, onDelete, onView, loading, pagination }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Fetch jobs and applications data
    const { data: jobsData, isLoading: jobsLoading } = useGetAllJobsQuery();
    const { data: applicationsData } = useGetAllJobApplicationsQuery();

    // Fetch currency data
    const { data: currencyData } = useGetAllCurrenciesQuery();

    // console.log('Jobs Data:', jobsData);
    // console.log('Applications Data:', applicationsData);
    // console.log('Offer Letters:', offerLetters);

    // Create memoized maps for jobs and applications
    const jobMap = useMemo(() => {
        if (!jobsData?.data) return {};
        return jobsData.data.reduce((acc, job) => {
            acc[job.id] = job;
            return acc;
        }, {});
    }, [jobsData]);

    const applicationMap = useMemo(() => {
        if (!applicationsData?.data) return {};
        return applicationsData.data.reduce((acc, application) => {
            acc[application.id] = application;
            return acc;
        }, {});
    }, [applicationsData]);

    // Function to get job title
    const getJobTitle = (jobId) => {
        const job = jobMap[jobId];
        return job ? job.title : 'N/A';
    };

    // Function to get applicant details
    const getApplicantDetails = (applicantId) => {
        const application = applicationMap[applicantId];
        return {
            name: application?.name || 'Unknown Applicant',
            email: application?.email || 'N/A',
            phone: application?.phone || 'N/A'
        };
    };

    // Function to get currency details
    const getCurrencyDetails = (currencyId) => {
        if (!currencyData?.data) return { symbol: '$', code: 'USD' };
        const currency = currencyData.data.find(c => c.id === currencyId);
        return currency ? {
            symbol: currency.currencySymbol || '$',
            code: currency.currencyCode || 'USD'
        } : { symbol: '$', code: 'USD' };
    };

    // Clear selections when offerLetters data changes
    useEffect(() => {
        setSelectedRowKeys([]);
    }, [offerLetters]);

    const handleChange = (newPagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
        if (pagination?.onChange) {
            pagination.onChange(newPagination, filters, sorter);
        }
    };

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        onDelete(selectedRowKeys);
        setSelectedRowKeys([]); // Clear selections after delete
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'accepted':
                return { color: '#52c41a', background: '#f6ffed' };
            case 'rejected':
                return { color: '#ff4d4f', background: '#fff1f0' };
            case 'pending':
                return { color: '#faad14', background: '#fff7e6' };
            default:
                return { color: '#8c8c8c', background: '#f5f5f5' };
        }
    };

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
            width: 200,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search job title"
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
                            Filter
                        </Button>
                        <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => {
                const jobTitle = getJobTitle(record.job);
                return jobTitle.toLowerCase().includes(value.toLowerCase());
            },
            render: (jobId) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{
                            color: "#1890ff",
                            background: "rgba(24, 144, 255, 0.1)",
                            width: isMobile ? "32px" : "40px",
                            height: isMobile ? "32px" : "40px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <FiBriefcase size={isMobile ? 16 : 20} />
                        </div>
                        <div className="info-wrapper">
                            <div className="name" style={{ 
                                color: "#262626", 
                                fontWeight: 600, 
                                fontSize: isMobile ? "13px" : "15px" 
                            }}>
                                {getJobTitle(jobId)}
                            </div>
                            <div className="subtitle" style={{ 
                                color: "#8c8c8c", 
                                fontSize: isMobile ? "11px" : "13px" 
                            }}>
                                Job Position
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Applicant',
            dataIndex: 'job_applicant',
            key: 'job_applicant',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search applicant name"
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
                            Filter
                        </Button>
                        <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => {
                const applicantName = getApplicantDetails(record.job_applicant).name;
                return applicantName.toLowerCase().includes(value.toLowerCase());
            },
            render: (applicantId) => {
                const applicant = getApplicantDetails(applicantId);
                return (
                    <div className="item-wrapper">
                        <div className="item-content">
                            <div className="icon-wrapper" style={{
                                color: "#52c41a",
                                background: "rgba(82, 196, 26, 0.1)",
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <FiUser size={20} />
                            </div>
                            <div className="info-wrapper">
                                <div className="name" style={{ color: "#262626", fontWeight: 600, fontSize: "15px" }}>
                                    {applicant.name}
                                </div>
                                <div className="subtitle" style={{ color: "#8c8c8c", fontSize: "13px" }}>
                                    {applicant.email}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        },
        {
            title: 'Salary',
            dataIndex: 'salary',
            key: 'salary',
            render: (salary, record) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{
                            color: "#722ed1",
                            background: "rgba(114, 46, 209, 0.1)",
                            width: isMobile ? "28px" : "32px",
                            height: isMobile ? "28px" : "32px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <FiDollarSign size={isMobile ? 14 : 16} />
                        </div>
                        <Text style={{ fontSize: isMobile ? "12px" : "13px" }}>
                            {salary ? `${getCurrencyDetails(record.currency).symbol} ${Number(salary).toLocaleString()}` : 'N/A'}
                        </Text>
                    </div>
                </div>
            ),
            sorter: (a, b) => {
                const salaryA = parseFloat(a.salary) || 0;
                const salaryB = parseFloat(b.salary) || 0;
                return salaryA - salaryB;
            }
        },
        {
            title: 'Expected Joining',
            dataIndex: 'expected_joining_date',
            key: 'expected_joining_date',
            render: (date) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{
                            color: "#f5222d",
                            background: "rgba(245, 34, 45, 0.1)",
                            width: isMobile ? "28px" : "32px",
                            height: isMobile ? "28px" : "32px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <FiCalendar size={isMobile ? 14 : 16} />
                        </div>
                        <Text style={{ fontSize: isMobile ? "12px" : "13px" }}>
                            {date ? moment(date).format('DD MMM YYYY') : 'N/A'}
                        </Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Offer Expiry',
            dataIndex: 'offer_expiry',
            key: 'offer_expiry',
            render: (date) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{
                            color: "#fa8c16",
                            background: "rgba(250, 140, 22, 0.1)",
                            width: isMobile ? "28px" : "32px",
                            height: isMobile ? "28px" : "32px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <FiClock size={isMobile ? 14 : 16} />
                        </div>
                        <Text style={{ fontSize: isMobile ? "12px" : "13px" }}>
                            {date ? moment(date).format('DD MMM YYYY') : 'N/A'}
                        </Text>
                    </div>
                </div>
            )
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const { color, background } = getStatusColor(status);
                return (
                    <Tag style={{
                        color: color,
                        background: background,
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        textTransform: 'capitalize',
                        fontSize: isMobile ? "11px" : "12px"
                    }}>
                        {status || 'N/A'}
                    </Tag>
                );
            }
        },
        {
            title: "Actions",
            key: "actions",
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Dropdown
                    overlay={
                        <Menu>
                            {getActionItems(record).map(item => (
                                <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick} danger={item.danger}>
                                    {item.label}
                                </Menu.Item>
                            ))}
                        </Menu>
                    }
                    trigger={['click']}
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical size={16} />}
                        style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            transition: 'all 0.3s ease'
                        }}
                        className="action-btn"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0f2f5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    />
                </Dropdown>
            ),
        },
    ];

    // Bulk actions component
    const BulkActions = () => (
        <div className={`bulk-actions${selectedRowKeys.length > 0 ? ' active' : ''}`}>
            <Button
                type="primary"
                danger
                icon={<FiTrash2 size={16} />}
                onClick={() => handleBulkDelete()}
            >
                Delete Selected ({selectedRowKeys.length})
            </Button>
        </div>
    );

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);
    
      const paginationConfig = {
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} items`,
        pageSizeOptions: ['10', '20', '50', '100'],
        locale: {
          items_per_page: isMobile ? '' : '/ page', // Hide '/ page' on mobile/tablet
        },
      };

    return (
        <>
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
                columns={columns}
                dataSource={offerLetters}
                rowSelection={rowSelection}
                loading={loading || jobsLoading}
                onChange={handleChange}
                rowKey="id"
                scroll={{ x: 1500 }}
                pagination={{
                    ...pagination,
                    ...paginationConfig,
                }}
                style={{
                    background: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    // ...pagination
                }}
            />
        </>
    );
};

export default OfferLetterList;