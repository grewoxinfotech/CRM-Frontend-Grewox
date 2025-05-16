import React, { useState } from 'react';
import { Table, Button, Space, Tag, Dropdown, Menu, Modal, message } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiBell,
    FiCalendar,
    FiUser
} from 'react-icons/fi';
import moment from 'moment';
import './announcement.scss';

const AnnouncementList = ({
    loading,
    announcements = [],
    pagination = {},
    onEdit,
    onDelete,
    onPageChange,
    onPageSizeChange
}) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    const handleTableChange = (pagination) => {
        onPageChange?.(pagination.current);
        onPageSizeChange?.(pagination.pageSize);
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
            title: 'Delete Selected Announcements',
            content: `Are you sure you want to delete ${ids.length} selected announcements?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                Promise.all(ids.map(id => onDelete(id)))
                    .then(() => {
                        message.success(`${ids.length} announcements deleted successfully`);
                        setSelectedRowKeys([]);
                    })
                    .catch((error) => {
                        message.error('Failed to delete announcements');
                    });
            },
        });
    };

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{ color: "#7C3AED", background: "rgba(124, 58, 237, 0.1)" }}>
                            <FiBell className="item-icon" />
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
            title: "Created By",
            dataIndex: "created_by",
            key: "created_by",
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: 'rgba(37, 99, 235, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB'
                    }}>
                        <FiUser size={16} />
                    </div>
                    <Tag color="blue">{text}</Tag>
                </div>
            ),
        },
        {
            title: "Created Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: 'rgba(37, 99, 235, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB'
                    }}>
                        <FiCalendar size={16} />
                    </div>
                    <div>
                        <div style={{
                            color: '#262626',
                            fontSize: '14px',
                            fontWeight: 500
                        }}>{moment(date).format('MMM DD, YYYY')}</div>
                        <div style={{
                            color: '#666',
                            fontSize: '12px'
                        }}>{moment(date).format('hh:mm A')}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 100,
            render: (_, record) => (
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item key="edit" onClick={() => onEdit(record)}>
                                <FiEdit2 /> Edit
                            </Menu.Item>
                            <Menu.Item key="delete" danger onClick={() => onDelete(record.id)}>
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
        <div className="announcement-list-container">
            <BulkActions />
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={announcements}
                loading={loading}
                rowKey="id"
                onChange={handleTableChange}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    position: ['bottomRight'],
                    onChange: (page, pageSize) => {
                        onPageChange(page);
                        if (pageSize !== pagination.pageSize) {
                            onPageSizeChange(pageSize);
                        }
                    }
                }}
                className="custom-table"
                scroll={{ x: 1000 }}
                style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
            />
        </div>
    );
};

export default AnnouncementList; 