import React, { useEffect, useState } from "react";
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
  Upload,
  message,
} from "antd";
import {
  FiUser,
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUpload,
  FiHash,
  FiCopy,
} from "react-icons/fi";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditCustomer = ({ open, onCancel, onSubmit, initialValues, loading }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        billing_address: initialValues.billing_address
          ? JSON.parse(initialValues.billing_address)
          : {},
        shipping_address: initialValues.shipping_address
          ? JSON.parse(initialValues.shipping_address)
          : {},
      });
      if (initialValues.profile_image) {
        setFileList([
          {
            uid: "-1",
            name: "profile_image",
            status: "done",
            url: initialValues.profile_image,
          },
        ]);
      }
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      const customerData = {
        // Basic Information
        name: values.name || "",
        contact: values.contact || "",
        email: values.email || "",
        tax_number: values.tax_number || "",
        alternate_number: values.alternate_number || "",
        text_number: values.text_number || "",
        company: values.company || "",
        status: values.status || "active",

        // Address Information
        billing_address: values.billing_address || {},
        shipping_address: values.shipping_address || {},

        // Additional Information
        notes: values.notes || "",
      };

      // If there's a profile image, append it to the data
      if (fileList.length > 0 && fileList[0].originFileObj) {
        customerData.profile_image = fileList[0].originFileObj;
      }

      await onSubmit(customerData);
    } catch (error) {
      console.error("Submit Error:", error);
      message.error("Failed to update customer");
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const copyBillingToShipping = () => {
    const billingAddress = form.getFieldValue("billing_address") || {};
    form.setFieldsValue({
      shipping_address: {
        street: billingAddress.street,
        city: billingAddress.city,
        state: billingAddress.state,
        country: billingAddress.country,
        postal_code: billingAddress.postal_code,
      },
    });
    message.success("Shipping address copied from billing address");
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
            <FiUser style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Edit Customer
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update customer information
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
              name="name"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Customer Name
                </span>
              }
              rules={[
                { required: true, message: "Please enter customer name" },
                { max: 100, message: "Name cannot exceed 100 characters" },
              ]}
            >
              <Input
                prefix={
                  <FiUser style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter customer name"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tax_number"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Tax Number
                </span>
              }
              rules={[{ required: true, message: "Please enter tax number" }]}
            >
              <Input
                prefix={
                  <FiHash style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter tax number"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="email"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Email Address
                </span>
              }
              rules={[
                { required: true, message: "Please enter email address" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={
                  <FiMail style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter email address"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="contact"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Phone Number
                </span>
              }
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input
                prefix={
                  <FiPhone style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter phone number"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="alternate_number"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Alternate Number
                </span>
              }
            >
              <Input
                prefix={
                  <FiPhone style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter alternate number"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name={["billing_address", "street"]}
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Billing Address
                </span>
              }
            >
              <Input
                prefix={
                  <FiMapPin style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter street address"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name={["billing_address", "city"]}>
                  <Input
                    placeholder="City"
                    size="large"
                    style={{
                      borderRadius: "10px",
                      padding: "8px 16px",
                      height: "48px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e6e8eb",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={["billing_address", "state"]}>
                  <Input
                    placeholder="State"
                    size="large"
                    style={{
                      borderRadius: "10px",
                      padding: "8px 16px",
                      height: "48px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e6e8eb",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name={["billing_address", "country"]}>
                  <Input
                    placeholder="Country"
                    size="large"
                    style={{
                      borderRadius: "10px",
                      padding: "8px 16px",
                      height: "48px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e6e8eb",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={["billing_address", "postal_code"]}>
                  <Input
                    placeholder="Postal Code"
                    size="large"
                    style={{
                      borderRadius: "10px",
                      padding: "8px 16px",
                      height: "48px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e6e8eb",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>

        <Button
          type="link"
          icon={<FiCopy style={{ marginRight: "4px" }} />}
          onClick={copyBillingToShipping}
          style={{
            fontSize: "14px",
            padding: "4px 8px",
            height: "auto",
            color: "#1890ff",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginLeft: "auto",
            marginBottom: "10px",
          }}
        >
          Same as Billing
        </Button>

        <Col span={24}>
          <Form.Item
            name={["shipping_address", "street"]}
            label={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Shipping Address
                </span>
              </div>
            }
          >
            <Input
              prefix={
                <FiMapPin style={{ color: "#1890ff", fontSize: "16px" }} />
              }
              placeholder="Enter street address"
              size="large"
              style={{
                borderRadius: "10px",
                padding: "8px 16px",
                height: "48px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e6e8eb",
              }}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={["shipping_address", "city"]}>
                <Input
                  placeholder="City"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                    height: "48px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e6e8eb",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={["shipping_address", "state"]}>
                <Input
                  placeholder="State"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                    height: "48px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e6e8eb",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={["shipping_address", "country"]}>
                <Input
                  placeholder="Country"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                    height: "48px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e6e8eb",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={["shipping_address", "postal_code"]}>
                <Input
                  placeholder="Postal Code"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                    height: "48px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e6e8eb",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>



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
              boxShadow: "0 4px 12px rgba(24, 143, 255, 0)",
            }}
          >
            Update Customer
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditCustomer;
