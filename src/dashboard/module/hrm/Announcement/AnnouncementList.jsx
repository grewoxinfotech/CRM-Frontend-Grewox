import React, { useState, useMemo, useEffect } from 'react';
import { Table, Button, Space, Tooltip, Tag, Dropdown, Modal, message, Input, DatePicker } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiEye,
    FiMoreVertical,
    FiCalendar,
    FiClock,
    FiUsers,
    FiMessageSquare,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle
} from 'react-icons/fi';
import { FaCodeBranch } from "react-icons/fa6";
import dayjs from 'dayjs';
import { useGetAllBranchesQuery } from '../Branch/services/branchApi';
import { useDeleteAnnouncementMutation } from './services/announcementApi';
import './announcement.scss';

const AnnouncementList = ({ announcements, loading, onEdit }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const { data: branchesData, isLoading: branchesLoading } = useGetAllBranchesQuery();
        const [deleteAnnouncement] = useDeleteAnnouncementMutation();
        const [isMobile, setIsMobile] = useState(false);

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
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
                    onClick={() => handleDelete(selectedRowKeys)}
                >
                    Delete Selected ({selectedRowKeys.length})
                </Button>
            )}
        </div>
    );

    const handleDelete = (recordOrIds) => {
        const isMultiple = Array.isArray(recordOrIds);
        const title = isMultiple ? 'Delete Selected Announcements' : 'Delete Announcement';
        const content = isMultiple
            ? `Are you sure you want to delete ${recordOrIds.length} selected announcements?`
            : 'Are you sure you want to delete this announcement?';

        Modal.confirm({
            title,
            content,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    if (isMultiple) {
                        await Promise.all(recordOrIds.map(id => deleteAnnouncement(id).unwrap()));
                        message.success(`${recordOrIds.length} announcements deleted successfully`);
                        setSelectedRowKeys([]);
                    } else {
                        await deleteAnnouncement(recordOrIds).unwrap();
                        message.success('Announcement deleted successfully');
                    }
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete announcement(s)');
                }
            },
        });
    };

    const getBranchName = (branchId) => {
        const branch = branchesData?.data?.find(branch => branch.id === branchId);
        return branch ? branch.branchName : branchId;
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search announcement title"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>Filter</Button>
                        <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>Reset</Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => record.title.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{ color: "#7C3AED", background: "rgba(124, 58, 237, 0.1)" }}>
                            <FiMessageSquare className="item-icon" />
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
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            render: (branchData) => {
                try {
                    const branchObj = JSON.parse(branchData);
                    if (branchObj.branch && branchObj.branch.length > 0) {
                        return (
                            <div className="item-wrapper">
                                <div className="item-content">
                                    <div className="icon-wrapper" style={{ color: "#2563EB", background: "rgba(37, 99, 235, 0.1)" }}>
                                        <FaCodeBranch className="item-icon" />
                                    </div>
                                    <div className="info-wrapper">
                                        <div className="name" style={{ color: "#2563EB", fontWeight: 500 }}>
                                            {branchObj.branch.map(branchId => getBranchName(branchId)).join(', ')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div className="item-wrapper">
                            <div className="item-content">
                                <div className="icon-wrapper" style={{ color: "#DC2626", background: "rgba(220, 38, 38, 0.1)" }}>
                                    <FiAlertCircle className="item-icon" />
                                </div>
                                <div className="info-wrapper">
                                    <div className="name" style={{ color: "#DC2626", fontWeight: 500 }}>No Branch</div>
                                </div>
                            </div>
                        </div>
                    );
                } catch (error) {
                    return (
                        <div className="item-wrapper">
                            <div className="item-content">
                                <div className="icon-wrapper" style={{ color: "#DC2626", background: "rgba(220, 38, 38, 0.1)" }}>
                                    <FiAlertCircle className="item-icon" />
                                </div>
                                <div className="info-wrapper">
                                    <div className="name" style={{ color: "#DC2626", fontWeight: 500 }}>Invalid Branch Data</div>
                                </div>
                            </div>
                        </div>
                    );
                }
            },
        },
        {
            title: 'Schedule',
            key: 'schedule',
            width: 200,
            render: (_, record) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{ color: "#D97706", background: "rgba(217, 119, 6, 0.1)" }}>
                            <FiClock className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <div className="name" style={{ color: "#D97706", fontWeight: 500 }}>
                                {dayjs(record.date).format('DD MMM YYYY')}
                            </div>
                            <div className="meta">
                                {record.time}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            fixed: "right",
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'edit',
                                icon: <FiEdit2 size={14} />,
                                label: 'Edit',
                                onClick: () => onEdit(record),
                            },
                            {
                                key: 'delete',
                                icon: <FiTrash2 size={14} />,
                                label: 'Delete',
                                danger: true,
                                onClick: () => handleDelete(record.id),
                            },
                        ],
                    }}
                    trigger={['click']}
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical size={16} />}
                        className="action-button"
                    />
                </Dropdown>
            ),
        },
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
        <div className="announcement-list-container">
            <BulkActions />
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={announcements}
                loading={loading || branchesLoading}
                rowKey="id"
                pagination={paginationConfig}
                className="custom-table"
                scroll={{ x: 1200, y: '' }}
                style={{
                    background: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
            />
        </div>
    );
};

export default AnnouncementList; 