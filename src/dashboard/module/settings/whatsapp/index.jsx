import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Switch, Button, message, Row, Col, Typography, Breadcrumb, Spin, Divider, List, Tag, Alert, Steps, Space, Tooltip, Modal, Avatar } from 'antd';
import { 
    SaveOutlined, ReloadOutlined, WhatsAppOutlined, CheckCircleOutlined, 
    InfoCircleOutlined, LayoutOutlined, EditOutlined, LockOutlined, 
    CopyOutlined, LinkOutlined, SettingOutlined, SendOutlined,
    SyncOutlined, ClockCircleOutlined, CloseCircleOutlined, PlusOutlined,
    FacebookOutlined
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
    useGetWhatsappTemplatesQuery,
    useLazyGetFacebookPagesQuery,
    useSubscribeFacebookPageMutation
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

    const [fetchFacebookPages, { isLoading: isFetchingPages }] = useLazyGetFacebookPagesQuery();
    const [subscribeFacebookPage, { isLoading: isSubscribingPage }] = useSubscribeFacebookPageMutation();
    const [facebookPages, setFacebookPages] = useState([]);
    const [isPageModalOpen, setIsPageModalOpen] = useState(false);
    

    
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

    const handleFacebookOAuth = () => {
        if (!FB_APP_ID) return message.error('Facebook App ID is not configured.');
        if (!window.FB) return message.error('Facebook SDK not loaded yet. Please refresh.');

        window.FB.login((response) => {
            if (response.authResponse) {
                const userAccessToken = response.authResponse.accessToken;
                processFacebookOAuth(userAccessToken);
            } else {
                message.error('User cancelled login or did not fully authorize.');
            }
        }, {
            scope: 'pages_show_list,pages_read_engagement,leads_retrieval,pages_manage_metadata',
        });
    };

    const processFacebookOAuth = async (userAccessToken) => {
        const hideLoading = message.loading('Fetching your Facebook Pages...', 0);
        try {
            const res = await fetchFacebookPages({ accessToken: userAccessToken }).unwrap();
            hideLoading();
            if (res.pages && res.pages.length > 0) {
                setFacebookPages(res.pages);
                setIsPageModalOpen(true);
                message.success('Facebook Pages loaded successfully!');
            } else {
                message.warning('No Facebook Pages found under this account. Make sure you are the Admin of at least one Page.');
            }
        } catch (error) {
            hideLoading();
            message.error(error?.data?.message || 'Failed to fetch Facebook Pages');
        }
    };

    const handleSelectPage = async (page) => {
        const hideLoading = message.loading(`Connecting Facebook Page: ${page.name}...`, 0);
        try {
            const res = await subscribeFacebookPage({
                facebook_page_id: page.id,
                facebook_page_name: page.name,
                page_access_token: page.accessToken,
                ai_auto_reply: form.getFieldValue('ai_auto_reply') || false,
                is_active: true
            }).unwrap();

            hideLoading();
            setIsEditing(false); // Lock config since it is successfully saved
            
            form.setFieldsValue({
                facebook_page_id: page.id,
                access_token: page.accessToken,
                is_active: true
            });

            setIsPageModalOpen(false);
            message.success(`Successfully connected ${page.name} for automatic lead capture!`);
        } catch (error) {
            hideLoading();
            message.error(error?.data?.message || `Failed to connect Facebook Page ${page.name}`);
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
                    <Title level={2}>WhatsApp & Facebook Integrations</Title>
                    <Text type="secondary">Manage your Facebook Lead Ads and WhatsApp Business API customer communications.</Text>
                </div>
                <div className="header-actions">
                    {settings && (
                        <Button 
                            type={isEditing ? 'primary' : 'default'}
                            icon={isEditing ? <LockOutlined /> : <EditOutlined />} 
                            onClick={() => setIsEditing(!isEditing)}
                            size="large"
                            className={isEditing ? 'btn-active' : ''}
                        >
                            {isEditing ? 'Lock Config' : 'Edit Config'}
                        </Button>
                    )}
                </div>
            </div>

            <div className="page-contents">
                <Form form={form} layout="vertical" onFinish={handleSave} className="settings-form">
                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={16}>
                            {/* Card 1: Facebook Lead Ads Integration (SaaS Connect) */}
                            <Card 
                                className="settings-card shadow-sm" 
                                style={{ marginBottom: '24px', borderLeft: '4px solid #1877f2' }}
                                title={
                                    <Space>
                                        <FacebookOutlined style={{ color: '#1877f2', fontSize: '18px' }} />
                                        <span style={{ fontWeight: 600 }}>Facebook Lead Ads Capture (SaaS Integration)</span>
                                    </Space>
                                }
                            >
                                <div style={{ marginBottom: '20px', padding: '16px', background: '#f0f7ff', borderRadius: '8px', border: '1px solid #d0e7ff' }}>
                                    <Text strong style={{ color: '#003a8c', display: 'block', marginBottom: '4px' }}>
                                        ⚡ 100% Automatic Connection
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        Simply click the button below to authorize Leadgoes CRM to automatically capture your Facebook leads. No manual keys, apps, or complex developer configurations required!
                                    </Text>
                                </div>

                                <Row gutter={24} align="middle">
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Connected Facebook Page ID" name="facebook_page_id">
                                            <Input placeholder="Not connected. Click the button to link Page" disabled readOnly style={{ background: '#fafafa' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <div style={{ marginTop: '8px', marginBottom: '24px' }}>
                                            <Button 
                                                type="primary" 
                                                icon={<FacebookOutlined />} 
                                                size="large"
                                                onClick={handleFacebookOAuth}
                                                loading={isFetchingPages}
                                                style={{ backgroundColor: '#1877f2', borderColor: '#1877f2' }}
                                                disabled={isLocked && !isEditing}
                                                block
                                            >
                                                {form.getFieldValue('facebook_page_id') ? 'Change Connected Page' : 'Connect Facebook Page'}
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>

                                {form.getFieldValue('facebook_page_id') && (
                                    <div style={{ padding: '8px 12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px', display: 'inline-block' }}>
                                        <Text type="success" strong style={{ fontSize: '12px' }}>
                                            ✓ Webhook Live & Subscribed to Meta Page
                                        </Text>
                                    </div>
                                )}
                            </Card>

                            {/* Card 2: WhatsApp Business API Setup (Manual BYOA) */}
                            <Card 
                                className={`settings-card shadow-sm ${isLocked ? 'card-locked' : ''}`}
                                style={{ borderLeft: '4px solid #52c41a' }}
                                title={
                                    <Space>
                                        <WhatsAppOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                                        <span style={{ fontWeight: 600 }}>WhatsApp Business API (Manual BYOA Setup)</span>
                                        {isLocked && <Tag color="blue" variant="soft">Secured</Tag>}
                                    </Space>
                                }
                            >
                                <div style={{ marginBottom: '20px', padding: '16px', background: '#f6ffed', borderRadius: '8px', border: '1px solid #d9f7be' }}>
                                    <Text strong style={{ color: '#237804', display: 'block', marginBottom: '4px' }}>
                                        ⚙️ Bring Your Own App (BYOA)
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        Paste your official Meta WhatsApp Business API details here. This allows you to sync messaging templates and manage customer chats within Leadgoes CRM.
                                    </Text>
                                </div>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="WhatsApp Phone Number ID" name="phone_number_id">
                                            <Input placeholder="e.g. 106123456789012" disabled={isLocked} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="WhatsApp Business Account ID" name="business_id">
                                            <Input placeholder="e.g. 102123456789012" disabled={isLocked} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item label="WhatsApp Access Token (System User Token)" name="access_token">
                                    <Input.TextArea placeholder="Enter your WhatsApp permanent system user access token" rows={3} disabled={isLocked} />
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
                                    <div className="form-actions" style={{ marginTop: '20px' }}>
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
                                        disabled={!settings || !settings.business_id}
                                        className="btn-sync"
                                    >
                                        {!settings?.business_id ? 'Connect WhatsApp WABA to Sync Templates' : 'Sync Templates to Meta Account'}
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
                                            title: 'Facebook Leads (Auto)',
                                            description: <Text type="secondary" size="small">Click <Text strong>Connect Facebook Page</Text> to instantly sync your forms and leads.</Text>,
                                            icon: <FacebookOutlined />,
                                        },
                                        {
                                            title: 'WhatsApp Setup (Manual)',
                                            description: <Text type="secondary" size="small">Paste your <Text strong>WABA IDs</Text> and <Text strong>System User Token</Text> in the fields below.</Text>,
                                            icon: <WhatsAppOutlined />,
                                        },
                                        {
                                            title: 'Sync Templates',
                                            description: <Text type="secondary" size="small">Click <Text strong>Sync Templates</Text> to fetch your approved WhatsApp messages.</Text>,
                                            icon: <SyncOutlined />,
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

            {/* Modal for Facebook Page Selection */}
            <Modal
                title={
                    <Space>
                        <FacebookOutlined style={{ color: '#1877F2', fontSize: '20px' }} />
                        <span>Select Facebook Page for Lead Capture</span>
                    </Space>
                }
                open={isPageModalOpen}
                onCancel={() => setIsPageModalOpen(false)}
                footer={null}
                width={500}
                centered
            >
                <div style={{ margin: '12px 0 20px' }}>
                    <Text type="secondary">
                        Choose the Facebook Page you want to connect to Leadgoes CRM. When users submit forms on this Page, leads will be captured automatically.
                    </Text>
                </div>
                <List
                    loading={isSubscribingPage}
                    dataSource={facebookPages}
                    renderItem={page => (
                        <List.Item
                            actions={[
                                <Button 
                                    type="primary" 
                                    key="connect-page" 
                                    onClick={() => handleSelectPage(page)}
                                >
                                    Connect
                                </Button>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar src={page.picture} icon={<FacebookOutlined />} />
                                }
                                title={<Text strong>{page.name}</Text>}
                                description={<Text type="secondary" style={{ fontSize: '12px' }}>Page ID: {page.id}</Text>}
                            />
                        </List.Item>
                    )}
                />
            </Modal>
        </div>
    );
};

export default WhatsappSettings;
