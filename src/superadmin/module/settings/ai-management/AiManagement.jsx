import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Select, Button, Row, Col, Typography, Spin, Divider, Tag, Space, Statistic, Table, Alert, Badge, message, Modal } from 'antd';
import { 
    RobotOutlined, ThunderboltOutlined, SettingOutlined, BarChartOutlined, 
    CheckCircleOutlined, InfoCircleOutlined, SaveOutlined, ReloadOutlined,
    GlobalOutlined, LineChartOutlined, DatabaseOutlined, FireOutlined,
    LockOutlined, EditOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useGetAiSettingsQuery, useUpdateAiSettingsMutation, useGetAiUsageStatsQuery } from '../services/settingsApi';
import PageHeader from '../../../../components/PageHeader';
import StatCard from '../../../../components/StatCard';
import { FiHome, FiCpu, FiRefreshCw } from 'react-icons/fi';
import './AiManagement.scss';

import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const AiManagement = () => {
    const [form] = Form.useForm();
    const { data: settings, isLoading: isSettingsLoading, refetch: refetchSettings } = useGetAiSettingsQuery();
    const { data: usageStats, isLoading: isUsageLoading, refetch: refetchUsage } = useGetAiUsageStatsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateAiSettingsMutation();

    const [selectedProvider, setSelectedProvider] = useState('gemini');
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    useEffect(() => {
        if (settings) {
            form.setFieldsValue({
                provider: settings.provider,
                gemini_api_key: settings.gemini_api_key,
                groq_api_key: settings.groq_api_key
            });
            setSelectedProvider(settings.provider);
        }
    }, [settings, form]);

    const handleSave = async (values) => {
        try {
            await updateSettings(values).unwrap();
            message.success('Global AI settings updated successfully!');
            setIsConfigModalOpen(false);
        } catch (error) {
            message.error(error?.data?.message || 'Failed to update settings');
        }
    };

    if (isSettingsLoading || isUsageLoading) {
        return (
            <div className="ai-management-loading">
                <Spin size="large" tip="Loading AI Configuration..." />
            </div>
        );
    }

    const providerColumns = [
        { title: 'Provider', dataIndex: 'provider', key: 'provider', render: (text) => <Tag color={text === 'gemini' ? 'blue' : 'purple'}>{text.toUpperCase()}</Tag> },
        { title: 'Requests', dataIndex: 'request_count', key: 'request_count', align: 'center' },
        { title: 'Total Tokens', dataIndex: 'total_tokens', key: 'total_tokens', align: 'right', render: (val) => <b>{Number(val || 0).toLocaleString()}</b> }
    ];

    const featureColumns = [
        { title: 'Feature', dataIndex: 'feature', key: 'feature', render: (text) => <Text strong>{text.replace('_', ' ').toUpperCase()}</Text> },
        { title: 'Requests', dataIndex: 'request_count', key: 'request_count', align: 'center' },
        { title: 'Total Tokens', dataIndex: 'total_tokens', key: 'total_tokens', align: 'right', render: (val) => <b>{Number(val || 0).toLocaleString()}</b> }
    ];

    return (
        <div className="ai-management-pages dashboard-container">
            <PageHeader
                title="Global AI Management"
                subtitle="Configure and monitor AI models used across the entire ecosystem"
                breadcrumbItems={[
                    {
                        title: (
                            <Link to="/superadmin">
                                <FiHome style={{ marginRight: '4px' }} />
                                Home
                            </Link>
                        )
                    },
                    { title: 'AI Management' }
                ]}
                extraActions={[
                    <Button 
                        key="edit"
                        type="primary"
                        icon={<EditOutlined />} 
                        onClick={() => setIsConfigModalOpen(true)}
                        style={{ borderRadius: '8px', height: '30px' }}
                    >
                        Edit Configuration
                    </Button>,
                    <Button 
                        key="refresh" 
                        icon={<FiRefreshCw />} 
                        onClick={() => { refetchSettings(); refetchUsage(); }}
                        className="refresh-btn"
                        style={{ borderRadius: '8px', height: '30px' }}
                    >
                        Refresh Stats
                    </Button>
                ]}
            />

            <div className="ai-management-content">
            <Row gutter={[12, 12]} style={{ marginBottom: '24px' }}>
                <StatCard 
                    icon={<ThunderboltOutlined />}
                    tag="Requests"
                    title="Total AI Requests"
                    value={usageStats?.summary?.totalRequests || 0}
                    subtitle="Overall system activity"
                    color="#1890ff"
                    gradient="linear-gradient(135deg, #1890ff, #096dd9)"
                    colSpan={{ xs: 24, md: 12, lg: 6 }}
                />
                <StatCard 
                    icon={<FireOutlined />}
                    tag="Tokens"
                    title="Tokens Consumed"
                    value={usageStats?.summary?.totalTokens || 0}
                    subtitle="Resource consumption"
                    color="#722ed1"
                    gradient="linear-gradient(135deg, #722ed1, #531dab)"
                    colSpan={{ xs: 24, md: 12, lg: 6 }}
                />
                <StatCard 
                    icon={<GlobalOutlined />}
                    tag="Active"
                    title="Current Provider"
                    value={settings?.provider?.toUpperCase() || 'GEMINI'}
                    subtitle="Global model in use"
                    color="#faad14"
                    gradient="linear-gradient(135deg, #faad14, #d48806)"
                    isNumeric={false}
                    colSpan={{ xs: 24, md: 12, lg: 6 }}
                />
                <StatCard 
                    icon={<LineChartOutlined />}
                    tag="Efficiency"
                    title="System Status"
                    value="Healthy"
                    subtitle="Latency optimized"
                    color="#52c41a"
                    gradient="linear-gradient(135deg, #52c41a, #389e0d)"
                    isNumeric={false}
                    colSpan={{ xs: 24, md: 12, lg: 6 }}
                />
            </Row>

            <Row gutter={[12, 12]}>
                {/* Usage by Provider */}
                <Col xs={24} lg={12}>
                    <Card 
                        className="usage-card shadow-sm" 
                        size="small"
                        title={<Space><BarChartOutlined /> <span style={{ fontSize: '14px' }}>Usage by Provider</span></Space>}
                    >
                        <Table 
                            dataSource={usageStats?.byProvider || []} 
                            columns={providerColumns} 
                            pagination={false} 
                            size="small"
                            scroll={{ y: 300 }}
                        />
                    </Card>
                </Col>

                {/* Usage by Feature */}
                <Col xs={24} lg={12}>
                    <Card 
                        className="usage-card shadow-sm" 
                        size="small"
                        title={<Space><DatabaseOutlined /> <span style={{ fontSize: '14px' }}>Usage by Feature</span></Space>}
                    >
                        <Table 
                            dataSource={usageStats?.byFeature || []} 
                            columns={featureColumns} 
                            pagination={false} 
                            size="small"
                            scroll={{ y: 300 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Configuration Modal */}
            <Modal
                title={
                    <Space>
                        <SettingOutlined style={{ color: '#1677ff' }} />
                        <span>Global AI Configuration</span>
                    </Space>
                }
                open={isConfigModalOpen}
                onCancel={() => setIsConfigModalOpen(false)}
                footer={null}
                width={500}
                centered
            >
                <Alert 
                    message="System Impact" 
                    description="Changes will immediately affect all AI features across the CRM."
                    type="warning"
                    showIcon
                    style={{ marginBottom: '20px' }}
                />

                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item label="Default AI Provider" name="provider" rules={[{ required: true }]}>
                        <Select size="large" onChange={(val) => setSelectedProvider(val)}>
                            <Option value="gemini">Google Gemini (1.5 Flash)</Option>
                            <Option value="groq">Groq (Llama 3.3)</Option>
                        </Select>
                    </Form.Item>

                    <Divider orientation="left" style={{ fontSize: '12px', color: '#8c8c8c' }}>API Credentials</Divider>

                    {selectedProvider === 'gemini' ? (
                        <Form.Item label="Gemini API Key" name="gemini_api_key" rules={[{ required: true }]}>
                            <Input.Password placeholder="Enter Gemini API Key" size="large" prefix={<LockOutlined />} />
                        </Form.Item>
                    ) : (
                        <Form.Item label="Groq API Key" name="groq_api_key" rules={[{ required: true }]}>
                            <Input.Password placeholder="Enter Groq API Key" size="large" prefix={<LockOutlined />} />
                        </Form.Item>
                    )}

                    <div style={{ marginTop: '24px' }}>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isUpdating} size="large" block>
                            Save & Update Configuration
                        </Button>
                    </div>
                </Form>
            </Modal>
            </div>
        </div>
    );
};

export default AiManagement;
