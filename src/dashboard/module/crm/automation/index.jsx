import React, { useState } from 'react';
import { Table, Button, Tag, Space, message, Card, Switch, Tooltip, Popconfirm, Typography, Divider } from 'antd';
const { Text } = Typography;
import { PlusOutlined, DeleteOutlined, ClockCircleOutlined, RocketOutlined, ThunderboltOutlined, FilterOutlined, RightOutlined, EyeOutlined, PlayCircleOutlined, PauseCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useGetAutomationsQuery, useCreateAutomationMutation, useSeedDefaultsMutation, useToggleAutomationMutation, useDeleteAutomationMutation, useUpdateAutomationMutation } from './services/automationApi';
import { useGetStatusesQuery, useGetCategoriesQuery, useGetSourcesQuery } from '../crmsystem/souce/services/SourceApi';
import { useGetLeadStagesQuery } from '../crmsystem/leadstage/services/leadStageApi';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { Form } from 'antd';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

// Components
import PageHeader from '../../../../components/PageHeader';
import WorkflowInspector from './components/WorkflowInspector';
import AutomationForm from './components/AutomationForm';

/** API may return JSON columns as strings or already-parsed arrays. */
function parseAutomationArray(value) {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

const AutomationPage = () => {
    const [createAutomation] = useCreateAutomationMutation();
    const [seedDefaults, { isLoading: isSeeding }] = useSeedDefaultsMutation();
    const [toggleAutomation] = useToggleAutomationMutation();
    const [deleteAutomation] = useDeleteAutomationMutation();
    const [updateAutomation] = useUpdateAutomationMutation();
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAutomation, setEditingAutomation] = useState(null);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [selectedAutomation, setSelectedAutomation] = useState(null);
    const [form] = Form.useForm();
    
    const currentUser = useSelector(selectCurrentUser);
    const { data: automationsResponse, isLoading: isFetching } = useGetAutomationsQuery();
    const { data: statusesResponse } = useGetStatusesQuery(currentUser?.client_id, { skip: !currentUser?.client_id });
    const { data: categoriesResponse } = useGetCategoriesQuery(currentUser?.client_id, { skip: !currentUser?.client_id });
    const { data: leadStagesResponse } = useGetLeadStagesQuery(currentUser?.client_id, { skip: !currentUser?.client_id });
    const { data: sourcesResponse } = useGetSourcesQuery(currentUser?.client_id, { skip: !currentUser?.client_id });
    const { data: usersResponse } = useGetUsersQuery();

    const onFinish = async (values) => {
        try {
            if (editingAutomation) {
                await updateAutomation({ id: editingAutomation.id, ...values }).unwrap();
                message.success('Automation updated successfully');
            } else {
                await createAutomation(values).unwrap();
                message.success('Automation created successfully');
            }
            setIsModalVisible(false);
            setEditingAutomation(null);
            form.resetFields();
        } catch (error) {
            message.error(editingAutomation ? 'Failed to update automation' : 'Failed to create automation');
        }
    };

    const handleEdit = (record) => {
        setEditingAutomation(record);
        form.setFieldsValue({
            ...record,
            conditions: parseAutomationArray(record.conditions),
            actions: parseAutomationArray(record.actions),
        });
        setIsModalVisible(true);
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
            width: 250,
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ThunderboltOutlined style={{ color: '#722ed1' }} />
                    <span style={{ color: '#1e293b', fontWeight: 600 }}>{text}</span>
                </div>
            )
        },
        {
            title: 'Trigger',
            dataIndex: 'triggerType',
            key: 'triggerType',
            render: (type) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FilterOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
                    <Tag color="purple" style={{ borderRadius: '4px', textTransform: 'uppercase', fontWeight: '600', margin: 0, fontSize: '10px' }}>
                        {type.replace(/_/g, ' ')}
                    </Tag>
                </div>
            )
        },
        {
            title: 'Conditions',
            dataIndex: 'conditions',
            key: 'conditions',
            render: (conditionsJson) => {
                const conditions = parseAutomationArray(conditionsJson);
                return conditions.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {conditions.map((c, i) => (
                            <Tag key={i} color="cyan" style={{ fontSize: '10px', fontWeight: 600 }}>{c.field} {c.operator} {c.value}</Tag>
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
                const actions = parseAutomationArray(actionsJson);
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
                                        } style={{ margin: 0, fontSize: '9px', borderRadius: '3px', fontWeight: 600 }}>
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
                                    <div style={{ display: 'flex', alignItems: 'center', margin: '0 -4px' }}>
                                        <div style={{ width: '12px', height: '1px', background: '#d9d9d9' }}></div>
                                        <RightOutlined style={{ fontSize: '8px', color: '#bfbfbf' }} />
                                    </div>
                                )}
                            </React.Fragment>
                        )) : <Tag>No actions</Tag>}
                    </div>
                );
            }
        },
        {
            title: 'Performance & Usage',
            key: 'performance',
            width: 180,
            render: (_, record) => {
                const totalRuns = parseInt(record.totalRuns || 0);
                const successRate = totalRuns > 0 ? (parseInt(record.successCount || 0) / totalRuns) * 100 : 0;
                const isHighPerforming = totalRuns > 10 && successRate > 90;
                
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text strong style={{ fontSize: '13px' }}>{totalRuns} Runs</Text>
                            {isHighPerforming && (
                                <Tag color="gold" style={{ fontSize: '9px', margin: 0, borderRadius: '4px' }}>
                                    HIGH PERFORMING
                                </Tag>
                            )}
                            {totalRuns === 0 && (
                                <Tag color="blue" style={{ fontSize: '9px', margin: 0, borderRadius: '4px' }}>
                                    FRESH
                                </Tag>
                            )}
                        </div>
                        {record.lastRun ? (
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                <ClockCircleOutlined style={{ fontSize: '10px' }} /> Last: {new Date(record.lastRun).toLocaleString('en-IN', { 
                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                                })}
                            </Text>
                        ) : (
                            <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>Never executed</Text>
                        )}
                    </div>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
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
                    <Tooltip title="Edit Workflow">
                        <Button 
                            type="text"
                            shape="circle"
                            icon={<EditOutlined style={{ color: '#8c8c8c' }} />} 
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title={record.isActive ? "Pause Automation" : "Start Automation"}>
                        <Button 
                            type="text"
                            shape="circle"
                            icon={record.isActive ? <PauseCircleOutlined style={{ color: '#faad14' }} /> : <PlayCircleOutlined style={{ color: '#52c41a' }} />} 
                            onClick={() => toggleAutomation(record.id)}
                        />
                    </Tooltip>
                    {!record.isDefault && (
                        <Popconfirm
                            title="Delete this automation?"
                            description="This action cannot be undone."
                            onConfirm={async () => {
                                try {
                                    await deleteAutomation(record.id).unwrap();
                                    message.success('Automation deleted');
                                } catch (err) {
                                    message.error('Failed to delete');
                                }
                            }}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                        >
                            <Button 
                                type="text" 
                                shape="circle" 
                                icon={<DeleteOutlined />} 
                                danger 
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            />
                        </Popconfirm>
                    )}
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

            <div>
                <Card style={{ 
                    marginBottom: '24px', 
                    background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)', 
                    border: '1px solid #dbeafe', 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 25px rgba(0,0,0,0.05)' 
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ padding: '12px', background: '#1890ff', borderRadius: '14px', boxShadow: '0 8px 16px rgba(24,144,255,0.25)' }}>
                                <RocketOutlined style={{ fontSize: '32px', color: '#fff' }} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, color: '#1e3a8a', letterSpacing: '-0.5px', fontWeight: '800' }}>CRM Automation Hub</h2>
                                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Design intelligent workflows that handle your leads 24/7</p>
                            </div>
                        </div>
                        <Button 
                            type="default" 
                            icon={<RocketOutlined style={{ color: '#1890ff' }} />}
                            style={{ 
                                borderRadius: '8px', 
                                fontWeight: '600', 
                                border: '1px solid #1890ff', 
                                color: '#1890ff',
                                background: '#f0f7ff' 
                            }}
                            className="how-to-setup-btn"
                            onClick={() => {
                                Modal.info({
                                    title: '🚀 Automation Setup Guide',
                                    width: 600,
                                    content: (
                                        <div style={{ marginTop: '20px' }}>
                                            <div style={{ marginBottom: '15px' }}>
                                                <h4 style={{ color: '#1890ff' }}>1. Choose a Trigger</h4>
                                                <p>This is the "Starting Line". For example, select <b>"New Lead Created"</b> if you want the automation to start whenever a new person enters your CRM.</p>
                                            </div>
                                            <div style={{ marginBottom: '15px' }}>
                                                <h4 style={{ color: '#1890ff' }}>2. Set Conditions (Optional)</h4>
                                                <p>Filter which leads should pass through. For example, only run for leads where <b>"Source equals Website"</b>.</p>
                                            </div>
                                            <div style={{ marginBottom: '15px' }}>
                                                <h4 style={{ color: '#1890ff' }}>3. Define Actions</h4>
                                                <p>Add what should happen. You can chain actions like: <b>Send WhatsApp immediately</b> → <b>Create Task after 2 hours</b>.</p>
                                            </div>
                                            <Divider />
                                            <p style={{ color: '#64748b', fontStyle: 'italic' }}><b>Tip:</b> Click "Generate Defaults" to instantly get 20+ ready-to-use workflows for your business!</p>
                                        </div>
                                    ),
                                    okText: 'Got it!',
                                });
                            }}
                        >
                            How to Setup?
                        </Button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        {[
                            { icon: <ThunderboltOutlined />, title: '1. TRIGGER', color: '#f59e0b', desc: 'Events like New Leads or Form Submissions start the flow.' },
                            { icon: <FilterOutlined />, title: '2. FILTER', color: '#10b981', desc: 'Filter by Stage, Source, or Priority for total control.' },
                            { icon: <PlusOutlined />, title: '3. ACTIONS', color: '#3b82f6', desc: 'Auto-execute WhatsApp messages or Tasks in sequence.' },
                            { icon: <ClockCircleOutlined />, title: '4. INTELLIGENCE', color: '#8b5cf6', desc: 'Set smart delays and stop automatically when leads reply.' },
                        ].map((step, i) => (
                            <div key={i} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <span style={{ color: step.color, fontSize: '18px' }}>{step.icon}</span>
                                    <b style={{ color: step.color, fontSize: '12px', letterSpacing: '0.5px' }}>{step.title}</b>
                                </div>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </Card>


            {/* Summary Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <RocketOutlined style={{ color: '#fff', fontSize: '20px' }} />
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Active Workflows</Text>
                            <Text strong style={{ fontSize: '20px' }}>{automationsResponse?.data?.filter(a => a.isActive).length || 0}</Text>
                        </div>
                    </div>
                </Card>

                <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', background: 'linear-gradient(135deg, #fff1f0 0%, #ffffff 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ff4d4f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PauseCircleOutlined style={{ color: '#fff', fontSize: '20px' }} />
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Paused Workflows</Text>
                            <Text strong style={{ fontSize: '20px' }}>{automationsResponse?.data?.filter(a => !a.isActive).length || 0}</Text>
                        </div>
                    </div>
                </Card>

                <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', background: 'linear-gradient(135deg, #f9f0ff 0%, #ffffff 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#722ed1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ThunderboltOutlined style={{ color: '#fff', fontSize: '20px' }} />
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Custom Workflows</Text>
                            <Text strong style={{ fontSize: '20px' }}>{automationsResponse?.data?.filter(a => !a.isDefault).length || 0}</Text>
                        </div>
                    </div>
                </Card>

                <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PlayCircleOutlined style={{ color: '#fff', fontSize: '20px' }} />
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Total Executions</Text>
                            <Text strong style={{ fontSize: '20px' }}>{automationsResponse?.data?.reduce((acc, curr) => acc + parseInt(curr.totalRuns || 0), 0) || 0}</Text>
                        </div>
                    </div>
                </Card>

                <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', background: 'linear-gradient(135deg, #fff7e6 0%, #ffffff 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#faad14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ThunderboltOutlined style={{ color: '#fff', fontSize: '20px' }} />
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>System Success Rate</Text>
                            <Text strong style={{ fontSize: '20px' }}>
                                {(() => {
                                    const total = automationsResponse?.data?.reduce((acc, curr) => acc + parseInt(curr.totalRuns || 0), 0) || 0;
                                    const success = automationsResponse?.data?.reduce((acc, curr) => acc + parseInt(curr.successCount || 0), 0) || 0;
                                    return total > 0 ? `${Math.round((success / total) * 100)}%` : '100%';
                                })()}
                            </Text>
                        </div>
                    </div>
                </Card>
            </div>

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
                isEditing={!!editingAutomation}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingAutomation(null);
                    form.resetFields();
                }}
                form={form}
                onFinish={onFinish}
                statuses={statusesResponse?.data}
                categories={categoriesResponse?.data}
                leadStages={leadStagesResponse}
                sources={sourcesResponse?.data}
                users={usersResponse?.data || []}
                currentUser={currentUser}
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
