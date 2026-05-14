import React from 'react';
import { Modal, Button, Tag, Divider, Card, Alert, Typography } from 'antd';
import { EyeOutlined, ThunderboltOutlined, PlayCircleOutlined, ClockCircleOutlined, RocketOutlined } from '@ant-design/icons';
import { FiX } from "react-icons/fi";

const { Text } = Typography;

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

const WorkflowInspector = ({ visible, onClose, automation }) => {
    if (!automation) return null;

    const conditions = parseAutomationArray(automation.conditions);
    const actions = parseAutomationArray(automation.actions);

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            centered
            destroyOnClose={true}
            closeIcon={null}
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
                    onClick={onClose}
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
                        <EyeOutlined style={{ fontSize: "24px", color: "#ffffff" }} />
                    </div>
                    <div>
                        <h2 style={{ margin: "0", fontSize: "22px", fontWeight: "600", color: "#ffffff" }}>
                            Workflow Inspector
                        </h2>
                        <Text style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.85)" }}>
                            Reviewing: {automation.name}
                        </Text>
                    </div>
                </div>
            </div>

            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ marginBottom: '12px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                        <ThunderboltOutlined style={{ color: '#1890ff' }} /> Trigger Configuration
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>EVENT TYPE</span>
                            <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>{(automation.triggerType || '').replace(/_/g, ' ').toUpperCase() || 'UNKNOWN'}</div>
                        </div>
                        {conditions.length > 0 && (
                            <Divider type="vertical" style={{ height: '35px', margin: 'auto 0' }} />
                        )}
                        {conditions.length > 0 && (
                            <div>
                                <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>CONDITIONS</span>
                                <div style={{ display: 'flex', gap: '5px', marginTop: '4px' }}>
                                    {conditions.map((c, i) => (
                                        <Tag color="blue" key={i} style={{ borderRadius: '4px', border: 'none', background: '#e0f2fe', color: '#0369a1' }}>
                                            {c.field} {c.operator} "{c.value}"
                                        </Tag>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: '600' }}>
                    <PlayCircleOutlined style={{ color: '#10b981' }} /> 
                    Execution Pipeline Sequence
                </h4>
                
                <div style={{ position: 'relative', paddingLeft: '32px', borderLeft: '2px dashed #e2e8f0', marginLeft: '10px' }}>
                    {actions.map((action, index) => (
                        <div key={index} style={{ marginBottom: '24px', position: 'relative' }}>
                            <div style={{ 
                                position: 'absolute', 
                                left: '-43px', 
                                top: '0', 
                                width: '22px', 
                                height: '22px', 
                                background: '#1890ff', 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                color: '#fff',
                                boxShadow: '0 4px 10px rgba(24,144,255,0.3)'
                            }}>{index + 1}</div>
                            
                            <Card size="small" style={{ borderRadius: '10px', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>
                                        {(action.type || '').replace(/_/g, ' ').toUpperCase() || 'UNKNOWN ACTION'}
                                    </span>
                                    <Tag color={action.delayInHours > 0 ? 'orange' : 'green'} style={{ borderRadius: '4px', border: 'none', fontWeight: '600', margin: 0 }}>
                                        {action.delayInHours > 0 ? `${action.delayInHours}h Delay` : 'INSTANT'}
                                    </Tag>
                                </div>
                                <Divider style={{ margin: '10px 0' }} />
                                <div style={{ fontSize: '13px', color: '#475569' }}>
                                    {action.type === 'send_whatsapp' && (
                                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <small style={{ color: '#1890ff', fontWeight: '700', fontSize: '10px' }}>MESSAGE CONTENT</small>
                                            <div style={{ marginTop: '5px', lineHeight: '1.5' }}>"{action.message || 'No message content'}"</div>
                                        </div>
                                    )}
                                    {action.type === 'create_task' && (
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <div><small style={{ color: '#94a3b8', fontWeight: '600' }}>TASK:</small> <b style={{ color: '#1e293b' }}>{action.taskName || 'Unnamed Task'}</b></div>
                                            <div><small style={{ color: '#94a3b8', fontWeight: '600' }}>PRIORITY:</small> <Tag color="red" style={{ border: 'none', borderRadius: '4px' }}>{(action.priority || 'medium').toUpperCase()}</Tag></div>
                                        </div>
                                    )}
                                    {action.type === 'update_lead_score' && (
                                        <div><small style={{ color: '#94a3b8', fontWeight: '600' }}>NEW LEAD SCORE:</small> <b style={{ fontSize: '16px', color: '#ef4444' }}>{action.score}%</b></div>
                                    )}
                                    {action.requireNoResponse && (
                                        <div style={{ marginTop: '10px' }}>
                                            <Tag color="volcano" icon={<ClockCircleOutlined />} style={{ borderRadius: '4px', border: 'none', fontWeight: '600' }}>
                                                SMART STOP: CANCEL IF CUSTOMER RESPONDS
                                            </Tag>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
                
                <Alert 
                    message={<b style={{ color: '#0369a1' }}>Workflow Summary</b>}
                    description={`This automation sequence is triggered by ${automation.triggerType.replace(/_/g, ' ')}. It consists of ${actions.length} individual steps designed to nurture the lead effectively.`}
                    type="info" 
                    showIcon 
                    style={{ marginTop: '24px', borderRadius: '10px', background: '#f0f9ff', border: '1px solid #e0f2fe' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <Button 
                        onClick={onClose}
                        style={{
                            padding: "8px 32px",
                            height: "44px",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            fontWeight: "500",
                        }}
                    >
                        Close Inspector
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default WorkflowInspector;
