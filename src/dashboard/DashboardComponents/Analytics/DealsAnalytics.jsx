import React from 'react';
import { Card, Row, Col, Typography, Statistic } from 'antd';
import {
    AreaChart, Area,
    PieChart, Pie, Cell,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
    RadialBarChart, RadialBar,
    Legend
} from 'recharts';
import { useGetSourcesQuery } from '../../module/crm/crmsystem/souce/services/SourceApi';
import { useSelector } from 'react-redux';
import { useGetLeadStagesQuery } from '../../module/crm/crmsystem/leadstage/services/leadStageApi';
import { selectCurrentUser } from '../../../auth/services/authSlice';
import { DollarOutlined, TeamOutlined, FundOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

// Modern color palette matching dashboard stats exactly
const COLORS = {
    companies: { main: '#7c3aed', light: '#a78bfa' },
    leads: { main: '#eb2f96', light: '#ff85c0' },
    deals: { main: '#1890ff', light: '#69c0ff' },
    revenue: { main: '#52c41a', light: '#95de64' }
};

// Lighter colors for bottom charts
const BOTTOM_CHART_COLORS = [
    '#9333EA',  // Light purple
    '#EC4899',  // Light pink
    '#3B82F6',  // Light blue
    '#10B981'   // Light green
];

const CHART_COLORS = [
    COLORS.companies.main,
    COLORS.leads.main,
    COLORS.deals.main,
    COLORS.revenue.main
];

const GRADIENTS = {
    deals: {
        start: COLORS.deals.main,
        end: COLORS.deals.light
    },
    value: {
        start: COLORS.revenue.main,
        end: COLORS.revenue.light
    },
    won: {
        start: COLORS.leads.main,
        end: COLORS.leads.light
    },
    conversion: {
        start: COLORS.companies.main,
        end: COLORS.companies.light
    }
};

const DealsAnalytics = ({ deals }) => {
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
    const { data: stagesData } = useGetLeadStagesQuery();

    const sources = sourcesData?.data || [];
    const stages = stagesData?.filter(stage => stage.stageType === "lead") || [];

    // Calculate total value and other metrics
    const totalValue = deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0;
    const totalDeals = deals?.length || 0;
    const wonDeals = deals?.filter(deal => deal.status === 'won').length || 0;
    const conversionRate = totalDeals ? ((wonDeals / totalDeals) * 100).toFixed(1) : 0;

    // Process deals data for status distribution
    const statusData = deals?.reduce((acc, deal) => {
        const status = deal.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const statusPieData = Object.entries(statusData || {}).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count
    }));

    // Process deals data for source distribution
    const sourceData = deals?.reduce((acc, deal) => {
        const source = sources.find(s => s.id === deal.source)?.name || 'Unknown';
        const value = deal.value || 0;
        acc[source] = (acc[source] || 0) + value;
        return acc;
    }, {});

    const sourceBarData = Object.entries(sourceData || {}).map(([source, value]) => ({
        name: source,
        value: value
    })).sort((a, b) => b.value - a.value);

    // Process deals data for weekly trend
    const getWeekData = () => {
        const weekData = deals?.reduce((acc, deal) => {
            const date = new Date(deal.createdAt);
            const weekDay = date.toLocaleDateString('en-US', { weekday: 'short' });
            if (!acc[weekDay]) acc[weekDay] = { total: 0, value: 0 };
            acc[weekDay].total++;
            acc[weekDay].value += deal.value || 0;
            return acc;
        }, {});

        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
            name: day,
            deals: weekData?.[day]?.total || 0,
            value: weekData?.[day]?.value || 0
        }));
    };

    const weeklyData = getWeekData();

    const cardStyle = {
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        background: '#ffffff',
        border: 'none'
    };

    const chartCardStyle = {
        ...cardStyle,
        background: 'linear-gradient(145deg, #ffffff, #f6f8ff)',
    };

    const titleStyle = {
        fontSize: '18px',
        fontWeight: 600,
        margin: 0,
        color: '#1a1a1a',
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: '#fff',
                    padding: '12px',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ margin: '4px 0', color: entry.color }}>
                            {entry.name}: {entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Format currency with rupee symbol and shortened numbers
    const formatCurrency = (value) => {
        if (value >= 10000000) { // 1 Cr+
            return `₹${(value / 10000000).toFixed(1)}Cr`;
        } else if (value >= 100000) { // 1 Lakh+
            return `₹${(value / 100000).toFixed(1)}L`;
        } else if (value >= 1000) { // 1k+
            return `₹${(value / 1000).toFixed(1)}k`;
        }
        return `₹${value}`;
    };

    // Format numbers to be shorter (for non-currency values)
    const formatNumber = (value) => {
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}k`;
        }
        return value.toString();
    };

    const statStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '16px 24px',
        background: 'linear-gradient(145deg, #ffffff, #f6f8ff)',
        borderRadius: '12px',
        gap: '4px'
    };

    const statTitleStyle = {
        fontSize: '14px',
        color: '#666',
        margin: 0
    };

    const statValueStyle = {
        fontSize: '24px',
        fontWeight: '600',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const statRowStyle = {
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        marginBottom: '24px'
    };

    return (
        <div>
            <div style={statRowStyle}>
                <div style={statStyle}>
                    <p style={statTitleStyle}>Total Value</p>
                    <p style={{ ...statValueStyle, color: COLORS.deals.main }}>
                        <DollarOutlined /> {formatCurrency(totalValue)}
                    </p>
                </div>
                <div style={statStyle}>
                    <p style={statTitleStyle}>Total Deals</p>
                    <p style={{ ...statValueStyle, color: COLORS.revenue.main }}>
                        <TeamOutlined /> {formatNumber(totalDeals)}
                    </p>
                </div>
                <div style={statStyle}>
                    <p style={statTitleStyle}>Won Deals</p>
                    <p style={{ ...statValueStyle, color: COLORS.leads.main }}>
                        <CheckCircleOutlined /> {formatNumber(wonDeals)}
                    </p>
                </div>
                <div style={statStyle}>
                    <p style={statTitleStyle}>Conversion Rate</p>
                    <p style={{ ...statValueStyle, color: COLORS.companies.main }}>
                        <FundOutlined /> {conversionRate}%
                    </p>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card
                        title={<Title level={5} style={titleStyle}>Weekly Deals Performance</Title>}
                        style={chartCardStyle}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={weeklyData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.deals.main} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={COLORS.deals.light} stopOpacity={0.2} />
                                    </linearGradient>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.revenue.main} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={COLORS.revenue.light} stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis yAxisId="left" stroke="#666" />
                                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area yAxisId="left" type="monotone" dataKey="deals" stroke={COLORS.deals.main} fillOpacity={1} fill="url(#colorDeals)" />
                                <Area yAxisId="right" type="monotone" dataKey="value" stroke={COLORS.revenue.main} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title={<Title level={5} style={titleStyle}>Deal Status Distribution</Title>}
                        style={chartCardStyle}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <defs>
                                    {['companies', 'leads', 'deals', 'revenue'].map((key, index) => (
                                        <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS[key].main} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={COLORS[key].light} stopOpacity={0.8} />
                                        </linearGradient>
                                    ))}
                                </defs>
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
                                    {statusPieData.map((entry, index) => {
                                        const key = ['companies', 'leads', 'deals', 'revenue'][index % 4];
                                        return <Cell key={`cell-${index}`} fill={`url(#color${key})`} />;
                                    })}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title={<Title level={5} style={titleStyle}>Deal Value by Source</Title>}
                        style={chartCardStyle}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={sourceBarData} layout="vertical">
                                <defs>
                                    {['companies', 'leads', 'deals', 'revenue'].map((key, index) => (
                                        <linearGradient key={key} id={`colorBar${key}`} x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="5%" stopColor={COLORS[key].main} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={COLORS[key].light} stopOpacity={0.8} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" stroke="#666" />
                                <YAxis dataKey="name" type="category" stroke="#666" />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                                    {sourceBarData.map((entry, index) => {
                                        const key = ['companies', 'leads', 'deals', 'revenue'][index % 4];
                                        return <Cell key={`cell-${index}`} fill={`url(#colorBar${key})`} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DealsAnalytics;