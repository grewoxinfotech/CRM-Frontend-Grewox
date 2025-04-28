import React, { useEffect, useRef, useState } from "react";
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
  DatePicker,
  Tabs,
} from "antd";
import {
  FiUser,
  FiMail,
  FiX,
  FiBriefcase,
  FiDollarSign,
  FiMapPin,
  FiChevronDown,
  FiUsers,
  FiUserPlus,
  FiCalendar,
  FiInfo,
} from "react-icons/fi";
import { useCreateDealMutation, useGetDealsQuery } from "./services/dealApi";
import { PlusOutlined } from "@ant-design/icons";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import AddPipelineModal from "../crmsystem/pipeline/AddPipelineModal";
import "./Deal.scss";
import { useGetSourcesQuery, useGetCategoriesQuery } from "../crmsystem/souce/services/SourceApi";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useUpdateLeadMutation } from "../lead/services/LeadApi";
import { useGetContactsQuery, useCreateContactMutation } from "../contact/services/contactApi";
import { useGetCompanyAccountsQuery } from "../companyacoount/services/companyAccountApi";
import AddCompanyModal from "../companyacoount/CreateCompanyAccount";
import AddContactModal from "../contact/CreateContact";
import {
  useGetAllCountriesQuery,
  useGetAllCurrenciesQuery,
} from "../../settings/services/settingsApi";
const { Text } = Typography;
const { Option } = Select;

const findIndianDefaults = (currencies, countries) => {
  const inrCurrency = currencies?.find((c) => c.currencyCode === "INR");
  const indiaCountry = countries?.find((c) => c.countryCode === "IN");
  return {
    defaultCurrency: inrCurrency?.currencyCode || "INR",
    defaultPhoneCode: indiaCountry?.id || undefined,
  };
};

