import React from 'react';
import { Card, Table, Typography, Tag, Radio, Avatar } from 'antd';
import { FiVideo } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;

const MeetingsTable = ({
    meetings,
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
                case 'today': return meetingDate >= today;
                case 'month': return meetingDate >= firstDayOfMonth;
                case 'year': return meetingDate >= firstDayOfYear;
                default: return true;
            }
        });
    };

    const columns = [
        {
            title: "Meeting Title",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar size="small" style={{ backgroundColor: '#4f46e5', fontSize: '10px' }} icon={<FiVideo size={10} />} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ fontSize: '13px' }}>{text || 'Untitled'}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>{record.description || 'No description'}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: "Time",
            dataIndex: "startTime",
            key: "time",
            render: (startTime, record) => (
                <div style={{ fontSize: '12px' }}>
                    <Text strong>{dayjs(record.date).format('DD MMM')}</Text>
                    <div style={{ color: '#64748b' }}>{dayjs(`2000-01-01T${startTime}`).format('hh:mm A')}</div>
                </div>
            ),
        },
        {
            title: "Participants",
            dataIndex: "employee",
            key: "employee",
            render: (employees) => {
                let empArr = [];
                try { empArr = employees ? (typeof employees === 'string' ? JSON.parse(employees) : employees) : []; } catch (e) { empArr = []; }
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar.Group maxCount={2} size="small">
                            {(Array.isArray(empArr) ? empArr : []).map((emp, i) => <Avatar key={i} style={{ backgroundColor: '#3b82f6' }}>{typeof emp === 'string' ? emp[0].toUpperCase() : '?'}</Avatar>)}
                        </Avatar.Group>
                        <Text type="secondary" style={{ fontSize: '11px' }}>{empArr.length} Joined</Text>
                    </div>
                );
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: 'center',
            render: (status) => {
                const colors = { scheduled: 'processing', completed: 'success', cancelled: 'error' };
                return <Tag color={colors[status?.toLowerCase()] || 'default'} style={{ borderRadius: '4px', fontSize: '11px', border: 'none' }}>{status?.toUpperCase()}</Tag>;
            },
        },
    ];

    return (
        <Card
            className="standard-content-card"
            bodyStyle={{ padding: 0 }}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#4f46e5', p: '6px', borderRadius: '6px', display: 'flex' }}><FiVideo style={{ color: 'white' }} /></div>
                    <Text strong style={{ fontSize: '15px' }}>Meeting Data</Text>
                    <Tag style={{ borderRadius: '10px', background: '#f1f5f9', border: 'none' }}>{meetings?.length || 0}</Tag>
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
                dataSource={filterMeetingsByDate(meetings)}
                columns={columns}
                size="small"
                rowKey="id"
                className="compact-table"
                pagination={{ pageSize: 6, hideOnSinglePage: true }}
                onRow={(record) => ({
                    onClick: () => navigate(`/dashboard/hrm/meeting/${record.id}`),
                    style: { cursor: 'pointer' }
                })}
                scroll={{ x: 'max-content' }}
            />
        </Card>
    );
};

export default MeetingsTable;