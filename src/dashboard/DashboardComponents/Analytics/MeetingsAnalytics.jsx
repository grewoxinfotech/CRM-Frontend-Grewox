import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import {
    AreaChart, Area,
    PieChart, Pie, Cell,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
    RadialBarChart, RadialBar,
    Legend
} from 'recharts';
import { useGetSourcesQuery, useGetStatusesQuery } from '../../module/crm/crmsystem/souce/services/SourceApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../auth/services/authSlice';


const { Title } = Typography;

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

const MeetingsAnalytics = ({ meetings }) => {
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
    const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);

    const sources = sourcesData?.data || [];
    const statuses = statusesData?.data || [];

    // Process meetings data for status distribution
    const statusData = meetings?.reduce((acc, meeting) => {
        const status = statuses.find(s => s.id === meeting.status)?.name || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const statusPieData = Object.entries(statusData || {}).map(([status, count]) => ({
        name: status,
        value: count
    }));

    // Process meetings data for time distribution
    const timeData = meetings?.reduce((acc, meeting) => {
        const hour = parseInt(meeting.startTime?.split(':')[0] || '0');
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {});

    const timeBarData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        meetings: timeData[i] || 0
    }));

    // Process meetings data for weekly trend
    const getWeekData = () => {
        const weekData = meetings?.reduce((acc, meeting) => {
            const date = new Date(meeting.date);
            const weekDay = date.toLocaleDateString('en-US', { weekday: 'short' });
            if (!acc[weekDay]) acc[weekDay] = { total: 0, completed: 0 };
            acc[weekDay].total++;
            if (meeting.status === 'completed') acc[weekDay].completed++;
            return acc;
        }, {});

        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
            name: day,
            total: weekData?.[day]?.total || 0,
            completed: weekData?.[day]?.completed || 0
        }));
    };

    const weeklyData = getWeekData();

    const cardStyle = {
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: '#ffffff',
        border: 'none'
    };

    const titleStyle = {
        fontSize: '16px',
        fontWeight: 600,
        margin: 0,
        color: '#262626',
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: '#fff',
                    padding: '12px',
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ margin: 0, fontWeight: 500 }}>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ margin: '4px 0', color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Row gutter={[24, 24]}>
            <Col span={24}>
                <Card
                    title={<Title level={5} style={titleStyle}>Weekly Meeting Trend</Title>}
                    style={cardStyle}
                    bodyStyle={{ padding: '24px' }}
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={weeklyData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="total" stroke="#8884d8" fillOpacity={1} fill="url(#colorTotal)" />
                            <Area type="monotone" dataKey="completed" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCompleted)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
            <Col xs={24} lg={12}>
                <Card
                    title={<Title level={5} style={titleStyle}>Meeting Status Distribution</Title>}
                    style={cardStyle}
                    bodyStyle={{ padding: '24px' }}
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {statusPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
            <Col xs={24} lg={12}>
                <Card
                    title={<Title level={5} style={titleStyle}>Meetings by Time of Day</Title>}
                    style={cardStyle}
                    bodyStyle={{ padding: '24px' }}
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={timeBarData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="meetings" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                {timeBarData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`#8884d8${Math.floor((entry.meetings / Math.max(...timeBarData.map(d => d.meetings))) * 99).toString(16).padStart(2, '0')}`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
        </Row>
    );
};

export default MeetingsAnalytics; 