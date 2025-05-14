import React, { useMemo, useState, useEffect } from 'react';
import { Table, Button, Tag, Dropdown, Tooltip, Typography, Avatar, Space, Input, DatePicker, Modal } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiFile, FiDownload, FiUser, FiX, FiCalendar, FiClock, FiPaperclip, FiAlertCircle, FiCheckSquare } from 'react-icons/fi';
import dayjs from 'dayjs';
import './task.scss';

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const TaskDetailCard = ({ record, users, visible, onClose }) => {
    
    const getAssignedUsers = (assignTo) => {
        try {
            if (typeof assignTo === 'string') {
                const parsed = JSON.parse(assignTo);
                return parsed?.assignedusers || [];
            }
            if (assignTo?.assignedusers) {
                return assignTo.assignedusers;
            }
            return Array.isArray(assignTo) ? assignTo : [];
        } catch (error) {
            console.log('Error parsing assignTo:', error);
            return [];
        }
    };

    const assignedUsers = getAssignedUsers(record?.assignTo)
        .map(id => users?.find(u => u.id === id))
        .filter(Boolean);

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={480}
            centered
            closeIcon={<FiX style={{ color: '#fff' }} />}
            maskStyle={{ backdropFilter: 'blur(4px)', background: 'rgba(0, 0, 0, 0.2)' }}
            bodyStyle={{ padding: 0 }}
            className="task-detail-modal"
        >
            <div style={{
                background: '#1890FF',
                padding: '24px',
                position: 'relative',
                borderRadius: '8px 8px 0 0',
            }}>
                <div style={{ marginBottom: 16 }}>
                    <Tag style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: 'none',
                        color: '#fff',
                        marginBottom: 12,
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px'
                    }}>
                        Task #{record?.id?.slice(-8).toUpperCase()}
                    </Tag>
                    <Text style={{
                        fontSize: 24,
                        display: 'block',
                        color: '#fff',
                        fontWeight: '600',
                        marginBottom: 16,
                        lineHeight: '1.2'
                    }}>
                        {record?.taskName}
                    </Text>
                    <Space size={8}>
                        <Tag style={{
                            background: record?.status === 'In Progress' ? '#E6F7FF' : '#FFF7E6',
                            border: `1px solid ${record?.status === 'In Progress' ? '#1890FF' : '#FFA940'}`,
                            color: record?.status === 'In Progress' ? '#1890FF' : '#FFA940',
                            borderRadius: '4px',
                            padding: '4px 8px'
                        }}>
                            {record?.status}
                        </Tag>
                        <Tag style={{
                            background: record?.priority === 'High' ? '#ff4d4f' :
                                record?.priority === 'Medium' ? '#FFA940' : '#52c41a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px'
                        }}>
                            {record?.priority} Priority
                        </Tag>
                    </Space>
                </div>
            </div>

            <div style={{ padding: '24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '24px',
                    background: '#E6F7FF',
                    padding: '16px',
                    borderRadius: '8px'
                }}>
                    <div>
                        <Text type="secondary" style={{
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginBottom: 4,
                            color: '#6B7280'
                        }}>
                            <FiCalendar style={{ strokeWidth: 2 }} /> Start Date
                        </Text>
                        <Text strong style={{ fontSize: '14px' }}>
                            {dayjs(record?.startDate).format('MMM DD, YYYY')}
                        </Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginBottom: 4,
                            color: '#6B7280'
                        }}>
                            <FiClock style={{ strokeWidth: 2 }} /> Due Date
                        </Text>
                        <Text strong style={{ fontSize: '14px' }}>
                            {dayjs(record?.dueDate).format('MMM DD, YYYY')}
                        </Text>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <Text type="secondary" style={{
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginBottom: 12,
                        color: '#6B7280'
                    }}>
                        <FiUser style={{ strokeWidth: 2 }} /> Assigned Team Members
                    </Text>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {assignedUsers.map(user => (
                            <div key={user.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '8px 12px',
                                background: '#F9FAFB',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB'
                            }}>
                                <Avatar
                                    src={user.profilePic}
                                    style={{
                                        backgroundColor: '#1890FF',
                                        color: '#fff',
                                        fontWeight: '500'
                                    }}
                                >
                                    {!user.profilePic && (user.username?.[0] || user.email?.[0] || '').toUpperCase()}
                                </Avatar>
                                <div>
                                    <Text strong style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        color: '#111827'
                                    }}>
                                        {user.username || user.email}
                                    </Text>
                                    <Text style={{
                                        fontSize: '12px',
                                        color: '#6B7280'
                                    }}>
                                        Team Member
                                    </Text>
                                </div>
                            </div>
                        ))}
                        {assignedUsers.length === 0 && (
                            <Text type="secondary" style={{ padding: '12px', textAlign: 'center' }}>
                                No users assigned
                            </Text>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <Text type="secondary" style={{
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginBottom: 12,
                        color: '#6B7280'
                    }}>
                        <FiAlertCircle style={{ strokeWidth: 2 }} /> Description
                    </Text>
                    <div style={{
                        background: '#F9FAFB',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                    }}>
                        <Paragraph style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#374151',
                            lineHeight: '1.5'
                        }}>
                            {record?.description || 'No description provided'}
                        </Paragraph>
                    </div>
                </div>

                {record?.file && (
                    <div>
                        <Text type="secondary" style={{
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginBottom: 12,
                            color: '#6B7280'
                        }}>
                            <FiPaperclip style={{ strokeWidth: 2 }} /> Attachments
                        </Text>
                        <Button
                            icon={<FiPaperclip />}
                            type="default"
                            style={{
                                width: '100%',
                                height: '40px',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                color: '#1890FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                background: '#F9FAFB'
                            }}
                            onClick={() => window.open(record.file, '_blank')}
                        >
                            View Attachment
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

const TaskList = ({ onEdit, onDelete, onView, searchText = '', filters = {}, tasks = [], users = [] }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };
    const [modalVisible, setModalVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // console.log('Raw Tasks in TaskList:', JSON.stringify(tasks, null, 2));

    const userMap = useMemo(() => {
        return users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});
    }, [users]);
    // Validate and transform tasks data
    const validTasks = useMemo(() => {
        return tasks.map(task => {
            if (!task.taskName) {
                console.warn('Task missing taskName:', task);
            }
            const validatedTask = {
                ...task,
                key: task.id,
                taskName: task.taskName || task.task_name || 'Untitled Task',
                assignTo: task.assignTo || '{"assignedusers": []}', // Changed from users to assignedusers
                priority: task.priority || 'Low',
                status: task.status || 'Pending',
                startDate: task.startDate || null,
                dueDate: task.dueDate || null,
                created_by: task.created_by || 'Unknown',
                task_reporter: task.task_reporter || ''
            };
            // console.log('Validated task:', validatedTask);
            return validatedTask;
        });
    }, [tasks]);


    const filteredTasks = useMemo(() => {
        const tasksArray = Array.isArray(validTasks) ? validTasks : [];

        const filtered = tasksArray.filter(task => {
            const taskName = task?.taskName?.toLowerCase() || '';
            if (!task?.taskName) {
                console.warn('Task missing taskName in filter:', task);
            }
            const description = task?.description?.toLowerCase() || '';
            const reporter = userMap[task?.task_reporter]?.username?.toLowerCase() || '';
            const searchLower = searchText.toLowerCase();

            const matchesSearch = !searchText ||
                taskName.includes(searchLower) ||
                description.includes(searchLower) ||
                reporter.includes(searchLower);

            const matchesPriority = !filters.priority ||
                task?.priority === filters.priority;

            const matchesStatus = !filters.status ||
                task?.status === filters.status;

            const matchesDateRange = !filters.dateRange?.length ||
                (dayjs(task?.startDate).isAfter(filters.dateRange[0]) &&
                    dayjs(task?.dueDate).isBefore(filters.dateRange[1]));

            return matchesSearch && matchesPriority && matchesStatus && matchesDateRange;
        });
        return filtered;
    }, [validTasks, searchText, filters, userMap]);

    const handleView = (record) => {
        setSelectedTask(record);
        setDetailModalVisible(true);
    };

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                label: 'View Details',
                icon: <FiEye size={14} />,
                onClick: () => handleView(record),
            },
            {
                key: 'edit',
                label: 'Edit Task',
                icon: <FiEdit2 size={14} />,
                onClick: () => onEdit(record),
            },
            {
                key: 'delete',
                label: 'Delete Task',
                icon: <FiTrash2 size={14} />,
                danger: true,
                onClick: () => onDelete(record.id),
            },
        ],
    });

    const getAssignedUsers = (assignTo) => {
        try {
            if (typeof assignTo === 'string') {
                const parsed = JSON.parse(assignTo);
                return parsed?.assignedusers || [];
            }
            if (assignTo?.assignedusers) {
                return assignTo.assignedusers;
            }
            return Array.isArray(assignTo) ? assignTo : [];
        } catch (error) {
            console.error('Error parsing assignTo:', error);
            return [];
        }
    };

    const columns = [
        {
            title: 'Task',
            dataIndex: 'taskName',
            key: 'taskName',
            render: (text, record) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{ color: "#7C3AED", background: "rgba(124, 58, 237, 0.1)" }}>
                            <FiCheckSquare className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <div className="name">{text}</div>
                            {record.description && (
                                <div className="meta">{record.description}</div>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusConfig = {
                    'pending': { color: '#FFA940', bg: '#FFF7E6' },
                    'in_progress': { color: '#1890FF', bg: '#E6F7FF' },
                    'completed': { color: '#52C41A', bg: '#F6FFED' },
                };
                const config = statusConfig[status] || { color: '#666', bg: '#F5F5F5' };
                return (
                    <Tag style={{
                        color: config.color,
                        background: config.bg,
                        border: `1px solid ${config.color}`,
                        borderRadius: '4px',
                        padding: '4px 8px'
                    }}>
                        {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Tag>
                );
            },
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => {
                const priorityConfig = {
                    'highest': { color: '#FF4D4F', bg: '#FFF1F0' },
                    'high': { color: '#FF4D4F', bg: '#FFF1F0' },
                    'medium': { color: '#FFA940', bg: '#FFF7E6' },
                    'low': { color: '#52C41A', bg: '#F6FFED' },
                };
                const config = priorityConfig[priority] || { color: '#666', bg: '#F5F5F5' };
                return (
                    <Tag style={{
                        color: config.color,
                        background: config.bg,
                        border: `1px solid ${config.color}`,
                        borderRadius: '4px',
                        padding: '4px 8px'
                    }}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Tag>
                );
            },
        },
        {
            title: 'Timeline',
            key: 'timeline',
            render: (_, record) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{ color: "#2563EB", background: "rgba(37, 99, 235, 0.1)" }}>
                            <FiCalendar className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <div className="name" style={{ color: '#111827', marginBottom: '4px' }}>
                                {dayjs(record.startDate).format('MMM DD, YYYY')}
                            </div>
                            <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FiClock size={12} />
                                {dayjs(record.dueDate).format('MMM DD, YYYY')}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignTo',
            key: 'assignTo',
            render: (assignTo) => {
                const assignedUsers = getAssignedUsers(assignTo)
                    .map(id => users?.find(u => u.id === id))
                    .filter(Boolean);

                return (
                    <Avatar.Group maxCount={3} maxStyle={{ color: '#1890FF', backgroundColor: '#E6F7FF' }}>
                        {assignedUsers.map((user, index) => (
                            <Tooltip key={user.id} title={user.username || user.email}>
                                <Avatar
                                    src={user.profilePic}
                                    style={{
                                        backgroundColor: !user.profilePic ? '#1890FF' : undefined,
                                        color: !user.profilePic ? '#fff' : undefined,
                                    }}
                                >
                                    {!user.profilePic && (user.username?.[0] || user.email?.[0] || '').toUpperCase()}
                                </Avatar>
                            </Tooltip>
                        ))}
                    </Avatar.Group>
                );
            },
        },
        {
            title: 'File',
            dataIndex: 'file',
            key: 'file',
            render: (file) => {
                if (!file) return <Text type="secondary">-</Text>;

                const fileName = file.split('/').pop();
                const fileExtension = fileName.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

                return (
                    <div className="item-wrapper">
                        <div className="item-content">
                            <div className="icon-wrapper" style={{ color: "#059669", background: "rgba(5, 150, 105, 0.1)" }}>
                                {isImage ? (
                                    <img
                                        src={file}
                                        alt={fileName}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '6px'
                                        }}
                                    />
                                ) : (
                                    <FiFile className="item-icon" />
                                )}
                            </div>
                            <div className="info-wrapper">
                                <Button
                                    type="link"
                                    icon={<FiDownload size={14} />}
                                    onClick={() => window.open(file, '_blank')}
                                    style={{ padding: 0, height: 'auto' }}
                                >
                                    Download
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 60,
            render: (_, record) => (
                <Dropdown
                    menu={getDropdownItems(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="task-actions-dropdown"
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
        <div className="task-list-container">
            {/* Bulk Actions */}
            {selectedRowKeys.length > 0 && (
                <div className="bulk-actions">
                    <Button
                        type="primary"
                        danger
                        icon={<FiTrash2 size={16} />}
                        onClick={() => {
                            onDelete(selectedRowKeys);
                            setSelectedRowKeys([]); // Clear selection after initiating delete
                        }}
                    >
                        Delete Selected ({selectedRowKeys.length})
                    </Button>
                </div>
            )}

            {/* Task Table */}
        {/* <div className='task-list-container'> */}
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={tasks}
                rowKey="id"
                pagination={paginationConfig}
                scroll={{ x: 1000, y: 'calc(100vh - 350px)' }}
                className="task-table"
            />

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailCard
                    record={selectedTask}
                    users={users}
                    visible={detailModalVisible}
                    onClose={() => {
                        setDetailModalVisible(false);
                        setSelectedTask(null);
                    }}
                />
            )}
        </div>
    );
};

export default TaskList;