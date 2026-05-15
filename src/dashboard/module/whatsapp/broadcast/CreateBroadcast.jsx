import React, { useState } from 'react';
import { Steps, Form, Input, Select, Button, DatePicker, Checkbox, Space, Divider, Typography, Alert, Row, Col, Card, Tag, message, Tooltip } from 'antd';
import { 
    PlusOutlined, 
    SendOutlined, 
    ThunderboltOutlined, 
    CheckCircleOutlined,
    InfoCircleOutlined,
    ArrowRightOutlined,
    UsergroupAddOutlined,
    FileTextOutlined,
    RocketOutlined,
    SyncOutlined
} from '@ant-design/icons';

import { 
    useCreateWhatsappBroadcastMutation,
    useGetWhatsappTemplatesQuery
} from '../../settings/services/settingsApi';
import { useGetStatusesQuery, useGetTagsQuery, useGetSourcesQuery, useGetCategoriesQuery } from '../../crm/crmsystem/souce/services/SourceApi';
import { useGetLeadStagesQuery } from '../../crm/crmsystem/leadstage/services/leadStageApi';
import { useGetLeadsQuery } from '../../crm/lead/services/LeadApi';
import { useGetDealsQuery } from '../../crm/deal/services/DealApi';
import { useGetContactsQuery } from '../../crm/contact/services/contactApi';
import { useGetCompanyAccountsQuery } from '../../crm/companyacoount/services/companyAccountApi';
import { useGetCustomFormsQuery } from '../../crm/generate-link/services/customFormApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const CreateBroadcast = ({ onSuccess }) => {
    const [current, setCurrent] = useState(0);
    const [form] = Form.useForm();
    const loggedInUser = useSelector(selectCurrentUser);
    
    const [createBroadcast, { isLoading: isCreating }] = useCreateWhatsappBroadcastMutation();
    const { data: templates = [] } = useGetWhatsappTemplatesQuery();
    const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
    const { data: stagesData } = useGetLeadStagesQuery();
    const { data: tagsData } = useGetTagsQuery(loggedInUser?.id);
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
    const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);

    const statuses = statusesData?.data || [];
    const leadStages = (stagesData || []).filter(s => s.stageType === 'lead');
    const dealStages = (stagesData || []).filter(s => s.stageType === 'deal');
    const tags = tagsData?.data || [];
    const sources = sourcesData?.data || [];
    const categories = categoriesData?.data || [];

    const targetModule = Form.useWatch('target_module', form) || 'leads';
    const audienceFilter = Form.useWatch('audience_filter', form) || {};
    const city = Form.useWatch(['audience_filter', 'city'], form);

    // Dynamic Recipients Count Logic
    const commonParams = { 
        page: 1, 
        pageSize: 1, 
        ...audienceFilter,
        ...(city && { city })
    };

    const { data: leadCountData, isFetching: isLeadCounting } = useGetLeadsQuery(commonParams, { skip: targetModule !== 'leads' });
    const { data: dealCountData, isFetching: isDealCounting } = useGetDealsQuery(commonParams, { skip: targetModule !== 'deals' });
    const { data: contactCountData, isFetching: isContactCounting } = useGetContactsQuery(commonParams, { skip: targetModule !== 'contacts' });
    const { data: companyCountData, isFetching: isCompanyCounting } = useGetCompanyAccountsQuery(commonParams, { skip: targetModule !== 'companies' });

    const totalRecipients = 
        targetModule === 'leads' ? (leadCountData?.pagination?.total || 0) : 
        targetModule === 'deals' ? (dealCountData?.pagination?.total || 0) : 
        targetModule === 'contacts' ? (contactCountData?.pagination?.total || 0) :
        targetModule === 'companies' ? (companyCountData?.pagination?.total || 0) : 0;
    
    const isCounting = isLeadCounting || isDealCounting || isContactCounting || isCompanyCounting;

    const { data: customFormsData } = useGetCustomFormsQuery({ 
        module_type: targetModule === 'companies' ? 'company' : targetModule === 'contacts' ? 'contact' : targetModule.replace(/s$/, ''), 
        status: 'active' 
    });
    const activeCustomForm = customFormsData?.data?.[0];
    const customFields = React.useMemo(() => {
        if (!activeCustomForm?.fields) return [];
        try {
            return typeof activeCustomForm.fields === 'string' 
                ? JSON.parse(activeCustomForm.fields) 
                : activeCustomForm.fields;
        } catch (e) { return []; }
    }, [activeCustomForm]);

    const next = async () => {
        try {
            await form.validateFields();
            setCurrent(current + 1);
        } catch (error) {
            console.log('Validation failed:', error);
        }
    };

    const prev = () => setCurrent(current - 1);

    const handleSubmit = async () => {
        try {
            // Get all values from the form, including preserved ones from previous steps
            const values = form.getFieldsValue(true);
            
            // Derive template text and language
            const selectedTemplate = templates.find(t => t.name === values.template_name);
            const templateText = selectedTemplate?.components?.find(c => c.type === 'BODY')?.text || '';
            const templateLanguage = selectedTemplate?.language || 'en';

            // Format variables if needed
            // Determine correct trigger type for backend
            let finalTriggerType = values.trigger_type;
            if (values.trigger_type === 'manual' && values.is_scheduled === 'later') {
                finalTriggerType = 'scheduled';
            }

            const payload = {
                ...values,
                trigger_type: finalTriggerType,
                name: values.name || `Broadcast ${new Date().toLocaleDateString()}`,
                audience_filter: values.audience_filter || {},
                scheduled_at: values.scheduled_at ? (typeof values.scheduled_at === 'string' ? values.scheduled_at : values.scheduled_at.toISOString()) : null,
                message: templateText, // Store the template text with placeholders
                template_language: templateLanguage // Store the correct language (e.g. en_US)
            };

            console.log('🚀 Launching Broadcast with payload:', payload);

            await createBroadcast(payload).unwrap();
            message.success('Campaign launched successfully!');
            onSuccess();
        } catch (error) {
            console.error('Broadcast Launch Error:', error);
            message.error(error.data?.message || 'Failed to launch campaign');
        }
    };

    const steps = [
        {
            title: 'Audience',
            icon: <UsergroupAddOutlined />,
            content: (
                <div style={{ marginTop: '20px' }}>
                    <Form.Item name="name" label="Campaign Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Diwali Offer 2026" />
                    </Form.Item>
                    <Form.Item name="trigger_type" initialValue="manual" noStyle>
                        <Input type="hidden" />
                    </Form.Item>

                    <Form.Item label={<Text strong style={{ fontSize: '13px' }}>Select Broadcast Type</Text>} required style={{ marginBottom: '16px' }}>
                        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.trigger_type !== curr.trigger_type}>
                            {({ getFieldValue, setFieldsValue }) => {
                                const selected = getFieldValue('trigger_type');
                                return (
                                    <Row gutter={12}>
                                        <Col span={12}>
                                            <div 
                                                style={{ 
                                                    cursor: 'pointer',
                                                    padding: '16px',
                                                    border: selected === 'manual' ? '2px solid #1890ff' : '1px solid #f0f0f0',
                                                    background: selected === 'manual' ? 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)' : '#fff',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
                                                    textAlign: 'center',
                                                    boxShadow: selected === 'manual' ? '0 4px 12px rgba(24, 144, 255, 0.1)' : '0 1px 4px rgba(0,0,0,0.02)'
                                                }}
                                                onClick={() => setFieldsValue({ trigger_type: 'manual' })}
                                            >
                                                <div style={{ 
                                                    width: '36px', 
                                                    height: '36px', 
                                                    background: selected === 'manual' ? '#1890ff' : '#f5f5f5', 
                                                    color: selected === 'manual' ? '#fff' : '#8c8c8c', 
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto 12px',
                                                    fontSize: '18px'
                                                }}>
                                                    <SendOutlined />
                                                </div>
                                                <Text strong style={{ fontSize: '14px', display: 'block', color: selected === 'manual' ? '#1890ff' : '#262626' }}>Manual</Text>
                                                <Text type="secondary" style={{ fontSize: '11px', marginTop: '4px', display: 'block' }}>
                                                    Once now or later.
                                                </Text>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div 
                                                style={{ 
                                                    cursor: 'pointer',
                                                    padding: '16px',
                                                    border: selected === 'event' ? '2px solid #722ed1' : '1px solid #f0f0f0',
                                                    background: selected === 'event' ? 'linear-gradient(135deg, #f9f0ff 0%, #ffffff 100%)' : '#fff',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
                                                    textAlign: 'center',
                                                    boxShadow: selected === 'event' ? '0 4px 12px rgba(114, 46, 209, 0.1)' : '0 1px 4px rgba(0,0,0,0.02)'
                                                }}
                                                onClick={() => setFieldsValue({ trigger_type: 'event' })}
                                            >
                                                <div style={{ 
                                                    width: '36px', 
                                                    height: '36px', 
                                                    background: selected === 'event' ? '#722ed1' : '#f5f5f5', 
                                                    color: selected === 'event' ? '#fff' : '#8c8c8c', 
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto 12px',
                                                    fontSize: '18px'
                                                }}>
                                                    <ThunderboltOutlined />
                                                </div>
                                                <Text strong style={{ fontSize: '14px', display: 'block', color: selected === 'event' ? '#722ed1' : '#262626' }}>Event</Text>
                                                <Text type="secondary" style={{ fontSize: '11px', marginTop: '4px', display: 'block' }}>
                                                    Auto based on actions.
                                                </Text>
                                            </div>
                                        </Col>
                                    </Row>
                                );
                            }}
                        </Form.Item>
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.trigger_type !== curr.trigger_type}>
                        {({ getFieldValue }) => (
                            <Alert 
                                style={{ marginBottom: '20px' }}
                                message={getFieldValue('trigger_type') === 'manual' ? "Manual Campaign" : "Event-Driven Automation"}
                                description={getFieldValue('trigger_type') === 'manual' 
                                    ? "This campaign will be sent once to the group of people you select in the next step. You can send it immediately or pick a future time."
                                    : "This campaign will stay active and automatically send a message whenever the selected event (like 'New Lead') happens for a specific person."
                                }
                                type="info"
                                showIcon
                            />
                        )}
                    </Form.Item>
                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.trigger_type !== currentValues.trigger_type}>
                        {({ getFieldValue }) => 
                            getFieldValue('trigger_type') === 'event' ? (
                                <Form.Item 
                                    name="trigger_event" 
                                    label="Select Trigger Event" 
                                    rules={[{ required: true, message: 'Please select an event' }]}
                                    style={{ marginTop: '16px' }}
                                >
                                    <Select placeholder="Select event to trigger broadcast">
                                        <Option value="lead_created">New Lead Created</Option>
                                        <Option value="stage_changed">Lead Stage Changed</Option>
                                        <Option value="status_changed">Lead Status Changed</Option>
                                        <Option value="inquiry_submitted">Inquiry Form Submitted</Option>
                                        <Option value="lead_converted">Lead Converted to Deal</Option>
                                    </Select>
                                </Form.Item>
                            ) : (
                                <div style={{ 
                                    background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)', 
                                    padding: '16px', 
                                    borderRadius: '12px', 
                                    border: '1px solid #bae7ff', 
                                    marginTop: '16px',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                                }}>
                                    <Title level={5} style={{ marginTop: 0, color: '#0050b3', marginBottom: '12px', fontSize: '14px' }}>
                                        Schedule Configuration
                                    </Title>
                                    
                                    <Form.Item 
                                        name="is_scheduled" 
                                        label={<Text strong style={{ fontSize: '12px' }}>Delivery Time</Text>} 
                                        initialValue="now"
                                        style={{ marginBottom: '12px' }}
                                    >
                                        <Select 
                                            size="middle"
                                            onChange={(val) => {
                                                if (val === 'now') form.setFieldValue('scheduled_at', null);
                                                form.setFieldValue('trigger_type', 'manual');
                                            }}
                                            style={{ borderRadius: '6px' }}
                                        >
                                            <Option value="now">Send Immediately</Option>
                                            <Option value="later">Schedule for specific time</Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.is_scheduled !== currentValues.is_scheduled}>
                                        {({ getFieldValue }) => 
                                            getFieldValue('is_scheduled') === 'later' ? (
                                                <Form.Item 
                                                    name="scheduled_at" 
                                                    label={<Text strong style={{ fontSize: '12px' }}>Target Date & Time</Text>} 
                                                    rules={[{ required: true, message: 'Select time' }]}
                                                    style={{ marginBottom: 0, marginTop: '8px' }}
                                                >
                                                    <DatePicker 
                                                        showTime 
                                                        format="YYYY-MM-DD HH:mm" 
                                                        style={{ width: '100%', borderRadius: '6px' }} 
                                                        size="middle"
                                                        disabledDate={(current) => current && current < new Date().setHours(0,0,0,0)}
                                                        placeholder="Select time"
                                                    />
                                                </Form.Item>
                                            ) : (
                                                <div style={{ 
                                                    fontSize: '11px', 
                                                    color: '#52c41a', 
                                                    background: '#f6ffed', 
                                                    padding: '8px 12px', 
                                                    borderRadius: '6px', 
                                                    border: '1px solid #b7eb8f',
                                                    marginTop: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    <CheckCircleOutlined style={{ marginRight: '6px', flexShrink: 0 }} />
                                                    <span>Campaign will start sending immediately after launch.</span>
                                                </div>
                                            )
                                        }
                                    </Form.Item>
                                </div>
                            )
                        }
                    </Form.Item>
                </div>
            )
        },
        {
            title: 'Audience Filter',
            icon: <UsergroupAddOutlined />,
            content: (
                <div style={{ marginTop: '20px' }}>
                    <Alert 
                        message="Precision Targeting" 
                        description={
                            <div style={{ fontSize: '13px' }}>
                                <p style={{ marginBottom: '8px' }}>Select specific criteria to narrow down your audience. <strong>Leaving a field blank means it will include everyone for that category.</strong></p>
                                <p style={{ marginBottom: 0, fontSize: '12px', color: '#666' }}>Note: Multiple filters work together (e.g., Status: 'Interested' AND Source: 'Facebook').</p>
                            </div>
                        }
                        type="info" 
                        showIcon 
                        style={{ marginBottom: '24px', borderRadius: '12px' }}
                    />

                    <Card size="small" style={{ marginBottom: '24px', borderRadius: '12px', background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px' }}>
                            <Space>
                                <UsergroupAddOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                                <Text strong>Target Audience Size:</Text>
                            </Space>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isCounting ? (
                                    <SyncOutlined spin style={{ color: '#1890ff' }} />
                                ) : (
                                    <Title level={4} style={{ margin: 0, color: '#52c41a' }}>{totalRecipients}</Title>
                                )}
                                <Text type="secondary" style={{ fontSize: '12px' }}>Recipients</Text>
                            </div>
                        </div>
                    </Card>

                    <Form.Item name="target_module" label="Target Module" initialValue="leads">
                        <Select onChange={() => form.setFieldsValue({ target_module: form.getFieldValue('target_module') })}>
                            <Option value="leads">CRM Leads</Option>
                            <Option value="deals">CRM Deals</Option>
                            <Option value="contacts">Global Contacts</Option>
                            <Option value="companies">Company Accounts</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.target_module !== curr.target_module}>
                        {({ getFieldValue }) => 
                            getFieldValue('target_module') === 'leads' ? (
                                <>
                                    <Row gutter={[16, 24]}>
                                        <Col span={12}>
                                            <Form.Item 
                                                name={['audience_filter', 'status']} 
                                                label={
                                                    <Space size={4}>
                                                        Lead Status
                                                        <Tooltip title="Target leads by their current business status (e.g., New, Interested, Following Up).">
                                                            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '13px' }} />
                                                        </Tooltip>
                                                    </Space>
                                                }
                                            >
                                                <Select placeholder="All Statuses" allowClear>
                                                    {statuses.map(s => (
                                                        <Option key={s.id} value={s.id}>{s.name}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item 
                                                name={['audience_filter', 'leadStage']} 
                                                label={
                                                    <Space size={4}>
                                                        Lead Stage
                                                        <Tooltip title="Target leads at specific steps in your sales process (e.g., Initial Contact, Qualification).">
                                                            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '13px' }} />
                                                        </Tooltip>
                                                    </Space>
                                                }
                                            >
                                                <Select placeholder="All Stages" allowClear>
                                                    {leadStages.map(s => (
                                                        <Option key={s.id} value={s.id}>{s.stageName}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name={['audience_filter', 'source']} label="Lead Source">
                                                <Select placeholder="All Sources" allowClear>
                                                    {sources.map(s => (
                                                        <Option key={s.id} value={s.id}>{s.name}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name={['audience_filter', 'category']} label="Lead Category">
                                                <Select placeholder="All Categories" allowClear>
                                                    {categories.map(c => (
                                                        <Option key={c.id} value={c.id}>{c.name}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item 
                                                name={['audience_filter', 'leadValueMin']} 
                                                label={
                                                    <Space size={4}>
                                                        Min Lead Value
                                                        <Tooltip title="Include only leads with a potential value greater than or equal to this amount.">
                                                            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '13px' }} />
                                                        </Tooltip>
                                                    </Space>
                                                }
                                            >
                                                <Input type="number" placeholder="No minimum" prefix="₹" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item 
                                                name={['audience_filter', 'leadValueMax']} 
                                                label={
                                                    <Space size={4}>
                                                        Max Lead Value
                                                        <Tooltip title="Include only leads with a potential value less than or equal to this amount.">
                                                            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '13px' }} />
                                                        </Tooltip>
                                                    </Space>
                                                }
                                            >
                                                <Input type="number" placeholder="No maximum" prefix="₹" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            ) : getFieldValue('target_module') === 'deals' ? (
                                <>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item 
                                                name={['audience_filter', 'stage']} 
                                                label={
                                                    <Space size={4}>
                                                        Deal Stage
                                                        <Tooltip title="Target deals currently in specific pipeline stages (e.g., Negotiation, Contract Sent).">
                                                            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '13px' }} />
                                                        </Tooltip>
                                                    </Space>
                                                }
                                            >
                                                <Select placeholder="All Deal Stages" allowClear>
                                                    {dealStages.map(s => (
                                                        <Option key={s.id} value={s.id}>{s.stageName}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item 
                                                name={['audience_filter', 'source']} 
                                                label={
                                                    <Space size={4}>
                                                        Deal Source
                                                        <Tooltip title="Filter based on where the deal originated (e.g., Cold Call, Referral, Website).">
                                                            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '13px' }} />
                                                        </Tooltip>
                                                    </Space>
                                                }
                                            >
                                                <Select placeholder="All Sources" allowClear>
                                                    {sources.map(s => (
                                                        <Option key={s.id} value={s.id}>{s.name}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item 
                                                name={['audience_filter', 'valueMin']} 
                                                label={
                                                    <Space size={4}>
                                                        Min Deal Value
                                                        <Tooltip title="Include only deals with a value greater than or equal to this amount.">
                                                            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '13px' }} />
                                                        </Tooltip>
                                                    </Space>
                                                }
                                            >
                                                <Input type="number" placeholder="No minimum" prefix="₹" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item 
                                                name={['audience_filter', 'valueMax']} 
                                                label={
                                                    <Space size={4}>
                                                        Max Deal Value
                                                        <Tooltip title="Include only deals with a value less than or equal to this amount.">
                                                            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '13px' }} />
                                                        </Tooltip>
                                                    </Space>
                                                }
                                            >
                                                <Input type="number" placeholder="No maximum" prefix="₹" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            ) : null
                        }
                    </Form.Item>



                    <Form.Item name={['audience_filter', 'city']} label="City">
                        <Input placeholder="e.g. Mumbai, New York" />
                    </Form.Item>

                    <Form.Item name="duplicate_protection" valuePropName="checked" initialValue={true}>
                        <Checkbox>Enable Duplicate Protection (Skip numbers already messaged in this campaign)</Checkbox>
                    </Form.Item>
                </div>
            )
        },
        {
            title: 'Message Template',
            icon: <FileTextOutlined />,
            content: (
                <div style={{ marginTop: '20px' }}>
                    <Form.Item name="template_name" label="Select Template" rules={[{ required: true }]}>
                        <Select placeholder="Choose an approved Meta template">
                            {templates.map(t => (
                                <Option key={t.name} value={t.name}>{t.name} ({t.category})</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.template_name !== currentValues.template_name}>
                        {({ getFieldValue }) => {
                            const selectedName = getFieldValue('template_name');
                            const template = templates.find(t => t.name === selectedName);
                            
                            if (!template) return null;
                            
                            const bodyComponent = template.components?.find(c => c.type === 'BODY');
                            const text = bodyComponent?.text || '';


                            // Function to show demo values in preview based on mapping
                            const formatPreview = (content) => {
                                const mapping = getFieldValue('variable_mapping') || {};
                                const customs = getFieldValue('custom_variables') || {};
                                
                                const parts = content.split(/(\{\{[0-9]+\}\})/g);
                                return parts.map((part, index) => {
                                    if (part.startsWith('{{') && part.endsWith('}}')) {
                                        const num = part.replace(/\{|\}/g, '');
                                        const mapType = mapping[num];
                                        let demoValue = part;

                                        if (mapType) {
                                            if (mapType.startsWith('cf_')) {
                                                const field = customFields.find(f => `cf_${f.name}` === mapType || `cf_${f.label}` === mapType);
                                                demoValue = `[${field?.label || 'Custom Value'}]`;
                                            } else {
                                                switch (mapType) {
                                                    case 'lead_name': demoValue = "John Doe"; break;
                                                    case 'lead_first_name': demoValue = "John"; break;
                                                    case 'lead_status': demoValue = "Interested"; break;
                                                    case 'lead_stage': demoValue = "Proposal"; break;
                                                    case 'lead_city': demoValue = "Ahmedabad"; break;
                                                    case 'lead_company': demoValue = "Grewox Infotech"; break;
                                                    case 'contact_name': demoValue = "Alice Smith"; break;
                                                    case 'contact_phone': demoValue = "+91 98765 43210"; break;
                                                    case 'custom': demoValue = customs[num] || part; break;
                                                    default: demoValue = part;
                                                }
                                            }
                                        }

                                        return <span key={index} style={{ color: '#1890ff', fontWeight: '600', padding: '0 2px' }}>{demoValue}</span>;
                                    }
                                    return <span key={index}>{part}</span>;
                                });
                            };

                            return (
                                <>
                                    <Form.Item noStyle shouldUpdate={(prev, curr) => 
                                        JSON.stringify(prev.variable_mapping) !== JSON.stringify(curr.variable_mapping) ||
                                        JSON.stringify(prev.custom_variables) !== JSON.stringify(curr.custom_variables)
                                    }>
                                        {() => (
                                            <Card title="Message Preview" size="small" style={{ background: '#f0f2f5', borderRadius: '8px', marginTop: '16px' }}>
                                                <div style={{ 
                                                    padding: '12px', 
                                                    background: '#fff', 
                                                    borderRadius: '8px', 
                                                    maxWidth: '100%', 
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                                    borderLeft: '4px solid #25D366', 
                                                    fontSize: '14px',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {formatPreview(text)}
                                                </div>
                                            </Card>
                                        )}
                                    </Form.Item>

                                    <div style={{ marginTop: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                            <Divider orientation="left" style={{ margin: 0 }}><span style={{ color: '#1890ff', fontWeight: '600' }}>Variable Mapping</span></Divider>
                                        </div>
                                        
                                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #eef0f2' }}>
                                            <div style={{ marginBottom: '16px', fontSize: '12px', color: '#8c8c8c' }}>
                                                Map each template placeholder to a CRM field or enter custom text.
                                            </div>
                                            
                                            <>
                                                {(() => {
                                                    const placeholders = text.match(/\{\{[0-9]+\}\}/g) || [];
                                                    const buttonPlaceholders = [];
                                                    if (template?.components) {
                                                        template.components.forEach(c => {
                                                            if (c.type === 'BUTTONS') {
                                                                c.buttons.forEach(b => {
                                                                    if (b.url) {
                                                                        const matches = b.url.match(/\{\{[0-9]+\}\}/g) || [];
                                                                        buttonPlaceholders.push(...matches);
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                    
                                                const totalVars = placeholders.length + buttonPlaceholders.length;
                                                const bodyCount = (text.match(/\{\{[0-9]+\}\}/g) || []).length;
                                                    
                                                    return Array.from({ length: totalVars }).map((_, i) => {
                                                        const varNum = i + 1;
                                                        const isButtonVar = varNum > bodyCount;
                                                        
                                                        return (
                                                            <div key={varNum} style={{ 
                                                                display: 'flex', 
                                                                alignItems: 'flex-start', 
                                                                gap: '12px', 
                                                                marginBottom: '16px',
                                                                background: isButtonVar ? '#fffbe6' : '#fff', 
                                                                padding: '12px',
                                                                borderRadius: '8px',
                                                                border: isButtonVar ? '1px solid #ffe58f' : '1px solid #f0f0f0',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                                            }}>
                                                                <div style={{ 
                                                                    width: '32px', 
                                                                    height: '32px', 
                                                                    background: isButtonVar ? '#fff1b8' : '#e6f7ff', 
                                                                    color: isButtonVar ? '#faad14' : '#1890ff', 
                                                                    borderRadius: '50%', 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    justifyContent: 'center',
                                                                    fontWeight: 'bold',
                                                                    flexShrink: 0,
                                                                    fontSize: '12px'
                                                                }}>
                                                                    {varNum}
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#595959' }}>
                                                                            {isButtonVar ? 'Button' : 'Body'} Placeholder: <code style={{ color: isButtonVar ? '#d48806' : '#eb2f96', background: isButtonVar ? '#fff1b8' : '#fff0f6', padding: '2px 4px', borderRadius: '4px' }}>{`{{${varNum}}}`}</code>
                                                                        </div>
                                                                        {isButtonVar && <Tag color="warning">Dynamic URL</Tag>}
                                                                    </div>
                                                                    <Form.Item 
                                                                        name={['variable_mapping', varNum.toString()]} 
                                                                        rules={[{ required: true, message: 'Mapping is required' }]}
                                                                        style={{ marginBottom: '8px' }}
                                                                    >
                                                                        <Select 
                                                                            placeholder={`Select source for {{${varNum}}}`}
                                                                            style={{ width: '100%' }}
                                                                            bordered={false}
                                                                            className="mapping-select"
                                                                            dropdownStyle={{ borderRadius: '8px' }}
                                                                        >
                                                                            {getFieldValue('target_module') === 'leads' && (
                                                                                <>
                                                                                    <Option value="lead_name">Lead: Full Name</Option>
                                                                                    <Option value="lead_first_name">Lead: First Name</Option>
                                                                                    <Option value="lead_status">Lead: Status</Option>
                                                                                    <Option value="lead_stage">Lead: Stage</Option>
                                                                                    <Option value="lead_city">Lead: City</Option>
                                                                                    <Option value="lead_company">Lead: Company</Option>
                                                                                    <Option value="contact_name">Contact: Linked Person Name</Option>
                                                                                    <Option value="contact_phone">Contact: Phone Number</Option>
                                                                                </>
                                                                            )}
                                                                            {getFieldValue('target_module') === 'deals' && (
                                                                                <>
                                                                                    <Option value="lead_name">Deal: Title</Option>
                                                                                    <Option value="lead_status">Deal: Status</Option>
                                                                                    <Option value="lead_stage">Deal: Stage</Option>
                                                                                    <Option value="lead_city">Deal: Linked Contact City</Option>
                                                                                    <Option value="contact_name">Contact: Linked Person Name</Option>
                                                                                    <Option value="contact_phone">Contact: Phone Number</Option>
                                                                                </>
                                                                            )}
                                                                            {getFieldValue('target_module') === 'contacts' && (
                                                                                <>
                                                                                    <Option value="lead_name">Contact: Full Name</Option>
                                                                                    <Option value="lead_first_name">Contact: First Name</Option>
                                                                                    <Option value="lead_city">Contact: City</Option>
                                                                                </>
                                                                            )}
                                                                            {getFieldValue('target_module') === 'companies' && (
                                                                                <>
                                                                                    <Option value="lead_name">Company: Name</Option>
                                                                                    <Option value="lead_city">Company: City</Option>
                                                                                </>
                                                                            )}

                                                                            {/* Dynamic Custom Fields */}
                                                                            {customFields.length > 0 && <Option disabled style={{ background: '#f5f5f5', color: '#8c8c8c' }}>-- Custom Fields --</Option>}
                                                                            {customFields.map(f => (
                                                                                <Option key={f.id || f.name} value={`cf_${f.name || f.label}`}>
                                                                                    {f.label}
                                                                                </Option>
                                                                            ))}

                                                                            <Option value="custom">-- Custom Text --</Option>
                                                                        </Select>
                                                                    </Form.Item>
                                                                    <Divider style={{ margin: '4px 0 8px 0' }} />
                                                                    
                                                                    <Form.Item 
                                                                        noStyle 
                                                                        shouldUpdate={(prev, curr) => prev.variable_mapping?.[varNum] !== curr.variable_mapping?.[varNum]}
                                                                    >
                                                                        {({ getFieldValue }) => 
                                                                            getFieldValue(['variable_mapping', varNum.toString()]) === 'custom' ? (
                                                                                <Form.Item 
                                                                                    name={['custom_variables', varNum.toString()]} 
                                                                                    rules={[{ required: true, message: 'Please enter a value' }]}
                                                                                    style={{ marginBottom: 0, marginTop: '12px' }}
                                                                                >
                                                                                    <Input placeholder="Type static text here..." style={{ borderRadius: '6px' }} />
                                                                                </Form.Item>
                                                                            ) : (
                                                                                <div style={{ fontSize: '11px', color: '#bfbfbf', fontStyle: 'italic' }}>
                                                                                    Will be pulled dynamically from lead data
                                                                                </div>
                                                                            )
                                                                        }
                                                                    </Form.Item>
                                                                </div>
                                                            </div>
                                                        );
                                                    });
                                                })()}

                                                {(() => {
                                                    const placeholders = text.match(/\{\{[0-9]+\}\}/g) || [];
                                                    const buttonPlaceholders = [];
                                                    if (template?.components) {
                                                        template.components.forEach(c => {
                                                            if (c.type === 'BUTTONS') {
                                                                c.buttons.forEach(b => {
                                                                    if (b.url) {
                                                                        const matches = b.url.match(/\{\{[0-9]+\}\}/g) || [];
                                                                        buttonPlaceholders.push(...matches);
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                    return placeholders.length + buttonPlaceholders.length === 0;
                                                })() && (
                                                    <div style={{ textAlign: 'center', padding: '20px', color: '#bfbfbf' }}>
                                                        <FileTextOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                                                        <p>No variables found in this template.</p>
                                                    </div>
                                                )}
                                            </>
                                        </div>
                                    </div>
                                </>
                            );
                        }}
                    </Form.Item>

                    <Form.Item name="is_recurring" valuePropName="checked" style={{ marginBottom: '8px' }}>
                        <Checkbox><Text strong>Make this a Recurring Broadcast</Text></Checkbox>
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.is_recurring !== currentValues.is_recurring}>
                        {({ getFieldValue }) => 
                            getFieldValue('is_recurring') ? (
                                <Form.Item name="frequency" label="Frequency" initialValue="weekly">
                                    <Select>
                                        <Option value="daily">Daily</Option>
                                        <Option value="weekly">Weekly</Option>
                                        <Option value="monthly">Monthly</Option>
                                    </Select>
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>

                    <Alert 
                        message="Ready to Launch!" 
                        description="This campaign will be sent to all matching recipients based on your audience filters." 
                        type="success" 
                        showIcon 
                    />
                </div>
            )
        }
    ];

    return (
        <Form form={form} layout="vertical" preserve={true}>
            <Steps current={current} items={steps.map(s => ({ title: s.title, icon: s.icon }))} size="small" />
            
            <div className="steps-content" style={{ minHeight: '300px', padding: '10px 0' }}>
                {steps[current].content}
            </div>

            <div className="steps-action" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {current > 0 && (
                    <Button onClick={() => prev()}>Previous</Button>
                )}
                {current < steps.length - 1 && (
                    <Button type="primary" onClick={() => next()}>Next</Button>
                )}
                {current === steps.length - 1 && (
                    <Button type="primary" icon={<CheckCircleOutlined />} loading={isCreating} onClick={handleSubmit}>
                        Launch Campaign
                    </Button>
                )}
            </div>
        </Form>
    );
};

export default CreateBroadcast;
