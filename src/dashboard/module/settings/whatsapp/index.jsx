import React, { useEffect } from 'react';
import { Card, Form, Input, Switch, Button, message, Row, Col, Typography, Breadcrumb, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { useGetWhatsappSettingsQuery, useSaveWhatsappSettingsMutation } from '../services/settingsApi';
import { BASE_URL } from '../../../../config/config';
import './whatsapp.scss';

const { Title, Text } = Typography;

const WhatsappSettings = () => {
    const [form] = Form.useForm();
    const currentUser = useSelector(selectCurrentUser);
    const { data: settings, isLoading } = useGetWhatsappSettingsQuery();
    const [saveSettings, { isLoading: isSaving }] = useSaveWhatsappSettingsMutation();

    useEffect(() => {
        // Generate a unique verify token for this specific client based on username
        const uniqueToken = `raiser_v1_${currentUser?.username || 'user'}`;

        if (settings) {
            form.setFieldsValue({
                phone_number_id: settings.phone_number_id,
                business_id: settings.business_id,
                access_token: settings.access_token,
                verify_token: settings.verify_token || uniqueToken,
                is_active: settings.is_active
            });
        } else {
            // For new setup, provide the username-based token automatically
            form.setFieldValue('verify_token', uniqueToken);
        }
    }, [settings, form, currentUser]);

    const handleSave = async (values) => {
        try {
            await saveSettings(values).unwrap();
            message.success('WhatsApp settings saved successfully!');
        } catch (error) {
            console.error('Save failed:', error);
            message.error(error?.data?.message || 'Failed to save WhatsApp settings');
        }
    };

    if (isLoading) {
        return (
            <div className="whatsapp-settings-loading">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="whatsapp-settings-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Settings</Breadcrumb.Item>
                    <Breadcrumb.Item>WhatsApp</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>WhatsApp Settings</Title>
                    <Text type="secondary">Configure your WhatsApp Business API credentials</Text>
                </div>
            </div>

            <div className="page-contents">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    className="settings-form"
                    initialValues={{ is_active: true }}
                >
                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={16}>
                            <Card className="settings-card">
                                <Form.Item
                                    label="Phone Number ID"
                                    name="phone_number_id"
                                    rules={[{ required: true, message: 'Please enter Phone Number ID' }]}
                                    extra="Find this in your Meta App Dashboard under WhatsApp > Getting Started"
                                >
                                    <Input placeholder="e.g. 106123456789012" className="settings-input" />
                                </Form.Item>

                                <Form.Item
                                    label="WhatsApp Business Account ID"
                                    name="business_id"
                                    rules={[{ required: true, message: 'Please enter Business Account ID' }]}
                                    extra="Find this in your Meta App Dashboard under WhatsApp > Getting Started"
                                >
                                    <Input placeholder="e.g. 102123456789012" className="settings-input" />
                                </Form.Item>

                                <Form.Item
                                    label="Permanent Access Token"
                                    name="access_token"
                                    rules={[{ required: true, message: 'Please enter Access Token' }]}
                                    extra="Generate a permanent token from Meta Business Settings > System Users"
                                >
                                    <Input.TextArea 
                                        placeholder="Enter your system user access token" 
                                        className="settings-input"
                                        rows={4}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Webhook Verify Token"
                                    name="verify_token"
                                    rules={[{ required: true, message: 'Please enter Verify Token' }]}
                                    extra="Choose a random string and set it in Meta App Dashboard under WhatsApp > Configuration"
                                >
                                    <Input placeholder="e.g. my_custom_verify_token" className="settings-input" />
                                </Form.Item>

                                <Form.Item
                                    label="Status"
                                    name="is_active"
                                    valuePropName="checked"
                                >
                                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                                </Form.Item>

                                <div className="form-actions">
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        icon={<SaveOutlined />}
                                        loading={isSaving}
                                        size="large"
                                    >
                                        Save Settings
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                        
                        <Col xs={24} lg={8}>
                            <Card title="Webhook Information" className="info-card">
                                <Text type="secondary">Use this URL in your Meta Developer Portal:</Text>
                                <div className="webhook-url-box">
                                    <code>https://api.raiser.in/api/v1/whatsapp/webhook</code>
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <Title level={5}>WhatsApp Setup Guide:</Title>
                                    
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong style={{ color: '#1890ff' }}>Step 1: Meta Portal Configuration</Text>
                                        <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                                            <li>Go to Meta Developers portal & select your App.</li>
                                            <li>Set Callback URL to the one shown above.</li>
                                            <li>Set Verify Token to the one generated in form.</li>
                                            <li>Subscribe to <Text code>messages</Text> and <Text code>flows</Text> fields.</li>
                                        </ul>
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong style={{ color: '#52c41a' }}>Step 2: Create Custom Form & Campaign</Text>
                                        <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                                            <li>Go to <Link to="/dashboard/crm/generate-link">Custom Forms</Link>.</li>
                                            <li>Create a new form and turn on <b>"Create WhatsApp Campaign"</b>.</li>
                                            <li>This will auto-create a Flow and Template on Meta.</li>
                                        </ul>
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong style={{ color: '#faad14' }}>Step 3: Wait for Meta Approval</Text>
                                        <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                                            <li>Meta takes 1 to 24 hours to approve templates.</li>
                                            <li>Once approved, the campaign will be ready to use.</li>
                                        </ul>
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong style={{ color: '#722ed1' }}>Step 4: Send & Collect Leads</Text>
                                        <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                                            <li><b>Manual:</b> Select leads in <Link to="/dashboard/crm/lead">Lead List</Link> and click <b>"Send WhatsApp"</b>.</li>
                                            <li><b>Auto:</b> New users messaging "Hi" will auto-receive the form.</li>
                                            <li><b>Result:</b> Filled forms automatically create new Leads in CRM!</li>
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
};

export default WhatsappSettings;
