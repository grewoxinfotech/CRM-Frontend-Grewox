import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Radio, Avatar } from 'antd';
import { FiCheckSquare, FiClock, FiAlertTriangle } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;

const PendingTasksTable = ({
    tasks,
    loading,
    dateFilter,
    setDateFilter,
    navigate
}) => {
    const filterPendingTasks = (items) => {
        if (!items) return [];

        // Only show tasks that are NOT completed
        const pendingItems = items.filter(task => task.status?.toLowerCase() !== 'completed');

        const now = dayjs();
        const today = now.startOf('day');

        return pendingItems.filter(task => {
            const dueDate = dayjs(task.dueDate);
            switch (dateFilter) {
                case 'today': 
                    return dueDate.isSame(today, 'day');
                case 'overdue':
                    return dueDate.isBefore(today, 'day');
                case 'upcoming':
                    return dueDate.isAfter(today, 'day');
                default: 
                    return true;
            }
        }).sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf());
    };

    const getRelativeDueDateTag = (date) => {
        const dueDate = dayjs(date);
        const today = dayjs().startOf('day');
        
        if (dueDate.isSame(today, 'day')) {
            return <Tag color="blue" style={{ borderRadius: '4px', border: 'none', fontSize: '10px' }}>TODAY</Tag>;
        }
        if (dueDate.isSame(today.add(1, 'day'), 'day')) {
            return <Tag color="cyan" style={{ borderRadius: '4px', border: 'none', fontSize: '10px' }}>TOMORROW</Tag>;
        }
        if (dueDate.isBefore(today, 'day')) {
            return <Tag color="error" style={{ borderRadius: '4px', border: 'none', fontSize: '10px' }}>OVERDUE</Tag>;
        }
        return null;
    };

    const columns = [
        {
            title: "Task Name",
            dataIndex: "taskName",
            key: "taskName",
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar size="small" style={{ backgroundColor: '#722ed1', fontSize: '10px' }}>
                        {text ? text[0].toUpperCase() : 'T'}
                    </Avatar>
                    <Text strong style={{ fontSize: '13px' }}>{text || 'Untitled'}</Text>
                </div>
            ),
        },
        {
            title: "Due Date",
            dataIndex: "dueDate",
            key: "dueDate",
            render: (date) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Text style={{ fontSize: '12px' }}>{dayjs(date).format('DD MMM, YYYY')}</Text>
                    {getRelativeDueDateTag(date)}
                </div>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: 'center',
            render: (status) => {
                const colors = { 'In Progress': 'processing', Todo: 'warning' };
                return <Tag color={colors[status] || 'default'} style={{ borderRadius: '4px', fontSize: '11px', border: 'none' }}>{(status || 'Todo').toUpperCase()}</Tag>;
            },
        },
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            align: 'center',
            render: (priority) => {
                const colors = { High: 'error', Medium: 'warning', Low: 'success' };
                return <Tag color={colors[priority] || 'default'} style={{ borderRadius: '4px', fontSize: '11px', border: 'none' }}>{(priority || 'Low').toUpperCase()}</Tag>;
            },
        }
    ];

    const displayData = filterPendingTasks(tasks);

    return (
        <Card
            className="standard-content-card"
            bodyStyle={{ padding: 0 }}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#722ed1', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                        <FiCheckSquare style={{ color: 'white' }} />
                    </div>
                    <Text strong style={{ fontSize: '15px' }}>Pending Tasks</Text>
                    <Tag style={{ borderRadius: '10px', background: '#f1f5f9', border: 'none' }}>{displayData.length}</Tag>
                </div>
            }
            extra={
                <Radio.Group value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} size="small">
                    <Radio.Button value="all">All Pending</Radio.Button>
                    <Radio.Button value="overdue">Overdue</Radio.Button>
                    <Radio.Button value="today">Today</Radio.Button>
                    <Radio.Button value="upcoming">Upcoming</Radio.Button>
                </Radio.Group>
            }
        >
            <Table
                dataSource={displayData}
                columns={columns}
                size="small"
                rowKey="id"
                className="compact-table"
                loading={loading}
                pagination={{ pageSize: 6, hideOnSinglePage: true }}
                onRow={() => ({
                    onClick: () => navigate(`/dashboard/crm/tasks`),
                    style: { cursor: 'pointer' }
                })}
                scroll={{ x: 'max-content' }}
                locale={{
                    emptyText: (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <FiCheckSquare size={32} style={{ color: '#52c41a', marginBottom: '8px' }} />
                            <p style={{ margin: 0, color: '#8c8c8c' }}>Hurrah! No pending tasks found.</p>
                        </div>
                    )
                }}
            />
        </Card>
    );
};

export default PendingTasksTable;
