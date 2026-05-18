import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Radio, Avatar, Space } from 'antd';
import { FiClock, FiPhoneCall, FiUsers, FiCheckSquare } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;

const FollowupRemindersTable = ({
    followups,
    loading,
    dateFilter,
    setDateFilter,
    navigate
}) => {
    // Local state for Interaction Type filter
    const [typeFilter, setTypeFilter] = useState("all");

    const filterFollowups = (items) => {
        if (!items) return [];
        
        // Only show pending / active followups
        const pendingItems = items.filter(item => item.status?.toLowerCase() !== 'completed');

        const now = dayjs();
        const today = now.startOf('day');

        // 1. Filter by Date
        let filtered = pendingItems.filter(item => {
            const itemDate = dayjs(item.date);
            switch (dateFilter) {
                case 'today': 
                    return itemDate.isSame(today, 'day');
                case 'overdue':
                    return itemDate.isBefore(today, 'day');
                case 'upcoming':
                    return itemDate.isAfter(today, 'day');
                default: 
                    return true;
            }
        });

        // 2. Filter by Interaction Type (call, meeting, task)
        if (typeFilter !== 'all') {
            filtered = filtered.filter(item => item.type?.toLowerCase() === typeFilter);
        }

        return filtered.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
    };

    const getRelativeDateTag = (date) => {
        const itemDate = dayjs(date);
        const today = dayjs().startOf('day');
        
        if (itemDate.isSame(today, 'day')) {
            return <Tag color="blue" style={{ borderRadius: '4px', border: 'none', fontSize: '10px' }}>TODAY</Tag>;
        }
        if (itemDate.isSame(today.add(1, 'day'), 'day')) {
            return <Tag color="cyan" style={{ borderRadius: '4px', border: 'none', fontSize: '10px' }}>TOMORROW</Tag>;
        }
        if (itemDate.isBefore(today, 'day')) {
            return <Tag color="error" style={{ borderRadius: '4px', border: 'none', fontSize: '10px' }}>OVERDUE</Tag>;
        }
        return null;
    };

    const columns = [
        {
            title: "Source / Lead",
            key: "source",
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag color={record.relatedType === 'Lead' ? 'cyan' : 'magenta'} style={{ fontSize: '10px', border: 'none' }}>
                        {record.relatedType?.toUpperCase()}
                    </Tag>
                    <Text strong style={{ fontSize: '13px' }}>{record.relatedName}</Text>
                </div>
            ),
        },
        {
            title: "Interaction",
            dataIndex: "type",
            key: "type",
            render: (type) => {
                let color = "blue";
                let icon = <FiPhoneCall style={{ marginRight: '4px' }} />;
                if (type === 'meeting') { color = "purple"; icon = <FiUsers style={{ marginRight: '4px' }} />; }
                if (type === 'task') { color = "orange"; icon = <FiCheckSquare style={{ marginRight: '4px' }} />; }
                return <Tag color={color} style={{ border: 'none', display: 'inline-flex', alignItems: 'center' }} icon={icon}>{type?.toUpperCase()}</Tag>;
            }
        },
        {
            title: "Title / Notes",
            dataIndex: "name",
            key: "name",
            render: (text) => (
                <Text style={{ fontSize: '13px' }} ellipsis={{ tooltip: text }}>
                    {text}
                </Text>
            )
        },
        {
            title: "Schedule",
            dataIndex: "date",
            key: "date",
            render: (date, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Text strong style={{ fontSize: '12px' }}>{dayjs(date).format('DD MMM, YYYY')}</Text>
                        {getRelativeDateTag(date)}
                    </div>
                    {record.time && (
                        <Text type="secondary" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <FiClock size={11} /> {record.time}
                        </Text>
                    )}
                </div>
            )
        },
        {
            title: "Priority",
            dataIndex: ["rawData", "priority"],
            key: "priority",
            align: 'center',
            render: (priority) => {
                const p = priority?.toLowerCase() || 'medium';
                const colors = { highest: 'error', high: 'error', medium: 'warning', low: 'success' };
                return <Tag color={colors[p] || 'default'} style={{ borderRadius: '4px', fontSize: '11px', border: 'none' }}>{p.toUpperCase()}</Tag>;
            },
        }
    ];

    const displayData = filterFollowups(followups);

    return (
        <Card
            className="standard-content-card"
            bodyStyle={{ padding: 0 }}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#1677ff', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                        <FiClock style={{ color: 'white' }} />
                    </div>
                    <Text strong style={{ fontSize: '15px' }}>Pending Follow-ups</Text>
                    <Tag style={{ borderRadius: '10px', background: '#f1f5f9', border: 'none' }}>{displayData.length}</Tag>
                </div>
            }
            extra={
                <Space size="middle" wrap className="followups-filter-space">
                    {/* Interaction Type Filter */}
                    <Radio.Group value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} size="small">
                        <Radio.Button value="all">All Types</Radio.Button>
                        <Radio.Button value="call">Calls</Radio.Button>
                        <Radio.Button value="meeting">Meetings</Radio.Button>
                        <Radio.Button value="task">Tasks</Radio.Button>
                    </Radio.Group>
                    
                    {/* Date/Status Filter */}
                    <Radio.Group value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} size="small">
                        <Radio.Button value="all">All Pending</Radio.Button>
                        <Radio.Button value="overdue">Overdue</Radio.Button>
                        <Radio.Button value="today">Today</Radio.Button>
                        <Radio.Button value="upcoming">Upcoming</Radio.Button>
                    </Radio.Group>
                </Space>
            }
        >
            <Table
                dataSource={displayData}
                columns={columns}
                size="small"
                rowKey={(record) => `${record.type}-${record.id}`}
                className="compact-table"
                loading={loading}
                pagination={{ pageSize: 6, hideOnSinglePage: true }}
                onRow={() => ({
                    onClick: () => navigate(`/dashboard/crm/followups`),
                    style: { cursor: 'pointer' }
                })}
                scroll={{ x: 'max-content' }}
                locale={{
                    emptyText: (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <FiCheckSquare size={32} style={{ color: '#52c41a', marginBottom: '8px' }} />
                            <p style={{ margin: 0, color: '#8c8c8c' }}>All caught up! No pending follow-ups found.</p>
                        </div>
                    )
                }}
            />
        </Card>
    );
};

export default FollowupRemindersTable;
