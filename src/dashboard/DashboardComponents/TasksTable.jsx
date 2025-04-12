import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Radio, Avatar, Input, Button, Space, Tooltip, Modal } from 'antd';
import { FiCheckSquare, FiClock, FiCalendar, FiX, FiPaperclip, FiAlertCircle, FiUser } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

// Utility function moved outside components
const getAssignedUsers = (assignTo) => {
    try {
        if (typeof assignTo === 'string') {
            const parsed = JSON.parse(assignTo);
            // Check both possible fields for assigned users
            return parsed?.assignedusers || parsed?.users || [];
        }
        return assignTo?.assignedusers || assignTo?.users || [];
    } catch (error) {
        console.log('Error parsing assignTo:', error);
        return [];
    }
};

const TaskDetailCard = ({ record, users, visible, onClose }) => {
    const assignedUsers = getAssignedUsers(record?.assignTo)
        .map(id => users?.find(u => u.id === id))
        .filter(Boolean);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#52c41a';
            case 'In Progress': return '#1890ff';
            case 'Todo': return '#faad14';
            default: return '#d9d9d9';
        }
    };

    return (
        <Modal
            visible={visible}
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
                background: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
                padding: '20px 24px',
                borderRadius: '8px 8px 0 0',
                position: 'relative'
            }}>
                <div style={{ marginBottom: 16 }}>
                    <Tag style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: '#fff',
                        marginBottom: 8
                    }}>
                        Task #{record?.id?.slice(-8).toUpperCase()}
                    </Tag>
                    <Text style={{
                        fontSize: 24,
                        display: 'block',
                        color: '#fff',
                        fontWeight: '600',
                        marginBottom: 16
                    }}>
                        {record?.taskName}
                    </Text>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Tag style={{
                            background: `${getStatusColor(record?.status)}20`,
                            border: `1px solid ${getStatusColor(record?.status)}`,
                            color: getStatusColor(record?.status)
                        }}>
                            {record?.status}
                        </Tag>
                        <Tag style={{
                            background: record?.priority === 'High' ? '#ff4d4f20' :
                                record?.priority === 'Medium' ? '#faad1420' : '#52c41a20',
                            border: `1px solid ${record?.priority === 'High' ? '#ff4d4f' :
                                record?.priority === 'Medium' ? '#faad14' : '#52c41a'}`,
                            color: record?.priority === 'High' ? '#ff4d4f' :
                                record?.priority === 'Medium' ? '#faad14' : '#52c41a'
                        }}>
                            {record?.priority} Priority
                        </Tag>
                    </div>
                </div>
            </div>

            <div style={{ padding: '24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                    marginBottom: '24px',
                    background: '#f9f0ff',
                    padding: '16px',
                    borderRadius: '8px'
                }}>
                    <div>
                        <Text type="secondary" style={{
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginBottom: 4
                        }}>
                            <FiCalendar /> Start Date
                        </Text>
                        <Text strong>{dayjs(record?.startDate).format('MMM DD, YYYY')}</Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginBottom: 4
                        }}>
                            <FiClock /> Due Date
                        </Text>
                        <Text strong>{dayjs(record?.dueDate).format('MMM DD, YYYY')}</Text>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <Text type="secondary" style={{
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginBottom: 8
                    }}>
                        <FiUser /> Assigned Team Members
                    </Text>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        background: '#fff',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0'
                    }}>
                        {assignedUsers.map(user => (
                            <div key={user.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: '#fafafa'
                            }}>
                                <Avatar src={user.profilePic} style={{ border: '2px solid #fff' }}>
                                    {!user.profilePic && (user.username?.[0] || user.email?.[0] || '').toUpperCase()}
                                </Avatar>
                                <div>
                                    <Text strong style={{ display: 'block', fontSize: '14px' }}>
                                        {user.username || user.email}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Team Member</Text>
                                </div>
                            </div>
                        ))}
                        {assignedUsers.length === 0 && (
                            <Text type="secondary" style={{ padding: '8px' }}>No users assigned</Text>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <Text type="secondary" style={{
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginBottom: 8
                    }}>
                        <FiAlertCircle /> Description
                    </Text>
                    <div style={{
                        background: '#fff',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0'
                    }}>
                        <Paragraph style={{ margin: 0 }}>
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
                            marginBottom: 8
                        }}>
                            <FiPaperclip /> Attachments
                        </Text>
                        <div style={{
                            background: '#fff',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #f0f0f0'
                        }}>
                            <a
                                href={record.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#722ed1'
                                }}
                            >
                                <FiPaperclip />
                                <Text>View Attachment</Text>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

