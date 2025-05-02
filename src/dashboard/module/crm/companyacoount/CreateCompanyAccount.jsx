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
  FiGlobe,
  FiBriefcase,
  FiUsers,
  FiCopy,
  FiChevronDown,
} from "react-icons/fi";
import dayjs from "dayjs";
import "./companyaccount.scss";
import { useCreateCompanyAccountMutation } from "./services/companyAccountApi";
import { useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Find the Indian phone code ID
const findIndianDefaults = (countries) => {
  const indiaCountry = countries?.find(c => c.countryCode === 'IN');
  return {
    defaultPhoneCode: indiaCountry?.id || 'K9GxyQ8rrXQycdLQNkGhczL'
  };
};

const CreateCompanyAccount = ({ open, onCancel, loggedInUser, companyAccountsResponse, onsubmit }) => {
  const [form] = Form.useForm();
  const [createCompanyAccount, { isLoading }] = useCreateCompanyAccountMutation();
  const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);

  // Get countries data
  const { data: countries = [] } = useGetAllCountriesQuery();
  const { defaultPhoneCode } = findIndianDefaults(countries);

  // Initialize form with default values
  React.useEffect(() => {
    form.setFieldsValue({
      phoneCode: defaultPhoneCode
    });
  }, [defaultPhoneCode, form]);

  const handleSubmit = async (values) => {
    try {
      // Get the selected country's phone code
      const selectedCountry = countries.find(c => c.id === values.phoneCode);
      const phoneNumber = values.phone_number ? values.phone_number.replace(/^0+/, '') : '';

      const companyData = {
        ...values,
        account_owner: loggedInUser?.id,
        phone_code: selectedCountry?.id || "",
        phone_number: phoneNumber,
      }
      await createCompanyAccount(companyData).unwrap();
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
      <div className="modal-header" style={{
        background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
        padding: "24px",
        color: "#ffffff",
        position: "relative",
      }}>
        <Button
          type="text"
          onClick={onCancel}
          className="close-button"
        >
          <FiX />
        </Button>
        <div className="header-content">
          <div className="header-icon">
            <FiBriefcase />
          </div>
          <div>
            <h2>Create Company Account</h2>
            <Text>Fill in the information to create company account</Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="company-account-form"
      >
        <div className="form-section">
          <Text strong className="section-title">Basic Information</Text>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="account_owner"
                label={
                  <span className="form-label">
                    <FiUser />
                    Account Owner <span className="required">*</span>
                  </span>
                }
                initialValue={loggedInUser?.username}
                disabled
              >
                <Input
                  placeholder="Enter account owner name"
                  size="large"
                  className="form-input"
                  disabled
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="company_name"
                label={
                  <span className="form-label">
                    <FiBriefcase />
                    Company Name <span className="required">*</span>
                  </span>
                }
                rules={[{ required: true, message: "Please enter company name" },
                  {
                    validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        if (!/[a-z]/.test(value) && !/[A-Z]/.test(value)) {
                            return Promise.reject(
                                new Error('Company name must contain both uppercase or lowercase English letters')
                            );
                        }
                        return Promise.resolve();
                    }
                }
                ]}
              >
                <Input
                  placeholder="Enter company name"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="company_site"
                label={
                  <span className="form-label">
                    <FiGlobe />
                    Company Site
                  </span>
                }
              >
                <Input
                  placeholder="Enter company site"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="phoneGroup"
                label={
                  <span className="form-label">
                    <FiPhone />
                    Company Number <span className="required">*</span>
                  </span>
                }
                className="combined-input-item"
                required
              >
                <Input.Group compact className="phone-input-group">
                  <Form.Item
                    name="phoneCode"
                    noStyle
                    initialValue={defaultPhoneCode}
                    rules={[{ required: true, message: 'Please select country code' }]}
                  >
                    <Select
                      style={{ width: '120px' }}
                      className="phone-code-select"
                      dropdownMatchSelectWidth={120}
                      suffixIcon={<FiChevronDown size={14} />}
                      popupClassName="custom-select-dropdown"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children?.props?.children[1]?.props?.children?.includes(input)
                      }
                    >
                      {countries?.map((country) => (
                        <Option key={country.id} value={country.id}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '14px' }}>{country.countryCode}</span>
                            <span style={{ fontSize: '14px' }}>{country.phoneCode}</span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="phone_number"
                    noStyle
                    rules={[
                      { required: true, message: 'Please enter company number' },
                      { pattern: /^\d+$/, message: 'Please enter only numbers' },
                      { min: 10, message: 'Phone number must be at least 10 digits' },
                      { max: 15, message: 'Phone number cannot exceed 15 digits' },
                      {
                        validator: (_, value) => {
                          if (value && value.startsWith('0')) {
                            return Promise.reject('Phone number should not start with 0');
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                    normalize={(value) => {
                      if (!value) return value;
                      // Remove any non-digit characters and leading zeros
                      return value.replace(/\D/g, '').replace(/^0+/, '');
                    }}
                  >
                    <Input
                      style={{ width: 'calc(100% - 120px)' }}
                      placeholder="Enter company number without leading zeros"
                      className="form-input"
                      maxLength={15}
                    />
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="form-section">
          <Text strong className="section-title">Company Details</Text>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="company_type"
                label={
                  <span className="form-label">
                    <FiBriefcase />
                    Company Type
                  </span>
                }
              >
                <Select
                  size="large"
                  placeholder="Select company type"
                  className="form-input"
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
                  <span className="form-label">
                    <FiTag />
                    Company Category
                  </span>
                }
              >
                <Input
                  placeholder="Enter company category"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="company_industry"
                label={
                  <span className="form-label">
                    <FiBriefcase />
                    Company Industry
                  </span>
                }
              >
                <Input
                  placeholder="Enter company industry"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="company_revenue"
                label={
                  <span className="form-label">
                    <FiDollarSign />
                    Company Revenue
                  </span>
                }
              >
                <Input
                  placeholder="Enter company revenue"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="form-section">
          <Text strong className="section-title">Contact Information</Text>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone_number"
                label={
                  <span className="form-label">
                    <FiPhone />
                    Phone Number
                  </span>
                }
              >
                <Input
                  placeholder="Enter phone number"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="website"
                label={
                  <span className="form-label">
                    <FiGlobe />
                    Website
                  </span>
                }
              >
                <Input
                  placeholder="Enter website"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fax"
                label={
                  <span className="form-label">
                    <FiPhone />
                    Fax
                  </span>
                }
              >
                <Input
                  placeholder="Enter fax number"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="ownership"
                label={
                  <span className="form-label">
                    <FiUsers />
                    Ownership
                  </span>
                }
              >
                <Input
                  placeholder="Enter ownership details"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>


        <div className="form-section">

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="number_of_employees"
                label={
                  <span className="form-label">
                    <FiUsers />
                    Number of Employees
                  </span>
                }
              >
                <Input
                  type="number"
                  placeholder="Enter number of employees"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="form-section">
          <div className="section-header">
            <Text strong className="section-title">Billing Address</Text>
          </div>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="billing_address"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    Address
                  </span>
                }
              >
                <TextArea
                  placeholder="Enter billing address"
                  rows={3}
                  className="form-textarea"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="billing_city"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    City
                  </span>
                }
              >
                <Input
                  placeholder="Enter city"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="billing_state"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    State
                  </span>
                }
              >
                <Input
                  placeholder="Enter state"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="billing_pincode"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    Pincode
                  </span>
                }
              >
                <Input
                  type="number"
                  placeholder="Enter pincode"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="billing_country"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    Country
                  </span>
                }
              >
                <Input
                  placeholder="Enter country"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="form-section">
          <div className="section-header">
            <Text strong className="section-title">Shipping Address</Text>
            <div className="copy-address-switch">
              <Text>Same as Billing Address</Text>
              <Switch
                checked={copyBillingToShipping}
                onChange={handleCopyBillingToShipping}
                size="small"
              />
            </div>
          </div>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="shipping_address"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    Address
                  </span>
                }
              >
                <TextArea
                  placeholder="Enter shipping address"
                  rows={3}
                  className="form-textarea"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="shipping_city"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    City
                  </span>
                }
              >
                <Input
                  placeholder="Enter city"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="shipping_state"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    State
                  </span>
                }
              >
                <Input
                  placeholder="Enter state"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="shipping_pincode"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    Pincode
                  </span>
                }
              >
                <Input
                  type="number"
                  placeholder="Enter pincode"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="shipping_country"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    Country
                  </span>
                }
              >
                <Input
                  placeholder="Enter country"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider className="form-divider" />

        <div className="form-footer">
          <Button
            size="large"
            onClick={onCancel}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="submit-button"
          >
            Create Company
          </Button>
        </div>
      </Form>

      <style jsx global>{`
        .company-account-form {
          padding: 24px;

          .phone-input-group {
            display: flex !important;
            
            .phone-code-select {
              .ant-select-selector {
                border-top-right-radius: 0 !important;
                border-bottom-right-radius: 0 !important;
                padding: 8px 8px !important;
                height: 48px !important;
              }
              
              .ant-select-selection-search {
                input {
                  height: 100% !important;
                }
              }

              .ant-select-selection-item {
                padding-right: 20px !important;
                color: #1f2937 !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
              }

              .ant-select-selection-placeholder {
                color: #9CA3AF !important;
              }
            }

            .form-input {
              border-top-left-radius: 0 !important;
              border-bottom-left-radius: 0 !important;
            }
          }

          .phone-input-group .ant-select-selector .ant-select-selection-item div span:last-child {
            color: white !important;
          }

          :where(.css-dev-only-do-not-override-240cud).ant-select-single {
            height: 48px !important;
          }

          .ant-select-dropdown {
            padding: 8px !important;
            border-radius: 10px !important;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;

            .ant-select-item {
              padding: 8px 12px !important;
              border-radius: 6px !important;
              min-height: 32px !important;
              display: flex !important;
              align-items: center !important;
              color: #1f2937 !important;

              &-option-selected {
                background-color: #E6F4FF !important;
                font-weight: 500 !important;
                color: #1890ff !important;
              }

              &-option-active {
                background-color: #F3F4F6 !important;
              }
            }

            .ant-select-item-option-content {
              font-size: 14px !important;
            }

            .ant-select-item-empty {
              color: #9CA3AF !important;
            }
          }
        }
      `}</style>
    </Modal>
  );
};

export default CreateCompanyAccount;
