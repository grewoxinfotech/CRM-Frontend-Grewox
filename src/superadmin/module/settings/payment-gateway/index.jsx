import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Switch, message, Spin, Space, Typography, Alert } from 'antd';
import { SaveOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import {
  useGetPaymentGatewaySettingsQuery,
  useUpdatePaymentGatewaySettingsMutation,
} from './services/paymentGatewayApi';

const { Title, Text } = Typography;

const PaymentGateway = () => {
  const [form] = Form.useForm();
  const [showKey, setShowKey] = useState(false);

  const { data, isLoading, refetch } = useGetPaymentGatewaySettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdatePaymentGatewaySettingsMutation();

  useEffect(() => {
    if (data?.data) {
      form.setFieldsValue({
        razor_pay_id: data.data.razor_pay_id || '',
        razor_pay_key: data.data.razor_pay_key || '',
        is_active: data.data.is_active || false,
      });
    }
  }, [data, form]);

  const onFinish = async (values) => {
    try {
      const result = await updateSettings(values).unwrap();
      message.success('Payment gateway settings updated successfully');
      refetch();
    } catch (error) {
      message.error(error?.data?.message || 'Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0 }}>Payment Gateway Settings</Title>
            <Text type="secondary">Configure Razorpay payment gateway credentials</Text>
          </Space>
        }
      >
        <Alert
          message="Environment Variables Pre-filled"
          description="On first access, Razorpay credentials from your .env file are automatically loaded here for easy management."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Razorpay Key ID"
            name="razor_pay_id"
            rules={[
              {
                required: false,
                message: 'Please enter Razorpay Key ID',
              },
            ]}
            extra="Enter your Razorpay Key ID from Razorpay Dashboard"
          >
            <Input 
              placeholder="rzp_live_xxxxxxxxxx or rzp_test_xxxxxxxxxx" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Razorpay Key Secret"
            name="razor_pay_key"
            rules={[
              {
                required: false,
                message: 'Please enter Razorpay Key Secret',
              },
            ]}
            extra="Enter your Razorpay Key Secret from Razorpay Dashboard"
          >
            <Input.Password
              placeholder="Enter Razorpay Key Secret"
              size="large"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label="Activate Payment Gateway"
            name="is_active"
            valuePropName="checked"
            extra="Enable this to use database credentials instead of environment variables"
          >
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={isUpdating}
              size="large"
            >
              Save Settings
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: '24px', padding: '16px', background: '#f6f6f6', borderRadius: '8px' }}>
          <Title level={5}>Important Notes:</Title>
          <ul style={{ marginBottom: 0 }}>
            <li><strong>Initial Setup:</strong> On first access, credentials are pre-filled from environment variables</li>
            <li><strong>Active Mode:</strong> When activated, these credentials will be used for all Razorpay transactions</li>
            <li><strong>Inactive Mode:</strong> If deactivated, system will fallback to environment variables</li>
            <li><strong>Get Credentials:</strong> Access from <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer">Razorpay Dashboard</a></li>
            <li><strong>Testing:</strong> Use test credentials for development and live credentials for production</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default PaymentGateway;
