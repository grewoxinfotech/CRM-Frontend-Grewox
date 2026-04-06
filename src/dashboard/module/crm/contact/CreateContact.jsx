import React, { useRef, useState } from "react";
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
  message,
  Popconfirm,
  InputNumber,
} from "antd";
import {
  FiFileText,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiTrash2,
  FiMapPin,
  FiTag,
  FiBriefcase,
  FiUsers,
  FiChevronDown,
  FiLink,
} from "react-icons/fi";
import "./contact.scss";
import { useCreateContactMutation } from "./services/contactApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';
import AddCompanyModal from "../companyacoount/CreateCompanyAccount";
import { PlusOutlined } from "@ant-design/icons";
import {
  useGetSourcesQuery,
  useDeleteSourceMutation,
} from "../crmsystem/souce/services/SourceApi";
import AddSourceModal from "../crmsystem/souce/AddSourceModal";

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

const CreateContact = ({ open, onCancel, loggedInUser, companyAccountsResponse }) => {
  const [form] = Form.useForm();
  const [createContact, { isLoading }] = useCreateContactMutation();
  const [isAddCompanyVisible, setIsAddCompanyVisible] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get countries data
  const { data: countries = [] } = useGetAllCountriesQuery();
  const { defaultPhoneCode } = findIndianDefaults(countries);

  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);

  const sources = sourcesData?.data || [];

  const [deleteSource] = useDeleteSourceMutation();


  const [isAddSourceVisible, setIsAddSourceVisible] = useState(false);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const sourceSelectRef = useRef(null);

  // Add handlers for source and category
  const handleAddSourceClick = (e) => {
    e.stopPropagation();
    setSourceDropdownOpen(false);
    setIsAddSourceVisible(true);
  };

   // Source handlers
   const handleDeleteSource = async (sourceId) => {
    try {
      await deleteSource(sourceId).unwrap();
      message.success("Source deleted successfully");
      // Clear the source field if the deleted source was selected
      if (form.getFieldValue("source") === sourceId) {
        form.setFieldValue("source", undefined);
      }
    } catch (error) {
      message.error(error.data?.message || "Failed to delete source");
    }
  };

  // Safely handle company accounts data
  const companyAccounts = React.useMemo(() => {
    if (!companyAccountsResponse) return [];
    if (Array.isArray(companyAccountsResponse)) return companyAccountsResponse;
    if (companyAccountsResponse?.data && Array.isArray(companyAccountsResponse.data)) {
      return companyAccountsResponse.data;
    }
    return [];
  }, [companyAccountsResponse]);

  // const handleSubmit = async (values) => {
  //   try {
  //     // Get the selected country's phone code
  //     const selectedCountry = countries.find(c => c.id === values.phoneCode);
  //     const phoneNumber = values.phone ? values.phone.replace(/^0+/, '') : '';

  //     const contactData = {
  //       contact_owner: loggedInUser?.id || "",
  //       first_name: values.first_name || "",
  //       last_name: values.last_name || "",
  //       company_name: values.company_name || "",
  //       email: values.email || "",
  //       phone_code: selectedCountry?.id || "",
  //       phone: phoneNumber,
  //       contact_source: values.contact_source || "",
  //       description: values.description || "",
  //       address: values.address || "",
  //       city: values.city || "",
  //       state: values.state || "",
  //       country: values.country || "",
  //       section: "contact",
  //       contact_source: values.contact_source || "",
  //       client_id: loggedInUser?.client_id || "",
  //     };

  //     await createContact(contactData);
  //     message.success("Contact created successfully");
  //     form.resetFields();
  //     onCancel();
  //   } catch (error) {
  //     console.error("Submit Error:", error);
  //     message.error(error.data?.message || 'Failed to create contact');
  //   }
  // };

  // ... existing code ...
  const handleSubmit = async (values) => {
    try {
      // Get the selected country's phone code
      const selectedCountry = countries.find(c => c.id === values.phoneCode);
      const phoneNumber = values.phone ? values.phone.replace(/^0+/, '') : '';

      const contactData = {
        contact_owner: loggedInUser?.id || "",
        first_name: values.first_name || "",
        last_name: values.last_name || "",
        company_name: values.company_name || "",
        email: values.email || "",
        website: values.website || "",
        phone_code: selectedCountry?.id || "",
        phone: phoneNumber,
        contact_source: values.contact_source || "",
        description: values.description || "",
        address: values.address || "",
        city: values.city || "",
        state: values.state || "",
        country: values.country || "",
        section: "contact",
        contact_source: values.contact_source || "",
        // client_id: loggedInUser?.client_id || "",
      };

      const response = await createContact(contactData).unwrap();

      // Check if response contains error
      if (response.error) {
        message.error(response.error);
        return; // Don't close modal or reset form
      }

      message.success("Contact created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Submit Error:", error);
      // Check for specific error messages
      if (error.data?.message?.includes("already exists")) {
        message.error("Contact with this name already exists");
      } else {
        message.error(error.data?.message || 'Failed to create contact');
      }
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

  const handleCompanyCreationSuccess = (newCompany) => {
    setIsAddCompanyVisible(false);
    form.setFieldsValue({
      company_name: newCompany.id
    });
    message.success('Company added successfully');
    setNewCompanyName("");
  };

  const handleAddCompanyClick = (e) => {
    if (e) e.stopPropagation();
    setIsAddCompanyVisible(true);
  };

  // Initialize form with default values
  React.useEffect(() => {
    form.setFieldsValue({
      phoneCode: defaultPhoneCode
    });
  }, [defaultPhoneCode, form]);

  return (
    <>
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
              <FiFileText />
            </div>
            <div>
              <h2>Create Contact</h2>
              <Text>Fill in the information to create new contact</Text>
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="contact-form"
          style={{ padding: "24px" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label={
                  <span className="form-label">
                    <FiUser />
                    First Name <span className="required">*</span>
                  </span>
                }
                rules={[{ required: true, message: "Please enter first name" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (!/[a-z]/.test(value) && !/[A-Z]/.test(value)) {
                        return Promise.reject(
                            new Error('First name must contain both uppercase or lowercase English letters')
                        );
                    }
                    return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input
                  placeholder="Enter first name"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="last_name"
                label={
                  <span className="form-label">
                    <FiUser />
                    Last Name
                  </span>
                }
              >
                <Input
                  placeholder="Enter last name"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="email"
                label={
                  <span className="form-label">
                    <FiMail />
                    Email (optional)
                  </span>
                }
                rules={[
                  { type: "email", message: "Please enter valid email" }
                ]}
              >
                <Input
                  placeholder="Enter email"
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
                    Phone Number <span className="required">*</span>
                  </span>
                }
                className="combined-input-item"
                required
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Form.Item
                    name="phoneCode"
                    noStyle
                    initialValue={defaultPhoneCode}
                    rules={[{ required: true, message: 'Please select country code' }]}
                  >
                    <Select
                      style={{ width: '120px', height: '48px' }}
                      className="phone-code-select-common"
                      suffixIcon={<FiChevronDown size={14} style={{ color: '#8c8c8c' }} />}
                      popupClassName="custom-select-dropdown"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children?.props?.children[0]?.props?.children?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {countries?.map((country) => (
                        <Option key={country.id} value={country.id}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '14px' }}>{country.countryCode}</span>
                            <span style={{ fontSize: '14px' }}>+{country.phoneCode.replace('+', '')}</span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    noStyle
                    rules={[
                      { required: true, message: 'Please enter phone number' },
                      { pattern: /^\d+$/, message: 'Please enter only numbers' },
                      { min: 7, message: 'Phone number must be at least 7 digits' },
                      { max: 15, message: 'Phone number cannot exceed 15 digits' }
                    ]}
                  >
                    <Input
                      style={{ width: 'calc(100% - 120px)', height: '48px' }}
                      placeholder="Enter phone number"
                      className="form-input"
                      type="number"
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </div>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="company_name"
                label={
                  <span className="form-label">
                    <FiBriefcase />
                    Select Company
                  </span>
                }
                >
                  <Select
                    placeholder="Select company"
                    style={selectStyle}
                    suffixIcon={<FiChevronDown size={14} style={{ color: '#8c8c8c' }} />}
                    className="form-input"
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                      const companyName = option?.children?.props?.children?.[1]?.props?.children?.[0]?.props?.children || '';
                      return companyName.toLowerCase().includes(input.toLowerCase());
                    }}
                    dropdownRender={(menu) => (
                      <div onClick={(e) => e.stopPropagation()}>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ padding: '0 8px 8px' }}>
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddCompanyClick}
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
                            Add New Company
                          </Button>
                        </div>
                      </div>
                    )}
                  >
                    {companyAccounts.map((company) => (
                      <Option key={company.id} value={company.id}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '4px 0'
                        }}>
                          <FiBriefcase style={{ color: '#1890FF', fontSize: '16px' }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{
                              fontWeight: '500',
                              color: '#111827'
                            }}>{company.company_name}</span>
                            {company.company_site && (
                              <span style={{
                                fontSize: '12px',
                                color: '#6B7280'
                              }}>{company.company_site}</span>
                            )}
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="contact_source"
                label={
                  <span className="form-label">
                    <FiTag />
                    Select Source 
                  </span>
                }
              >
                <Select
                  ref={sourceSelectRef}
                  open={sourceDropdownOpen}
                  onDropdownVisibleChange={setSourceDropdownOpen}
                  placeholder="Select source"
                  style={selectStyle}
                  suffixIcon={<FiChevronDown size={14} style={{ color: '#8c8c8c' }} />}
                  className="form-input"
                  popupClassName="custom-select-dropdown"
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const sourceName = option?.children?.props?.children?.[0]?.props?.children?.[1] || '';
                    return sourceName.toLowerCase().includes(input.toLowerCase());
                  }}
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
                        {form.getFieldValue("contact_source") !== source.id && (
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

          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="link" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ 
                padding: 0, 
                height: 'auto', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                color: '#1890ff',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              {showAdvanced ? 'Show Less Details' : 'Show More Details (Advance)'}
              <FiChevronDown style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </Button>
          </div>

          {showAdvanced && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="contact_owner"
                  label={
                    <span className="form-label">
                      <FiUsers />
                      Contact Owner
                    </span>
                  }
                  initialValue={loggedInUser?.username}
                >
                  <Input
                    size="large"
                    className="form-input"
                    disabled
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="website"
                  label={
                    <span className="form-label">
                      <FiLink />
                      Website
                    </span>
                  }
                  rules={[
                    { type: "url", message: "Please enter a valid URL" }
                  ]}
                >
                  <Input
                    placeholder="Enter website URL"
                    size="large"
                    className="form-input"
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="address"
                  label={
                    <span className="form-label">
                      <FiMapPin />
                      Address
                    </span>
                  }
                >
                  <TextArea
                    placeholder="Enter address"
                    rows={3}
                    className="form-textarea"
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="city"
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
                  name="state"
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
                  name="country"
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

              <Col span={24}>
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
              </Col>
            </Row>
          )}

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
              Create Contact
            </Button>
          </div>
        </Form>
      </Modal >

      <AddCompanyModal
        open={isAddCompanyVisible}
        onCancel={() => setIsAddCompanyVisible(false)}
        loggedInUser={loggedInUser}
        companyAccountsResponse={companyAccountsResponse}
        onSuccess={handleCompanyCreationSuccess}
        initialCompanyName={newCompanyName}
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
        .contact-form {
          padding: 24px;
          
          .form-section {
            margin-bottom: 32px;
          }

          .section-title {
            display: block;
            margin-bottom: 24px;
            color: #1f2937;
            font-size: 16px;
          }

          .form-label {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #374151;
            font-size: 14px;

            svg {
              color: #1890ff;
              font-size: 16px;
            }

            .required {
              color: #ff4d4f;
              margin-left: 4px;
            }
          }

          .form-input {
            height: 48px;
            border-radius: 10px;
            font-size: 14px;
            background-color: #f9fafb;
            transition: all 0.3s ease;

            &:hover, &:focus {
              border-color: #1890ff;
              box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
            }

            &::placeholder {
              color: #9ca3af;
            }
          }

          .form-textarea {
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            padding: 12px 16px;
            font-size: 14px;
            background-color: #f9fafb;
            resize: none;
            transition: all 0.3s ease;

            &:hover, &:focus {
              border-color: #1890ff;
              box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
            }

            &::placeholder {
              color: #9ca3af;
            }
          }

          .ant-select:not(.ant-select-customize-input) .ant-select-selector {
            background-color: #f9fafb !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 10px !important;
            min-height: 48px !important;
            padding: 0 16px !important;
            display: flex !important;
            align-items: center !important;
          }

          .ant-select-single .ant-select-selector .ant-select-selection-item,
          .ant-select-single .ant-select-selector .ant-select-selection-placeholder,
          .ant-select-single .ant-select-selector .ant-select-selection-search,
          .ant-select-single .ant-select-selector .ant-select-selection-search-input {
            line-height: 48px !important;
            height: 48px !important;
            transition: all 0.3s !important;
            display: flex !important;
            align-items: center !important;
            padding: 0 !important;
          }

          .form-divider {
            margin: 32px 0;
            border-color: #e5e7eb;
          }

          .form-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;

            .cancel-button {
              height: 48px;
              padding: 0 24px;
              border-radius: 10px;
              border: 1px solid #e5e7eb;
              color: #374151;
              font-weight: 500;
              transition: all 0.3s ease;

              &:hover {
                border-color: #d1d5db;
                background-color: #f9fafb;
              }
            }

            .submit-button {
              height: 48px;
              padding: 0 24px;
              border-radius: 10px;
              background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
              border: none;
              color: white;
              font-weight: 500;
              transition: all 0.3s ease;

              &:hover {
                opacity: 0.9;
              }
            }
          }

          .ant-select-single {
            height: 48px !important;
          }

          .phone-code-select-common {
            .ant-select-selector {
              border-top-right-radius: 0 !important;
              border-bottom-right-radius: 0 !important;
              padding: 0 8px !important;
              height: 48px !important;
              display: flex !important;
              align-items: center !important;
            }
            
            .ant-select-selection-item {
              display: flex !important;
              align-items: center !important;
              gap: 4px !important;
              height: 48px !important;
              line-height: 48px !important;
            }
          }

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
        }
      `}</style>
    </>
  );
};

export default CreateContact;
