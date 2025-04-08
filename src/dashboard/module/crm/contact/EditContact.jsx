import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Row,
  Col,
  Divider,
  DatePicker,
  message,
} from "antd";
import {
  FiFileText,
  FiX,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiTag,
} from "react-icons/fi";
import dayjs from "dayjs";
import "./contact.scss";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditContact = ({ open, onCancel, contactData }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (contactData) {
      form.setFieldsValue({
        ...contactData
      });
    }
  }, [contactData, form]);

  const handleSubmit = async (values) => {
    try {
      const updatedContactData = {
        id: contactData.id,
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        email: values.email || "",
        phone: values.phone || "",
        company: values.company || "",
        jobTitle: values.jobTitle || "",
        status: values.status || "Active",
        address: values.address || "",
        notes: values.notes || "",
      };

      // Mock API call
      console.log("Updated Contact Data:", updatedContactData);
      message.success("Contact updated successfully");
      onCancel();
    } catch (error) {
      console.error("Update Error:", error);
      message.error("Failed to update contact");
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="pro-modal custom-modal"
      styles={{
        body: {
          padding: 0,
          borderRadius: "8px",
          overflow: "hidden",
        },
      }}
    >
      <div
        className="modal-header"
        style={{
          background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
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
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          }}
        >
          <FiX style={{ fontSize: "20px" }} />
        </Button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
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
            <FiFileText style={{ fontSize: "24px", color: "#ffffff" }} />
          </div>
          <div>
            <h2
              style={{
                margin: "0",
                fontSize: "24px",
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              Edit Contact
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update contact information
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        style={{
          padding: "24px",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiUser style={{ marginRight: "8px", color: "#1890ff" }} />
                  First Name <span style={{ color: '#ff4d4f' }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input
                placeholder="Enter first name"
                size="large"
                style={{
                  borderRadius: "10px",
                  height: "48px",
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="lastName"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiUser style={{ marginRight: "8px", color: "#1890ff" }} />
                  Last Name <span style={{ color: '#ff4d4f' }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <Input
                placeholder="Enter last name"
                size="large"
                style={{
                  borderRadius: "10px",
                  height: "48px",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiMail style={{ marginRight: "8px", color: "#1890ff" }} />
                  Email <span style={{ color: '#ff4d4f' }}>*</span>
                </span>
              }
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter valid email" }
              ]}
            >
              <Input
                placeholder="Enter email"
                size="large"
                style={{
                  borderRadius: "10px",
                  height: "48px",
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="phone"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiPhone style={{ marginRight: "8px", color: "#1890ff" }} />
                  Phone Number
                </span>
              }
            >
              <Input
                placeholder="Enter phone number"
                size="large"
                style={{
                  borderRadius: "10px",
                  height: "48px",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="company"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiTag style={{ marginRight: "8px", color: "#1890ff" }} />
                  Company
                </span>
              }
            >
              <Input
                placeholder="Enter company name"
                size="large"
                style={{
                  borderRadius: "10px",
                  height: "48px",
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="jobTitle"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiTag style={{ marginRight: "8px", color: "#1890ff" }} />
                  Job Title
                </span>
              }
            >
              <Input
                placeholder="Enter job title"
                size="large"
                style={{
                  borderRadius: "10px",
                  height: "48px",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="address"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiMapPin style={{ marginRight: "8px", color: "#1890ff" }} />
                  Address
                </span>
              }
            >
              <TextArea
                placeholder="Enter address"
                rows={4}
                style={{
                  borderRadius: "10px",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="notes"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiFileText style={{ marginRight: "8px", color: "#1890ff" }} />
                  Notes
                </span>
              }
            >
              <TextArea
                placeholder="Enter notes"
                rows={4}
                style={{
                  borderRadius: "10px",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: "24px 0" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <Button
            size="large"
            onClick={onCancel}
            style={{
              padding: "8px 24px",
              height: "44px",
              borderRadius: "10px",
              border: "1px solid #e6e8eb",
              fontWeight: "500",
            }}
          >
            Cancel
          </Button>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            style={{
              padding: "8px 32px",
              height: "44px",
              borderRadius: "10px",
              fontWeight: "500",
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
            }}
          >
            Update Contact
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditContact;
