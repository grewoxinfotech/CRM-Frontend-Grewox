import React, { useState, useMemo, useEffect } from 'react';
import { Table, Space, Button, Tag, message, Modal, Dropdown, Input, DatePicker } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiEye,
    FiMoreVertical,
    FiCalendar,
    FiPlus,
    FiClock,
    FiMapPin,
    FiUsers,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle
} from 'react-icons/fi';
import { useGetMeetingsQuery, useUpdateMeetingMutation, useDeleteMeetingMutation } from './services/meetingApi';
import { useGetAllDepartmentsQuery } from '../Department/services/departmentApi';
import dayjs from 'dayjs';
import CreateMeeting from './CreateMeeting';
import EditMeeting from './EditMeeting';
import './meeting.scss';

const MeetingList = ({ searchText }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isMobile, setIsMobile] = useState(false);

    // API calls
    const { data: meetings, isLoading } = useGetMeetingsQuery();
    const { data: departmentsData } = useGetAllDepartmentsQuery();
    const [updateMeeting] = useUpdateMeetingMutation();
    const [deleteMeeting] = useDeleteMeetingMutation();

    // Create a map of department IDs to names
    const departmentMap = useMemo(() => {
        const map = {};
        if (departmentsData) {
            departmentsData.forEach(dept => {
                if (dept && dept.id) {
                    map[dept.id] = dept.department_name;
                }
            });
        }
        return map;
    }, [departmentsData]);

    const statuses = [
        { id: 'scheduled', name: 'Scheduled', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.1)', icon: <FiCalendar /> },
        { id: 'completed', name: 'Completed', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', icon: <FiCheckCircle /> },
        { id: 'cancelled', name: 'Cancelled', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.1)', icon: <FiXCircle /> },
    ];

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

    // Filter meetings based on search text
    const filteredMeetings = useMemo(() => {
        if (!meetings?.data) return [];

        if (!searchText) return meetings.data;

        const searchLower = searchText.toLowerCase();
        return meetings.data.filter(meeting => {
            const title = meeting.title?.toLowerCase() || '';
            const description = meeting.description?.toLowerCase() || '';
            const department = departmentMap[meeting.department]?.toLowerCase() || '';
            const location = meeting.location?.toLowerCase() || '';

            return (
                title.includes(searchLower) ||
                description.includes(searchLower) ||
                department.includes(searchLower) ||
                location.includes(searchLower)
            );
        });
    }, [meetings?.data, searchText, departmentMap]);

    // Handle edit
    const handleEdit = (record) => {
        const formattedRecord = {
            ...record,
            date: record.date ? dayjs(record.date, 'YYYY-MM-DD') : null,
            startTime: record.startTime ? dayjs(record.startTime, 'HH:mm:ss') : null,
            endTime: record.endTime ? dayjs(record.endTime, 'HH:mm:ss') : null,
        };
        setEditingMeeting(formattedRecord);
        setIsEditModalOpen(true);
    };

    // Handle delete
    const handleDelete = (recordOrIds) => {
        const isMultiple = Array.isArray(recordOrIds);
        const title = isMultiple ? 'Delete Selected Meetings' : 'Delete Meeting';
        const content = isMultiple
            ? `Are you sure you want to delete ${recordOrIds.length} selected meetings?`
            : 'Are you sure you want to delete this meeting?';

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
                        await Promise.all(recordOrIds.map(id => deleteMeeting(id).unwrap()));
                        message.success(`${recordOrIds.length} meetings deleted successfully`);
                        setSelectedRowKeys([]);
                    } else {
                        await deleteMeeting(recordOrIds).unwrap();
                        message.success('Meeting deleted successfully');
                    }
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete meeting(s)');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search meeting title"
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
                            <FiUsers className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <div className="name" style={{ color: "#262626", fontWeight: 600 }}>{text}</div>
                            {record.description && (
                                <div className="meta">{record.description}</div>
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
            title: 'Schedule',
            key: 'schedule',
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
                                {record.startTime} - {record.endTime}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            render: (text) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{ color: "#059669", background: "rgba(5, 150, 105, 0.1)" }}>
                            <FiMapPin className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <div className="name" style={{ color: "#059669", fontWeight: 500 }}>{text || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: statuses.map(status => ({
                text: status.name,
                value: status.id
            })),
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                const statusConfig = statuses.find(s => s.id === status) || statuses[0];
                return (
                    <div className="item-wrapper">
                        <div className="item-content">
                            <div className="icon-wrapper" style={{ color: statusConfig.color, background: statusConfig.bg }}>
                                {statusConfig.icon}
                            </div>
                            <div className="info-wrapper">
                                <div className="name" style={{ color: statusConfig.color, fontWeight: 500, textTransform: 'capitalize' }}>
                                    {statusConfig.name}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
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
                                onClick: () => handleEdit(record),
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
        <div className="meeting-list-container">
            <BulkActions />
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={filteredMeetings}
                loading={isLoading}
                rowKey="id"
                pagination={paginationConfig}
                className="custom-table"
                scroll={{ x: 1300, y: '' }}
                style={{
                    background: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
            />
            <CreateMeeting
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
            />
            {isEditModalOpen && (
                <EditMeeting
                    open={isEditModalOpen}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setEditingMeeting(null);
                    }}
                    initialValues={editingMeeting}
                />
            )}
        </div>
    );
};

export default MeetingList;