import React, { useState } from 'react';
import { Table, Button, Dropdown, Tag, Tooltip, Modal, message, Input, Space } from 'antd';
import {
    FiEye,
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiDollarSign,
    FiUsers,
    FiClock,
    FiHardDrive,
    FiPackage,
    FiToggleRight,
    FiSearch,
    FiFilter,
    FiX,
    FiUserCheck
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetAllCurrenciesQuery } from '../settings/services/settingsApi';
import moment from 'moment';

const PlanList = ({ plans, loading, onView, onEdit, onDelete, pagination, onPageChange, searchText, subscribedUsers }) => {
    const { data: currencies } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });

    const [filteredInfo, setFilteredInfo] = useState({});
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const handleTableChange = (pagination, filters, sorter) => {
        console.log('Table Change:', { pagination, filters, sorter });
        setFilteredInfo(filters);
        if (onPageChange) {
            onPageChange(pagination, filters, sorter);
        }
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setFilteredInfo(prev => ({
            ...prev,
            [dataIndex]: selectedKeys
        }));
    };

    const handleReset = (clearFilters, confirm) => {
        clearFilters();
        confirm();
        setFilteredInfo(prev => ({
            ...prev,
            [dataIndex]: null
        }));
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div className="custom-filter-dropdown">
                <div className="filter-input">
                    <Input
                        placeholder={`Search ${dataIndex}`}
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        prefix={<FiSearch className="search-icon" />}
                        allowClear={{
                            clearIcon: <FiX className="clear-icon" />
                        }}
                        autoFocus
                    />
                </div>
                <Space className="filter-actions">
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        className="filter-button"
                        icon={<FiFilter />}
                    >
                        Apply Filter
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters, confirm)}
                        className="filter-button"
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => (
            <FiFilter
                style={{
                    color: filtered ? '#3b82f6' : '#94a3b8'
                }}
            />
        ),
        onFilter: (value, record) => {
            return record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '';
        },
        filteredValue: filteredInfo[dataIndex] || null
    });

    // Define plan status options
    const planStatuses = [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
    ];

    const planTypes = [
        { text: 'Default Sign Up Plan', value: true },
        { text: 'Regular Plan', value: false }
    ];

    const getCurrencyIcon = (currencyId) => {
        const currency = currencies?.find(c => c.id === currencyId);
        return currency?.currencyIcon || '₹';
    };

    const highlightText = (text, highlight) => {
        if (!highlight.trim() || !text) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} className="highlight-text">
                            {part}
                        </span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView(record),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit Plan',
                onClick: () => onEdit(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete Plan',
                danger: true,
                onClick: () => onDelete(record),
            }
        ]
    });

    const getActionItems = (record) => [
        {
            key: 'view',
            icon: <FiEye className="action-icon" />,
            label: 'View Details',
            onClick: () => onView(record)
        },
        {
            key: 'edit',
            icon: <FiEdit2 className="action-icon" />,
            label: 'Edit Plan',
            onClick: () => onEdit(record)
        },
        {
            key: 'delete',
            icon: <FiTrash2 className="action-icon" />,
            label: 'Delete Plan',
            danger: true,
            onClick: () => onDelete(record)
        }
    ];

    const formatStorageSize = (sizeInMB) => {
        const size = parseFloat(sizeInMB);
        if (size >= 1024) {
            const gbValue = size / 1024;
            // Remove decimals if it's a whole number
            return `${Number.isInteger(gbValue) ? gbValue.toFixed(0) : gbValue.toFixed(2)} GB`;
        }
        return `${size} MB`;
    };

    const getAssignedUsersCount = (planId) => {
        if (!subscribedUsers || !Array.isArray(subscribedUsers)) return 0;
        return subscribedUsers.filter(user => user.plan_id === planId && user.status !== 'cancelled').length;
    };

    const columns = [
        {
            title: (
                <div className="column-header">
                    {/* <FiPackage className="header-icon" /> */}
                    <span>Plan Name</span>
                </div>
            ),
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),
            filters: planTypes,
            onFilter: (value, record) => record.is_default === value,
            width: '25%',
            
            render: (_, record) => (
                <div className="name-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {highlightText(record.name, searchText)}
                    {record.is_default && (
                        <Tooltip title="This plan will be automatically assigned to new users during signup">
                            <Tag 
                                color="#1890ff"
                                style={{
                                    borderRadius: '4px',
                                    padding: '0 6px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#e6f4ff',
                                    border: '1px solid #91caff',
                                    color: '#0958d9',
                                    cursor: 'help'
                                }}
                            >
                                <FiPackage style={{ fontSize: '12px' }} /> Default Sign Up Plan
                            </Tag>
                        </Tooltip>
                    )}
                </div>
            ),
        },
        {
            title: (
                <div className="column-header">
                    {/* <FiDollarSign className="header-icon" /> */}
                    <span>Price</span>
                </div>
            ),
            dataIndex: 'price',
            key: 'price',
            sorter: (a, b) => (a.price || 0) - (b.price || 0),
            render: (price, record) => (
                <div className="price-cell">
                    <div className="price-amount">
                        <span className="currency" aria-label="currency">{getCurrencyIcon(record.currency)}</span>
                        <span className="amount">{Number(price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            ),
            width: '25%',
        },
        {
            title: (
                <div className="column-header">
                    {/* <FiUsers className="header-icon" /> */}
                    <span>Limits</span>
                    
                </div>
            ),
            key: 'limits',
            sorter: (a, b) => (a.price || 0) - (b.price || 0),
            render: (_, record) => (
                <div className="limits-cell">
                    <div className="limits-group">
                        <Tooltip title="Users Limit">
                            <Tag className="limit-tag users">
                                <FiUsers className="tag-icon" /> {record.max_users || 0} Users
                            </Tag>
                        </Tooltip>
                        <Tooltip title="Clients Limit">
                            <Tag className="limit-tag clients">
                                <FiUsers className="tag-icon" /> {record.max_clients || 0} Clients
                            </Tag>
                        </Tooltip>
                    </div>
                    <div className="limits-group">
                        <Tooltip title="Vendors Limit">
                            <Tag className="limit-tag vendors">
                                <FiUsers className="tag-icon" /> {record.max_vendors || 0} Vendors
                            </Tag>
                        </Tooltip>
                        <Tooltip title="Customers Limit">
                            <Tag className="limit-tag customers">
                                <FiUsers className="tag-icon" /> {record.max_customers || 0} Customers
                            </Tag>
                        </Tooltip>
                    </div>
                </div>
            ),
            width: '30%',
        },
        {
            title: (
                <div className="column-header">
                    {/* <FiHardDrive className="header-icon" /> */}
                    <span>Storage & Trial</span>
                </div>
            ),
            key: 'storage_trial',
            sorter: (a, b) => (a.price || 0) - (b.price || 0),

            render: (_, record) => (
                <div className="storage-trial-cell">
                    <Tooltip title="Storage Limit">
                        <Tag className="feature-tag storage">
                            <FiHardDrive className="tag-icon" /> {formatStorageSize(record.storage_limit)}
                        </Tag>
                    </Tooltip>
                    <Tooltip title="Trial Period">
                        <Tag className="feature-tag trial">
                            <FiClock className="tag-icon" /> {record.trial_period || 0} Days
                        </Tag>
                    </Tooltip>
                </div>
            ),
            width: '20%',
        },
        {
            title: (
                <div className="column-header status-header">
                    {/* <FiToggleRight className="header-icon" /> */}
                    <span>Status</span>
                </div>
            ),
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            className: 'status-column',
            filters: planStatuses,
            onFilter: (value, record) => (record.status?.toLowerCase() || '') === value.toLowerCase(),
            render: (status) => {
                const statusText = (status || 'Inactive').charAt(0).toUpperCase() + (status || 'inactive').slice(1);
                return (
                    <Tag className={`status-tag ${status?.toLowerCase() || 'inactive'}`}>
                        {statusText}
                    </Tag>
                );
            },
            width: '12%',
        },
        {
            title: (
                <div className="column-header">
                    {/* <FiUserCheck className="header-icon" /> */}
                    <span>Assigned Users</span>
                </div>
            ),
            key: 'assigned_users',
            width: '20%',
            render: (_, record) => {
                const count = getAssignedUsersCount(record.id);
                return (
                    <Tooltip title="Number of users assigned to this plan">
                        <Tag className="assigned-users-tag">
                            <FiUsers className="tag-icon" /> {count} Users
                        </Tag>
                    </Tooltip>
                );
            },
            sorter: (a, b) => getAssignedUsersCount(a.id) - getAssignedUsersCount(b.id),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '120px',
            fixed: 'right',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Dropdown
                        menu={getDropdownItems(record)}
                        trigger={['click']}
                        placement="bottomRight"
                        overlayClassName="plan-actions-dropdown"
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical className="action-icon" />}
                            className="action-button more"
                        />
                    </Dropdown>
                </div>
            ),
        }
    ];

    const handleDelete = async (recordOrIds) => {
        try {
            await onDelete(recordOrIds);
            // Clear selection after successful delete
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    // Add bulk action buttons with your design
    const BulkActions = () => (
        <div className="bulk-actions" style={{ marginBottom: 16 }}>
            {selectedRowKeys.length > 0 && (
                <Button
                    type="primary"
                    icon={<FiTrash2 />}
                    onClick={() => handleDelete(selectedRowKeys)}
                    className="delete-button"
                    style={{ marginTop: 10 }}
                >
                    Delete Selected ({selectedRowKeys.length})
                </Button>
            )}
        </div>
    );

    return (
        <div className="plans-table-wrapper">
            <BulkActions />
            <Table
                columns={columns}
                dataSource={plans}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                rowKey="id"
                className="plans-table"
                scroll={{ x: 1300 , y: '' }}
                rowSelection={rowSelection}
            />
            <style jsx>{`
                .assigned-users-tag {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    background: #e6f4ff;
                    border: 1px solid #91caff;
                    color: #0958d9;
                    font-weight: 500;
                    
                    .tag-icon {
                        font-size: 14px;
                    }
                }
                .edit-button {
                    background: linear-gradient(135deg, #4096ff 0%, #1677ff 100%);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    height: 32px;
                    padding: 0 12px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    &:hover {
                        background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
                        color: white;
                    }
                }
                .action-button.more {
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    background: transparent;
                    transition: all 0.3s ease;
                    &:hover {
                        background: #f1f5f9;
                        .action-icon {
                            color: #3b82f6;
                        }
                    }
                    .action-icon {
                        font-size: 16px;
                        color: #64748b;
                    }
                }
            `}</style>
        </div>
    );
};

export default PlanList;