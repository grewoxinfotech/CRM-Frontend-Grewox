import React, { useState } from "react";
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
  InputNumber,
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
  FiChevronDown,
  FiTag,
  FiUserPlus,
  FiShield,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useCreateLeadMutation, useGetLeadsQuery } from "./services/LeadApi";
import { useGetAllCurrenciesQuery, useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import CreateUser from '../../user-management/users/CreateUser';

const { Text } = Typography;
const { Option } = Select;

// Find the Indian currency and phone code IDs
const findIndianDefaults = (currencies, countries) => {
  const inrCurrency = currencies?.find(c => c.currencyCode === 'INR');
  const indiaCountry = countries?.find(c => c.countryCode === 'IN');
  return {
    defaultCurrency: inrCurrency?.currencyCode || 'INR',
    defaultPhoneCode: indiaCountry?.phoneCode?.replace('+', '') || '91'
  };
};

const CreateLead = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);
  const dispatch = useDispatch();
  const [createLead, { isLoading }] = useCreateLeadMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);

  // Fetch users data with roles
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();

  // Get subclient role ID to filter it out (similar to CreateProjectModal.jsx)
  const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;

  // Filter users to get team members (excluding subclients)
  const users = usersResponse?.data?.filter(user =>
    user?.created_by === loggedInUser?.username &&
    user?.role_id !== subclientRoleId
  ) || [];

  const { data: leadsData = [], isLoading: isLoadingUsers } =
    useGetLeadsQuery();
  console.log("datas", leadsData);
  const leads = leadsData?.data;

  // Lead stage options
  const leadStages = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal", label: "Proposal" },
    { value: "negotiation", label: "Negotiation" },
    { value: "closed", label: "Closed" },
  ];

  // Source options
  const sources = [
    { value: "website", label: "Website" },
    { value: "referral", label: "Referral" },
    { value: "social", label: "Social Media" },
    { value: "email", label: "Email Campaign" },
    { value: "cold_call", label: "Cold Call" },
    { value: "event", label: "Event" },
  ];

  // Status options
  const statuses = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "converted", label: "Converted" },
    { value: "lost", label: "Lost" },
  ];

  // Add interest level options
  const interestLevels = [
    { value: "high", label: "High Interest", color: "#52c41a" },
    { value: "medium", label: "Medium Interest", color: "#faad14" },
    { value: "low", label: "Low Interest", color: "#ff4d4f" },
  ];

  const { data: currencies = [] } = useGetAllCurrenciesQuery();
  const { data: countries = [] } = useGetAllCountriesQuery();

  const { defaultCurrency, defaultPhoneCode } = findIndianDefaults(currencies, countries);

  // Add getRoleColor function from CreateProjectModal.jsx
  const getRoleColor = (role) => {
    const roleColors = {
      'employee': {
        color: '#D46B08',
        bg: '#FFF7E6',
        border: '#FFD591'
      },
      'admin': {
        color: '#096DD9',
        bg: '#E6F7FF',
        border: '#91D5FF'
      },
      'manager': {
        color: '#08979C',
        bg: '#E6FFFB',
        border: '#87E8DE'
      },
      'default': {
        color: '#531CAD',
        bg: '#F9F0FF',
        border: '#D3ADF7'
      }
    };
    return roleColors[role?.toLowerCase()] || roleColors.default;
  };

  const handleSubmit = async (values) => {
    try {
      // Format phone number with country code
      const formattedPhone = values.telephone ?
        `+${values.phoneCode} ${values.telephone}` :
        null;

      // Format lead_members to match project_members structure
      const formData = {
        ...values,
        telephone: formattedPhone,
        // Convert lead_members array to nested object like project_members
        lead_members: {
          lead_members: values.lead_members || []
        },
        // Make sure other null fields have default values
        assigned: values.assigned || [],
        files: values.files || [],
        tag: values.tag || [],
        leadStage: values.leadStage || 'new',
        status: values.status || 'active',
        source: values.source || 'website'
      };

      const response = await createLead(formData).unwrap();
      message.success("Lead created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error(
        "Failed to create lead: " + (error.data?.message || "Unknown error")
      );
      console.error("Create Lead Error:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Add these consistent styles
  const formItemStyle = {
    fontSize: "14px",
    fontWeight: "500"
  };

  const inputStyle = {
    height: "48px",
    borderRadius: "10px",
    padding: "8px 16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e6e8eb",
    transition: "all 0.3s ease",
    '&.ant-select-focused': {
      borderColor: '#1890ff',
      boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
    }
  };

  const prefixIconStyle = {
    color: "#1890ff",
    fontSize: "16px",
    marginRight: "8px"
  };

  // Add selectStyle for Select components
  const selectStyle = {
    width: '100%',
    height: '48px',
    '& .ant-select-selector': {
      height: '48px !important',
      padding: '8px 16px !important',
      backgroundColor: '#f8fafc !important',
      border: '1px solid #e6e8eb !important',
      borderRadius: '10px !important',
      display: 'flex',
      alignItems: 'center',
    },
    '& .ant-select-selection-search': {
      height: '46px',
      display: 'flex',
      alignItems: 'center',
    },
    '& .ant-select-selection-search-input': {
      height: '46px !important',
    },
    '& .ant-select-selection-placeholder': {
      lineHeight: '32px !important',
      color: '#9CA3AF',
    },
    '& .ant-select-selection-item': {
      lineHeight: '32px !important',
    }
  };

  // Add multiSelectStyle for multiple select components
  const multiSelectStyle = {
    ...selectStyle,
    '& .ant-select-selector': {
      minHeight: '48px !important',
      height: 'auto !important',
      padding: '4px 12px !important',
      backgroundColor: '#f8fafc !important',
      border: '1px solid #e6e8eb !important',
      borderRadius: '10px !important',
    },
    '& .ant-select-selection-item': {
      height: '32px',
      lineHeight: '30px !important',
      borderRadius: '6px',
      background: '#E5E7EB',
      border: 'none',
      margin: '4px',
    }
  };

  const handleCreateUser = () => {
    setIsCreateUserVisible(true);
  };

  const handleCreateUserSuccess = (newUser) => {
    setIsCreateUserVisible(false);
    // Add the newly created user to the selected team members
    const currentMembers = form.getFieldValue('lead_members') || [];
    form.setFieldValue('lead_members', [...currentMembers, newUser.id]);
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
      className="pro-modal custom-modal lead-form-modal"
      style={{
        "--antd-arrow-background-color": "#ffffff",
      }}
      styles={{
        body: {
          padding: 0,
          borderRadius: "8px",
          overflow: "hidden",
        },
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
        },
        content: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
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
              Create New Lead
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create lead
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="lead-form custom-form"
        style={{ padding: "24px" }}
      >
        {/* Lead Details - Moved to top */}
        <div className="section-title" style={{ marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Lead Details</Text>
        </div>
        <div className="form-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <Form.Item
            name="leadTitle"
            label={<span style={formItemStyle}>Lead Title</span>}
            rules={[
              { required: true, message: "Please enter lead title" },
              { min: 3, message: "Lead title must be at least 3 characters" },
            ]}
          >
            <Input
              prefix={<FiUser style={prefixIconStyle} />}
              placeholder="Enter lead title"
              style={inputStyle}
            />
          </Form.Item>

          {/* Interest Level */}
          <Form.Item
            name="interest_level"
            label={<span style={formItemStyle}>Interest Level</span>}
          >
            <Select
              placeholder="Select interest level"
              style={selectStyle}
              popupClassName="custom-select-dropdown"
            >
              {interestLevels.map((level) => (
                <Option key={level.value} value={level.value}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: level.color
                    }} />
                    {level.label}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="leadValueGroup"
            label={<span style={formItemStyle}>Lead Value</span>}
            className="combined-input-item"
          >
            <Input.Group compact className="value-input-group">
              <Form.Item
                name="currency"
                noStyle
                initialValue={defaultCurrency}
                rules={[{ required: true, message: 'Please select currency' }]}
              >
                <Select
                  style={{ width: '120px' }}
                  className="currency-select"
                  dropdownMatchSelectWidth={120}
                  suffixIcon={<FiChevronDown size={14} />}
                  popupClassName="custom-select-dropdown"
                  showSearch
                  optionFilterProp="value"
                  filterOption={(input, option) =>
                    (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {currencies?.map((currency) => (
                    <Option key={currency.id} value={currency.currencyCode}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>{currency.currencyIcon}</span>
                        <span style={{ fontSize: '14px' }}>{currency.currencyCode}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="leadValue"
                noStyle
                rules={[{ required: true, message: 'Please enter lead value' }]}
              >
                <InputNumber
                  style={{ width: 'calc(100% - 100px)' }}
                  placeholder="Enter amount"
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="leadStage"
            label={<span style={formItemStyle}>Lead Stage</span>}
            rules={[{ required: true, message: "Please select lead stage" }]}
          >
            <Select
              placeholder="Select lead stage"
              style={selectStyle}
              popupClassName="custom-select-dropdown"
            >
              {leadStages?.map((stage) => (
                <Option key={stage.value} value={stage.value}>
                  {stage.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Source Select */}
          <Form.Item
            name="source"
            label={<span style={formItemStyle}>Source</span>}
            rules={[{ required: true, message: "Please select source" }]}
          >
            <Select
              placeholder="Select source"
              style={selectStyle}
              popupClassName="custom-select-dropdown"
            >
              {sources.map((source) => (
                <Option key={source.value} value={source.value}>
                  {source.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Status Select */}
          <Form.Item
            name="status"
            label={<span style={formItemStyle}>Status</span>}
          >
            <Select
              placeholder="Select status"
              style={selectStyle}
              popupClassName="custom-select-dropdown"
            >
              {statuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Category Select */}
          <Form.Item
            name="category"
            label={<span style={formItemStyle}>Category</span>}
          >
            <Select
              placeholder="Select category"
              style={selectStyle}
              popupClassName="custom-select-dropdown"
            >
              <Option value="cat1">Category 1</Option>
              <Option value="cat2">Category 2</Option>
            </Select>
          </Form.Item>
        </div>

        {/* Team Members Section - Updated to match ProjectModal */}
        <div style={{ marginBottom: '32px' }}>
          <Form.Item
            name="lead_members"
            label={<span style={formItemStyle}>Team Members</span>}
            style={{ marginBottom: '16px' }}
          >
            <Select
              mode="multiple"
              placeholder="Select team members"
              style={{
                width: '100%',
                height: 'auto',
                minHeight: '48px'
              }}
              popupClassName="custom-select-dropdown"
              showSearch
              optionFilterProp="children"
              maxTagCount={5}
              maxTagTextLength={15}
              loading={usersLoading}
              open={teamMembersOpen}
              onDropdownVisibleChange={setTeamMembersOpen}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '0 8px',
                    justifyContent: 'flex-end'
                  }}>
                    <Button
                      type="text"
                      icon={<FiUserPlus style={{ fontSize: '16px', color: '#ffffff' }} />}
                      onClick={handleCreateUser}
                      style={{
                        height: '36px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)';
                      }}
                    >
                      Add New User
                    </Button>
                    <Button
                      type="text"
                      icon={<FiShield style={{ fontSize: '16px', color: '#1890ff' }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTeamMembersOpen(false);
                      }}
                      style={{
                        height: '36px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: '#ffffff',
                        border: '1px solid #1890ff',
                        color: '#1890ff',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e6f4ff';
                        e.currentTarget.style.borderColor = '#69b1ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = '#1890ff';
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </>
              )}
            >
              {Array.isArray(users) && users.map(user => {
                const userRole = rolesData?.data?.find(role => role.id === user.role_id);
                const roleStyle = getRoleColor(userRole?.role_name);

                return (
                  <Option key={user.id} value={user.id}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '4px 0'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#e6f4ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1890ff',
                        fontSize: '16px',
                        fontWeight: '500',
                        textTransform: 'uppercase'
                      }}>
                        {user.profilePic ? (
                          <img
                            src={user.profilePic}
                            alt={user.username}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          user.username?.charAt(0) || <FiUser />
                        )}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1
                      }}>
                        <span style={{
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.85)',
                          fontSize: '14px'
                        }}>
                          {user.username}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div
                          className="role-indicator"
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: roleStyle.color,
                            boxShadow: `0 0 8px ${roleStyle.color}`,
                            animation: 'pulse 2s infinite'
                          }}
                        />
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: roleStyle.bg,
                          color: roleStyle.color,
                          border: `1px solid ${roleStyle.border}`,
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}>
                          {userRole?.role_name || 'User'}
                        </span>
                      </div>
                    </div>
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </div>

        {/* Basic Information - Moved to bottom */}
        <div className="section-title" style={{ marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Basic Information</Text>
        </div>
        <div className="form-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <Form.Item
            name="firstName"
            label={<span style={formItemStyle}>First Name</span>}
          >
            <Input
              prefix={<FiUser style={prefixIconStyle} />}
              placeholder="Enter first name"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={<span style={formItemStyle}>Last Name</span>}
          >
            <Input
              prefix={<FiUser style={prefixIconStyle} />}
              placeholder="Enter last name"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={formItemStyle}>Email</span>}
            rules={[
              { type: "email", message: "Please enter a valid email" }
            ]}
          >
            <Input
              prefix={<FiMail style={prefixIconStyle} />}
              placeholder="Enter email address"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="phoneGroup"
            label={<span style={formItemStyle}>Phone Number</span>}
            className="combined-input-item"
          >
            <Input.Group compact className="phone-input-group">
              <Form.Item name="phoneCode" noStyle initialValue={defaultPhoneCode}>
                <Select
                  style={{ width: '120px' }}
                  className="phone-code-select"
                  dropdownMatchSelectWidth={120}
                  suffixIcon={<FiChevronDown size={14} />}
                  popupClassName="custom-select-dropdown"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children?.props?.children[0]?.props?.children?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {countries?.map((country) => (
                    <Option key={country.id} value={country.phoneCode.replace('+', '')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>{country.countryCode}</span>
                        <span style={{ fontSize: '14px' }}>+{country.phoneCode.replace('+', '')}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="telephone"
                noStyle
              >
                <InputNumber
                  style={{ width: 'calc(100% - 100px)' }}
                  placeholder="Enter phone number"
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="company_name"
            label={<span style={formItemStyle}>Company Name</span>}
          >
            <Input
              prefix={<FiBriefcase style={prefixIconStyle} />}
              placeholder="Enter company name"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="address"
            label={<span style={formItemStyle}>Address</span>}
          >
            <Input
              prefix={<FiMapPin style={prefixIconStyle} />}
              placeholder="Enter address"
              style={inputStyle}
            />
          </Form.Item>
        </div>

        <Divider style={{ margin: "24px 0" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "0 24px 24px"
          }}
        >
          <Button
            size="large"
            onClick={handleCancel}
            style={{
              padding: "8px 24px",
              height: "44px",
              borderRadius: "10px",
              border: "1px solid #e6e8eb",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={isLoading}
            style={{
              padding: "8px 24px",
              height: "44px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Create Lead
          </Button>
        </div>
      </Form>

      {/* Add CreateUser Modal */}
      <CreateUser
        visible={isCreateUserVisible}
        onCancel={() => setIsCreateUserVisible(false)}
        onSubmit={handleCreateUserSuccess}
      />

      <style jsx global>{`
        .lead-form-modal {
          .currency-select, .phone-code-select {
            cursor: pointer;
            .ant-select-selector {
              padding: 8px 8px !important;
              height: 48px !important;
            }
            
            .ant-select-selection-search {
              input {
                height: 100% !important;
                color: #fff !important;
              }
            }

            .ant-select-selection-item {
              padding-right: 20px !important;
              font-weight: 500 !important;
              color: #fff !important;
            }

            .ant-select-selection-placeholder {
              color: #9CA3AF !important;
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

          .value-input-group, .phone-input-group {
            display: flex !important;
            align-items: stretch !important;

            .ant-select {
              .ant-select-selector {
                height: 100% !important;
                border-top-right-radius: 0 !important;
                border-bottom-right-radius: 0 !important;
              }
            }

            .ant-input {
              border-top-left-radius: 0 !important;
              border-bottom-left-radius: 0 !important;
            }
          }

          .ant-select:not(.ant-select-customize-input) .ant-select-selector {
            background-color: #f8fafc !important;
            border: 1px solid #e6e8eb !important;
            border-radius: 10px !important;
            min-height: 48px !important;
            padding: 8px!important;
            display: flex !important;
            align-items: center !important;
          }

          .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
            border-color: #1890ff !important;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
          }

          .ant-select-single .ant-select-selector .ant-select-selection-item,
          .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
            line-height: 32px !important;
            height: 32px !important;
            transition: all 0.3s !important;
            display: flex !important;
            align-items: center !important;
          }

          .ant-select-multiple {
            .ant-select-selector {
              min-height: 48px !important;
              height: auto !important;
              padding: 4px 8px !important;
              background-color: #f8fafc !important;
              border: 1px solid #e6e8eb !important;
              border-radius: 10px !important;
              display: flex !important;
              align-items: flex-start !important;
              flex-wrap: wrap !important;
            }

            .ant-select-selection-item {
              height: 32px !important;
              line-height: 30px !important;
              background: #f0f7ff !important;
              border: 1px solid #91caff !important;
              border-radius: 6px !important;
              color: #0958d9 !important;
              font-size: 13px !important;
              margin: 4px !important;
              padding: 0 8px !important;
              display: flex !important;
              align-items: center !important;
            }

            .ant-select-selection-search {
              margin: 4px !important;
            }

            .ant-select-selection-placeholder {
              padding: 8px !important;
            }
          }

          .ant-select-dropdown {
            .ant-select-item-option-content {
              white-space: normal !important;
              word-break: break-word !important;
            }
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.8;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          .role-indicator {
            animation: pulse 2s infinite;
          }
        }
      `}</style>
    </Modal>
  );
};

export default CreateLead;