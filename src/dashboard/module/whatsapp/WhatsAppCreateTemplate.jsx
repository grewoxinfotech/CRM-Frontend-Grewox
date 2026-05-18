import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Typography, Space, Divider, message, Row, Col } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiSend, FiPlus, FiSmile, FiTrash2 } from 'react-icons/fi';
import { useCreateWhatsappTemplateMutation } from '../settings/services/settingsApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../auth/services/authSlice';
import { useGetRolesQuery } from '../hrm/role/services/roleApi';
import PageHeader from '../../../components/PageHeader';

const { Title, Text } = Typography;

export default function WhatsAppCreateTemplate() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [createTemplate, { isLoading: isCreating }] = useCreateWhatsappTemplateMutation();

    const currentUser = useSelector(selectCurrentUser);
    const { data: rolesData } = useGetRolesQuery(undefined, {
        skip: !currentUser || currentUser.roleName === 'super-admin' || currentUser.roleName === 'client'
    });
    const userRoleData = rolesData?.message?.data?.find(role => role.id === currentUser?.role_id);
    const userPermissions = React.useMemo(() => {
        if (!userRoleData?.permissions) return null;
        try {
            return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
        } catch (e) { return null; }
    }, [userRoleData]);

    const hasPermission = React.useCallback((action) => {
        if (!currentUser) return false;
        if (currentUser.roleName === 'super-admin' || currentUser.roleName === 'client') return true;
        if (!userPermissions) return false;
        const perms = userPermissions['dashboards-communication'];
        if (!perms || perms.length === 0) return false;
        return (perms[0]?.permissions || []).includes(action);
    }, [currentUser, userPermissions]);

    React.useEffect(() => {
        if (currentUser && userPermissions) {
            if (!hasPermission('create')) {
                message.error('You do not have permission to create WhatsApp templates.');
                navigate('/dashboard/whatsapp/templates');
            }
        }
    }, [currentUser, userPermissions, hasPermission, navigate]);

    // Form value states for live preview
    const [name, setName] = useState('');
    const [headerText, setHeaderText] = useState('');
    const [bodyText, setBodyText] = useState('Hello {{1}},\n\nThank you for choosing Grewox CRM. Your appointment for {{2}} is confirmed!');
    const [footerText, setFooterText] = useState('Reply STOP to unsubscribe.');
    const [buttons, setButtons] = useState([
        { type: 'QUICK_REPLY', text: 'Interested' },
        { type: 'QUICK_REPLY', text: 'Call Back' }
    ]);

    const handleCreate = async (values) => {
        const components = [];

        if (values.headerText) {
            const headerText = values.headerText.trim();
            const headerComp = {
                type: 'HEADER',
                format: 'TEXT',
                text: headerText
            };
            // Auto-detect header variables e.g. {{1}}
            const headerVars = headerText.match(/\{\{(\d+)\}\}/g);
            if (headerVars && headerVars.length > 0) {
                headerComp.example = {
                    header_text: headerVars.map((_, idx) => `Header Sample ${idx + 1}`)
                };
            }
            components.push(headerComp);
        }

        const bodyText = values.bodyText.trim();
        const bodyComp = {
            type: 'BODY',
            text: bodyText
        };
        // Auto-detect body variables e.g. {{1}}, {{2}}
        const bodyVars = bodyText.match(/\{\{(\d+)\}\}/g);
        if (bodyVars && bodyVars.length > 0) {
            bodyComp.example = {
                body_text: [
                    bodyVars.map((_, idx) => `Sample Value ${idx + 1}`)
                ]
            };
        }
        components.push(bodyComp);

        if (values.footerText) {
            components.push({
                type: 'FOOTER',
                text: values.footerText.trim()
            });
        }

        const formButtons = values.buttons || [];
        const payloadButtons = [];

        formButtons.forEach(btn => {
            if (!btn.text) return;
            const text = btn.text.trim();
            if (btn.type === 'QUICK_REPLY') {
                payloadButtons.push({
                    type: 'QUICK_REPLY',
                    text: text
                });
            } else if (btn.type === 'PHONE_NUMBER') {
                payloadButtons.push({
                    type: 'PHONE_NUMBER',
                    text: text,
                    phone_number: btn.phone_number ? btn.phone_number.trim() : ''
                });
            } else if (btn.type === 'URL') {
                const url = btn.url ? btn.url.trim() : '';
                const urlComp = {
                    type: 'URL',
                    text: text,
                    url: url
                };
                // Auto-detect dynamic URL variables e.g. {{1}}
                const urlVars = url.match(/\{\{(\d+)\}\}/g);
                if (urlVars && urlVars.length > 0) {
                    urlComp.example = urlVars.map((_, idx) => `url_sample_${idx + 1}`);
                }
                payloadButtons.push(urlComp);
            }
        });

        if (payloadButtons.length > 0) {
            components.push({
                type: 'BUTTONS',
                buttons: payloadButtons
            });
        }

        const templateName = values.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

        try {
            await createTemplate({
                name: templateName,
                category: values.category,
                language: values.language || 'en_US',
                components: components
            }).unwrap();

            message.success('WhatsApp template created successfully!');
            navigate('/dashboard/whatsapp/templates');
        } catch (err) {
            console.error('Failed to create template:', err);
            message.error(err?.data?.message || 'Failed to create template');
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <PageHeader
                title="Create WhatsApp Template"
                subtitle="Create a template directly on your Meta WABA account with live mock phone preview."
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "WhatsApp" },
                    { title: <Link to="/dashboard/whatsapp/templates">Templates</Link> },
                    { title: "Create" }
                ]}
                extraActions={[
                    <Button 
                        key="back"
                        icon={<FiArrowLeft style={{ marginRight: '4px' }} />} 
                        onClick={() => navigate('/dashboard/whatsapp/templates')}
                    >
                        Back to Templates
                    </Button>
                ]}
            />

            <Row gutter={[24, 24]}>
                {/* Form Column */}
                <Col xs={24} lg={15}>
                    <Card className="shadow-sm" style={{ borderRadius: '12px', padding: '12px' }}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleCreate}
                            initialValues={{
                                category: 'MARKETING',
                                language: 'en_US',
                                bodyText: bodyText,
                                footerText: footerText,
                                buttons: buttons
                            }}
                            onValuesChange={(changedValues, allValues) => {
                                if ('headerText' in changedValues) setHeaderText(allValues.headerText || '');
                                if ('bodyText' in changedValues) setBodyText(allValues.bodyText || '');
                                if ('footerText' in changedValues) setFooterText(allValues.footerText || '');
                                if ('buttons' in changedValues) setButtons(allValues.buttons || []);
                            }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                                <Form.Item
                                    name="name"
                                    label="Template Name"
                                    rules={[
                                        { required: true, message: 'Template name is required' },
                                        { pattern: /^[a-z0-9_]+$/, message: 'Only lowercase, numbers & underscores allowed' }
                                    ]}
                                >
                                    <Input 
                                        placeholder="e.g. appointment_confirmation" 
                                        onChange={(e) => {
                                            const val = e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                                            form.setFieldsValue({ name: val });
                                            setName(val);
                                        }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="category"
                                    label="Category"
                                    rules={[{ required: true }]}
                                >
                                    <Select style={{ width: '100%' }}>
                                        <Select.Option value="MARKETING">MARKETING</Select.Option>
                                        <Select.Option value="UTILITY">UTILITY</Select.Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="language"
                                    label="Language"
                                    rules={[{ required: true }]}
                                >
                                    <Select style={{ width: '100%' }}>
                                        <Select.Option value="en_US">English (US)</Select.Option>
                                        <Select.Option value="es">Spanish</Select.Option>
                                        <Select.Option value="hi">Hindi</Select.Option>
                                        <Select.Option value="gu">Gujarati</Select.Option>
                                    </Select>
                                </Form.Item>
                            </div>

                            <Form.Item
                                name="headerText"
                                label="Header Text (Optional)"
                                help="Optional static text to display at the top of the message."
                            >
                                <Input 
                                    placeholder="e.g. Welcome to Grewox!" 
                                    onChange={(e) => setHeaderText(e.target.value)}
                                />
                            </Form.Item>

                            <Form.Item
                                name="bodyText"
                                label="Message Body"
                                rules={[{ required: true, message: 'Message body is required' }]}
                                help="Use {{1}}, {{2}} to add dynamic placeholders (e.g. Hello {{1}}, thank you for choosing Grewox!)."
                            >
                                <Input.TextArea 
                                    rows={5} 
                                    placeholder="Hello {{1}},\n\nYour order for {{2}} is confirm!"
                                    onChange={(e) => setBodyText(e.target.value)}
                                />
                            </Form.Item>

                            <Form.Item
                                name="footerText"
                                label="Footer Text (Optional)"
                                help="Add a small footer text at the bottom of the message."
                            >
                                <Input 
                                    placeholder="e.g. Reply STOP to unsubscribe." 
                                    onChange={(e) => setFooterText(e.target.value)}
                                />
                            </Form.Item>

                            <Divider style={{ margin: '20px 0' }} />
                            
                            <Text strong style={{ fontSize: '14px', color: '#475569', display: 'block', marginBottom: '12px' }}>
                                Buttons (Optional - Max 3)
                            </Text>

                            <Form.List name="buttons">
                                {(fields, { add, remove }) => (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Card 
                                                key={key} 
                                                size="small" 
                                                style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                                bodyStyle={{ padding: '12px' }}
                                            >
                                                <Row gutter={[12, 12]} align="middle">
                                                    <Col xs={24} sm={6}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'type']}
                                                            rules={[{ required: true, message: 'Type is required' }]}
                                                            style={{ margin: 0 }}
                                                        >
                                                            <Select placeholder="Type" style={{ width: '100%' }}>
                                                                <Select.Option value="QUICK_REPLY">Quick Reply</Select.Option>
                                                                <Select.Option value="PHONE_NUMBER">Call Phone</Select.Option>
                                                                <Select.Option value="URL">Visit Website</Select.Option>
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={8}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'text']}
                                                            rules={[{ required: true, message: 'Label is required' }]}
                                                            style={{ margin: 0 }}
                                                        >
                                                            <Input placeholder="Button Label (e.g. Call Us)" maxLength={25} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={8}>
                                                        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => {
                                                            const prevBtn = prevValues.buttons?.[name] || {};
                                                            const currBtn = currentValues.buttons?.[name] || {};
                                                            return prevBtn.type !== currBtn.type;
                                                        }}>
                                                            {({ getFieldValue }) => {
                                                                const type = getFieldValue(['buttons', name, 'type']);
                                                                if (type === 'PHONE_NUMBER') {
                                                                    return (
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[name, 'phone_number']}
                                                                            rules={[{ required: true, message: 'Phone number is required' }]}
                                                                            style={{ margin: 0 }}
                                                                        >
                                                                            <Input placeholder="e.g. +919876543210" />
                                                                        </Form.Item>
                                                                    );
                                                                }
                                                                if (type === 'URL') {
                                                                    return (
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[name, 'url']}
                                                                            rules={[{ required: true, message: 'URL is required' }]}
                                                                            style={{ margin: 0 }}
                                                                        >
                                                                            <Input placeholder="e.g. https://example.com/{{1}}" />
                                                                        </Form.Item>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={2} style={{ textAlign: 'right' }}>
                                                        <Button 
                                                            type="text" 
                                                            danger 
                                                            icon={<FiTrash2 />} 
                                                            onClick={() => remove(name)}
                                                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Card>
                                        ))}

                                        {fields.length < 3 && (
                                            <Button 
                                                type="dashed" 
                                                onClick={() => add({ type: 'QUICK_REPLY', text: '' })} 
                                                block 
                                                icon={<FiPlus />}
                                                style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                Add Button
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </Form.List>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <Button size="large" onClick={() => navigate('/dashboard/whatsapp/templates')}>
                                    Cancel
                                </Button>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    size="large" 
                                    loading={isCreating}
                                    icon={<FiSend />}
                                >
                                    Create & Submit for Approval
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>

                {/* WhatsApp Live Preview Column */}
                <Col xs={24} lg={9}>
                    <Card 
                        title={<span style={{ fontWeight: '700', color: '#1e293b' }}>Live Mobile Preview</span>}
                        className="shadow-sm" 
                        style={{ borderRadius: '12px', position: 'sticky', top: '24px' }}
                    >
                        <div style={{ background: '#efeae2', borderRadius: '16px', padding: '24px 16px', border: '1px solid #dcdad5', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.05)' }}>
                            
                            {/* Message Bubble */}
                            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '12px 14px', maxWidth: '85%', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', position: 'relative', alignSelf: 'flex-start' }}>
                                
                                {/* Header */}
                                {headerText && (
                                    <div style={{ fontWeight: '700', fontSize: '13.5px', color: '#1e293b', marginBottom: '6px' }}>
                                        {headerText}
                                    </div>
                                )}

                                {/* Body */}
                                <div style={{ fontSize: '14px', color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                    {bodyText || 'Start typing in the message body field...'}
                                </div>

                                {/* Footer */}
                                {footerText && (
                                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                                        {footerText}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons Mock */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '85%', alignSelf: 'flex-start' }}>
                                {buttons.map((btn, index) => {
                                    if (!btn || !btn.text) return null;
                                    return (
                                        <div 
                                            key={index} 
                                            style={{ 
                                                background: '#ffffff', 
                                                borderRadius: '8px', 
                                                padding: '10px', 
                                                textAlign: 'center', 
                                                color: '#005a9e', 
                                                fontWeight: '600', 
                                                fontSize: '13px', 
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.08)', 
                                                cursor: 'pointer', 
                                                border: '1px solid #f1f5f9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            {btn.type === 'PHONE_NUMBER' && <span style={{ fontSize: '12px' }}>📞</span>}
                                            {btn.type === 'URL' && <span style={{ fontSize: '12px' }}>🌐</span>}
                                            {btn.text}
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
