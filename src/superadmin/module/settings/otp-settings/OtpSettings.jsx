import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Select, Button, Row, Col, Typography, Spin, Divider, Tag, Space, Alert, message, Badge } from 'antd';
import { 
    SettingOutlined, CheckCircleOutlined, SaveOutlined, ReloadOutlined,
    LockOutlined, EditOutlined, MessageOutlined, SafetyCertificateOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useGetOtpSettingsQuery, useUpdateOtpSettingsMutation } from '../services/settingsApi';
import PageHeader from '../../../../components/PageHeader';
import StatCard from '../../../../components/StatCard';
import { FiHome, FiSettings, FiRefreshCw } from 'react-icons/fi';
import './OtpSettings.scss';

import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const OtpSettings = () => {
    const [form] = Form.useForm();
    const { data: settings, isLoading: isSettingsLoading, refetch: refetchSettings } = useGetOtpSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateOtpSettingsMutation();

    const [selectedProvider, setSelectedProvider] = useState('messagecentral');

    useEffect(() => {
        if (settings) {
            form.setFieldsValue({
                provider: settings.provider,
                url: settings.url,
                apiKey: settings.apiKey,
                customerId: settings.customerId,
                templateName: settings.templateName
            });
            setSelectedProvider(settings.provider);
        }
    }, [settings, form]);

    const handleSave = async (values) => {
        try {
            await updateSettings(values).unwrap();
            message.success('Global OTP settings updated successfully!');
        } catch (error) {
            message.error(error?.data?.message || 'Failed to update OTP settings');
        }
    };

    if (isSettingsLoading) {
        return (
            <div className="otp-settings-loading">
                <Spin size="large" tip="Loading OTP Configuration..." />
            </div>
        );
    }

    return (
        <div className="otp-settings-pages dashboard-container">
            <PageHeader
                title="Global OTP & SMS Management"
                subtitle="Configure multi-provider OTP routes and SMS API credentials dynamically"
                breadcrumbItems={[
                    {
                        title: (
                            <Link to="/superadmin">
                                <FiHome style={{ marginRight: '4px' }} />
                                Home
                            </Link>
                        )
                    },
                    { title: 'OTP Settings' }
                ]}
                extraActions={[
                    <Button 
                        key="refresh" 
                        icon={<FiRefreshCw />} 
                        onClick={() => { refetchSettings(); }}
                        className="refresh-btn"
                        style={{ borderRadius: '8px', height: '30px' }}
                    >
                        Refresh
                    </Button>
                ]}
            />

            <div className="otp-settings-content">
                <Row gutter={[12, 12]} style={{ marginBottom: '24px' }}>
                    <StatCard 
                        icon={<MessageOutlined />}
                        tag="Status"
                        title="SMS Gateway Status"
                        value="Active"
                        subtitle="Dynamically routed"
                        color="#52c41a"
                        gradient="linear-gradient(135deg, #52c41a, #389e0d)"
                        isNumeric={false}
                        colSpan={{ xs: 24, md: 12, lg: 8 }}
                    />
                    <StatCard 
                        icon={<SafetyCertificateOutlined />}
                        tag="Provider"
                        title="Active SMS Provider"
                        value={settings?.provider === 'messagecentral' ? 'MessageCentral' : '2Factor'}
                        subtitle="Primary dispatch route"
                        color="#1890ff"
                        gradient="linear-gradient(135deg, #1890ff, #096dd9)"
                        isNumeric={false}
                        colSpan={{ xs: 24, md: 12, lg: 8 }}
                    />
                    <StatCard 
                        icon={<GlobalOutlined />}
                        tag="Bypass"
                        title="Sandbox Bypass"
                        value={process.env.NODE_ENV !== 'production' ? 'Enabled (123456)' : 'Disabled'}
                        subtitle="Local development testing"
                        color="#faad14"
                        gradient="linear-gradient(135deg, #faad14, #d48806)"
                        isNumeric={false}
                        colSpan={{ xs: 24, md: 12, lg: 8 }}
                    />
                </Row>

                <Row gutter={[12, 12]}>
                    <Col xs={24} lg={16}>
                        <motion.div variants={fadeInUp} initial="initial" animate="animate">
                            <Card 
                                className="settings-card shadow-sm"
                                title={
                                    <Space>
                                        <SettingOutlined style={{ color: '#1890ff' }} />
                                        <span>SMS API Gateway Settings</span>
                                    </Space>
                                }
                            >
                                <Form form={form} layout="vertical" onFinish={handleSave}>
                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item 
                                                label="SMS Provider" 
                                                name="provider" 
                                                rules={[{ required: true, message: 'Provider is required' }]}
                                            >
                                                <Select size="large" onChange={(val) => setSelectedProvider(val)}>
                                                    <Option value="messagecentral">MessageCentral CPaaS</Option>
                                                    <Option value="2factor">2Factor Legacy API</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item 
                                                label="API Endpoint URL" 
                                                name="url" 
                                                rules={[{ required: true, message: 'API URL is required' }]}
                                            >
                                                <Input placeholder="Enter API URL endpoint" size="large" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Divider orientation="left" style={{ fontSize: '12px', color: '#8c8c8c' }}>Security & Authorization Credentials</Divider>

                                    <Row gutter={16}>
                                        <Col xs={24} md={selectedProvider === 'messagecentral' ? 12 : 24}>
                                            <Form.Item 
                                                label="API Authorization Key" 
                                                name="apiKey" 
                                                rules={[{ required: true, message: 'API Key is required' }]}
                                            >
                                                <Input.Password placeholder="Enter API Key / Token" size="large" prefix={<LockOutlined />} />
                                            </Form.Item>
                                        </Col>
                                        {selectedProvider === 'messagecentral' && (
                                            <Col xs={24} md={12}>
                                                <Form.Item 
                                                    label="Customer ID" 
                                                    name="customerId" 
                                                    rules={[{ required: true, message: 'Customer ID is required' }]}
                                                >
                                                    <Input placeholder="Enter MessageCentral Customer ID" size="large" />
                                                </Form.Item>
                                            </Col>
                                        )}
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24}>
                                            <Form.Item 
                                                label="Approved DLT SMS Template Name" 
                                                name="templateName"
                                            >
                                                <Input placeholder="Enter approved SMS template name (optional)" size="large" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isUpdating} size="large" style={{ borderRadius: '8px' }}>
                                            Save & Update SMS Settings
                                        </Button>
                                    </div>
                                </Form>
                            </Card>
                        </motion.div>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card 
                            className="info-card shadow-sm"
                            title={
                                <Space>
                                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    <span>Route Instructions</span>
                                </Space>
                            }
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <Alert 
                                    message="Dynamic SMS Routing" 
                                    description="Active configurations immediately redirect sign-up and resend OTP requests in real-time."
                                    type="info"
                                    showIcon
                                />
                                <div>
                                    <Badge status="processing" text={<Text strong>MessageCentral CPaaS</Text>} />
                                    <p style={{ color: '#8c8c8c', margin: '4px 0 12px 14px', fontSize: '12px' }}>
                                        Requires Customer ID, Scope-based Auth Token, and flowType query formats.
                                    </p>
                                </div>
                                <div>
                                    <Badge status="warning" text={<Text strong>2Factor Legacy SMS</Text>} />
                                    <p style={{ color: '#8c8c8c', margin: '4px 0 0 14px', fontSize: '12px' }}>
                                        Uses custom path-appended token parameters to route OTP codes directly over standard gateways.
                                    </p>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default OtpSettings;
