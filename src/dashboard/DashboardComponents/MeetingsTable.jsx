import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Radio, Avatar, Input, Button, Space, Tooltip, Modal } from 'antd';
import { FiVideo } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;

const MeetingsTable = ({
    meetings,
    loading,
    dateFilter,
    setDateFilter,
    navigate
}) => {
    const filterMeetingsByDate = (meetings) => {
        if (!meetings) return [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

        return meetings.filter(meeting => {
            const meetingDate = new Date(meeting.date);
            switch (dateFilter) {
                case 'today':
                    return meetingDate >= today;
                case 'month':
                    return meetingDate >= firstDayOfMonth;
                case 'year':
                    return meetingDate >= firstDayOfYear;
                default:
                    return true;
            }
        });
    };

    const columns = [
        {
            title: "Meeting Title",
            dataIndex: "title",
            key: "title",
            width: '25%',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search meetings..."
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
                record.title?.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar style={{
                        backgroundColor: record.meetingLink ? '#52c41a' : '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FiVideo style={{ color: 'white' }} />
                    </Avatar>
                    <div>
                        <Text strong style={{ display: 'block' }}>{text}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.description || 'No description'}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: "Time",
            dataIndex: "startTime",
            key: "time",
            width: '25%',
            render: (startTime, record) => (
                <div>
                    <Text strong style={{ display: 'block' }}>
                        {dayjs(record.date).format('MMM DD, YYYY')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {dayjs(`2000-01-01T${startTime}`).format('hh:mm A')} -
                        {dayjs(`2000-01-01T${record.endTime}`).format('hh:mm A')}
                    </Text>
                </div>
            )
        },
        {
            title: "Participants",
            dataIndex: "employee",
            key: "employee",
            width: '25%',
            render: (employees) => {
                const employeeArray = employees ? JSON.parse(employees) : [];
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar.Group maxCount={3}>
                            {employeeArray.map((emp, index) => (
                                <Avatar key={index} style={{ backgroundColor: '#1890ff' }}>
                                    {emp.slice(0, 2).toUpperCase()}
                                </Avatar>
                            ))}
                        </Avatar.Group>
                        <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                            {employeeArray.length} {employeeArray.length === 1 ? 'participant' : 'participants'}
                        </Text>
                    </div>
                );
            }
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: '25%',
            render: (status) => {
                const statusConfig = {
                    scheduled: {
                        color: '#1890ff',
                        bg: '#e6f7ff'
                    },
                    completed: {
                        color: '#52c41a',
                        bg: '#f6ffed'
                    },
                    cancelled: {
                        color: '#ff4d4f',
                        bg: '#fff1f0'
                    }
                };

                const config = statusConfig[status.toLowerCase()] || statusConfig.scheduled;

                return (
                    <Tag style={{
                        color: config.color,
                        backgroundColor: config.bg,
                        border: `1px solid ${config.color}`,
                        textTransform: 'capitalize',
                        fontWeight: '500'
                    }}>
                        {status}
                    </Tag>
                );
            }
        }
    ];

    const filteredMeetings = filterMeetingsByDate(meetings);
    const displayMeetings = filteredMeetings?.slice(0, 5) || [];

    return (
        <Card
            className="leads-table-card"
            bodyStyle={{ padding: 0 }}
            style={{ height: '100%' }}
        >
            <div className="table-header-wrapper" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #e6f7ff 100%)',
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
                            background: '#1890ff',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FiVideo style={{ color: 'white', fontSize: '16px' }} />
                        </div>
                        <Text strong style={{
                            fontSize: '18px',
                            color: '#1f2937',
                            background: 'linear-gradient(90deg, #1890ff, #69c0ff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: '600',
                            letterSpacing: '-0.02em'
                        }}>
                            Meeting Data
                        </Text>
                        <Tag style={{
                            marginLeft: '8px',
                            background: '#e6f7ff',
                            border: 'none',
                            color: '#1890ff',
                            fontWeight: '600',
                            fontSize: '13px'
                        }}>
                            {meetings?.length || 0} Total
                        </Tag>
                    </div>
                    <Radio.Group
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        size="small"
                    >
                        <Radio.Button value="all" style={{ fontSize: '12px', fontWeight: '500' }}>All Time</Radio.Button>
                        <Radio.Button value="today" style={{ fontSize: '12px', fontWeight: '500' }}>Today</Radio.Button>
                        <Radio.Button value="month" style={{ fontSize: '12px', fontWeight: '500' }}>This Month</Radio.Button>
                        <Radio.Button value="year" style={{ fontSize: '12px', fontWeight: '500' }}>This Year</Radio.Button>
                    </Radio.Group>
                </div>
            </div>

            <Table
                dataSource={displayMeetings}
                columns={columns}
                rowKey="id"
                pagination={false}
                className="colorful-table fixed-height-table"
                onRow={(record) => ({
                    onClick: () => navigate(`/dashboard/hrm/meeting/${record.id}`),
                    style: { cursor: 'pointer' }
                })}
                loading={loading}
                locale={{
                    emptyText: (
                        <div style={{ padding: '24px 0' }}>
                            <Text type="secondary">No meetings found</Text>
                        </div>
                    )
                }}
            />
        </Card>
    );
};

export default MeetingsTable;