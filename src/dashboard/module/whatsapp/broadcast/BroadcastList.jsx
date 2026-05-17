import React, { useState } from 'react';
import { Table, Button, Tag, Space, Card, Typography, Progress, Tooltip, message, Modal, Alert, Steps, Row, Col, Tabs, Select, Input, List, Drawer, Form, DatePicker } from 'antd';
import {
    PlusOutlined,
    SendOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    ReloadOutlined,
    EyeOutlined,
    BarChartOutlined,
    QuestionCircleOutlined,
    InfoCircleOutlined,
    FileTextOutlined,
    RocketOutlined,
    UsergroupAddOutlined,
    SoundOutlined,
    MessageOutlined,
    SyncOutlined,
    CalendarOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { FiFilter } from 'react-icons/fi';
import {
    useGetWhatsappBroadcastsQuery,
    usePauseWhatsappBroadcastMutation,
    useResumeWhatsappBroadcastMutation,
    useRetryWhatsappBroadcastMutation,
    useProcessWhatsappBroadcastMutation
} from '../../settings/services/settingsApi';
import { useGetSourcesQuery, useGetCategoriesQuery } from '../../crm/crmsystem/souce/services/SourceApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import CreateBroadcast from './CreateBroadcast';
import { motion } from "framer-motion";
import CountUp from 'react-countup';
import PageHeader from '../../../../components/PageHeader';
import { FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../whatsapp-messages.scss';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

const BroadcastList = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    const [filters, setFilters] = useState({
        source: null,
        category: null,
        target_module: null,
        dateRange: null
    });

    const loggedInUser = useSelector(selectCurrentUser);
    const { data: rolesData } = useGetRolesQuery(undefined, {
        skip: !loggedInUser || loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client'
    });
    const userRoleData = rolesData?.message?.data?.find(role => role.id === loggedInUser?.role_id);
    const userPermissions = React.useMemo(() => {
        if (!userRoleData?.permissions) return null;
        try {
            return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
        } catch (e) { return null; }
    }, [userRoleData]);
    const hasPermission = React.useCallback((action) => {
        if (!loggedInUser) return false;
        if (loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client') return true;
        if (!userPermissions) return false;
        const perms = userPermissions['dashboards-communication'];
        if (!perms || perms.length === 0) return false;
        return (perms[0]?.permissions || []).includes(action);
    }, [loggedInUser, userPermissions]);

    const { data: broadcasts = [], isLoading, isFetching, refetch } = useGetWhatsappBroadcastsQuery({
        search: searchQuery
    });
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
    const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);

    const sources = sourcesData?.data || [];
    const categories = categoriesData?.data || [];
    const [pauseBroadcast] = usePauseWhatsappBroadcastMutation();
    const [resumeBroadcast] = useResumeWhatsappBroadcastMutation();
    const [retryBroadcast] = useRetryWhatsappBroadcastMutation();
    const [processBroadcast] = useProcessWhatsappBroadcastMutation();

    const handleAction = async (action, id) => {
        try {
            if (action === 'pause') await pauseBroadcast(id).unwrap();
            if (action === 'resume') await resumeBroadcast(id).unwrap();
            if (action === 'retry') await retryBroadcast(id).unwrap();
            if (action === 'send') await processBroadcast(id).unwrap();
            message.success(`Broadcast ${action}ed successfully`);
            refetch();
        } catch (error) {
            message.error(`Failed to ${action} broadcast`);
        }
    };

    const getStatusTag = (status) => {
        const colors = {
            draft: 'default',
            scheduled: 'blue',
            processing: 'processing',
            paused: 'warning',
            completed: 'success',
            cancelled: 'error'
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
    };

    const columns = [
        {
            title: 'Campaign Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.template_name}</Text>
                </Space>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status)
        },
        {
            title: 'Progress',
            key: 'progress',
            render: (_, record) => {
                const percent = Math.round((record.sent_count / record.total_recipients) * 100) || 0;
                return (
                    <div style={{ width: 150 }}>
                        <Progress percent={percent} size="small" status={record.status === 'processing' ? 'active' : 'normal'} />
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            {record.sent_count} / {record.total_recipients} Sent
                        </Text>
                    </div>
                );
            }
        },
        {
            title: 'Analytics',
            key: 'analytics',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Delivered">
                        <Tag color="cyan">{record.delivered_count}</Tag>
                    </Tooltip>
                    <Tooltip title="Read">
                        <Tag color="green">{record.read_count}</Tag>
                    </Tooltip>
                    <Tooltip title="Failed">
                        <Tag color="red">{record.failed_count}</Tag>
                    </Tooltip>
                </Space>
            )
        },
        {
            title: 'Delivery Rate',
            key: 'deliveryRate',
            render: (_, record) => {
                const rate = record.sent_count > 0 ? Math.round((record.delivered_count / record.sent_count) * 100) : 0;
                let color = 'red';
                if (rate >= 80) color = 'green';
                else if (rate >= 50) color = 'orange';
                
                return (
                    <Text strong style={{ color: `var(--ant-${color}-6)` }}>
                        {rate}%
                    </Text>
                );
            }
        },
        {
            title: 'Broadcast Time',
            key: 'broadcastTime',
            render: (_, record) => {
                const isScheduled = !!record.scheduled_at;

                if (!isScheduled) {
                    return (
                        <Space direction="vertical" size={0}>
                            <Tag color="blue" style={{ borderRadius: '4px', fontWeight: '500' }}>Immediate</Tag>
                            {record.trigger_type === 'event' && <Text type="secondary" style={{ fontSize: '11px' }}>via Automation</Text>}
                        </Space>
                    );
                }

                return (
                    <Space direction="vertical" size={0}>
                        <Tag color="cyan" style={{ borderRadius: '4px', fontWeight: '500' }}>Scheduled</Tag>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            {new Date(record.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </Text>
                    </Space>
                );
            }
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {hasPermission('update') && (
                        <>
                            {record.status === 'draft' && (
                                <Button type="text" icon={<SendOutlined />} title="Launch" onClick={() => handleAction('send', record.id)} />
                            )}
                            {record.status === 'processing' ? (
                                <Button type="text" icon={<PauseCircleOutlined />} title="Pause" onClick={() => handleAction('pause', record.id)} />
                            ) : record.status === 'paused' ? (
                                <Button type="text" icon={<PlayCircleOutlined />} title="Resume" onClick={() => handleAction('resume', record.id)} />
                            ) : null}
                            {record.failed_count > 0 && (
                                <Button type="text" icon={<ReloadOutlined />} title="Retry Failed" onClick={() => handleAction('retry', record.id)} />
                            )}
                        </>
                    )}
                    <Button type="text" icon={<EyeOutlined />} title="View Details" />
                </Space>
            )
        }
    ];

    const globalFilteredBroadcasts = broadcasts.filter(b => {
        // Search query
        if (searchQuery && !b.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // Source filter
        if (filters.source && b.audience_filter?.source !== filters.source) return false;

        // Category filter
        if (filters.category && b.audience_filter?.category !== filters.category) return false;

        // Target Module filter
        if (filters.target_module && b.target_module !== filters.target_module) return false;

        // Date Range filter
        if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
            const createdAt = new Date(b.createdAt);
            const start = filters.dateRange[0].toDate();
            const end = filters.dateRange[1].toDate();
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            if (createdAt < start || createdAt > end) return false;
        }

        return true;
    });

    const stats = {
        total: globalFilteredBroadcasts.length,
        live: globalFilteredBroadcasts.filter(b => b.status === 'processing').length,
        sent: globalFilteredBroadcasts.reduce((acc, b) => acc + (b.sent_count || 0), 0),
        delivered: globalFilteredBroadcasts.reduce((acc, b) => acc + (b.delivered_count || 0), 0),
        scheduled: globalFilteredBroadcasts.filter(b => b.status === 'scheduled').length,
        draft: globalFilteredBroadcasts.filter(b => b.status === 'draft').length,
        completed: globalFilteredBroadcasts.filter(b => b.status === 'completed').length,
    };

    const deliveryRate = stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0;

    const filteredBroadcasts = globalFilteredBroadcasts.filter(b => {
        // Tab filter
        const matchesTab = activeTab === 'all' || b.status === activeTab;
        return matchesTab;
    });

    const iconBgMap = {
        TOTAL: "linear-gradient(135deg, #6366f1, #818cf8)",
        LIVE: "linear-gradient(135deg, #10b981, #34d399)",
        SENT: "linear-gradient(135deg, #722ed1, #a78bfa)",
        SCHEDULED: "linear-gradient(135deg, #faad14, #fbbf24)",
        DELIVERY: "linear-gradient(135deg, #2f54eb, #597ef7)",
    };

    const StatCard = ({ title, value, icon, index, type, suffix = "" }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
        >
            <Card
                className="standard-content-card stat-premium-card"
                bodyStyle={{ padding: '12px 16px' }}
                hoverable
            >
                <div className="stat-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="stat-icon-wrapper" style={{
                        background: iconBgMap[type] || "linear-gradient(135deg, #64748b, #94a3b8)",
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#fff',
                        fontSize: '16px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}>
                        {icon}
                    </div>
                </div>

                <div className="stat-card-body" style={{ marginTop: '8px' }}>
                    <Text style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {title}
                    </Text>
                    <div className="stat-value-display" style={{ marginTop: '0px' }}>
                        <Title level={2} style={{
                            margin: 0,
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            fontSize: '24px',
                            background: iconBgMap[type] || '#0f172a',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'inline-block',
                            lineHeight: '1.2'
                        }}>
                            <CountUp start={0} end={value} duration={2} separator="," suffix={suffix} />
                        </Title>
                    </div>
                </div>
            </Card>
        </motion.div>
    );

    return (
        <div className="broadcast-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <PageHeader
                title="WhatsApp Broadcast"
                count={broadcasts.length}
                subtitle={<span style={{ fontSize: '14px' }}>Manage and track your bulk messaging campaigns</span>}
                breadcrumbItems={[
                    {
                        title: (
                            <Link to="/dashboard">
                                <FiHome style={{ marginRight: "4px" }} />
                                Home
                            </Link>
                        )
                    },
                    { title: "WhatsApp" },
                    { title: "Broadcast" }
                ]}
                onAdd={hasPermission('create') ? () => setIsCreateModalOpen(true) : undefined}
                addText="New Campaign"
            />

            <Alert
                message="WhatsApp Broadcast Analytics"
                description="Monitor your bulk messaging performance and engagement metrics."
                type="info"
                showIcon
                closable
                style={{ marginBottom: '24px', borderRadius: '12px', marginTop: '24px' }}
            />

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={4}>
                    <StatCard
                        title="Total Campaigns"
                        value={stats.total}
                        icon={<SoundOutlined />}
                        type="TOTAL"
                        index={0}
                    />
                </Col>
                <Col xs={24} sm={12} md={5}>
                    <StatCard
                        title="Live Now"
                        value={stats.live}
                        icon={<SyncOutlined spin={stats.live > 0} />}
                        type="LIVE"
                        index={1}
                    />
                </Col>
                <Col xs={24} sm={12} md={5}>
                    <StatCard
                        title="Messages Sent"
                        value={stats.sent}
                        icon={<MessageOutlined />}
                        type="SENT"
                        index={2}
                    />
                </Col>
                <Col xs={24} sm={12} md={5}>
                    <StatCard
                        title="Delivery Rate"
                        value={deliveryRate}
                        icon={<CheckCircleOutlined />}
                        type="DELIVERY"
                        index={3}
                        suffix="%"
                    />
                </Col>
                <Col xs={24} sm={12} md={5}>
                    <StatCard
                        title="Scheduled"
                        value={stats.scheduled}
                        icon={<CalendarOutlined />}
                        type="SCHEDULED"
                        index={4}
                    />
                </Col>
            </Row>



            <Card
                bordered={false}
                style={{
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                    border: '1px solid #f0f0f0'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>Campaign Management</Title>
                        <Text type="secondary">View and manage all your broadcast activities.</Text>
                    </div>
                    <Space size="middle">
                        <Search
                            placeholder="Search campaigns..."
                            allowClear
                            onSearch={(value) => setSearchQuery(value)}
                            onChange={(e) => !e.target.value && setSearchQuery('')}
                            style={{ width: 250, borderRadius: '8px' }}
                        />
                        <Button
                            icon={<FiFilter />}
                            onClick={() => setIsFilterDrawerOpen(true)}
                            type={Object.keys(filters).filter(k => filters[k]).length > 0 ? "primary" : "default"}
                            style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Filter {Object.keys(filters).filter(k => filters[k]).length > 0 && `(${Object.keys(filters).filter(k => filters[k]).length})`}
                        </Button>
                        <Button
                            icon={<QuestionCircleOutlined />}
                            onClick={() => setIsHelpModalOpen(true)}
                            style={{ borderRadius: '8px' }}
                        >
                            Guide
                        </Button>
                    </Space>
                </div>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="project-tabs"
                    style={{ marginBottom: '16px' }}
                    items={[
                        { key: 'all', label: `All (${stats.total})` },
                        { key: 'draft', label: `Draft (${stats.draft})` },
                        { key: 'scheduled', label: `Scheduled (${stats.scheduled})` },
                        { key: 'processing', label: `Processing (${stats.live})` },
                        { key: 'completed', label: `Completed (${stats.completed})` },
                    ]}
                />

                <Table
                    columns={columns}
                    dataSource={filteredBroadcasts}
                    loading={isLoading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Drawer
                title="Advanced Filters"
                placement="right"
                onClose={() => setIsFilterDrawerOpen(false)}
                open={isFilterDrawerOpen}
                width={350}
                extra={
                    <Button onClick={() => setFilters({ source: null, category: null, target_module: null, dateRange: null })}>
                        Clear All
                    </Button>
                }
            >
                <Form layout="vertical">
                    <Form.Item label="Date Range">
                        <DatePicker.RangePicker 
                            style={{ width: '100%' }}
                            value={filters.dateRange}
                            onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
                        />
                    </Form.Item>
                    <Form.Item label="Target Module">
                        <Select
                            placeholder="Select Module"
                            allowClear
                            value={filters.target_module}
                            onChange={(val) => setFilters(prev => ({ ...prev, target_module: val }))}
                        >
                            <Option value="leads">Leads</Option>
                            <Option value="deals">Deals</Option>
                            <Option value="contacts">Contacts</Option>
                            <Option value="companies">Companies</Option>
                            <Option value="excel">Excel</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Audience Source">
                        <Select
                            placeholder="Select Source"
                            allowClear
                            value={filters.source}
                            onChange={(val) => setFilters(prev => ({ ...prev, source: val }))}
                        >
                            {sources.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Audience Category">
                        <Select
                            placeholder="Select Category"
                            allowClear
                            value={filters.category}
                            onChange={(val) => setFilters(prev => ({ ...prev, category: val }))}
                        >
                            {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Form.Item>
                </Form>
            </Drawer>

            <Modal
                title={null}
                open={isHelpModalOpen}
                onCancel={() => setIsHelpModalOpen(false)}
                footer={null}
                width={800}
                className="premium-help-modal"
                centered
            >
                <div style={{ padding: '0 10px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            width: '60px',
                            height: '60px',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 15px',
                            boxShadow: '0 4px 15px rgba(24, 144, 255, 0.3)'
                        }}>
                            <RocketOutlined style={{ fontSize: '30px', color: '#fff' }} />
                        </div>
                        <Title level={3}>WhatsApp Broadcast Guide</Title>
                        <Text type="secondary">Launch successful campaigns with these best practices</Text>
                    </div>

                    <List
                        itemLayout="horizontal"
                        dataSource={[
                            {
                                title: <Text strong style={{ fontSize: '16px' }}>1. Audience Filtering (Precision Targeting)</Text>,
                                description: (
                                    <Paragraph type="secondary" style={{ margin: 0 }}>
                                        Target specific groups from Leads, Deals, Contacts, or Companies. 
                                        <div style={{ marginTop: '5px' }}>
                                            <Tag color="blue">City</Tag> <Tag color="green">Stage</Tag> <Tag color="orange">Status</Tag>
                                        </div>
                                    </Paragraph>
                                ),
                                icon: <div style={{ background: '#e6f7ff', padding: '8px', borderRadius: '50%', color: '#1890ff' }}><UsergroupAddOutlined /></div>
                            },
                            {
                                title: <Text strong style={{ fontSize: '16px' }}>2. Template Messages (Meta Approved)</Text>,
                                description: (
                                    <Paragraph type="secondary" style={{ margin: 0 }}>
                                        Our system automatically personalizes messages using <b>{"{{1}}"} for Name</b>, <b>{"{{2}}"} for City</b>, etc. to avoid spam detection.
                                    </Paragraph>
                                ),
                                icon: <div style={{ background: '#f6ffed', padding: '8px', borderRadius: '50%', color: '#52c41a' }}><FileTextOutlined /></div>
                            },
                            {
                                title: <Text strong style={{ fontSize: '16px' }}>3. Meta Messaging Tiers (Limits)</Text>,
                                description: (
                                    <Paragraph type="secondary" style={{ margin: 0 }}>
                                        Meta starts you at 1,000 users/day. Send high-quality messages to upgrade to 10,000+ users/day automatically.
                                    </Paragraph>
                                ),
                                icon: <div style={{ background: '#fff7e6', padding: '8px', borderRadius: '50%', color: '#fa8c16' }}><RocketOutlined /></div>
                            },
                            {
                                title: <Text strong style={{ fontSize: '16px' }}>4. Safety & Anti-Ban Protection</Text>,
                                description: (
                                    <Paragraph type="secondary" style={{ margin: 0 }}>
                                        To keep your account safe, we recommend starting with <b>50-100 messages</b> per day for the first week. Gradually increase your volume as your quality rating stays green.
                                    </Paragraph>
                                ),
                                icon: <div style={{ background: '#fff0f6', padding: '8px', borderRadius: '50%', color: '#eb2f96' }}><InfoCircleOutlined /></div>
                            }
                        ]}
                        renderItem={(item) => (
                            <List.Item style={{ padding: '12px 0' }}>
                                <List.Item.Meta
                                    avatar={item.icon}
                                    title={item.title}
                                    description={item.description}
                                />
                            </List.Item>
                        )}
                    />

                    <div style={{
                        marginTop: '25px',
                        padding: '15px',
                        background: '#f0f5ff',
                        borderRadius: '12px',
                        border: '1px solid #adc6ff',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <ThunderboltOutlined style={{ color: '#2f54eb', fontSize: '18px' }} />
                            <Text strong>Best Practices for Results:</Text>
                        </div>
                        <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#434343', marginBottom: 0 }}>
                            <li><b>Opt-in only:</b> Only message people who know your brand.</li>
                            <li><b>Personalize:</b> Always use customer names to avoid "Spam" reports.</li>
                            <li><b>Timing:</b> 10 AM to 7 PM is best for high engagement.</li>
                        </ul>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '30px' }}>
                        <Button type="primary" size="large" onClick={() => setIsHelpModalOpen(false)} style={{ borderRadius: '8px', minWidth: '150px' }}>
                            Got It, Let's Go!
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                title="Create WhatsApp Broadcast"
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                footer={null}
                width={800}
                destroyOnClose
            >
                <CreateBroadcast onSuccess={() => {
                    setIsCreateModalOpen(false);
                    refetch();
                }} />
            </Modal>
        </div>
    );
};

export default BroadcastList;
