import React from 'react';
import { Row, Col, Card, Typography, Breadcrumb, Badge, Table, Progress, Avatar } from 'antd';
import { motion } from 'framer-motion';
import {
    FiUsers,
    FiDollarSign,
    FiHome,
    FiCreditCard,
    FiTrendingUp,
    FiPieChart,
    FiActivity,
    FiSmile,
    FiAward
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../auth/services/authSlice';
import { Link } from 'react-router-dom';
import { useGetAllCompaniesQuery } from '../company/services/companyApi';
import { useGetAllPlansQuery } from '../plans/services/planApi';
import { useGetAllSubscribedUsersQuery } from '../SubscribedUser/services/SubscribedUserApi';
import PageHeader from '../../../components/PageHeader';
import StatCard from '../../../components/StatCard';
import moment from 'moment';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    LineChart,
    Line
} from 'recharts';
import './dashboard.scss';

const { Title, Text } = Typography;

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#d946ef', '#06b6d4'];

const SuperAdminDashboard = () => {
    const user = useSelector(selectCurrentUser);
    const { data: companiesData } = useGetAllCompaniesQuery();
    const { data: plansData } = useGetAllPlansQuery({ page: 1, limit: 100 });
    const { data: subscribedUsersData } = useGetAllSubscribedUsersQuery();

    // Calculate actual best selling plan
    const planCounts = React.useMemo(() => {
        const counts = {};
        subscribedUsersData?.data?.forEach(sub => {
            if (sub.status === 'active') {
                counts[sub.plan_id] = (counts[sub.plan_id] || 0) + 1;
            }
        });
        return counts;
    }, [subscribedUsersData]);

    const bestSellingInfo = React.useMemo(() => {
        let bestId = null;
        let maxCount = 0;
        Object.entries(planCounts).forEach(([planId, count]) => {
            if (count > maxCount) {
                maxCount = count;
                bestId = planId;
            }
        });
        const plan = plansData?.data?.find(p => p.id === bestId);
        return {
            name: plan?.name || 'Basic Plan',
            count: maxCount
        };
    }, [planCounts, plansData]);

    // Calculate statistics
    const totalClients = companiesData?.data?.length || 0;
    const activeSubscriptions = subscribedUsersData?.data?.filter(sub =>
        sub.status === 'active'
    ).length || 0;

    const totalRevenue = subscribedUsersData?.data?.reduce((total, sub) => {
        if (sub.status === 'active' && sub.payment_status === 'paid') {
            const plan = plansData?.data?.find(p => p.id === sub.plan_id);
            return total + Number(plan?.price || 0);
        }
        return total;
    }, 0) || 0;

    // Dynamic 6-month Revenue and Subscription Growth Chart Data
    const monthlyRevenueData = React.useMemo(() => {
        if (!subscribedUsersData?.data || !plansData?.data) return [];
        
        const months = [];
        for (let i = 5; i >= 0; i--) {
            months.push({
                month: moment().subtract(i, 'months').format('MMM YYYY'),
                revenue: 0,
                subscriptions: 0
            });
        }

        subscribedUsersData.data.forEach(sub => {
            if (sub.status === 'active' && sub.payment_status === 'paid' && sub.createdAt) {
                const subMonth = moment(sub.createdAt).format('MMM YYYY');
                const monthObj = months.find(m => m.month === subMonth);
                if (monthObj) {
                    const plan = plansData.data.find(p => p.id === sub.plan_id);
                    const price = Number(plan?.price || 0);
                    monthObj.revenue += price;
                    monthObj.subscriptions += 1;
                }
            }
        });

        return months;
    }, [subscribedUsersData, plansData]);

    // Dynamic Plan Distribution Bar Chart Data
    const planStats = React.useMemo(() => {
        if (!subscribedUsersData?.data || !plansData?.data) return [];
        
        return plansData.data
            .map(plan => ({
                name: plan.name,
                value: planCounts[plan.id] || 0
            }))
            .filter(item => item.value > 0);
    }, [planCounts, plansData]);

    // Dynamic 6-month Signup Growth Rate
    const monthlySignupData = React.useMemo(() => {
        if (!companiesData?.data) return [];
        
        const months = [];
        for (let i = 5; i >= 0; i--) {
            months.push({
                month: moment().subtract(i, 'months').format('MMM YYYY'),
                signups: 0
            });
        }

        companiesData.data.forEach(c => {
            if (c.createdAt) {
                const cMonth = moment(c.createdAt).format('MMM YYYY');
                const monthObj = months.find(m => m.month === cMonth);
                if (monthObj) {
                    monthObj.signups += 1;
                }
            }
        });

        return months;
    }, [companiesData]);

    // Tenant System Health (Active vs Suspended Donut Chart)
    const companyStatusStats = React.useMemo(() => {
        if (!companiesData?.data) return [];
        let active = 0;
        let inactive = 0;
        
        companiesData.data.forEach(c => {
            if (c.status === 'active') active++;
            else inactive++;
        });

        return [
            { name: 'Active Tenants', value: active, color: '#10b981' },
            { name: 'Suspended/Inactive', value: inactive, color: '#ef4444' }
        ].filter(item => item.value > 0);
    }, [companiesData]);

    // Calculate Plan Revenue Share
    const planRevenueShare = React.useMemo(() => {
        if (!subscribedUsersData?.data || !plansData?.data) return [];
        
        const share = {};
        let totalRev = 0;

        plansData.data.forEach(p => {
            share[p.id] = {
                id: p.id,
                name: p.name,
                revenue: 0,
                color: ''
            };
        });

        subscribedUsersData.data.forEach(sub => {
            if (sub.status === 'active' && sub.payment_status === 'paid') {
                const plan = plansData.data.find(p => p.id === sub.plan_id);
                if (plan) {
                    if (!share[plan.id]) {
                        share[plan.id] = { id: plan.id, name: plan.name, revenue: 0 };
                    }
                    const price = Number(plan.price || 0);
                    share[plan.id].revenue += price;
                    totalRev += price;
                }
            }
        });

        return Object.values(share)
            .map((item, index) => ({
                ...item,
                percent: totalRev > 0 ? Math.round((item.revenue / totalRev) * 100) : 0,
                color: COLORS[index % COLORS.length]
            }))
            .filter(item => item.revenue > 0)
            .sort((a, b) => b.revenue - a.revenue);
    }, [subscribedUsersData, plansData]);

    // Calculate Top 5 Recent Subscriptions
    const recentSubscriptions = React.useMemo(() => {
        if (!subscribedUsersData?.data || !companiesData?.data || !plansData?.data) return [];
        
        const sorted = [...subscribedUsersData.data]
            .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
            .slice(0, 5);

        return sorted.map(sub => {
            const company = companiesData.data.find(c => c.id === sub.client_id);
            const plan = plansData.data.find(p => p.id === sub.plan_id);
            return {
                id: sub.id,
                companyName: company?.username || 'N/A',
                companyEmail: company?.email || 'N/A',
                planName: plan?.name || 'Basic Plan',
                price: Number(plan?.price || 0),
                startDate: sub.start_date ? moment(sub.start_date).format('YYYY-MM-DD') : '-',
                endDate: sub.end_date ? moment(sub.end_date).format('YYYY-MM-DD') : '-',
                status: sub.status || 'active',
                paymentStatus: sub.payment_status || 'paid'
            };
        });
    }, [subscribedUsersData, companiesData, plansData]);

    // Custom Tooltip component for recharts
    const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(4px)'
                }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '13px' }}>{label}</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: '#2563eb', fontSize: '14px' }}>
                        {prefix}{payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            className="dashboard-container"
            initial="initial"
            animate="animate"
            variants={{
                animate: { transition: { staggerChildren: 0.1 } }
            }}
        >
            <PageHeader
                title="Overview"
                subtitle="Welcome back! Super Admin"
                breadcrumbItems={[
                    {
                        title: (
                            <Link to="/superadmin">
                                <FiHome style={{ marginRight: '4px' }} />
                                Home
                            </Link>
                        )
                    },
                    { title: 'Dashboard' }
                ]}
            />

            {/* Stat Cards Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <StatCard 
                    icon={<FiUsers />}
                    title="Total Companies"
                    value={totalClients}
                    subtitle="Total registered clients"
                    tag={`Paid Users: ${activeSubscriptions}`}
                    color="#2563eb"
                    gradient="linear-gradient(135deg, #2563eb, #3b82f6)"
                />
                <StatCard 
                    icon={<FiAward />}
                    title="Best Selling Plan"
                    value={bestSellingInfo.name}
                    subtitle="Plan with highest volume"
                    tag={`Active Subscriptions: ${bestSellingInfo.count}`}
                    color="#8b5cf6"
                    gradient="linear-gradient(135deg, #8b5cf6, #6d28d9)"
                />
                <StatCard 
                    icon={<FiDollarSign />}
                    title="Total Revenue"
                    value={totalRevenue}
                    subtitle="Revenue from active subscriptions"
                    tag={`Total Order Amount: ₹${totalRevenue.toLocaleString()}`}
                    color="#16a34a"
                    gradient="linear-gradient(135deg, #16a34a, #15803d)"
                    prefix="₹"
                    decimals={2}
                />
            </Row>

            {/* Row 1: Core Financial Analytics */}
            <Row gutter={[20, 20]} style={{ marginBottom: '20px' }}>
                
                {/* Revenue Growth Trend */}
                <Col xs={24} lg={16}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                            border: '1px solid #e2e8f0',
                            height: '100%'
                        }}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#eff6ff', color: '#2563eb', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                    <FiTrendingUp size={18} />
                                </div>
                                <div>
                                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', display: 'block' }}>Revenue & Billings Trend</span>
                                    <span style={{ fontWeight: 500, fontSize: '11px', color: '#64748b' }}>6-Month transaction history</span>
                                </div>
                            </div>
                        }
                    >
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip content={<CustomTooltip prefix="₹" />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Plan Popularity Distribution */}
                <Col xs={24} lg={8}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                            border: '1px solid #e2e8f0',
                            height: '100%'
                        }}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#f5f3ff', color: '#8b5cf6', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                    <FiPieChart size={18} />
                                </div>
                                <div>
                                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', display: 'block' }}>Plan Volume</span>
                                    <span style={{ fontWeight: 500, fontSize: '11px', color: '#64748b' }}>Active subscriptions count</span>
                                </div>
                            </div>
                        }
                    >
                        <div style={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {planStats.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                                    No active plans data to show yet.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart data={planStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={30}>
                                            {planStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>
                </Col>

            </Row>

            {/* Row 2: Client & Acquisition Growth Analytics */}
            <Row gutter={[20, 20]}>
                
                {/* Client Acquisition Trend (Line Chart) */}
                <Col xs={24} lg={14}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                            border: '1px solid #e2e8f0',
                            height: '100%'
                        }}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#ecfdf5', color: '#10b981', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                    <FiActivity size={18} />
                                </div>
                                <div>
                                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', display: 'block' }}>Company Acquisition Rate</span>
                                    <span style={{ fontWeight: 500, fontSize: '11px', color: '#64748b' }}>New client signups per month</span>
                                </div>
                            </div>
                        }
                    >
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlySignupData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="signups" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Company Health Status Donut PieChart */}
                <Col xs={24} lg={10}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                            border: '1px solid #e2e8f0',
                            height: '100%'
                        }}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#fffbeb', color: '#f59e0b', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                    <FiSmile size={18} />
                                </div>
                                <div>
                                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', display: 'block' }}>Tenant System Health</span>
                                    <span style={{ fontWeight: 500, fontSize: '11px', color: '#64748b' }}>Active vs. Suspended accounts</span>
                                </div>
                            </div>
                        }
                    >
                        <div style={{ width: '100%', height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            {companyStatusStats.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                                    No company status data to show.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-around', gap: '10px' }}>
                                    <div style={{ width: '50%', height: 220 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={companyStatusStats}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {companyStatusStats.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {companyStatusStats.map((entry, index) => (
                                            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Badge color={entry.color} />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{entry.name}</span>
                                                    <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: 700 }}>{entry.value} companies</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

            </Row>

            {/* Section: Subscriptions & Financial Insights */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: '24px' }}>
                <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                    <FiActivity size={18} />
                </div>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Subscriptions & Financial Insights</h2>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Real-time subscription transactions and revenue breakdown</p>
                </div>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                {/* Recent Subscriptions Table */}
                <Col xs={24} xl={16}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                            border: '1px solid #e2e8f0',
                        }}
                        title={
                            <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>Recent Subscription Transactions</span>
                        }
                    >
                        <Table
                            dataSource={recentSubscriptions}
                            rowKey="id"
                            pagination={false}
                            columns={[
                                {
                                    title: 'Company',
                                    dataIndex: 'companyName',
                                    key: 'companyName',
                                    render: (text, record) => (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Avatar style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontWeight: 600 }}>
                                                {text.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>{text}</span>
                                                <span style={{ color: '#64748b', fontSize: '11px' }}>{record.companyEmail}</span>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    title: 'Plan Name',
                                    dataIndex: 'planName',
                                    key: 'planName',
                                    render: (text) => (
                                        <Badge 
                                            count={text} 
                                            style={{ 
                                                backgroundColor: '#f1f5f9', 
                                                color: '#334155', 
                                                fontSize: '12px', 
                                                fontWeight: 600,
                                                padding: '0 8px',
                                                borderRadius: '6px',
                                                height: '22px',
                                                lineHeight: '22px',
                                                boxShadow: 'none',
                                                border: '1px solid #e2e8f0'
                                            }} 
                                        />
                                    )
                                },
                                {
                                    title: 'Amount',
                                    dataIndex: 'price',
                                    key: 'price',
                                    render: (val) => (
                                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                                            ₹{val.toLocaleString()}
                                        </span>
                                    )
                                },
                                {
                                    title: 'Duration',
                                    key: 'duration',
                                    render: (_, record) => (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>{record.startDate}</span>
                                            <span style={{ fontSize: '10px', color: '#64748b' }}>to {record.endDate}</span>
                                        </div>
                                    )
                                },
                                {
                                    title: 'Status',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: (status) => {
                                        const isAct = status === 'active';
                                        return (
                                            <Badge
                                                status={isAct ? 'success' : 'default'}
                                                text={isAct ? 'Active' : 'Inactive'}
                                                style={{ fontWeight: 600 }}
                                            />
                                        );
                                    }
                                }
                            ]}
                            locale={{
                                emptyText: <div style={{ padding: '24px', color: '#64748b' }}>No recent subscription data available</div>
                            }}
                        />
                    </Card>
                </Col>

                {/* Subscription Revenue Share progress card */}
                <Col xs={24} xl={8}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                            border: '1px solid #e2e8f0',
                            height: '100%'
                        }}
                        title={
                            <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>Subscription Revenue Share</span>
                        }
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '4px 0' }}>
                            {planRevenueShare.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
                                    No active billing transactions to evaluate.
                                </div>
                            ) : (
                                planRevenueShare.map((item) => (
                                    <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>
                                                {item.name}
                                            </span>
                                            <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                                                ₹{item.revenue.toLocaleString()} ({item.percent}%)
                                            </span>
                                        </div>
                                        <Progress 
                                            percent={item.percent} 
                                            strokeColor={item.color} 
                                            showInfo={false} 
                                            strokeWidth={8}
                                            style={{ margin: 0 }}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

        </motion.div>
    );
};

export default SuperAdminDashboard;
