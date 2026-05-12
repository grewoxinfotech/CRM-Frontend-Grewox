import React, { useState } from 'react';
import { Table, Button, Tag, Space, message, Card, Switch, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, ClockCircleOutlined, RocketOutlined, ThunderboltOutlined, FilterOutlined, RightOutlined, EyeOutlined } from '@ant-design/icons';
import { useGetAutomationsQuery, useCreateAutomationMutation, useSeedDefaultsMutation, useToggleAutomationMutation } from './services/automationApi';
import { useGetStatusesQuery, useGetCategoriesQuery } from '../crmsystem/souce/services/SourceApi';
import { useGetLeadStagesQuery } from '../crmsystem/leadstage/services/leadStageApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { Form } from 'antd';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

// Components
import PageHeader from '../../../../components/PageHeader';
import WorkflowInspector from './components/WorkflowInspector';
import AutomationForm from './components/AutomationForm';


const AutomationPage = () => {
    const [createAutomation] = useCreateAutomationMutation();
    const [seedDefaults, { isLoading: isSeeding }] = useSeedDefaultsMutation();
    const [toggleAutomation] = useToggleAutomationMutation();
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [selectedAutomation, setSelectedAutomation] = useState(null);
    const [form] = Form.useForm();
    
    const currentUser = useSelector(selectCurrentUser);
    const { data: automationsResponse, isLoading: isFetching } = useGetAutomationsQuery();
    const { data: statusesResponse } = useGetStatusesQuery(currentUser?.client_id, { skip: !currentUser?.client_id });
    const { data: categoriesResponse } = useGetCategoriesQuery(currentUser?.client_id, { skip: !currentUser?.client_id });
    const { data: leadStagesResponse } = useGetLeadStagesQuery(currentUser?.client_id, { skip: !currentUser?.client_id });

    const handleCreate = async (values) => {
        try {
            const formattedValues = {
                ...values,
                conditions: JSON.stringify(values.conditions || []),
                actions: JSON.stringify(values.actions || []),
            };
            await createAutomation(formattedValues).unwrap();
            message.success('Automation created successfully!');
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to create automation');
        }
    };

    const handleSeedDefaults = async () => {
        try {
            const res = await seedDefaults().unwrap();
            message.success(`Successfully imported ${res.count} default workflows!`);
        } catch (error) {
            message.error('Failed to generate defaults');
        }
    };

    const columns = [
        {
            title: 'Workflow Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <b style={{ color: '#1890ff' }}>{text}</b>
        },
        {
            title: 'Trigger',
            dataIndex: 'triggerType',
            key: 'triggerType',
            render: (type) => (
                <Tag color="purple" style={{ borderRadius: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                    {type.replace(/_/g, ' ')}
                </Tag>
            )
        },
        {
            title: 'Conditions',
            dataIndex: 'conditions',
            key: 'conditions',
            render: (conditionsJson) => {
                const conditions = JSON.parse(conditionsJson || '[]');
                return conditions.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {conditions.map((c, i) => (
                            <Tag key={i} color="cyan" style={{ fontSize: '10px' }}>{c.field} {c.operator} {c.value}</Tag>
                        ))}
                    </div>
                ) : <span style={{ color: '#bfbfbf', fontSize: '12px' }}>No Conditions</span>;
            }
        },
        {
            title: 'Workflow Sequence',
            dataIndex: 'actions',
            key: 'actions',
            render: (actionsJson) => {
                const actions = typeof actionsJson === 'string' ? JSON.parse(actionsJson || '[]') : actionsJson;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        {actions && actions.length > 0 ? actions.map((action, index) => (
                            <React.Fragment key={index}>
                                <Tooltip title={`${action.type.replace(/_/g, ' ').toUpperCase()} ${action.delayInHours > 0 ? `(Delay: ${action.delayInHours}h)` : '(Instant)'}`}>
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center',
                                        background: '#fff',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: '6px',
                                        padding: '4px 10px',
                                        minWidth: '70px',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                                    }}>
                                        <Tag color={
                                            action.type.includes('whatsapp') ? 'green' : 
                                            action.type.includes('task') ? 'blue' : 
                                            action.type.includes('reassign') ? 'volcano' : 'gold'
                                        } style={{ margin: 0, fontSize: '9px', borderRadius: '3px', fontWeight: 'bold' }}>
                                            {action.type === 'update_lead_category' ? 'CATEGORY' : 
                                             action.type === 'update_lead_score' ? 'SCORE' : 
                                             action.type === 'update_lead_status' ? 'STATUS' :
                                             action.type.split('_')[0].toUpperCase()}
                                        </Tag>
                                        {action.delayInHours > 0 && (
                                            <span style={{ fontSize: '9px', color: '#8c8c8c', marginTop: '2px' }}>
                                                <ClockCircleOutlined style={{ fontSize: '8px' }} /> {action.delayInHours}h
                                            </span>
                                        )}
                                    </div>
                                </Tooltip>
                                {index < actions.length - 1 && (
                                    <RightOutlined style={{ fontSize: '10px', color: '#d9d9d9' }} />
                                )}
                            </React.Fragment>
                        )) : <Tag>No actions</Tag>}
                    </div>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive, record) => (
                <Switch 
                    checked={isActive} 
                    onChange={() => toggleAutomation(record.id)} 
                    size="small"
                    checkedChildren="ON" 
                    unCheckedChildren="OFF" 
                />
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="View Detailed Flow">
                        <Button 
                            type="text"
                            shape="circle"
                            icon={<EyeOutlined style={{ color: '#1890ff' }} />} 
                            onClick={() => {
                                setSelectedAutomation(record);
                                setIsViewModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Button type="text" shape="circle" icon={<DeleteOutlined />} danger />
                </Space>
            ),
        }
    ];

    return (
        <div style={{ background: '#f9f9f9', minHeight: '100vh' }}>
            <PageHeader 
                title="Automations"
                count={automationsResponse?.data?.length || 0}
                subtitle="Orchestrate your business with intelligent workflows"
                breadcrumbItems={[
                    {
                        title: (
                            <Link to="/dashboard">
                                <FiHome style={{ marginRight: "4px" }} />
                                Home
                            </Link>
                        ),
                    },
                    {
                        title: <span style={{ color: '#1f2937', fontWeight: 500 }}>CRM Automations</span>,
                    },
                ]}
            />

            <div style={{ padding: '0 24px 24px 24px' }}>
                <Card style={{ marginBottom: '24px', marginTop: '20px', background: 'linear-gradient(135deg, #f0f5ff 0%, #ffffff 100%)', border: '1px solid #adc6ff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '12px', background: '#1890ff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(24,144,255,0.3)' }}>
                        <RocketOutlined style={{ fontSize: '32px', color: '#fff' }} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, color: '#002766', letterSpacing: '-0.5px' }}>Advanced CRM Automation Builder</h2>
                        <span style={{ color: '#595959', fontSize: '14px' }}>Phase 2: High-Precision Triggers & Intelligent Follow-up Sequence Engine</span>
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {[
                        { icon: <ThunderboltOutlined />, title: '1. SMART TRIGGER', color: '#faad14', desc: 'Events like New Leads or WhatsApp messages ignite the flow.' },
                        { icon: <FilterOutlined />, title: '2. CUSTOM CONDITIONS', color: '#52c41a', desc: 'Filter by Budget, Source, or Keywords for surgical precision.' },
                        { icon: <PlusOutlined />, title: '3. DYNAMIC ACTIONS', color: '#1890ff', desc: 'Auto-execute WhatsApps, Tasks, or Reassignments in sequence.' },
                        { icon: <ClockCircleOutlined />, title: '4. SMART RESPONSE', color: '#722ed1', desc: 'Stops automatically if the lead replies. No more spam!' },
                    ].map((step, i) => (
                        <div key={i} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f0f0f0', transition: 'all 0.3s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span style={{ color: step.color, fontSize: '18px' }}>{step.icon}</span>
                                <b style={{ color: step.color, fontSize: '11px', letterSpacing: '0.5px' }}>{step.title}</b>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#8c8c8c', lineHeight: '1.6' }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <Card 
                title={<div style={{ fontWeight: '700' }}>Active Automation Workflows</div>} 
                extra={
                    <Space>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={() => setIsModalVisible(true)}
                            style={{ borderRadius: '6px' }}
                        >
                            New Workflow
                        </Button>
                        <Button 
                            icon={<RocketOutlined />} 
                            onClick={handleSeedDefaults}
                            loading={isSeeding}
                            style={{ borderRadius: '6px' }}
                        >
                            Generate Defaults
                        </Button>
                    </Space>
                }
                style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}
            >
                <Table 
                    columns={columns} 
                    dataSource={automationsResponse?.data || []} 
                    rowKey="id" 
                    loading={isFetching}
                    pagination={{ pageSize: 10 }}
                    style={{ borderRadius: '8px' }}
                />
            </Card>
        </div>

        {/* Create/Edit Modal (Separated) */}
            <AutomationForm 
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onFinish={handleCreate}
                form={form}
                statuses={statusesResponse?.data}
                categories={categoriesResponse?.data}
                leadStages={leadStagesResponse?.data}
            />

            {/* Detailed View Modal (Separated) */}
            <WorkflowInspector 
                visible={isViewModalVisible}
                onClose={() => setIsViewModalVisible(false)}
                automation={selectedAutomation}
            />
        </div>
    );
};

export default AutomationPage;
