import React from "react";
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
} from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useCreateLeadMutation, useGetLeadsQuery } from "./services/LeadApi";
import { useGetAllCurrenciesQuery, useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';

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

  const { data: currencies = [] } = useGetAllCurrenciesQuery({
    page: 1,
    limit: 100
  });
  const { data: countries = [] } = useGetAllCountriesQuery({
    page: 1,
    limit: 100
  });

  const { defaultCurrency, defaultPhoneCode } = findIndianDefaults(currencies, countries);

  const handleSubmit = async (values) => {
    try {
      // Format phone number with country code
      const formattedPhone = values.telephone ?
        `+${values.phoneCode} ${values.telephone}` :
        null;

      const formData = {
        ...values,
        telephone: formattedPhone,
        // Make sure other null fields have default values
        assigned: values.assigned || [],
        lead_members: values.lead_members || [],
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
    transition: "all 0.3s ease"
  };

  const prefixIconStyle = {
    color: "#1890ff",
    fontSize: "16px",
    marginRight: "8px"
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="pro-modal custom-modal"
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
        className="lead-form"
      >
        <div className="form-grid">
          <Form.Item
            name="firstName"
            label={<span style={formItemStyle}>First Name</span>}
            rules={[{ required: true, message: "Please enter first name" }]}
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
            rules={[{ required: true, message: "Please enter last name" }]}
          >
            <Input
              prefix={<FiUser style={prefixIconStyle} />}
              placeholder="Enter last name"
              style={inputStyle}
            />
          </Form.Item>

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
                <FiUser style={prefixIconStyle} />
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
            name="leadStage"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Lead Stage
              </span>
            }
          >
            <Select
              placeholder="Select lead stage"
              size="large"
              style={{
                borderRadius: "10px",
              }}
            >
              {leadStages?.map((stage) => (
                <Option key={stage.value} value={stage.value}>
                  {stage.label}
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
              >
                <Select
                  style={{ width: '100px' }}
                  className="currency-select"
                  dropdownMatchSelectWidth={false}
                  suffixIcon={<FiChevronDown size={14} />}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const currencyData = currencies.find(c => c.currencyCode === option.value);
                    return (
                      currencyData?.currencyName?.toLowerCase().includes(input.toLowerCase()) ||
                      currencyData?.currencyCode?.toLowerCase().includes(input.toLowerCase())
                    );
                  }}
                  dropdownStyle={{ minWidth: '180px' }}
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                    </div>
                  )}
                >
                  {currencies?.map((currency) => (
                    <Option key={currency.id} value={currency.currencyCode}>
                      <div className="currency-option">
                        <span className="currency-icon">{currency.currencyIcon}</span>
                        <div className="currency-details">
                          <span className="currency-code">{currency.currencyCode}</span>
                          <span className="currency-name">{currency.currencyName}</span>
                        </div>
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
                <Input
                  style={{ width: 'calc(100% - 100px)' }}
                  placeholder="Enter amount"
                  prefix={<FiDollarSign style={prefixIconStyle} />}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="phoneGroup"
            label={<span style={formItemStyle}>Phone Number</span>}
            className="combined-input-item"
          >
            <Input.Group compact className="phone-input-group">
              <Form.Item
                name="phoneCode"
                noStyle
                initialValue={defaultPhoneCode}
              >
                <Select
                  style={{ width: '100px' }}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  optionFilterProp="children"
                  className="phone-code-select"
                  suffixIcon={<FiChevronDown size={14} />}
                  filterOption={(input, option) => {
                    const countryData = countries.find(c => c.phoneCode.replace('+', '') === option.value);
                    return (
                      countryData?.countryName?.toLowerCase().includes(input.toLowerCase()) ||
                      countryData?.countryCode?.toLowerCase().includes(input.toLowerCase()) ||
                      countryData?.phoneCode?.includes(input)
                    );
                  }}
                  dropdownStyle={{ minWidth: '200px' }}
                >
                  {countries?.map((country) => (
                    <Option key={country.id} value={country.phoneCode.replace('+', '')}>
                      <div className="phone-code-option">
                        <div className="phone-code-main">
                          <span className="phone-code">+{country.phoneCode.replace('+', '')}</span>
                          <span className="country-code">{country.countryCode}</span>
                        </div>
                        <span className="country-name">{country.countryName}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="telephone"
                noStyle
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input
                  style={{ width: 'calc(100% - 100px)' }}
                  placeholder="Enter phone number"
                  prefix={<FiPhone style={prefixIconStyle} />}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={formItemStyle}>Email</span>}
            rules={[
              { required: true, message: "Please enter email" },
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
            name="assigned"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Assigned To
              </span>
            }
          >
            <Select
              placeholder="Select assignee"
              size="large"
              //   loading={isLoadingLeads}
              style={{
                borderRadius: "10px",
              }}
            >
              {leads?.map((lead) => (
                <Option key={lead.id} value={lead.id}>
                  {lead.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="lead_members"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Lead Members
              </span>
            }
          >
            <Select
              mode="multiple"
              placeholder="Select lead members"
              size="large"
              //   loading={isLoadingLeads}
              style={{
                borderRadius: "10px",
              }}
            >
              {leads?.map((lead) => (
                <Option key={lead.id} value={lead.id}>
                  {lead.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="source"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Source
              </span>
            }
          >
            <Select
              placeholder="Select source"
              size="large"
              style={{
                borderRadius: "10px",
              }}
            >
              {sources.map((source) => (
                <Option key={source.value} value={source.value}>
                  {source.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Category
              </span>
            }
          >
            <Select
              placeholder="Select category"
              size="large"
              style={{
                borderRadius: "10px",
              }}
            >
              <Option value="cat1">Category 1</Option>
              <Option value="cat2">Category 2</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tags"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Tags
              </span>
            }
          >
            <Select
              mode="tags"
              placeholder="Add tags"
              size="large"
              style={{
                borderRadius: "10px",
              }}
            >
              <Option value="tag1">Tag 1</Option>
              <Option value="tag2">Tag 2</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="files"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Files
              </span>
            }
          >
            <Select
              mode="multiple"
              placeholder="Select files"
              size="large"
              style={{
                borderRadius: "10px",
              }}
            >
              <Option value="file1">File 1</Option>
              <Option value="file2">File 2</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Status
              </span>
            }
          >
            <Select
              placeholder="Select status"
              size="large"
              style={{
                borderRadius: "10px",
              }}
            >
              {statuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="company_name"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Company Name
              </span>
            }
          >
            <Input
              prefix={
                <FiBriefcase style={prefixIconStyle} />
              }
              placeholder="Enter company name"
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
            name="client_id"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Client ID
              </span>
            }
          >
            <Input
              prefix={<FiHash style={prefixIconStyle} />}
              placeholder="Enter client ID"
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
    </Modal>
  );
};

export default CreateLead;
