import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Radio, Avatar } from 'antd';
import { FiCheckSquare, FiClock } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;

const TasksTable = ({
    tasks,
    dateFilter,
    setDateFilter,
    navigate
}) => {
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
                case 'today': return startDate.isSame(today, 'day') || dueDate.isSame(today, 'day') || (startDate.isBefore(today) && dueDate.isAfter(today));
                case 'month': return (startDate.isAfter(firstDayOfMonth) || dueDate.isAfter(firstDayOfMonth)) && (startDate.isBefore(now.endOf('month')) || dueDate.isBefore(now.endOf('month')));
                case 'year': return (startDate.isAfter(firstDayOfYear) || dueDate.isAfter(firstDayOfYear)) && (startDate.isBefore(now.endOf('year')) || dueDate.isBefore(now.endOf('year')));
                default: return true;
            }
        });
    };

    const columns = [
        {
            title: "Task Name",
            dataIndex: "taskName",
            key: "taskName",
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar size="small" style={{ backgroundColor: '#722ed1', fontSize: '10px' }}>{text ? text[0].toUpperCase() : 'T'}</Avatar>
                    <Text strong style={{ fontSize: '13px' }}>{text || 'Untitled'}</Text>
                </div>
            ),
        },
        {
            title: "Due Date",
            dataIndex: "dueDate",
            key: "dueDate",
            render: (date) => <Text style={{ fontSize: '12px' }}>{dayjs(date).format('DD MMM, YYYY')}</Text>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: 'center',
            render: (status) => {
                const colors = { Completed: 'success', 'In Progress': 'processing', Todo: 'warning' };
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

    return (
        <Card
            className="standard-content-card"
            bodyStyle={{ padding: 0 }}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#722ed1', p: '6px', borderRadius: '6px', display: 'flex' }}><FiCheckSquare style={{ color: 'white' }} /></div>
                    <Text strong style={{ fontSize: '15px' }}>Task Data</Text>
                    <Tag style={{ borderRadius: '10px', background: '#f1f5f9', border: 'none' }}>{tasks?.length || 0}</Tag>
                </div>
            }
            extra={
                <Radio.Group value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} size="small">
                    <Radio.Button value="all">All</Radio.Button>
                    <Radio.Button value="today">Today</Radio.Button>
                    <Radio.Button value="month">Month</Radio.Button>
                </Radio.Group>
            }
        >
            <Table
                dataSource={filterTasksByDate(tasks)}
                columns={columns}
                size="small"
                rowKey="id"
                className="compact-table"
                pagination={{ pageSize: 6, hideOnSinglePage: true }}
                onRow={() => ({
                    onClick: () => navigate(`/dashboard/crm/tasks`),
                    style: { cursor: 'pointer' }
                })}
                scroll={{ x: 'max-content' }}
            />
        </Card>
    );
};

export default TasksTable;