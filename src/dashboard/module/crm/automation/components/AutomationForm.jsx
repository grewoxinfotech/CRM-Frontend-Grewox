import React from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space, Divider, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, ThunderboltOutlined, RocketOutlined } from '@ant-design/icons';
import { FiX } from "react-icons/fi";

const { Option } = Select;
const { Text } = Typography;

const AutomationForm = ({ visible, onCancel, onFinish, form, statuses, categories, leadStages }) => {
    return (
        <Modal
            title={null}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
            destroyOnClose={true}
            closeIcon={null}
            centered
            bodyStyle={{ padding: 0, borderRadius: '12px', overflow: 'hidden' }}
        >
            {/* Pro Header with Gradient */}
            <div
                style={{
                    background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                    padding: "24px",
                    color: "#ffffff",
                    position: "relative",
                }}
            >
                <Button
                    type="text"
                    onClick={onCancel}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        color: "#ffffff",
                        width: "32px",
                        height: "32px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        border: "none",
                    }}
                >
                    <FiX style={{ fontSize: "20px" }} />
                </Button>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <RocketOutlined style={{ fontSize: "24px", color: "#ffffff" }} />
                    </div>
                    <div>
                        <h2 style={{ margin: "0", fontSize: "24px", fontWeight: "600", color: "#ffffff" }}>
                            Create Automation
                        </h2>
                        <Text style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.85)" }}>
                            Build high-precision automated workflows for your leads
                        </Text>
                    </div>
                </div>
            </div>

            <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinish}
                initialValues={{ actions: [{ type: 'send_whatsapp', delayInHours: 0 }] }}
                style={{ padding: "24px" }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <Form.Item 
                        name="name" 
                        label={<span style={{ fontWeight: "500" }}>Workflow Name <span style={{ color: "#ff4d4f" }}>*</span></span>} 
                        rules={[{ required: true, message: 'Please enter workflow name' }]}
                    >
                        <Input 
                            placeholder="e.g. 24h Welcome Sequence" 
                            style={{ borderRadius: "10px", height: "44px", background: "#f8fafc" }} 
                        />
                    </Form.Item>
                    <Form.Item 
                        name="triggerType" 
                        label={<span style={{ fontWeight: "500" }}>Trigger Event <span style={{ color: "#ff4d4f" }}>*</span></span>} 
                        rules={[{ required: true }]}
                    >
                        <Select 
                            placeholder="Select when to trigger" 
                            style={{ width: "100%" }}
                            dropdownStyle={{ borderRadius: '8px' }}
                        >
                            <Option value="lead_created">New Lead Created</Option>
                            <Option value="stage_changed">Lead Stage Changed</Option>
                            <Option value="whatsapp_received">Incoming WhatsApp Message</Option>
                            <Option value="task_created">Task Created</Option>
                        </Select>
                    </Form.Item>
                </div>

                <Divider orientation="left" style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                    <ThunderboltOutlined style={{ color: '#faad14' }} /> CONDITIONS (OPTIONAL)
                </Divider>

                <Form.List name="conditions">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item {...restField} name={[name, 'field']} rules={[{ required: true }]}>
                                        <Select style={{ width: 160 }} placeholder="Field">
                                            <Option value="leadStage">Lead Stage</Option>
                                            <Option value="leadSource">Lead Source</Option>
                                            <Option value="budget">Budget</Option>
                                            <Option value="messageText">Message Text</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'operator']} rules={[{ required: true }]}>
                                        <Select style={{ width: 130 }} placeholder="Operator">
                                            <Option value="equals">Equals</Option>
                                            <Option value="contains">Contains</Option>
                                            <Option value="greater_than">Greater Than</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'value']} rules={[{ required: true }]}>
                                        <Input placeholder="Value" style={{ borderRadius: "8px" }} />
                                    </Form.Item>
                                    <Button 
                                        type="text" 
                                        danger 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => remove(name)} 
                                        style={{ display: 'flex', alignItems: 'center' }}
                                    />
                                </Space>
                            ))}
                            <Button 
                                type="dashed" 
                                onClick={() => add()} 
                                block 
                                icon={<PlusOutlined />} 
                                style={{ borderRadius: '8px', borderStyle: 'dashed', color: '#1890ff' }}
                            >
                                Add Filter Condition
                            </Button>
                        </>
                    )}
                </Form.List>

                <Divider orientation="left" style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginTop: '24px' }}>
                    WORKFLOW SEQUENCE STEPS
                </Divider>
                
                <Form.List name="actions">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }, index) => (
                                <Card 
                                    size="small" 
                                    key={key} 
                                    style={{ marginBottom: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                                    title={<Text strong style={{ color: '#1890ff', fontSize: '12px' }}>STEP {index + 1}</Text>}
                                    extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '16px' }}>
                                        <Form.Item {...restField} name={[name, 'type']} label="Action Type" rules={[{ required: true }]}>
                                            <Select>
                                                <Option value="send_whatsapp">Send WhatsApp Message</Option>
                                                <Option value="send_whatsapp_template">Send WhatsApp Template</Option>
                                                <Option value="create_task">Create Follow-up Task</Option>
                                                <Option value="update_lead_status">Update Lead Status</Option>
                                                <Option value="update_lead_category">Update Lead Category</Option>
                                                <Option value="update_lead_score">Update Lead Score</Option>
                                                <Option value="assign_round_robin">Round Robin Assignment</Option>
                                                <Option value="reassign_lead">Reassign Lead (Escalate)</Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'delayInHours']} label="Delay (Hours)" rules={[{ required: true }]}>
                                            <InputNumber min={0} step={0.25} style={{ width: '100%', borderRadius: '8px' }} placeholder="0 = Instant" />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'requireNoResponse']} label="Stop Logic" valuePropName="checked">
                                            <Select>
                                                <Option value={false}>Always Execute</Option>
                                                <Option value={true}>Cancel if Replied</Option>
                                            </Select>
                                        </Form.Item>
                                    </div>

                                    {/* Conditional fields based on action type */}
                                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.actions !== currentValues.actions}>
                                        {({ getFieldValue }) => {
                                            const type = getFieldValue(['actions', name, 'type']);
                                            if (type === 'send_whatsapp') {
                                                return (
                                                    <Form.Item {...restField} name={[name, 'message']} label="Message Content" rules={[{ required: true }]}>
                                                        <Input.TextArea rows={2} placeholder="Write your message here..." style={{ borderRadius: '8px' }} />
                                                    </Form.Item>
                                                );
                                            }
                                            if (type === 'create_task') {
                                                return (
                                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                                                        <Form.Item {...restField} name={[name, 'taskName']} label="Task Name" rules={[{ required: true }]}>
                                                            <Input placeholder="Follow up call" style={{ borderRadius: '8px' }} />
                                                        </Form.Item>
                                                        <Form.Item {...restField} name={[name, 'priority']} label="Priority">
                                                            <Select defaultValue="medium">
                                                                <Option value="low">Low</Option>
                                                                <Option value="medium">Medium</Option>
                                                                <Option value="high">High</Option>
                                                            </Select>
                                                        </Form.Item>
                                                    </div>
                                                );
                                            }
                                            if (type === 'update_lead_score') {
                                                return (
                                                    <Form.Item {...restField} name={[name, 'score']} label="Set Score (%)" rules={[{ required: true }]}>
                                                        <InputNumber min={0} max={100} style={{ width: '100%', borderRadius: '8px' }} />
                                                    </Form.Item>
                                                );
                                            }
                                            return null;
                                        }}
                                    </Form.Item>
                                </Card>
                            ))}
                            <Button 
                                type="dashed" 
                                onClick={() => add()} 
                                block 
                                icon={<PlusOutlined />}
                                style={{ borderRadius: '10px', height: '40px', color: '#1890ff' }}
                            >
                                Add Next Action to Sequence
                            </Button>
                        </>
                    )}
                </Form.List>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                        marginTop: "32px",
                    }}
                >
                    <Button
                        onClick={onCancel}
                        style={{
                            padding: "8px 24px",
                            height: "44px",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            fontWeight: "500",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => form.submit()}
                        style={{
                            padding: "8px 32px",
                            height: "44px",
                            borderRadius: "10px",
                            fontWeight: "600",
                            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.2)",
                        }}
                    >
                        Create Workflow
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AutomationForm;
