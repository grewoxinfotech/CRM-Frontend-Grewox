import React from "react";
import { Card, Form, Input, Button, Typography, Space, Divider, Switch, Badge, Alert, message } from "antd";
import { FiSave, FiLink, FiInfo, FiCheckCircle, FiActivity } from "react-icons/fi";
import PageHeader from "../../../../components/PageHeader";
import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";

const { Title, Text, Paragraph } = Typography;

const IntegrationPage = ({ 
  title, 
  subtitle, 
  icon, 
  fields = [], 
  description, 
  webhookUrl, 
  status = "disconnected",
  onSave 
}) => {
  const [form] = Form.useForm();
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id || currentUser?._id || "your-token";
  
  // Make webhookUrl dynamic by using environment variable base and replacing token with userId
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const webhookBase = apiBase.replace(/\/api$/, ""); // Remove trailing /api if present
  
  // Combine base with relative path and replace token
  const dynamicWebhookUrl = webhookUrl 
    ? (webhookUrl.startsWith('http') 
        ? webhookUrl.replace(/https?:\/\/[^\/]+/, webhookBase) 
        : (webhookBase + (webhookUrl.startsWith('/') ? '' : '/') + webhookUrl)
      ).replace("your-unique-token", userId)
    : null;

  return (
    <div className="integration-page standard-page-container">
      <PageHeader
        title={`${title} Integration`}
        subtitle={subtitle}
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: "Integrations" },
          { title: title },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', marginTop: '24px' }}>
        <div className="main-config-section">
          <Card 
            className="standard-content-card"
            title={
              <Space>
                {icon}
                <span>Connection Settings</span>
              </Space>
            }
            extra={
              <Badge 
                status={status === "connected" ? "success" : "default"} 
                text={status?.toUpperCase()} 
              />
            }
          >
            <Paragraph style={{ color: '#64748b', marginBottom: '24px' }}>
              {description}
            </Paragraph>

            <Form
              form={form}
              layout="vertical"
              onFinish={onSave}
              initialValues={{ enabled: true }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {fields.map(field => (
                  <Form.Item
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    rules={[{ required: field.required, message: `Please enter ${field.label.toLowerCase()}` }]}
                    style={field.fullWidth ? { gridColumn: '1 / -1' } : {}}
                  >
                    {field.type === 'password' ? (
                      <Input.Password placeholder={field.placeholder} size="large" style={{ borderRadius: '8px' }} />
                    ) : (
                      <Input placeholder={field.placeholder} size="large" style={{ borderRadius: '8px' }} />
                    )}
                  </Form.Item>
                ))}
              </div>

              <Form.Item name="enabled" valuePropName="checked" label="Integration Status">
                <Space>
                  <Switch />
                  <Text>Enable this integration to start receiving data</Text>
                </Space>
              </Form.Item>

              <Divider />

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<FiSave />} 
                  size="large"
                  style={{ borderRadius: '8px', padding: '0 32px' }}
                >
                  Save Configuration
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {webhookUrl && (
            <Card 
              title="Webhook Configuration" 
              style={{ marginTop: '24px', borderRadius: '12px' }}
              className="standard-content-card"
            >
              <Alert
                message="Endpoint URL"
                description={
                  <Space direction="vertical" style={{ width: '100%', marginTop: '8px' }}>
                    <Text type="secondary">Use this URL in your {title} settings to push data to Grewox CRM.</Text>
                    <Input 
                      value={dynamicWebhookUrl} 
                      readOnly 
                      addonAfter={<Button type="link" icon={<FiLink />} onClick={() => {
                        navigator.clipboard.writeText(dynamicWebhookUrl);
                        message.success("Copied to clipboard");
                      }}>Copy</Button>}
                      style={{ borderRadius: '8px' }}
                    />
                  </Space>
                }
                type="info"
                showIcon
                icon={<FiActivity />}
              />
            </Card>
          )}
        </div>

        <div className="help-section">
          <Card title="How it works" style={{ borderRadius: '12px' }} className="standard-content-card">
            <Space direction="vertical" size={20} style={{ width: '100%', marginTop: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', background: '#e6f7ff', 
                  color: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '12px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px'
                }}>1</div>
                <Text style={{ lineHeight: '1.6' }}>Enter your {title} credentials or API keys above.</Text>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', background: '#e6f7ff', 
                  color: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '12px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px'
                }}>2</div>
                <Text style={{ lineHeight: '1.6' }}>Map the incoming fields to your CRM Lead fields.</Text>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', background: '#e6f7ff', 
                  color: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '12px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px'
                }}>3</div>
                <Text style={{ lineHeight: '1.6' }}>Incoming leads will automatically appear in your Lead Dashboard.</Text>
              </div>
            </Space>

            <Divider />

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <Title level={5} style={{ fontSize: '14px', marginTop: 0 }}>
                <FiInfo style={{ marginRight: '8px' }} />
                Need help?
              </Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                If you encounter any issues setting up your {title} integration, our team is here to help.
              </Text>
              <Button type="link" style={{ padding: 0, marginTop: '8px' }}>Contact Support</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPage;
