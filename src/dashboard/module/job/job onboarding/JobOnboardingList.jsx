import React, { useState, useEffect } from 'react';
import { Table, Tag, Dropdown, Button, Input, Space, DatePicker, Typography } from 'antd';
import {
    FiMoreVertical,
    FiEdit2,
    FiTrash2,
    FiUser,
    FiCalendar,
    FiClock,
    FiDollarSign,
    FiPackage,
    FiActivity
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';

const { Text } = Typography;

const JobOnboardingList = ({ onboardings = [], onEdit, onDelete, loading, pagination = {} }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Fetch currencies
    const { data: currencies } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });

    // Clear selections when onboardings data changes
    useEffect(() => {
        setSelectedRowKeys([]);
    }, [onboardings]);

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

    // Get currency details
    const getCurrencyDetails = (currencyId) => {
        if (!currencies || !currencyId) return { icon: '', code: '' };
        const currency = currencies.find(c => c.id === currencyId);
        return {
            icon: currency?.currencyIcon || '',
            code: currency?.currencyCode || ''
        };
    };

    // Format salary with currency
    const formatSalary = (salary, currencyId) => {
        const { code } = getCurrencyDetails(currencyId);
        return `${code} ${salary}`;
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
        if (selectedRowKeys.length > 0) {
            onDelete(selectedRowKeys);
        }
    };

    // Bulk actions component
    const BulkActions = () => (
        <div className={`bulk-actions${selectedRowKeys.length > 0 ? ' active' : ''}`}>
            <Button
                type="primary"
                danger
                icon={<FiTrash2 size={16} />}
                onClick={handleBulkDelete}
            >
                Delete Selected ({selectedRowKeys.length})
            </Button>
        </div>
    );

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return { color: '#faad14', background: '#fff7e6' };
            case 'in_progress':
                return { color: '#1890ff', background: '#e6f7ff' };
            case 'completed':
                return { color: '#52c41a', background: '#f6ffed' };
            case 'delayed':
                return { color: '#ff4d4f', background: '#fff1f0' };
            default:
                return { color: '#8c8c8c', background: '#f5f5f5' };
        }
    };

    const columns = [
        {
            title: 'Interviewer',
            dataIndex: 'Interviewer',
            key: 'Interviewer',
            width: 250,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search Interviewer"
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
                record.Interviewer.toLowerCase().includes(value.toLowerCase()),
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
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
                    <span style={{ color: "#262626" }}>{text}</span>
                </div>
            ),
        },
        {
            title: 'Joining Date',
            dataIndex: 'JoiningDate',
            key: 'JoiningDate',
            sorter: (a, b) => dayjs(a.JoiningDate).unix() - dayjs(b.JoiningDate).unix(),
            render: (date) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        color: "#3b82f6",
                        background: "rgba(59, 130, 246, 0.1)",
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <FiCalendar size={16} />
                    </div>
                    <span style={{ color: "#4b5563" }}>{dayjs(date).format('DD MMM YYYY')}</span>
                </div>
            ),
        },
        {
            title: 'Days of Week',
            dataIndex: 'DaysOfWeek',
            key: 'DaysOfWeek',
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        color: "#8b5cf6",
                        background: "rgba(139, 92, 246, 0.1)",
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <FiClock size={16} />
                    </div>
                    <span style={{ color: "#4b5563" }}>{text}</span>
                </div>
            ),
        },
        {
            title: 'Salary',
            dataIndex: 'Salary',
            key: 'Salary',
            sorter: (a, b) => parseFloat(a.Salary) - parseFloat(b.Salary),
            render: (text, record) => {
                const { icon, code } = getCurrencyDetails(record.Currency);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            color: "#059669",
                            background: "rgba(5, 150, 105, 0.1)",
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            {icon ? (
                                <span style={{ fontSize: '16px' }}>{icon}</span>
                            ) : (
                                <FiDollarSign size={16} />
                            )}
                        </div>
                        <span style={{ color: "#059669", fontWeight: "600" }}>
                            {formatSalary(text, record.Currency)}
                        </span>
                    </div>
                );
            },
        },
        {
            title: 'Salary Type',
            dataIndex: 'SalaryType',
            key: 'SalaryType',
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        color: "#6366f1",
                        background: "rgba(99, 102, 241, 0.1)",
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <FiPackage size={16} />
                    </div>
                    <span style={{ color: "#4b5563", textTransform: "capitalize" }}>{text}</span>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            key: 'Status',
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'In Progress', value: 'in_progress' },
                { text: 'Completed', value: 'completed' },
                { text: 'Delayed', value: 'delayed' },
            ],
            onFilter: (value, record) => record.Status?.toLowerCase() === value,
            render: (status) => {
                const config = getStatusColor(status);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            color: config.color,
                            background: config.background,
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <FiActivity size={16} />
                        </div>
                        <Tag
                            style={{
                                color: config.color,
                                background: config.background,
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                textTransform: 'capitalize'
                            }}
                        >
                            {status?.replace(/_/g, ' ') || 'N/A'}
                        </Tag>
                    </div>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            fixed: 'right',
            render: (_, record) => {
                const menuItems = [
                    {
                        key: 'edit',
                        icon: <FiEdit2 size={14} />,
                        label: 'Edit',
                        onClick: () => onEdit(record)
                    },
                    {
                        key: 'delete',
                        icon: <FiTrash2 size={14} />,
                        label: 'Delete',
                        danger: true,
                        onClick: () => onDelete(record.id)
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
        <div className="job-onboarding-list-container">
            <BulkActions />
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={onboardings}
                rowKey={record => record.id || record._id}
                loading={loading}
                onChange={handleChange}
                pagination={{
                    current: pagination?.current || 1,
                    pageSize: pagination?.pageSize || 10,
                    total: pagination?.total || 0,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                    ...pagination,
                    ...paginationConfig,
                }}
                // pagination={paginationConfig}
                className="custom-table"
            />
        </div>
    );
};

export default JobOnboardingList; 