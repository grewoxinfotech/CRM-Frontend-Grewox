import React, { useEffect } from 'react';
import { Card, Form, Input, Switch, Button, message, Row, Col, Typography, Breadcrumb, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { UnorderedListOutlined } from '@ant-design/icons';
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
                facebook_page_id: settings.facebook_page_id,
                access_token: settings.access_token,
                verify_token: settings.verify_token || uniqueToken,
                is_active: settings.is_active,
                ai_auto_reply: settings.ai_auto_reply !== false,
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

            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div className="page-title">
                    <Title level={2}>WhatsApp Settings</Title>
                    <Text type="secondary">Configure your WhatsApp Business API credentials</Text>
                </div>
                <Link to="/dashboard/whatsapp/messages">
                    <Button icon={<UnorderedListOutlined />} size="large">
                        Open message log
                    </Button>
                </Link>
            </div>

            <div className="page-contents">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    className="settings-form"
                    initialValues={{ is_active: true, ai_auto_reply: true }}
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
                                    label="Facebook Page ID"
                                    name="facebook_page_id"
                                    rules={[{ required: true, message: 'Please enter Facebook Page ID' }]}
                                    extra="Find this in your Facebook Page > About > Page Transparency."
                                >
                                    <Input placeholder="e.g. 104567890123456" className="settings-input" />
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

                                <Form.Item
                                    label="AI auto-reply (Gemini)"
                                    name="ai_auto_reply"
                                    valuePropName="checked"
                                    extra="When on, incoming WhatsApp messages get a short AI reply (needs GEMINI_API_KEY on the server). When off, the static thank-you template is used."
                                >
                                    <Switch checkedChildren="On" unCheckedChildren="Off" />
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
                                            <li>Subscribe to <Text code>messages</Text> field.</li>
                                        </ul>
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong style={{ color: '#eb2f96' }}>Step 2: Meta Lead Ads Setup (Crucial)</Text>
                                        <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                                            <li><b>1. App Dashboard:</b> Go to Meta App {'>'} Webhooks. Select 'Page' from dropdown.</li>
                                            <li><b>2. Subscription:</b> Click 'Subscribe to this object' and subscribe to the <Text code>leadgen</Text> field.</li>
                                            <li><b>3. Permissions:</b> In App Settings, ensure your System User Token has <Text code>leads_retrieval</Text>, <Text code>pages_read_engagement</Text>, and <Text code>pages_show_list</Text> permissions.</li>
                                            <li><b>4. CRM Connect:</b> Go to Meta Business Suite {'>'} All Tools {'>'} Instant Forms. Click 'CRM Setup' or 'Connected CRM' tab. Search for your Meta App name and click 'Connect' to link it to the Page.</li>
                                            <li><b>5. Test:</b> Use the <a href="https://developers.facebook.com/tools/lead-ads-testing" target="_blank" rel="noreferrer">Lead Ads Testing Tool</a> to send a test lead and verify it appears in CRM.</li>
                                        </ul>
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong style={{ color: '#722ed1' }}>Step 3: Collect Leads (Automatic)</Text>
                                        <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                                            <li><b>Auto-Capture:</b> Once a user fills your Meta Lead Ad form, the data is instantly sent to our CRM.</li>
                                            <li><b>Lead Creation:</b> A new lead will be automatically created in your CRM with all form details.</li>
                                            <li><b>Centralized:</b> All your leads from Facebook and Instagram Ads are managed in one place.</li>
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
