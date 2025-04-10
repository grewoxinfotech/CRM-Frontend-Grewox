import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  message,
  Card,
  Typography,
  InputNumber,
} from "antd";
import { FiUser, FiPhone, FiFileText } from "react-icons/fi";
import { useCreateLeadMutation } from "./services/LeadApi";
import { useLocation } from "react-router-dom";

const { TextArea } = Input;
const { Title } = Typography;

const SimpleLeadForm = () => {
  const [form] = Form.useForm();
  const [createLead, { isLoading }] = useCreateLeadMutation();
  const location = useLocation();
  const [defaultValues, setDefaultValues] = useState(null);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(location.search);
    const urlDefaults = {
      pipeline: params.get("pipeline"),
      leadStage: params.get("stage"),
      source: params.get("source") || "web-form",
      leadTitle: params.get("title") || "New Lead",
    };
    setDefaultValues(urlDefaults);
    form.setFieldsValue(urlDefaults);
  }, [location, form]);

  const handleSubmit = async (values) => {
    try {
      // Combine form values with default values from URL
      const formData = {
        ...values,
        ...defaultValues,
      };

      await createLead(formData).unwrap();
      message.success("Thank you! We'll contact you soon.");
      form.resetFields();
    } catch (error) {
      message.error(error?.data?.message || "Failed to submit form");
    }
  };

  const formItemStyle = {
    fontSize: "14px",
    fontWeight: "500",
  };

  const inputStyle = {
    height: "48px",
    borderRadius: "10px",
    padding: "8px 16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e6e8eb",
    transition: "all 0.3s ease",
  };

  const prefixIconStyle = {
    color: "#1890ff",
    fontSize: "16px",
    marginRight: "8px",
  };

  return (
    <div style={{ 
      maxWidth: "600px", 
      margin: "40px auto",
      padding: "0 20px"
    }}>
      <Card
        bordered={false}
        style={{
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Title level={2} style={{ marginBottom: "8px" }}>Contact Us</Title>
          <Typography.Text type="secondary">
            Fill out the form below and we'll get back to you shortly
          </Typography.Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="firstName"
            label={<span style={formItemStyle}>Name</span>}
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input
              prefix={<FiUser style={prefixIconStyle} />}
              placeholder="Enter your name"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="telephone"
            label={<span style={formItemStyle}>Phone Number</span>}
            rules={[{ required: true, message: "Please enter your phone number" }]}
          >
            <Input
              prefix={<FiPhone style={prefixIconStyle} />}
              placeholder="Enter your phone number"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span style={formItemStyle}>Message</span>}
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <TextArea
              prefix={<FiFileText style={prefixIconStyle} />}
              placeholder="Enter your message"
              style={{ ...inputStyle, height: "120px", resize: "none" }}
              rows={4}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: "24px" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <style jsx global>{`
        .ant-form-item-label > label {
          font-weight: 500;
          color: #1f2937;
        }

        .ant-input-affix-wrapper:focus,
        .ant-input-affix-wrapper-focused {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }

        .ant-input:focus,
        .ant-input-focused {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default SimpleLeadForm; 