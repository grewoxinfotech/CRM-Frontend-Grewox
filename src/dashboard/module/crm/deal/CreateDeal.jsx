import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Divider,
  Upload,
  message,
  Spin,
} from "antd";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiX,
  FiBriefcase,
  FiHash,
  FiDollarSign,
  FiMapPin,
  FiCamera,
} from "react-icons/fi";
import { useCreateDealMutation } from "./services/DealApi";

const { Text } = Typography;
const { Option } = Select;

const CreateDeal = ({ open, onCancel, leadData }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);
  const [createDeal, { isLoading }] = useCreateDealMutation();

  // Pre-fill form with lead data when available
  useEffect(() => {
    if (leadData && open) {
      form.setFieldsValue({
        leadTitle: `Deal from ${leadData.name}`,
        dealName: `${leadData.name}'s Deal`,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        source: leadData.source,
        leadId: leadData.id,
      });
    }
  }, [leadData, form, open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList([]);
    }
  }, [open, form]);

  const handleSubmit = async (values) => {
    try {
      const dealData = {
        ...values,
        leadId: leadData?.id,
        status: "active",
        createdFrom: "lead_conversion",
        price: parseFloat(values.price) || 0,
        closedDate: values.closedDate
          ? new Date(values.closedDate).toISOString()
          : null,
      };

      await createDeal(dealData).unwrap();
      message.success("Deal created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error(
        "Failed to create deal: " + (error.data?.message || "Unknown error")
      );
      console.error("Create Deal Error:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={720}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="pro-modal custom-modal"
      maskClosable={false}
      style={{
        "--antd-arrow-background-color": "#ffffff",
      }}
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
          background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
          padding: "24px",
          color: "#ffffff",
          position: "relative",
        }}
      >
        <Button
          type="text"
          icon={<FiX />}
          onClick={handleCancel}
          style={{
            color: "#ffffff",
            position: "absolute",
            right: "24px",
            top: "24px",
          }}
        />
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
            <FiDollarSign style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Create New Deal
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create deal
            </Text>
          </div>
        </div>
      </div>

      <Spin spinning={isLoading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          style={{
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <Form.Item
              name="leadTitle"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Lead Title
                </span>
              }
              rules={[
                { required: true, message: "Please enter lead title" },
                { min: 3, message: "Lead title must be at least 3 characters" },
              ]}
            >
              <Input
                prefix={
                  <FiDollarSign
                    style={{ color: "#1890ff", fontSize: "16px" }}
                  />
                }
                placeholder="Enter lead title"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>

            <Form.Item
              name="dealName"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Deal Name
                </span>
              }
              rules={[
                { required: true, message: "Please enter deal name" },
                { min: 3, message: "Deal name must be at least 3 characters" },
              ]}
            >
              <Input
                prefix={
                  <FiDollarSign
                    style={{ color: "#1890ff", fontSize: "16px" }}
                  />
                }
                placeholder="Enter deal name"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <Form.Item
              name="pipeline"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Pipeline
                </span>
              }
              rules={[{ required: true, message: "Please select pipeline" }]}
            >
              <Select
                placeholder="Select pipeline"
                size="large"
                style={{ width: "100%" }}
              >
                <Option value="sales">Sales Pipeline</Option>
                <Option value="marketing">Marketing Pipeline</Option>
                <Option value="support">Support Pipeline</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="stage"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Stage
                </span>
              }
              rules={[{ required: true, message: "Please select stage" }]}
            >
              <Select
                placeholder="Select stage"
                size="large"
                style={{ width: "100%" }}
              >
                <Option value="qualification">Qualification</Option>
                <Option value="proposal">Proposal</Option>
                <Option value="negotiation">Negotiation</Option>
                <Option value="closed_won">Closed Won</Option>
                <Option value="closed_lost">Closed Lost</Option>
              </Select>
            </Form.Item>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <Form.Item
              name="price"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Price
                </span>
              }
              rules={[
                { required: true, message: "Please enter price" },
                {
                  pattern: /^\d+(\.\d{1,2})?$/,
                  message: "Please enter a valid price",
                },
              ]}
            >
              <Input
                prefix={
                  <FiDollarSign
                    style={{ color: "#1890ff", fontSize: "16px" }}
                  />
                }
                placeholder="Enter price"
                size="large"
                type="number"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>

            <Form.Item
              name="currency"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Currency
                </span>
              }
              rules={[{ required: true, message: "Please select currency" }]}
            >
              <Select
                placeholder="Select currency"
                size="large"
                style={{ width: "100%" }}
              >
                <Option value="USD">USD</Option>
                <Option value="EUR">EUR</Option>
                <Option value="GBP">GBP</Option>
                <Option value="INR">INR</Option>
              </Select>
            </Form.Item>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <Form.Item
              name="project"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Project
                </span>
              }
            >
              <Input
                prefix={
                  <FiBriefcase style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter project name"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>

            <Form.Item
              name="closedDate"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Expected Close Date
                </span>
              }
            >
              <Input
                type="date"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              onClick={handleCancel}
              size="large"
              style={{
                borderRadius: "10px",
                padding: "8px 24px",
                height: "48px",
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              style={{
                borderRadius: "10px",
                padding: "8px 24px",
                height: "48px",
              }}
            >
              Create Deal
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CreateDeal;
