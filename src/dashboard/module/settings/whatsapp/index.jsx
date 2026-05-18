import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Switch, Button, message, Row, Col, Typography, Breadcrumb, Spin, Divider, List, Tag, Alert, Steps, Space, Tooltip } from 'antd';
import { 
    SaveOutlined, ReloadOutlined, WhatsAppOutlined, CheckCircleOutlined, 
    InfoCircleOutlined, LayoutOutlined, EditOutlined, LockOutlined, 
    CopyOutlined, LinkOutlined, SettingOutlined, SendOutlined,
    SyncOutlined, ClockCircleOutlined, CloseCircleOutlined, PlusOutlined
} from '@ant-design/icons';
import { FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { UnorderedListOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { useGetsubcriptionByIdQuery } from '../../../../superadmin/module/SubscribedUser/services/SubscribedUserApi';
import { 
    useGetWhatsappSettingsQuery, 
    useSaveWhatsappSettingsMutation, 
    useWhatsappEmbeddedSignupMutation, 
    useSyncWhatsappTemplatesMutation,
    useGetWhatsappTemplatesQuery
} from '../services/settingsApi';
import { FB_APP_ID, FB_CONFIG_ID, WHATSAPP_WEBHOOK_URL } from '../../../../config/config';
import './whatsapp.scss';

const { Title, Text } = Typography;

const WhatsappSettings = () => {
    const [form] = Form.useForm();
    const currentUser = useSelector(selectCurrentUser);

    const clientPlanId = currentUser?.client_plan_id;
    const { data: subscriptionData } = useGetsubcriptionByIdQuery(clientPlanId, { skip: !clientPlanId });

    const hasAiFeature = React.useMemo(() => {
        if (!currentUser) return false;
        if (currentUser.roleName === 'super-admin') return true;
        
        const plan = subscriptionData?.data?.Plan;
        if (!plan) return false;
        
        const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || {});
        return !!(features?.ai_features || features?.ai || Number(plan.ai_credits) > 0);
    }, [currentUser, subscriptionData]);
    
    const { data: settings, isLoading: isSettingsLoading } = useGetWhatsappSettingsQuery();
    const { data: metaTemplates, isLoading: isMetaTemplatesLoading, refetch: refetchTemplates } = useGetWhatsappTemplatesQuery(undefined, {
        skip: !settings?.business_id
    });

    const [saveSettings, { isLoading: isSaving }] = useSaveWhatsappSettingsMutation();
    const [embeddedSignup, { isLoading: isConnecting }] = useWhatsappEmbeddedSignupMutation();
    const [syncTemplates, { isLoading: isSyncing }] = useSyncWhatsappTemplatesMutation();
    

    
    const [isEditing, setIsEditing] = useState(false);

    const webhookUrl = WHATSAPP_WEBHOOK_URL;

    const commonTemplates = [
        { name: 'welcome_customer_msg', label: 'Welcome Message', category: 'Marketing' },
        { name: 'follow_up_lead_msg', label: 'Lead Follow-up', category: 'Marketing' },
        { name: 'meeting_reminder', label: 'Meeting Reminder', category: 'Utility' },
        { name: 'payment_request', label: 'Payment Request', category: 'Utility' },
        { name: 'status_update_msg', label: 'Status Update', category: 'Utility' },
    ];

    useEffect(() => {
        if (!window.FB && FB_APP_ID) {
            window.fbAsyncInit = function() {
                window.FB.init({
                    appId      : FB_APP_ID,
                    cookie     : true,
                    xfbml      : true,
                    version    : 'v21.0'
                });
            };
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        }
    }, []);

    const handleEmbeddedSignup = () => {
        if (!FB_APP_ID) return message.error('Facebook App ID is not configured.');
        if (!window.FB) return message.error('Facebook SDK not loaded yet. Please refresh.');

        window.FB.login((response) => {
            if (response.authResponse) {
                processEmbeddedSignup(response.authResponse.code);
            } else {
                message.error('User cancelled login or did not fully authorize.');
            }
        }, {
            config_id: FB_CONFIG_ID,
            response_type: 'code',
            override_default_response_type: true,
        });
    };

    const processEmbeddedSignup = async (code) => {
        try {
            const res = await embeddedSignup({ 
                code,
                redirect_uri: 'https://biaxial-lovella-semisuburban.ngrok-free.dev'
            }).unwrap();
            
            setIsEditing(true);
            form.setFieldsValue({
                phone_number_id: res.data.phone_number_id,
                business_id: res.data.business_id,
                access_token: res.data.access_token,
            });
            message.success(`Successfully connected ${res.data.display_phone_number || res.data.business_name}!`);
        } catch (error) {
            message.error(error?.data?.message || 'Failed to fetch WhatsApp details');
        }
    };

    useEffect(() => {
        const uniqueToken = `raiser_v1_${currentUser?.username || 'user'}`;
        if (settings) {
            form.setFieldsValue({
                phone_number_id: settings.phone_number_id,
                business_id: settings.business_id,
                facebook_page_id: settings.facebook_page_id,
                access_token: settings.access_token,
                verify_token: settings.verify_token || uniqueToken,
                is_active: settings.is_active,
                ai_auto_reply: hasAiFeature && settings.ai_auto_reply !== false,
            });
            setIsEditing(false);
        } else {
            form.setFieldValue('verify_token', uniqueToken);
            setIsEditing(true);
        }
    }, [settings, form, currentUser, hasAiFeature]);

    const handleSave = async (values) => {
        try {
            await saveSettings(values).unwrap();
            message.success('WhatsApp settings saved successfully!');
            setIsEditing(false);
        } catch (error) {
            message.error(error?.data?.message || 'Failed to save settings');
        }
    };

    const handleSyncTemplates = async () => {
        try {
            await syncTemplates().unwrap();
            message.success('Template synchronization request sent to Meta.');
            refetchTemplates();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to sync templates');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        message.success('Copied to clipboard!');
    };

    const getTemplateStatusTag = (templateName) => {
        if (isMetaTemplatesLoading) return <Tag icon={<SyncOutlined spin />} color="processing">Checking...</Tag>;
        
        const metaTemplate = metaTemplates?.find(t => t.name === templateName);
        
        if (!metaTemplate) return <Tag color="orange">Pending Sync</Tag>;
        
        switch (metaTemplate.status) {
            case 'APPROVED':
                return <Tag icon={<CheckCircleOutlined />} color="success">Approved</Tag>;
            case 'REJECTED':
                return <Tag icon={<CloseCircleOutlined />} color="error">Rejected</Tag>;
            case 'PENDING':
                return <Tag icon={<ClockCircleOutlined />} color="warning">In Review</Tag>;
            default:
                return <Tag color="blue">{metaTemplate.status}</Tag>;
        }
    };

    if (isSettingsLoading) return <div className="whatsapp-settings-loading"><Spin size="large" /></div>;

    const isLocked = !isEditing && settings;

    return (
        <div className="whatsapp-settings-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item><Link to="/dashboard"><FiHome /> Home</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>Settings</Breadcrumb.Item>
                    <Breadcrumb.Item>WhatsApp</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>WhatsApp Business API</Title>
                    <Text type="secondary">Automate your customer communication with official WhatsApp integration</Text>
                </div>
                <div className="header-actions">
                    {settings && (
                        <Button 
                            icon={isEditing ? <LockOutlined /> : <EditOutlined />} 
                            onClick={() => setIsEditing(!isEditing)}
                            size="large"
                            className={isEditing ? 'btn-active' : ''}
                        >
                            {isEditing ? 'Lock Config' : 'Edit Config'}
                        </Button>
                    )}
                    <Button 
                        type="primary" 
                        icon={<WhatsAppOutlined />} 
                        size="large"
                        onClick={handleEmbeddedSignup}
                        loading={isConnecting}
                        className="btn-connect"
                        disabled={isLocked && !isEditing}
                    >
                        Connect WhatsApp
                    </Button>
                </div>
            </div>

            <div className="page-contents">
                <Form form={form} layout="vertical" onFinish={handleSave} className="settings-form">
                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={16}>
                            <Card className={`settings-card shadow-sm ${isLocked ? 'card-locked' : ''}`} title={
                                <Space>
                                    <SettingOutlined />
                                    <span>API Credentials</span>
                                    {isLocked && <Tag color="blue" variant="soft">Secured</Tag>}
                                </Space>
                            }>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Phone Number ID" name="phone_number_id" rules={[{ required: true }]}>
                                            <Input placeholder="e.g. 106123456789012" disabled={isLocked} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Business Account ID" name="business_id" rules={[{ required: true }]}>
                                            <Input placeholder="e.g. 102123456789012" disabled={isLocked} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item label="Facebook Page ID" name="facebook_page_id" rules={[{ required: true }]}>
                                    <Input placeholder="e.g. 104567890123456" disabled={isLocked} />
                                </Form.Item>

                                <Form.Item label="Permanent Access Token" name="access_token" rules={[{ required: true }]}>
                                    <Input.TextArea placeholder="Enter your system user access token" rows={3} disabled={isLocked} />
                                </Form.Item>

                                <Divider style={{ margin: '12px 0 24px' }} />

                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item label="Webhook Verify Token" name="verify_token" rules={[{ required: true }]}>
                                            <Input placeholder="Verify token for callback" disabled={isLocked} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item label="Service Status" name="is_active" valuePropName="checked">
                                            <Switch checkedChildren="Active" unCheckedChildren="Inactive" disabled={isLocked} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item 
                                            label={
                                                <Space>
                                                    <span>AI Auto-Reply</span>
                                                    {!hasAiFeature && (
                                                        <Tag color="error" style={{ border: 'none', borderRadius: '4px', fontSize: '9px', padding: '0 6px', margin: 0 }}>
                                                            LOCKED
                                                        </Tag>
                                                    )}
                                                </Space>
                                            } 
                                            name="ai_auto_reply" 
                                            valuePropName="checked"
                                        >
                                            {hasAiFeature ? (
                                                <Switch checkedChildren="On" unCheckedChildren="Off" disabled={isLocked} />
                                            ) : (
                                                <Tooltip title="AI Auto-Reply is a Premium feature. Upgrade your plan to unlock it.">
                                                    <div style={{ display: 'inline-block' }}>
                                                        <Switch checkedChildren="On" unCheckedChildren="Off" disabled checked={false} />
                                                    </div>
                                                </Tooltip>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {isEditing && (
                                    <div className="form-actions">
                                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isSaving} size="large" block>
                                            Save & Update Configuration
                                        </Button>
                                    </div>
                                )}
                            </Card>

                            <Card 
                                title={<Space><LayoutOutlined /> <span>Message Templates</span></Space>} 
                                className="templates-card shadow-sm" 
                                style={{ marginTop: '24px' }}
                                extra={<Button size="small" type="link" icon={<SyncOutlined />} onClick={() => refetchTemplates()} loading={isMetaTemplatesLoading}>Refresh Status</Button>}
                            >
                                <div style={{ marginBottom: '24px' }}>
                                    <Text type="secondary">
                                        Professional templates for every stage of your customer journey. Sync these to your Meta account to start using them.
                                    </Text>
                                </div>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={commonTemplates}
                                    renderItem={item => (
                                        <List.Item
                                            extra={getTemplateStatusTag(item.name)}
                                        >
                                            <List.Item.Meta
                                                title={<Text strong>{item.label}</Text>}
                                                description={
                                                    <Space size="small">
                                                        <Text type="secondary" style={{fontSize: '12px'}}>ID: <code>{item.name}</code></Text>
                                                        <Tag size="small" bordered={false}>{item.category}</Tag>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                                <div style={{ marginTop: '24px' }}>
                                    <Button 
                                        type="primary" 
                                        block 
                                        icon={<ReloadOutlined />} 
                                        onClick={handleSyncTemplates} 
                                        loading={isSyncing}
                                        size="large"
                                        disabled={!settings}
                                        className="btn-sync"
                                    >
                                        Sync Templates to Meta Account
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                        
                        <Col xs={24} lg={8}>
                            <Card title={<Space><InfoCircleOutlined /> <span>Quick Setup Guide</span></Space>} className="guide-card shadow-sm">
                                <div className="webhook-section">
                                    <Text strong size="small">Webhook Callback URL</Text>
                                    <div className="webhook-copy-box">
                                        <Text code ellipsis style={{maxWidth: '80%'}}>{webhookUrl}</Text>
                                        <Tooltip title="Copy URL">
                                            <Button type="text" icon={<CopyOutlined />} onClick={() => copyToClipboard(webhookUrl)} />
                                        </Tooltip>
                                    </div>
                                </div>

                                <Divider style={{ margin: '20px 0' }} />
                                
                                <Steps
                                    direction="vertical"
                                    size="small"
                                    current={-1}
                                    className="setup-steps-visual"
                                    items={[
                                        {
                                            title: 'Meta App Configuration',
                                            description: <Text type="secondary" size="small">Go to Meta Developers, set Callback URL and Verify Token. Subscribe to <Text code>messages</Text> field.</Text>,
                                            icon: <SettingOutlined />,
                                        },
                                        {
                                            title: 'Lead Ads Integration',
                                            description: <Text type="secondary" size="small">In Meta Business Suite, link your Page to the App and subscribe to <Text code>leadgen</Text> field.</Text>,
                                            icon: <LinkOutlined />,
                                        },
                                        {
                                            title: 'Verify & Go Live',
                                            description: <Text type="secondary" size="small">Use the Testing Tool to send a lead. Check logs below to verify data arrival.</Text>,
                                            icon: <SendOutlined />,
                                        },
                                    ]}
                                />

                                <div style={{ marginTop: '24px' }}>
                                    <Link to="/dashboard/whatsapp/messages">
                                        <Button block icon={<UnorderedListOutlined />}>View Live Message Logs</Button>
                                    </Link>
                                </div>
                            </Card>

                            <Card className="ai-status-card shadow-sm" style={{ marginTop: '24px', background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%)', border: 'none' }}>
                                <Title level={5} style={{ color: '#003a8c' }}><LayoutOutlined /> System Behavior</Title>
                                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#003a8c' }}>
                                    <li><b>AI Response:</b> Handles inquiries if enabled.</li>
                                    <li><b>Fallback:</b> Uses <code>welcome_customer_msg</code>.</li>
                                    <li><b>Logging:</b> All interactions are logged in real-time.</li>
                                </ul>
                            </Card>
                        </Col>
                    </Row>
                </Form>
        </div>


    </div>
);
};

export default WhatsappSettings;