const CreateDeal = ({ open, onCancel, leadData }) => {
  const loggedInUser = useSelector(selectCurrentUser);

  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);
  const selectRef = useRef(null);
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const [isAddCompanyVisible, setIsAddCompanyVisible] = useState(false);
  const [isAddContactVisible, setIsAddContactVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const [manualValue, setManualValue] = useState(0);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newCompanyName, setNewCompanyName] = useState("");

  const [createDeal, { isLoading: isCreatingDeal }] = useCreateDealMutation();
  const [updateLead, { isLoading: isUpdatingLead }] = useUpdateLeadMutation();
  const [createContact] = useCreateContactMutation();

  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);
  const { data: dealStages } = useGetLeadStagesQuery();
  const { data: pipelinesData } = useGetPipelinesQuery();
  const pipelines = pipelinesData || [];
  const sources = sourcesData?.data || [];
  const categories = categoriesData?.data || [];

  const {
    data: companyAccountsResponse = { data: [] },
    isLoading: isCompanyAccountsLoading,
  } = useGetCompanyAccountsQuery();
  const {
    data: contactsResponse,
    isLoading: isContactsLoading,
    error,
  } = useGetContactsQuery();
  const { data: currencies = [] } = useGetAllCurrenciesQuery({
    page: 1,
    limit: 100,
  });
  const { data: countries = [] } = useGetAllCountriesQuery({
    page: 1,
    limit: 100,
  });

  const { defaultCurrency, defaultPhoneCode } = findIndianDefaults(
    currencies,
    countries
  );

  // Add state to track selected pipeline
  const [selectedPipeline, setSelectedPipeline] = useState(null);

  // Filter stages based on selected pipeline
  const filteredStages =
    dealStages?.filter(
      (stage) =>
        stage.stageType === "deal" &&
        (!selectedPipeline || stage.pipeline === selectedPipeline)
    ) || [];

  // Get default stage for selected pipeline
  const getDefaultStage = (pipelineId) => {
    return dealStages?.find(
      (stage) => stage.stageType === "deal" &&
        stage.pipeline === pipelineId &&
        stage.isDefault
    )?.id;
  };

  // Handle pipeline selection change
  const handlePipelineChange = (value) => {
    setSelectedPipeline(value);
    // Set the default stage for this pipeline
    const defaultStage = getDefaultStage(value);
    form.setFieldsValue({
      stage: defaultStage
    });
  };

  // Handle manual value change
  const handleValueChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setManualValue(numValue);
    form.setFieldsValue({ value: numValue });
  };

  // Modify the useEffect to handle lead conversion properly
  useEffect(() => {
    if (leadData && open) {
      // Find the country details
      const countryDetails = countries.find((c) => c.id === leadData.phoneCode);

      // Find if the company exists in companyAccounts
      const existingCompany = companyAccountsResponse?.data?.find(
        (c) => c.company_name?.toLowerCase() === leadData.company?.toLowerCase()
      );

      // Get default stage for the pipeline
      const defaultStage = getDefaultStage(leadData.pipeline);

      form.setFieldsValue({
        dealTitle: leadData.leadTitle,
        currency: leadData.currency,
        phoneCode: countryDetails?.phoneCode?.replace("+", ""),
        value: leadData.value,
        source: leadData.source,
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone?.replace(/^\+\d+\s/, ""),
        address: leadData.address,
        company_name: existingCompany?.id || undefined,
        leadId: leadData.id,
        pipeline: leadData.pipeline,
        stage: defaultStage, // Use default deal stage instead of lead stage
      });

      // Set manual value for value field
      setManualValue(leadData.value || 0);

      // Set selected pipeline if lead data has pipeline
      if (leadData.pipeline) {
        setSelectedPipeline(leadData.pipeline);
      }
    }
  }, [
    leadData,
    form,
    open,
    currencies,
    countries,
    companyAccountsResponse?.data,
  ]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList([]);
    }
  }, [open, form]);

  const { data: dealsData } = useGetDealsQuery();

  const handleSubmit = async (values) => {
    try {
      // Check if deal with same title already exists
      const dealExists = dealsData?.data?.some(
        deal => deal.dealTitle.toLowerCase() === values.dealTitle.toLowerCase()
      );

      if (dealExists) {
        message.error("A deal with this title already exists");
        return;
      }

      let contactId;
      console.log('Form Values:', values); // Debug log

      // Only proceed with contact creation if deal name is unique
      if (contactMode === 'new' &&
        (values.firstName || values.lastName || values.email || values.telephone || values.address)) {
        try {
          // Format phone with country code
          let formattedPhone = '';
          if (values.telephone && values.phoneCode) {
            const selectedCountry = countries.find(c => c.id === values.phoneCode);
            if (selectedCountry) {
              formattedPhone = `+${selectedCountry.phoneCode.replace('+', '')} ${values.telephone}`;
            }
          }

          // Create contact first
          const contactData = {
            first_name: values.firstName || "",
            last_name: values.lastName || "",
            company_name: values.company_name || null,
            email: values.email || "",
            phone: formattedPhone || "",
            contact_source: "deal",
            description: `Contact created from deal form by ${loggedInUser?.username || 'user'}`,
            address: values.address || "",
            client_id: loggedInUser?.client_id,
            contact_owner: loggedInUser?.id
          };

          console.log('Creating contact with data:', contactData); // Debug log

          const contactResponse = await createContact(contactData).unwrap();
          console.log('Contact Creation Response:', contactResponse); // Debug log

          if (contactResponse?.id) {
            contactId = contactResponse.id;
            message.success('Contact created successfully');
          } else if (contactResponse?.data?.id) {
            contactId = contactResponse.data.id;
            message.success('Contact created successfully');
          } else {
            throw new Error('Contact creation failed - no ID returned');
          }
        } catch (error) {
          console.error('Contact Creation Error:', error);
          message.error(error.data?.message || 'Failed to create contact');
          return;
        }
      } else if (contactMode === 'existing') {
        contactId = values.firstName; // In existing mode, firstName field contains the contact ID
      }

      // Format phone number for deal
      const formattedPhone = values.telephone
        ? `+${values.phoneCode} ${values.telephone}`
        : null;

      const dealData = {
        dealTitle: values.dealTitle,
        email: values.email,
        phone: formattedPhone,
        pipeline: values.pipeline,
        stage: values.stage,
        value: parseFloat(values.value) || 0,
        currency: values.currency,
        closedDate: values.closedDate
          ? new Date(values.closedDate).toISOString()
          : null,
        source: values.source,
        company_id: values.company_name || null,
        contact_id: contactId || null,
        category: values.category,
        address: values.address,
        leadId: leadData?.id,
      };

      console.log('Creating deal with data:', dealData); // Debug log

      // Create the deal
      const dealResponse = await createDeal(dealData).unwrap();

      // If this deal was created from a lead, update the lead's is_converted status
      if (leadData?.id) {
        try {
          await updateLead({
            id: leadData.id,
            data: {
              is_converted: true,
              dealId: dealResponse.id,
            },
          }).unwrap();
        } catch (updateError) {
          console.error("Error updating lead:", updateError);
          message.warning(
            "Deal created but failed to update lead status. Please refresh the page."
          );
        }
      }

      message.success("Deal created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Create Deal Error:", error);
      message.error(
        error?.data?.message || "Failed to create deal. Please try again."
      );
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  const handleAddPipelineClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setIsAddPipelineVisible(true);
  };

  // Modify handleAddCompanyClick
  const handleAddCompanyClick = (e) => {
    if (e) e.stopPropagation();
    setIsAddCompanyVisible(true);
    // Set the company name from lead data
    setNewCompanyName(leadData?.company || "");
  };

  const handleAddContactClick = (e) => {
    e.stopPropagation();
    setIsAddContactVisible(true);
  };

  // Add these consistent styles from CreateLead
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

  const selectStyle = {
    width: "100%",
    height: "48px",
  };

  // Add multiSelectStyle for multiple select components
  const multiSelectStyle = {
    ...selectStyle,
    "& .ant-select-selector": {
      minHeight: "48px !important",
      height: "auto !important",
      padding: "4px 12px !important",
      backgroundColor: "#f8fafc !important",
      border: "1px solid #e6e8eb !important",
      borderRadius: "10px !important",
    },
    "& .ant-select-selection-item": {
      height: "32px",
      lineHeight: "30px !important",
      borderRadius: "6px",
      background: "#E5E7EB",
      border: "none",
      margin: "4px",
    },
  };

  const handleCompanyChange = (companyId) => {
    console.log("Selected Company ID:", companyId);

    // Set the company_name field with the selected company ID
    form.setFieldsValue({
      company_name: companyId,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      address: undefined,
    });

    // Filter contacts based on selected company
    if (companyId && contactsResponse?.data) {
      const filteredContacts = contactsResponse.data.filter(
        contact => contact.company_name === companyId
      );
      setFilteredContacts(filteredContacts);
    } else {
      setFilteredContacts([]);
    }
  };

  const handleFirstNameChange = (contactId) => {
    // Find the selected contact from all contacts
    const contact = contactsResponse?.data?.find((c) => c.id === contactId);
    if (contact) {
      // Get current form values
      const currentValues = form.getFieldsValue();

      // Set the form values including company if it exists
      form.setFieldsValue({
        firstName: contact.id, // Set contact ID for form submission
        lastName: contact.last_name, // Set actual last name for display
        email: contact.email,
        phone: contact.phone?.replace(/^\+\+91\s/, ""),
        address: contact.address,
        // Only set company_name if contact has a company, otherwise clear it
        company_name: contact.company_name || undefined,
      });
      setSelectedContact(contact);
    }
  };

  const handleClearCompany = () => {
    form.setFieldsValue({
      company_name: undefined,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      address: undefined,
    });
    setFilteredContacts([]); // Reset filtered contacts to show all contacts
    setSelectedContact(null);
  };

  const handleClearContact = () => {
    form.setFieldsValue({
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      address: undefined,
    });
    setSelectedContact(null);
  };

  // Add this function to handle company creation success
  const handleCompanyCreationSuccess = (newCompany) => {
    setIsAddCompanyVisible(false);
    form.setFieldsValue({
      company_name: newCompany.id,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      address: undefined,
    });
    message.success("Company added successfully");
    setNewCompanyName(""); // Reset the new company name
  };

  // Add state to track contact mode
  const [contactMode, setContactMode] = useState('existing');

  return (
    <>
      <Modal
        title={null}
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose={true}
        centered
        closeIcon={null}
        className="pro-modal custom-modal deal-form-modal"
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
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.45)",
          },
          content: {
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
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

        <Spin spinning={isCreatingDeal || isUpdatingLead}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="deal-form custom-form"
            style={{ padding: "24px" }}
          >
            {/* Deal Details Section */}
            <div className="section-title" style={{ marginBottom: "16px" }}>
              <Text strong style={{ fontSize: "16px", color: "#1f2937" }}>
                Deal Details
              </Text>
            </div>

            <div
              className="form-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              <Form.Item
                name="dealTitle"
                label={<span style={formItemStyle}>Deal Title <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[
                  { required: true, message: "Deal title is required" },
                  {
                    min: 3,
                    message: "Deal title must be at least 3 characters",
                  },
                  {
                    max: 100,
                    message: "Deal title cannot exceed 100 characters",
                  }
                ]}
              >
                <Input
                  prefix={<FiUser style={prefixIconStyle} />}
                  placeholder="Enter deal title"
                  style={inputStyle}
                />
              </Form.Item>

              <Form.Item
                name="pipeline"
                label={<span style={formItemStyle}>Pipeline <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: "Pipeline is required" }]}
              >
                <Select
                  ref={selectRef}
                  open={dropdownOpen}
                  onDropdownVisibleChange={setDropdownOpen}
                  placeholder="Select pipeline"
                  onChange={handlePipelineChange}
                  style={selectStyle}
                  suffixIcon={<FiChevronDown size={14} />}
                  dropdownRender={(menu) => (
                    <div onClick={(e) => e.stopPropagation()}>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <div
                        style={{
                          padding: '8px 12px',
                          display: 'flex',
                          justifyContent: 'center'
                        }}
                      >
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddPipelineClick}
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
                          Add Pipeline
                        </Button>
                      </div>
                    </div>
                  )}
                >
                  {pipelines.map((pipeline) => (
                    <Option key={pipeline.id} value={pipeline.id}>
                      {pipeline.pipeline_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Hidden stage field that will be set automatically */}
              <Form.Item name="stage" hidden={true}>
                <Input type="hidden" />
              </Form.Item>

              <Form.Item
                name="dealValue"
                label={<span style={formItemStyle}>Deal Value <span style={{ color: '#ff4d4f' }}>*</span></span>}
                className="combined-input-item"
              >
                <Input.Group compact className="value-input-group">
                  <Form.Item
                    name="currency"
                    noStyle
                    initialValue={defaultCurrency}
                    rules={[
                      { required: true, message: "Currency is required" },
                    ]}
                  >
                    <Select
                      style={{ width: "120px" }}
                      className="currency-select"
                      dropdownMatchSelectWidth={false}
                      suffixIcon={<FiChevronDown size={14} />}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) => {
                        const currencyData = currencies.find(
                          (c) => c.currencyCode === option.value
                        );
                        return (
                          currencyData?.currencyName
                            ?.toLowerCase()
                            .includes(input.toLowerCase()) ||
                          currencyData?.currencyCode
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        );
                      }}
                      dropdownStyle={{ minWidth: "180px" }}
                      popupClassName="custom-select-dropdown"
                    >
                      {currencies?.map((currency) => (
                        <Option key={currency.id} value={currency.currencyCode}>
                          <div className="currency-option">
                            <span className="currency-icon">
                              {currency.currencyIcon}
                            </span>
                            <div className="currency-details">
                              <span className="currency-code">
                                {currency.currencyCode}
                              </span>
                              <span className="currency-name">
                                {currency.currencyName}
                              </span>
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="value"
                    noStyle
                    rules={[
                      { required: true, message: "Deal value is required" },
                      {
                        type: 'number',
                        min: 0,
                        message: "Deal value must be greater than or equal to 0"
                      }
                    ]}
                  >
                    <Input
                      style={{ width: "calc(100% - 120px)" }}
                      placeholder="Enter amount"
                      type="number"
                      onChange={(e) => handleValueChange(e.target.value)}
                    />
                  </Form.Item>
                </Input.Group>
              </Form.Item>

              <Form.Item
                name="source"
                label={<span style={formItemStyle}>Source <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: "Source is required" }]}
              >
                <Select
                  placeholder="Select source"
                  style={selectStyle}
                  popupClassName="custom-select-dropdown"
                  listHeight={100}
                  dropdownStyle={{
                    maxHeight: "100px",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    scrollBehavior: "smooth",
                  }}
                >
                  {sources.map((source) => (
                    <Option key={source.id} value={source.id}>
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
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="category"
                label={<span style={formItemStyle}>Category <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: "Category is required" }]}
              >
                <Select
                  placeholder="Select category"
                  style={selectStyle}
                  allowClear
                  popupClassName="custom-select-dropdown"
                >
                  {categories?.map((category) => (
                    <Option key={category.id} value={category.id}>
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
                            backgroundColor: category.color || "#1890ff",
                          }}
                        />
                        {category.name}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="closedDate"
                label={<span style={formItemStyle}>Expected Close Date <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[
                  {
                    required: true,
                    message: "Expected close date is required"
                  }
                ]}
              >
                <DatePicker
                  size="large"
                  format="DD-MM-YYYY"
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    height: "48px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e6e8eb",
                  }}
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf("day");
                  }}
                  placeholder="Select date"
                  suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
                  superNextIcon={null}
                  superPrevIcon={null}
                />
              </Form.Item>
            </div>

            {/* Basic Information Section */}
            <div style={{ margin: '24px 0' }}>
              <Text strong style={{ fontSize: '16px', color: '#1f2937', marginBottom: '16px', display: 'block' }}>
                Basic Information
              </Text>

              <Tabs
                activeKey={contactMode}
                onChange={(value) => {
                  setContactMode(value);
                  form.setFieldsValue({
                    company_name: undefined,
                    firstName: undefined,
                    lastName: undefined,
                    email: undefined,
                    phone: undefined,
                    address: undefined,
                  });
                }}
                items={[
                  {
                    key: 'existing',
                    label: (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px'
                      }}>
                        <FiUserPlus style={{ fontSize: '16px' }} />
                        <span>Select Existing</span>
                      </div>
                    ),
                  },
                  {
                    key: 'new',
                    label: (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px'
                      }}>
                        <FiUser style={{ fontSize: '16px' }} />
                        <span>Add New</span>
                      </div>
                    ),
                  }
                ]}
                style={{
                  marginBottom: '24px'
                }}
              />
            </div>

            <div className="form-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '32px'
            }}>
              {contactMode === 'existing' ? (
                // Show existing contact/company selection fields
                <>
                  <Form.Item
                    name="company_name"
                    label={<span style={formItemStyle}>Company Name</span>}
                  >
                    <Select
                      placeholder="Select company"
                      onChange={handleCompanyChange}
                      style={selectStyle}
                      allowClear
                      suffixIcon={null}
                      dropdownRender={(menu) => (
                        <div onClick={(e) => e.stopPropagation()}>
                          {menu}
                          <Divider style={{ margin: '8px 0' }} />
                          <div style={{
                            padding: '8px 12px',
                            display: 'flex',
                            justifyContent: 'center'
                          }}>
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
                              Add Company
                            </Button>
                          </div>
                        </div>
                      )}
                    >
                      {companyAccountsResponse?.data?.map((company) => (
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

                  <Form.Item
                    name="firstName"
                    label={<span style={formItemStyle}>Contact Name</span>}
                  >
                    <Select
                      placeholder="Select contact name"
                      style={selectStyle}
                      suffixIcon={null}
                      showSearch
                      allowClear
                      onChange={handleFirstNameChange}
                      filterOption={(input, option) => {
                        const contact = contactsResponse?.data?.find(
                          (c) => c.id === option.value
                        );
                        if (!contact) return false;
                        const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase();
                        const companyName = companyAccountsResponse?.data?.find(
                          (c) => c.id === contact.company_name
                        )?.company_name?.toLowerCase() || '';
                        return fullName.includes(input.toLowerCase()) ||
                          companyName.includes(input.toLowerCase());
                      }}
                      dropdownRender={(menu) => (
                        <div onClick={(e) => e.stopPropagation()}>
                          {menu}
                          <Divider style={{ margin: '8px 0' }} />
                          <div style={{
                            padding: '8px 12px',
                            display: 'flex',
                            justifyContent: 'center'
                          }}>
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={handleAddContactClick}
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
                              Add Contact
                            </Button>
                          </div>
                        </div>
                      )}
                    >
                      {contactsResponse?.data?.map((contact) => {
                        const companyName = companyAccountsResponse?.data?.find(
                          (c) => c.id === contact.company_name
                        )?.company_name || "No Company";

                        return (
                          <Option key={contact.id} value={contact.id}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '4px 0'
                            }}>
                              <FiUser style={{ color: '#1890FF', fontSize: '16px' }} />
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                flex: 1,
                                minWidth: 0
                              }}>
                                <span style={{
                                  fontWeight: '500',
                                  color: '#111827',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>{`${contact.first_name || ''} ${contact.last_name || ''}`}</span>
                                <span style={{
                                  color: '#6B7280',
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  <FiBriefcase style={{ fontSize: '12px' }} />
                                  {companyName}
                                </span>
                              </div>
                            </div>
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </>
              ) : (
                // Show manual entry fields
                <>
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
                      {
                        type: "email",
                        message: "Please enter a valid email",
                      }
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
                          dropdownMatchSelectWidth={false}
                          suffixIcon={<FiChevronDown size={14} />}
                          popupClassName="custom-select-dropdown"
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) => {
                            const country = countries?.find(c => c.id === option.value);
                            return (
                              country?.countryName?.toLowerCase().includes(input.toLowerCase()) ||
                              country?.countryCode?.toLowerCase().includes(input.toLowerCase()) ||
                              country?.phoneCode?.includes(input)
                            );
                          }}
                        >
                          {countries?.map((country) => (
                            <Option key={country.id} value={country.id}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        <Input
                          style={{ width: 'calc(100% - 120px)', padding: '0 16px' }}
                          placeholder="Enter phone number"
                        />
                      </Form.Item>
                    </Input.Group>
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
                </>
              )}
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
                onClick={handleCancel}
                size="large"
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
                htmlType="submit"
                loading={isCreatingDeal || isUpdatingLead}
                size="large"
                style={{
                  padding: "8px 24px",
                  height: "44px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                  border: "none",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Create Deal
              </Button>
            </div>
          </Form>
        </Spin>
      </Modal>

      <AddPipelineModal
        isOpen={isAddPipelineVisible}
        onClose={() => setIsAddPipelineVisible(false)}
      />

      <AddCompanyModal
        open={isAddCompanyVisible}
        onCancel={() => setIsAddCompanyVisible(false)}
        loggedInUser={loggedInUser}
        companyAccountsResponse={companyAccountsResponse}
        onSuccess={handleCompanyCreationSuccess}
        initialCompanyName={newCompanyName}
      />

      <AddContactModal
        open={isAddContactVisible}
        onCancel={() => setIsAddContactVisible(false)}
        loggedInUser={loggedInUser}
        companyAccountsResponse={companyAccountsResponse}
        onsubmit={handleAddContactClick}
      />

      <style jsx global>{`
        .deal-form-modal {
          .currency-select,
          .phone-code-select {
            cursor: pointer;
            .ant-select-selector {
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
              font-weight: 500 !important;
            }

              .ant-select-selection-placeholder {
                color: #9ca3af !important;
              }
          }

          .currency-select .ant-select-selector {
            background: linear-gradient(
              135deg,
              #1890ff 0%,
              #096dd9 100%
            ) !important;
            border: none !important;

            .ant-select-selection-item {
              color: white !important;
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
                background-color: #e6f4ff !important;
                font-weight: 500 !important;
                color: #1890ff !important;
              }

              &-option-active {
                background-color: #f3f4f6 !important;
              }
            }

            .ant-select-item-option-content {
              font-size: 14px !important;
            }

            .ant-select-item-empty {
              color: #9ca3af !important;
            }
          }

          .value-input-group,
          .phone-input-group {
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
            padding: 8px !important;
            display: flex !important;
            align-items: center !important;
          }

          .ant-select-focused:not(.ant-select-disabled).ant-select:not(
              .ant-select-customize-input
            )
            .ant-select-selector {
            border-color: #1890ff !important;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
          }

          .ant-select-single .ant-select-selector .ant-select-selection-item,
          .ant-select-single
            .ant-select-selector
            .ant-select-selection-placeholder {
            line-height: 32px !important;
            height: 32px !important;
            transition: all 0.3s !important;
            display: flex !important;
            align-items: center !important;
          }

          /* Add styles for multiple select (team members) */
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
              // flex-wrap: wrap !important;
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

          /* Team member option styling */
          .team-member-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;

            .member-name {
              font-weight: 500;
              color: #1f2937;
            }

            .member-role {
              font-size: 12px;
              padding: 2px 6px;
              border-radius: 4px;
              text-transform: capitalize;
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

          /* Add these new styles for product selection */
          .ant-select-multiple {
            .ant-select-selection-item {
              height: auto !important;
              background: #f0f7ff !important;
              border: 1px solid #91caff !important;
              border-radius: 8px !important;
              margin: 4px !important;
              display: flex !important;
              align-items: center !important;
              gap: 12px !important;

              /* Product image container */
              .ant-select-selection-item-content > div {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
              }

              /* Product details container */
              .ant-select-selection-item-content > div > div:last-child {
                display: flex !important;
                flex-direction: column !important;
                gap: 2px !important;
              }

              /* Product name */
              .ant-select-selection-item-content span:first-child {
                color: #1f2937 !important;
                font-weight: 500 !important;
                font-size: 14px !important;
                line-height: 1.4 !important;
              }

              /* Product price */
              .ant-select-selection-item-content span:last-child {
                color: #6b7280 !important;
                font-size: 12px !important;
                line-height: 1.2 !important;
              }

              /* Product image */
              img {
                width: 32px !important;
                height: 32px !important;
                border-radius: 4px !important;
                object-fit: cover !important;
              }

              /* Remove button */
              .ant-select-selection-item-remove {
                color: #6b7280 !important;
                font-size: 14px !important;
                margin-left: auto !important;
                padding: 4px !important;
                border-radius: 4px !important;

                &:hover {
                  background-color: #eef2ff !important;
                  color: #4b5563 !important;
                }
              }
            }

            /* Adjust the selector height when items are selected */
            .ant-select-selector {
              height: auto !important;
              min-height: 48px !important;
              padding: 4px 8px !important;
            }

            /* Style for the search input */
            .ant-select-selection-search {
              margin: 4px !important;
              padding: 4px !important;
            }
          }

          /* Dropdown styles for product options */
          .ant-select-dropdown {
            .ant-select-item-option-content {
              > div {
                padding: 8px 0 !important;
              }

              /* Product option container */
              div[style*="display: flex"] {
                gap: 12px !important;
              }

              /* Product image in dropdown */
              div[style*="width: 32px"] {
                flex-shrink: 0 !important;
              }

              /* Product details in dropdown */
              div[style*="flex-direction: column"] {
                flex-grow: 1 !important;

                span:first-child {
                  color: #1f2937 !important;
                  font-weight: 500 !important;
                  margin-bottom: 2px !important;
                }

                span:last-child {
                  color: #6b7280 !important;
                  font-size: 12px !important;
                }
              }
            }

            .ant-select-item-option-selected {
              .ant-select-item-option-content {
                > div {
                  background-color: #f0f7ff !important;
                }
              }
            }
          }

          .product-select {
            .ant-select-selector {
              height: auto !important;
              min-height: 48px !important;
              padding: 4px 8px !important;
              display: flex !important;
              align-items: flex-start !important;
              flex-wrap: wrap !important;
              gap: 4px !important;
              background-color: #f8fafc !important;
              border: 1px solid #e6e8eb !important;
              border-radius: 10px !important;
              transition: all 0.3s ease !important;

              &:hover {
                border-color: #40a9ff !important;
              }

              &.ant-select-focused {
                border-color: #1890ff !important;
                box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
              }
            }

            .ant-select-selection-item {
              height: auto !important;
              margin: 4px !important;
              padding: 4px 8px !important;
              background: #f0f7ff !important;
              border: 1px solid #91caff !important;
              border-radius: 6px !important;
              display: flex !important;
              align-items: center !important;
              gap: 8px !important;

              .ant-select-selection-item-content {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
              }

              img {
                width: 32px !important;
                height: 32px !important;
                border-radius: 4px !important;
                object-fit: cover !important;
              }

              .ant-select-selection-item-remove {
                color: #6b7280 !important;
                margin-left: auto !important;
                padding: 4px !important;
                border-radius: 4px !important;

                &:hover {
                  background-color: #eef2ff !important;
                  color: #4b5563 !important;
                }
              }
            }

            .ant-select-selection-placeholder {
              line-height: 38px !important;
              color: #9ca3af !important;
            }

            .ant-select-selection-search {
              margin: 0 !important;
              padding: 0 !important;

              input {
                height: 38px !important;
              }
            }

            &.ant-select-focused .ant-select-selector {
              border-color: #1890ff !important;
              box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
            }
          }
        }
      `}</style>
    </>
  );
};

export default CreateDeal;
