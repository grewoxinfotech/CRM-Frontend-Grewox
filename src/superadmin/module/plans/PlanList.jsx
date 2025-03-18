import React from 'react';
import { Table, Button, Dropdown, Tag, Tooltip } from 'antd';
import {
    FiEye,
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiDollarSign,
    FiUsers,
    FiClock,
    FiHardDrive
} from 'react-icons/fi';
import dayjs from 'dayjs';

const PlanList = ({ plans, loading, onView, onEdit, onDelete, pagination, onPageChange }) => {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
            render: (text) => (
                <div style={{ fontWeight: 500 }}>{text || 'N/A'}</div>
            ),
            width: '15%',
            fixed: 'left'
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price, record) => (
                <div className="price-cell">
                    <FiDollarSign className="price-icon" />
                    <span className="plan-price">
                        {Number(price || 0).toFixed(2)}
                        <small className="currency-duration">
                            {record.currency}/{record.duration.toLowerCase()}
                        </small>
                    </span>
                </div>
            ),
            width: '20%',
        },
        {
            title: 'Limits',
            key: 'limits',
            render: (_, record) => (
                <div className="limits-cell">
                    <div className="limits-row">
                        <Tooltip title="Users Limit">
                            <Tag color="blue">
                                <FiUsers /> {record.max_users || 0} Users
                            </Tag>
                        </Tooltip>
                        <Tooltip title="Clients Limit">
                            <Tag color="cyan">
                                <FiUsers /> {record.max_clients || 0} Clients
                            </Tag>
                        </Tooltip>
                    </div>
                    <div className="limits-row">
                        <Tooltip title="Vendors Limit">
                            <Tag color="purple">
                                <FiUsers /> {record.max_vendors || 0} Vendors
                            </Tag>
                        </Tooltip>
                        <Tooltip title="Customers Limit">
                            <Tag color="magenta">
                                <FiUsers /> {record.max_customers || 0} Customers
                            </Tag>
                        </Tooltip>
                    </div>
                </div>
            ),
            width: '25%',
        },
        {
            title: 'Storage & Trial',
            key: 'storage_trial',
            render: (_, record) => (
                <div className="storage-trial-cell">
                    <Tooltip title="Storage Limit">
                        <Tag color="orange">
                            <FiHardDrive /> {record.storage_limit || 0} GB
                        </Tag>
                    </Tooltip>
                    <Tooltip title="Trial Period">
                        <Tag color="green">
                            <FiClock /> {record.trial_period || 0} Days Trial
                        </Tag>
                    </Tooltip>
                </div>
            ),
            width: '20%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`plan-status ${status || 'inactive'}`}>
                    {(status || 'Inactive').charAt(0).toUpperCase() + (status || 'inactive').slice(1)}
                </span>
            ),
            width: '10%',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'view',
                                icon: <FiEye />,
                                label: 'View Details',
                                onClick: (e) => {
                                    e.stopPropagation();
                                    onView(record);
                                }
                            },
                            {
                                key: 'edit',
                                icon: <FiEdit2 />,
                                label: 'Edit Plan',
                                onClick: (e) => {
                                    e.stopPropagation();
                                    onEdit(record.id);
                                }
                            },
                            {
                                key: 'delete',
                                icon: <FiTrash2 />,
                                label: 'Delete Plan',
                                danger: true,
                                onClick: (e) => {
                                    e.stopPropagation();
                                    onDelete(record.id);
                                }
                            }
                        ]
                    }}
                    trigger={['click']}
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>
            ),
            width: '80px',
            fixed: 'right',
            align: 'center',
        },
    ];

    return (
        <Table
            dataSource={plans}
            columns={columns}
            rowKey={record => record.id}
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={pagination}
            onChange={(pagination) => onPageChange?.(pagination.current, pagination.pageSize)}
        />
    );
};

export default PlanList;