import React, { useState,useRef } from "react";
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
  Popconfirm,
} from "antd";
import {
  FiFileText,
  FiX,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiTrash2,
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
import { PlusOutlined } from "@ant-design/icons";
import { useGetUsersQuery } from "../../user-management/users/services/userApi";
import { useUpdateCompanyAccountMutation } from "./services/companyAccountApi";
import { useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';
import {
  useGetSourcesQuery,
  useDeleteSourceMutation,
  useGetCategoriesQuery,
  useDeleteCategoryMutation
} from "../crmsystem/souce/services/SourceApi";
import AddSourceModal from "../crmsystem/souce/AddSourceModal";
import AddCategoryModal from "../crmsystem/souce/AddCategoryModal";

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

const EditCompanyAccount = ({ open, onCancel, companyData, loggedInUser,categoriesData }) => {
  const [form] = Form.useForm();
  const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);
  const { data: usersData } = useGetUsersQuery();
  const [updateCompanyAccount, { isLoading }] = useUpdateCompanyAccountMutation();

  // Get countries data
  const { data: countries = [] } = useGetAllCountriesQuery();
  const { defaultPhoneCode } = findIndianDefaults(countries);

  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: categoriesDataFromApi } = useGetCategoriesQuery(loggedInUser?.id);

  const sources = sourcesData?.data || [];
  const categories = categoriesDataFromApi?.data || categoriesData?.data || [];

  const [deleteSource] = useDeleteSourceMutation();

  const [isAddCategoryVisible, setIsAddCategoryVisible] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categorySelectRef = React.useRef(null);
  const [deleteCategory] = useDeleteCategoryMutation();

  const [isAddSourceVisible, setIsAddSourceVisible] = useState(false);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const sourceSelectRef = useRef(null);

   // Find others category
   const othersCategory = categories?.find(cat => cat.name.toLowerCase() === "others") || null;

  // Add handlers for source and category
  const handleAddSourceClick = (e) => {
    e.stopPropagation();
    setSourceDropdownOpen(false);
    setIsAddSourceVisible(true);
  };

   // Handle add category click
   const handleAddCategoryClick = (e) => {
    e.stopPropagation();
    setCategoryDropdownOpen(false);
    setIsAddCategoryVisible(true);
  };

  // Handle category deletion
  const handleDeleteCategory = async (e, categoryId) => {
    e.stopPropagation();
    try {
      await deleteCategory(categoryId).unwrap();
      message.success("Category deleted successfully");
      // Clear the category field if the deleted category was selected
      if (form.getFieldValue('company_category') === categoryId) {
        form.setFieldValue('company_category', undefined);
      }
    } catch (error) {
      message.error(error.data?.message || "Failed to delete category");
    }
  };

   // Source handlers
   const handleDeleteSource = async (sourceId) => {
    try {
      await deleteSource(sourceId).unwrap();
      message.success("Source deleted successfully");
      // Clear the source field if the deleted source was selected
      if (form.getFieldValue("company_source") === sourceId) {
        form.setFieldValue("company_source", undefined);
      }
    } catch (error) {
      message.error(error.data?.message || "Failed to delete source");
    }
  };

  React.useEffect(() => {
    if (companyData) {
      console.log("companyData", companyData);

      // Find the account owner's name from users data
      let accountOwnerName = companyData?.account_owner;
      if (usersData?.data) {
        const owner = usersData.data.find(user => user.id === companyData?.account_owner);
        if (owner) {
          accountOwnerName = owner.username;
        }
      }

      form.setFieldsValue({
        ...companyData,
        account_owner: accountOwnerName,
        registrationDate: companyData.registrationDate ? dayjs(companyData.registrationDate) : null,
        phoneCode: companyData.phone_code || defaultPhoneCode,
        company_number: companyData.company_number
      });
    }
  }, [companyData, form, usersData, defaultPhoneCode]);

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

    // Add these consistent styles from CreateLead
    const formItemStyle = {
      fontSize: "14px",
      fontWeight: "500",
    };
  
    const selectStyle = {
      width: "100%",
      height: "48px",
    };

  const handleSubmit = async (values) => {
    try {
      // Find the account owner ID from the username
      let accountOwnerId = companyData?.account_owner;
      if (usersData?.data) {
        const owner = usersData.data.find(user => user.username === values.account_owner);
        if (owner) {
          accountOwnerId = owner.id;
        }
      }

      // Get the selected country's phone code
      const selectedCountry = countries.find(c => c.id === values.phoneCode);
      const phoneNumber = values.phone_number ? values.phone_number.replace(/^0+/, '') : '';

      const updatedCompanyData = {
        ...values,
        category: values.company_category || othersCategory?.id,
        account_owner: accountOwnerId,
        registrationDate: values.registrationDate ? values.registrationDate.format('YYYY-MM-DD') : null,
        phone_code: selectedCountry?.id || "",
        phone_number: phoneNumber,
      };

      await updateCompanyAccount({
        id: companyData.id,
        data: updatedCompanyData
      }).unwrap();

      message.success("Company account updated successfully");
      onCancel();
    } catch (error) {
      console.error("Update Error:", error);
      message.error("Failed to update company account");
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
            <h2>Edit Company Account</h2>
            <Text>Update company account information</Text>
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
                    Account Owner 
                  </span>
                }
                rules={[{ required: true, message: "Please enter account owner" }]}
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
                    Company Name 
                  </span>
                }
                rules={[{ required: true, message: "Please enter company name" }]}
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
                name="email"
                label={
                  <span className="form-label">
                    <FiMail />
                    Email
                  </span>
                }
              >
                <Input
                  placeholder="Enter company email"
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
                  placeholder="Enter company website"
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
            <Col span={12}>
            <Form.Item
                name="company_source"
                label={
                  <span style={formItemStyle}>
                    Source 
                  </span>
                }
              >
                <Select
                  ref={sourceSelectRef}
                  open={sourceDropdownOpen}
                  onDropdownVisibleChange={setSourceDropdownOpen}
                  placeholder="Select source"
                  style={selectStyle}
                  popupClassName="custom-select-dropdown"
                  dropdownRender={(menu) => (
                    <div onClick={(e) => e.stopPropagation()}>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <div
                        style={{
                          padding: "8px 12px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddSourceClick}
                          style={{
                            width: "100%",
                            background:
                              "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                            border: "none",
                            height: "40px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxShadow: "0 2px 8px rgba(24, 144, 255, 0.15)",
                            fontWeight: "500",
                          }}
                        >
                          Add Source
                        </Button>
                      </div>
                    </div>
                  )}
                >
                  {sources.map((source) => (
                    <Option key={source.id} value={source.id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: source.color || "#1890ff",
                            }}
                          />
                          {source.name}
                        </div>
                        {form.getFieldValue("company_source") !== source.id && (
                          <Popconfirm
                            title="Delete Source"
                            description="Are you sure you want to delete this source?"
                            onConfirm={(e) => {
                              e?.stopPropagation?.();
                              handleDeleteSource(source.id);
                            }}
                            okText="Yes"
                            cancelText="No"
                            placement="left"
                          >
                            <Button
                              type="text"
                              icon={<FiTrash2 style={{ color: "#ff4d4f" }} />}
                              size="small"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0.8,
                                transition: "opacity 0.2s",
                                "&:hover": {
                                  opacity: 1,
                                  backgroundColor: "transparent",
                                },
                              }}
                            />
                          </Popconfirm>
                        )}
                      </div>
                    </Option>
                  ))}
                </Select>
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
            label={<span style={formItemStyle}>Category</span>}
          >
            <Select
              ref={categorySelectRef}
              open={categoryDropdownOpen}
              onDropdownVisibleChange={setCategoryDropdownOpen}
              placeholder="Select or type to filter categories"
              style={{
                ...selectStyle,
                dropdownStyle: {
                  maxHeight: '400px',
                  overflow: 'hidden'
                }
              }}
              showSearch
              allowClear
              filterOption={(input, option) =>
                option.children.props.children[0].props.children[1].toLowerCase().includes(input.toLowerCase())
              }
              dropdownRender={(menu) => (
                <div
                  style={{
                    position: 'relative',
                    maxHeight: '400px'
                  }}
                >
                  <div style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    paddingBottom: '48px'
                  }}>
                    {menu}
                  </div>
                  <div style={{
                    position: 'sticky',
                    bottom: 0,
                    padding: '8px 12px',
                    borderTop: '1px solid #f0f0f0',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddCategoryClick}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        border: 'none',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
                        fontWeight: '500',
                      }}
                    >
                      Add Category
                    </Button>
                  </div>
                </div>
              )}
            >
              {categories?.map((category) => (
                <Option key={category.id} value={category.id}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: category.color || '#1890ff'
                        }}
                      />
                      {category.name}
                    </div>
                    {form.getFieldValue('company_category') !== category.id && (
                      <Popconfirm
                        title="Delete Category"
                        description="Are you sure you want to delete this category?"
                        onConfirm={(e) => handleDeleteCategory(e, category.id)}
                        onCancel={(e) => e.stopPropagation()}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                      >
                        <Button
                          type="text"
                          icon={<FiTrash2 style={{ color: '#ff4d4f' }} />}
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.8,
                            transition: 'opacity 0.2s',
                            ':hover': {
                              opacity: 1,
                              backgroundColor: 'transparent'
                            }
                          }}
                        />
                      </Popconfirm>
                    )}
                  </div>
                </Option>
              ))}
            </Select>
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

        <div className="form-section">
          <Text strong className="section-title">Additional Information</Text>
          <Form.Item
            name="description"
            label={
              <span className="form-label">
                <FiFileText />
                Description
              </span>
            }
          >
            <TextArea
              placeholder="Enter description"
              rows={4}
              className="form-textarea"
            />
          </Form.Item>
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
            className="submit-button"
            loading={isLoading}
          >
            Update Company Account
          </Button>
        </div>
      </Form>

      <AddCategoryModal
        isOpen={isAddCategoryVisible}
        onClose={(success) => {
          setIsAddCategoryVisible(false);
          if (success) {
            setCategoryDropdownOpen(true);
          }
        }}
      />

      <AddSourceModal
        isOpen={isAddSourceVisible}
        onClose={(success) => {
          setIsAddSourceVisible(false);
          if (success) {
            setSourceDropdownOpen(true);
          }
        }}
      />

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
                    .phone-input-group .ant-select-selector .ant-select-selection-item div span:last-child {
                      color: white !important;
                    }
          
                    :where(.css-dev-only-do-not-override-240cud).ant-select-single {
                      height: 48px !important;
                    }
        }
      `}</style>
    </Modal>
  );
};

export default EditCompanyAccount;
