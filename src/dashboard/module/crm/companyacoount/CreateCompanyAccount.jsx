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
  Switch,
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
  FiDollarSign,
} from "react-icons/fi";
import dayjs from "dayjs";
import "./companyaccount.scss";
import { useCreateCompanyAccountMutation } from "./services/companyAccountApi";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateCompanyAccount = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const [createCompanyAccount, { isLoading }] = useCreateCompanyAccountMutation();
  const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);

  const handleSubmit = async (values) => {
    try {
      await createCompanyAccount(values).unwrap();
      message.success("Company account created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error("Failed to create company account");
    }
  };

  const handleCopyBillingToShipping = (checked) => {
    setCopyBillingToShipping(checked);
    if (checked) {
      const billingValues = form.getFieldsValue([
        'billing_address',
        'billing_city',
        'billing_state',
        'billing_pincode',
        'billing_country'
      ]);
      
      form.setFieldsValue({
        shipping_address: billingValues.billing_address,
        shipping_city: billingValues.billing_city,
        shipping_state: billingValues.billing_state,
        shipping_pincode: billingValues.billing_pincode,
        shipping_country: billingValues.billing_country
      });
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
              Create Company Account
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create company account
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
              name="account_owner"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Account Owner <span style={{ color: '#ff4d4f' }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter account owner" }]}
            >
              <Input
                placeholder="Enter account owner name"
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
              name="company_name"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Company Name <span style={{ color: '#ff4d4f' }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter company name" }]}
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
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="company_site"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Company Site
                </span>
              }
            >
              <Input
                placeholder="Enter company site"
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
              name="company_number"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Company Number
                </span>
              }
            >
              <Input
                placeholder="Enter company number"
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
              name="company_type"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Company Type
                </span>
              }
            >
              <Select
                size="large"
                placeholder="Select company type"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                <Option value="private">Private</Option>
                <Option value="public">Public</Option>
                <Option value="partnership">Partnership</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="company_category"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Company Category
                </span>
              }
            >
              <Input
                placeholder="Enter company category"
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
              name="company_industry"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Company Industry
                </span>
              }
            >
              <Input
                placeholder="Enter company industry"
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
              name="company_revenue"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Company Revenue
                </span>
              }
            >
              <Input
                placeholder="Enter company revenue"
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
              name="phone_number"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
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

          <Col span={12}>
            <Form.Item
              name="website"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Website
                </span>
              }
            >
              <Input
                placeholder="Enter website"
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
              name="fax"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Fax
                </span>
              }
            >
              <Input
                placeholder="Enter fax number"
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
              name="ownership"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Ownership
                </span>
              }
            >
              <Input
                placeholder="Enter ownership details"
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
              name="number_of_employees"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Number of Employees
                </span>
              }
            >
              <Input
                type="number"
                placeholder="Enter number of employees"
                size="large"
                style={{
                  borderRadius: "10px",
                  height: "48px",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        

        <div style={{ marginBottom: "24px", marginTop: "24px" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Text strong>Billing Address</Text>
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="billing_city"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    City
                  </span>
                }
              >
                <Input
                  placeholder="Enter city"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    height: "48px",
                  }}
                  onChange={(e) => {
                    if (copyBillingToShipping) {
                      form.setFieldValue('shipping_city', e.target.value);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="billing_state"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    State
                  </span>
                }
              >
                <Input
                  placeholder="Enter state"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    height: "48px",
                  }}
                  onChange={(e) => {
                    if (copyBillingToShipping) {
                      form.setFieldValue('shipping_state', e.target.value);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="billing_pincode"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Pincode
                  </span>
                }
              >
                <Input
                  placeholder="Enter pincode"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    height: "48px",
                  }}
                  onChange={(e) => {
                    if (copyBillingToShipping) {
                      form.setFieldValue('shipping_pincode', e.target.value);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="billing_country"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Country
                  </span>
                }
              >
                <Input
                  placeholder="Enter country"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    height: "48px",
                  }}
                  onChange={(e) => {
                    if (copyBillingToShipping) {
                      form.setFieldValue('shipping_country', e.target.value);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="billing_address"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Address
                  </span>
                }
              >
                <Input
                  placeholder="Enter billing address"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    height: "48px",
                  }}
                  onChange={(e) => {
                    if (copyBillingToShipping) {
                      form.setFieldValue('shipping_address', e.target.value);
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Text strong>Shipping Address</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text>Shipping Address</Text>
              <Switch 
                checked={copyBillingToShipping}
                onChange={handleCopyBillingToShipping}
                size="small"
              />
            </div>
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="shipping_city"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    City
                  </span>
                }
              >
                <Input
                  placeholder="Enter city"
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
                name="shipping_state"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    State
                  </span>
                }
              >
                <Input
                  placeholder="Enter state"
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
                name="shipping_pincode"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Pincode
                  </span>
                }
              >
                <Input
                  placeholder="Enter pincode"
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
                name="shipping_country"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Country
                  </span>
                }
              >
                <Input
                  placeholder="Enter country"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    height: "48px",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="shipping_address"
                label={
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    Address
                  </span>
                }
              >
                <Input
                  placeholder="Enter shipping address"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    height: "48px",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Form.Item
          name="description"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Description
            </span>
          }
        >
          <TextArea
            placeholder="Enter description"
            rows={4}
            style={{
              borderRadius: "10px",
            }}
          />
        </Form.Item>

        <Divider style={{ margin: "24px 0" }} />

        <div style={{ textAlign: "right", marginTop: "24px" }}>
          <Button
            onClick={onCancel}
            style={{ marginRight: "8px" }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
          >
            Create Company
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateCompanyAccount;
