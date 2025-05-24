import React, { useState } from 'react';
import { Table, Space, Button, Tag, message, Modal, Dropdown, Menu } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiEye,
    FiMoreVertical,
    FiCalendar,
    FiClock,
    FiUsers,
    FiCheckCircle,
    FiXCircle
} from 'react-icons/fi';
import dayjs from 'dayjs';
import './meeting.scss';

const MeetingList = ({
    loading,
    meetings = [],
    pagination = {},
    onEdit,
    onView,
    onDelete,
    onPageChange,
    onPageSizeChange,
    departmentMap = {}
}) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    // Handle pagination change
    const handleTableChange = (newPagination, filters, sorter) => {
        if (newPagination.current !== pagination.current) {
            onPageChange?.(newPagination.current);
        }
        if (newPagination.pageSize !== pagination.pageSize) {
            onPageSizeChange?.(newPagination.pageSize);
        }
    };

    // Bulk actions component
    const BulkActions = () => (
        <div className={`bulk-actions ${selectedRowKeys.length > 0 ? 'active' : ''}`}>
            {selectedRowKeys.length > 0 && (
                <Button
                    type="primary"
                    danger
                    icon={<FiTrash2 size={16} />}
                    onClick={() => handleBulkDelete(selectedRowKeys)}
                >
                    Delete Selected ({selectedRowKeys.length})
                </Button>
            )}
        </div>
    );

    const handleBulkDelete = (ids) => {
        Modal.confirm({
            title: 'Delete Selected Meetings',
            content: `Are you sure you want to delete ${ids.length} selected meetings?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                Promise.all(ids.map(id => onDelete(id)))
                    .then(() => {
                        message.success(`${ids.length} meetings deleted successfully`);
                        setSelectedRowKeys([]);
                    })
                    .catch((error) => {
                        message.error('Failed to delete meetings');
                    });
            },
        });
    };

    const getStatusConfig = (status) => {
        const configs = {
            scheduled: { color: '#2563EB', bg: 'rgba(37, 99, 235, 0.1)', icon: <FiCalendar />, text: 'Scheduled' },
            completed: { color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', icon: <FiCheckCircle />, text: 'Completed' },
            cancelled: { color: '#DC2626', bg: 'rgba(220, 38, 38, 0.1)', icon: <FiXCircle />, text: 'Cancelled' }
        };
        return configs[status] || configs.scheduled;
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{ color: "#7C3AED", background: "rgba(124, 58, 237, 0.1)" }}>
                            <FiUsers className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <div className="name" style={{ color: "#262626", fontWeight: 600 }}>{text}</div>
                            {record.description && (
                                <div className="meta">{record.description.length > 50 ? `${record.description.substring(0, 50)}...` : record.description}</div>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            render: (departmentId) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{ color: "#2563EB", background: "rgba(37, 99, 235, 0.1)" }}>
                            <FiUsers className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <div className="name" style={{ color: "#2563EB", fontWeight: 500 }}>
                                {departmentMap[departmentId] || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Date & Time',
            key: 'datetime',
            render: (_, record) => (
                <Space direction="vertical" size={4}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCalendar size={14} color="#2563EB" />
                        <span>{dayjs(record.date).format('MMM DD, YYYY')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiClock size={14} color="#059669" />
                        <span>{`${dayjs(record.startTime, 'HH:mm:ss').format('hh:mm A')} - ${record.endTime ? dayjs(record.endTime, 'HH:mm:ss').format('hh:mm A') : 'TBD'}`}</span>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = getStatusConfig(status);
                return (
                    <Tag
                        style={{
                            color: config.color,
                            backgroundColor: config.bg,
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        {config.icon}
                        {config.text}
                    </Tag>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Dropdown
                    overlay={
                        <Menu>
                            {/* <Menu.Item key="view" onClick={() => onView?.(record)}>
                                <FiEye /> View
                            </Menu.Item> */}
                            <Menu.Item key="edit" onClick={() => onEdit?.(record)}>
                                <FiEdit2 /> Edit
                            </Menu.Item>
                            <Menu.Item key="delete" danger onClick={() => handleBulkDelete([record.id])}>
                                <FiTrash2 /> Delete
                            </Menu.Item>
                        </Menu>
                    }
                    trigger={["click"]}
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
                        className="action-button"
                    />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="meeting-list-container">
            <BulkActions />
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={meetings}
                loading={loading}
                rowKey="id"
                onChange={handleTableChange}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    position: ['bottomRight'],
                    hideOnSinglePage: false,
                    showQuickJumper: true
                }}
                className="custom-table"
                scroll={{ x: "max-content", y: "100%" }}
                style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
            />
        </div>
    );
};

export default MeetingList;