const TasksTable = ({
    tasks,
    loading,
    dateFilter,
    setDateFilter,
    navigate,
    users
}) => {
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const filterTasksByDate = (tasks) => {
        if (!tasks) return [];
        const now = dayjs();
        const today = now.startOf('day');
        const firstDayOfMonth = now.startOf('month');
        const firstDayOfYear = now.startOf('year');

        return tasks.filter(task => {
            const startDate = dayjs(task.startDate);
            const dueDate = dayjs(task.dueDate);

            switch (dateFilter) {
                case 'today':
                    return startDate.isSame(today, 'day') ||
                        dueDate.isSame(today, 'day') ||
                        (startDate.isBefore(today) && dueDate.isAfter(today));
                case 'month':
                    return (startDate.isAfter(firstDayOfMonth) || dueDate.isAfter(firstDayOfMonth)) &&
                        (startDate.isBefore(now.endOf('month')) || dueDate.isBefore(now.endOf('month')));
                case 'year':
                    return (startDate.isAfter(firstDayOfYear) || dueDate.isAfter(firstDayOfYear)) &&
                        (startDate.isBefore(now.endOf('year')) || dueDate.isBefore(now.endOf('year')));
                default:
                    return true;
            }
        });
    };

    const handleRowClick = (record) => {
        setSelectedTask(record);
        setModalVisible(true);
    };

    const columns = [
        {
            title: "Task Name",
            dataIndex: "taskName",
            key: "taskName",
            width: '40%',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search tasks..."
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 180, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button type="primary" onClick={() => confirm()} size="small">Search</Button>
                        <Button onClick={clearFilters} size="small">Reset</Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) =>
                record.taskName?.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <Tooltip title={text} mouseEnterDelay={0.5}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar style={{
                            backgroundColor: '#722ed1',
                            flexShrink: 0
                        }}>
                            {text?.[0]?.toUpperCase() || 'T'}
                        </Avatar>
                        <Text strong style={{ width: '100%' }} ellipsis>
                            {text || 'Untitled Task'}
                        </Text>
                    </div>
                </Tooltip>
            )
        },
        {
            title: "Due Date",
            dataIndex: "dueDate",
            key: "dueDate",
            width: '25%',
            render: (date) => (
                <Tooltip title={dayjs(date).format('MMMM DD, YYYY, HH:mm')}>
                    <Text>{dayjs(date).format('MMM DD, YYYY')}</Text>
                </Tooltip>
            )
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: '20%',
            filters: [
                { text: 'Completed', value: 'Completed' },
                { text: 'In Progress', value: 'In Progress' },
                { text: 'Todo', value: 'Todo' }
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Tag color={
                    status === 'Completed' ? 'success' :
                        status === 'In Progress' ? 'processing' : 'warning'
                }>
                    {status || 'Todo'}
                </Tag>
            )
        },
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            width: '15%',
            filters: [
                { text: 'High', value: 'High' },
                { text: 'Medium', value: 'Medium' },
                { text: 'Low', value: 'Low' }
            ],
            onFilter: (value, record) => record.priority === value,
            render: (priority) => (
                <Tag color={
                    priority === 'High' ? 'error' :
                        priority === 'Medium' ? 'warning' : 'success'
                }>
                    {priority || 'Low'}
                </Tag>
            )
        }
    ];

    const filteredTasks = filterTasksByDate(tasks);
    const displayTasks = filteredTasks.slice(0, 5); // Only take first 5 actual tasks

    return (
        <Card
            className="leads-table-card"
            bodyStyle={{ padding: 0 }}
            style={{ height: '100%' }}
        >
            <div className="table-header-wrapper" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f2ff 100%)',
                borderBottom: '1px solid #e6f4ff',
                padding: '16px',
                borderRadius: '8px 8px 0 0'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            background: '#722ed1',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FiCheckSquare style={{ color: 'white', fontSize: '16px' }} />
                        </div>
                        <Text strong style={{
                            fontSize: '18px',
                            color: '#1f2937',
                            background: 'linear-gradient(90deg, #722ed1, #b37feb)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: '600',
                            letterSpacing: '-0.02em'
                        }}>
                            Task Data
                        </Text>
                        <Tag style={{
                            marginLeft: '8px',
                            background: '#f9f0ff',
                            border: 'none',
                            color: '#722ed1',
                            fontWeight: '600',
                            fontSize: '13px'
                        }}>
                            {tasks?.length || 0} Total
                        </Tag>
                    </div>
                    <Radio.Group
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        size="small"
                        className="date-filter-radio-group"
                    >
                        <Radio.Button className="date-filter-radio-button" value="all" style={{ fontSize: '12px', fontWeight: '500' }}>All Time</Radio.Button>
                        <Radio.Button className="date-filter-radio-button" value="today" style={{ fontSize: '12px', fontWeight: '500' }}>Today</Radio.Button>
                        <Radio.Button className="date-filter-radio-button" value="month" style={{ fontSize: '12px', fontWeight: '500' }}>This Month</Radio.Button>
                        <Radio.Button className="date-filter-radio-button" value="year" style={{ fontSize: '12px', fontWeight: '500' }}>This Year</Radio.Button>
                    </Radio.Group>
                </div>
            </div>

            <Table
                dataSource={displayTasks}
                columns={columns}
                rowKey="id"
                pagination={false}
                className="colorful-table fixed-height-table"
                onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                    style: { cursor: 'pointer' }
                })}
                loading={loading}
                locale={{
                    emptyText: (
                        <div style={{ padding: '24px 0' }}>
                            <Text type="secondary">No tasks found</Text>
                        </div>
                    )
                }}
            />

            <TaskDetailCard
                record={selectedTask}
                users={users}
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedTask(null);
                }}
            />
        </Card>
    );
};

export default TasksTable;