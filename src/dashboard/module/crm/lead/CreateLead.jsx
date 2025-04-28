import React, { useState, useEffect } from "react";
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
  Popconfirm,
  Switch,
  Radio,
  Segmented,
  Tabs,
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
  FiTrash2,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useCreateLeadMutation, useGetLeadsQuery } from "./services/LeadApi";
import { useGetAllCurrenciesQuery, useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';
import { useGetCompanyAccountsQuery } from '../companyacoount/services/companyAccountApi';
import { useGetContactsQuery, useCreateContactMutation } from '../contact/services/contactApi';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import CreateUser from '../../user-management/users/CreateUser';
import { useGetSourcesQuery, useGetStatusesQuery, useGetCategoriesQuery, useDeleteSourceMutation, useDeleteCategoryMutation } from '../crmsystem/souce/services/SourceApi';
import { useGetLeadStagesQuery } from '../crmsystem/leadstage/services/leadStageApi';
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { PlusOutlined } from '@ant-design/icons';
import AddPipelineModal from "../crmsystem/pipeline/AddPipelineModal";
import AddSourceModal from "../crmsystem/souce/AddSourceModal";
import AddCategoryModal from "../crmsystem/souce/AddCategoryModal";
import AddCompanyModal from "../companyacoount/CreateCompanyAccount";
import AddContactModal from "../contact/CreateContact";

const { Text } = Typography;
const { Option } = Select;

// Find the Indian currency and phone code IDs
const findIndianDefaults = (currencies, countries) => {
  const inrCurrency = currencies?.find(c => c.currencyCode === 'INR');
  const indiaCountry = countries?.find(c => c.countryCode === 'IN');
  return {
    defaultCurrency: inrCurrency?.id || 'JJXdfl6534FX7PNEIC3qJTK',
    defaultPhoneCode: indiaCountry?.id || 'K9GxyQ8rrXQycdLQNkGhczL'
  };
};

const CreateLead = ({
  open,
  onCancel,
  pipelines,
  currencies,
  countries,
  sourcesData,
  statusesData,
  categoriesData,
  initialValues
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);
  const dispatch = useDispatch();
  const [createLead, { isLoading }] = useCreateLeadMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const [isAddSourceVisible, setIsAddSourceVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const selectRef = React.useRef(null);
  const sourceSelectRef = React.useRef(null);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [deleteSource] = useDeleteSourceMutation();
  const [isAddCategoryVisible, setIsAddCategoryVisible] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categorySelectRef = React.useRef(null);
  const [deleteCategory] = useDeleteCategoryMutation();
  const [isAddCompanyVisible, setIsAddCompanyVisible] = useState(false);
  const [isAddContactVisible, setIsAddContactVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [useExistingContact, setUseExistingContact] = useState(true);
  const [contactMode, setContactMode] = useState('existing');
  const [createContact] = useCreateContactMutation();

  // Get stages data
  const { data: stagesData } = useGetLeadStagesQuery();

  // Find others category
  const othersCategory = categoriesData?.data?.find(cat => cat.name.toLowerCase() === "others") || null;

  // Filter stages to only show lead type stages
  const stages = stagesData?.filter(stage => stage.stageType === "lead") || [];

  // Get the pending status ID
  const pendingStatus = statusesData?.data?.find(status => status.name.toLowerCase() === "pending");

  const { defaultCurrency, defaultPhoneCode } = findIndianDefaults(currencies, countries);

  const {
    data: companyAccountsResponse = { data: [] },
    isLoading: isCompanyAccountsLoading,
  } = useGetCompanyAccountsQuery();

  const {
    data: contactsResponse,
    isLoading: isContactsLoading,
  } = useGetContactsQuery();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        currency: initialValues.currency || defaultCurrency,
        phoneCode: initialValues.phoneCode || defaultPhoneCode,
      });
    }
  }, [initialValues, form, defaultCurrency, defaultPhoneCode]);

  useEffect(() => {
    // Watch for changes in contact_id field
    const contactId = form.getFieldValue('contact_id');
    if (contactId) {
      const selectedContact = contactsResponse?.data?.find(c => c.id === contactId);
      if (selectedContact) {
        // Update all related fields
        form.setFieldsValue({
          firstName: selectedContact.first_name || '',
          lastName: selectedContact.last_name || '',
          email: selectedContact.email || '',
          telephone: selectedContact.phone || '',
          address: selectedContact.address || '',
          company_id: selectedContact.company_name || undefined
        });
      }
    }
  }, [form.getFieldValue('contact_id'), contactsResponse?.data]);

  const handleSubmit = async (values) => {
    try {
      let contactId = values.contact_id;
      let leadData;

      // Format phone number with country code
      const selectedCountry = countries.find(c => c.id === values.phoneCode);
      const formattedPhone = values.telephone ?
        `+${selectedCountry?.phoneCode?.replace('+', '')} ${values.telephone}` :
        null;

      // Get default stage for selected pipeline
      const defaultStage = stages.find(stage => stage.pipeline === values.pipeline && stage.isDefault);

      // Prepare the base lead data
      const leadFormData = {
        leadTitle: values.leadTitle,
        leadStage: defaultStage?.id,
        pipeline: values.pipeline,
        currency: values.currency,
        leadValue: values.leadValue,
        source: values.source,
        category: values.category || othersCategory?.id,
        status: pendingStatus?.id,
        interest_level: "medium",
        inquiry_id: values.inquiry_id || initialValues?.inquiry_id || null,
        company_id: values.company_id || null,
        contact_id: null
      };

      // If in "Add New" mode and any contact details are filled
      if (contactMode === 'new' &&
        (values.firstName || values.lastName || values.email || values.telephone || values.address)) {

        try {
          // Create contact first
          const contactData = {
            contact_owner: loggedInUser?.id || "",
            first_name: values.firstName || "",
            last_name: values.lastName || "",
            company_name: values.company_id || "",
            email: values.email || "",
            phone_code: values.phoneCode || "",
            phone: values.telephone ? values.telephone.toString() : "",
            contact_source: "lead",
            description: `Lead created from lead form by ${loggedInUser?.name} on ${new Date().toLocaleDateString()}`,
            address: values.address || "",
            client_id: loggedInUser.client_id
          };

          const contactResponse = await createContact(contactData).unwrap();
          contactId = contactResponse.data.id;

          // Update lead data with the new contact ID
          leadFormData.contact_id = contactId;
        } catch (error) {
          console.error('Error creating contact:', error);
          message.error(error.data?.message || 'Failed to create contact');
          return;
        }
      } else {
        // For existing contact, use the contact's ID
        leadFormData.contact_id = values.contact_id;
      }

      // Create the lead with all the data
      const leadResponse = await createLead(leadFormData).unwrap();
      message.success("Lead created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Error creating lead:', error);
      message.error(error.data?.message || "Failed to create lead");
    }
  };

  // Handle pipeline selection change
  const handlePipelineChange = (value) => {
    setSelectedPipeline(value);
  };

  // Handle add pipeline click
  const handleAddPipelineClick = (e) => {
    e.stopPropagation();
    setIsAddPipelineVisible(true);
  };

  // Handle add source click
  const handleAddSourceClick = (e) => {
    e.stopPropagation();
    setIsAddSourceVisible(true);
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

  // Update the selectStyle
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
      display: 'flex !important',
      alignItems: 'center !important',
      gap: '8px !important',
    }
  };

  // Handle source deletion
  const handleDeleteSource = async (e, sourceId) => {
    e.stopPropagation();
    try {
      await deleteSource(sourceId).unwrap();
      message.success("Source deleted successfully");
    } catch (error) {
      message.error(error.data?.message || "Failed to delete source");
    }
  };

  // Handle add category click
  const handleAddCategoryClick = (e) => {
    e.stopPropagation();
    setIsAddCategoryVisible(true);
  };

  // Handle category deletion
  const handleDeleteCategory = async (e, categoryId) => {
    e.stopPropagation();
    try {
      await deleteCategory(categoryId).unwrap();
      message.success("Category deleted successfully");
    } catch (error) {
      message.error(error.data?.message || "Failed to delete category");
    }
  };

  const handleContactChange = (contactId) => {
    if (!contactId) {
      form.setFieldsValue({
        contact_id: undefined,
        company_id: undefined,
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        telephone: undefined,
        address: undefined,
      });
      return;
    }

    const selectedContact = contactsResponse?.data?.find(c => c.id === contactId);
    if (selectedContact) {
      // Update form with contact details
      form.setFieldsValue({
        contact_id: contactId,
        firstName: selectedContact.first_name || '',
        lastName: selectedContact.last_name || '',
        email: selectedContact.email || '',
        telephone: selectedContact.phone || '',
        address: selectedContact.address || '',
        company_id: selectedContact.company_name // Set company_id from contact's company_name
      });
    }
  };

  const handleCompanyChange = (companyId) => {
    if (!companyId) {
      // If company is cleared and we're in existing contact mode
      if (contactMode === 'existing') {
        form.setFieldsValue({
          company_id: undefined
        });
      } else {
        // If in new contact mode, clear all contact fields
        form.setFieldsValue({
          company_id: undefined,
          firstName: undefined,
          lastName: undefined,
          email: undefined,
          telephone: undefined,
          address: undefined,
        });
      }
      return;
    }

    // Set the company ID
    form.setFieldsValue({
      company_id: companyId
    });
  };

  const handleClearCompany = () => {
    form.setFieldsValue({
      company_id: undefined,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      telephone: undefined,
      address: undefined,
    });
    setSelectedContact(null);
  };

  const handleClearContact = () => {
    form.setFieldsValue({
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      telephone: undefined,
      address: undefined,
    });
    setSelectedContact(null);
  };

  const handleAddCompanyClick = (e) => {
    if (e) e.stopPropagation();
    setIsAddCompanyVisible(true);
  };

  const handleAddContactClick = (e) => {
    if (e) e.stopPropagation();
    setIsAddContactVisible(true);
  };

  const handleCompanyCreationSuccess = (newCompany) => {
    setIsAddCompanyVisible(false);
    form.setFieldsValue({
      company_name: newCompany.id,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      telephone: undefined,
      address: undefined,
    });
    message.success("Company added successfully");
    setNewCompanyName("");
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
      closeIcon={
        <FiX style={{
          fontSize: '20px',
          color: '#ffffff'
        }} />
      }
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
        {/* Hidden field for inquiry_id */}
        <Form.Item
          name="inquiry_id"
          hidden={true}
        >
          <Input type="hidden" />
        </Form.Item>

        {/* Lead Details Section */}
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

          <Form.Item
            name="pipeline"
            label={<span style={formItemStyle}>Pipeline</span>}
            rules={[{ required: true, message: "Please select pipeline" }]}
          >
            <Select
              ref={selectRef}
              open={dropdownOpen}
              onDropdownVisibleChange={setDropdownOpen}
              placeholder="Select pipeline"
              onChange={handlePipelineChange}
              style={selectStyle}
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

          <Form.Item
            name="leadValueGroup"
            label={<span style={formItemStyle}>Lead Value</span>}
            className="combined-input-item"
            required
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
                    <Option key={currency.id} value={currency.id}>
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
                rules={[
                  { required: true, message: 'Please enter lead value' },
                  { type: 'number', min: 0, message: 'Value must be greater than or equal to 0' }
                ]}
              >
                <InputNumber
                  style={{ width: 'calc(100% - 100px)', padding: '0 16px' }}
                  placeholder="Enter amount"
                  min={0}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="source"
            label={<span style={formItemStyle}>Source</span>}
            rules={[{ required: true, message: "Please select source" }]}
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
                      onClick={handleAddSourceClick}
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
                      Add Source
                    </Button>
                  </div>
                </div>
              )}
            >
              {sourcesData?.data?.map((source) => (
                <Option key={source.id} value={source.id}>
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
                          backgroundColor: source.color || '#1890ff'
                        }}
                      />
                      {source.name}
                    </div>
                    <Popconfirm
                      title="Delete Source"
                      description="Are you sure you want to delete this source?"
                      onConfirm={(e) => handleDeleteSource(e, source.id)}
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
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label={<span style={formItemStyle}>Category</span>}
          >
            <Select
              ref={categorySelectRef}
              open={categoryDropdownOpen}
              onDropdownVisibleChange={setCategoryDropdownOpen}
              placeholder="Select or type to filter categories"
              style={selectStyle}
              popupClassName="custom-select-dropdown"
              showSearch
              allowClear
              filterOption={(input, option) =>
                option.children.props.children[0].props.children[1].toLowerCase().includes(input.toLowerCase())
              }
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
              {categoriesData?.data?.map((category) => (
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
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Basic Information Section */}
        <div style={{ marginBottom: '24px' }}>
          <Text strong style={{ fontSize: '16px', color: '#1f2937', marginBottom: '16px', display: 'block' }}>
            Basic Information
          </Text>

          <Tabs
            activeKey={contactMode}
            onChange={(value) => {
              setContactMode(value);
              form.setFieldsValue({
                company_name: undefined,
                contact_id: undefined,
                firstName: undefined,
                lastName: undefined,
                email: undefined,
                telephone: undefined,
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
                name="company_id"
                label={<span style={formItemStyle}>Company Name</span>}
              >
                <Select
                  placeholder="Select company"
                  onChange={handleCompanyChange}
                  style={selectStyle}
                  allowClear
                  suffixIcon={null}
                  value={form.getFieldValue('company_id')}
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
                name="contact_id"
                label={<span style={formItemStyle}>Contact Name</span>}
              >
                <Select
                  placeholder="Select contact name"
                  style={selectStyle}
                  suffixIcon={null}
                  showSearch
                  allowClear
                  onChange={handleContactChange}
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
                    validateTrigger: ['onChange', 'onBlur'],
                    transform: (value) => value?.trim() || null
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
                    name="telephone"
                    noStyle
                  >
                    <InputNumber
                      style={{ width: 'calc(100% - 100px)', padding: '0 16px' }}
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

        {/* Form Actions */}
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

      <AddSourceModal
        isOpen={isAddSourceVisible}
        onClose={(success) => {
          setIsAddSourceVisible(false);
          if (success) {
            setSourceDropdownOpen(true);
          }
        }}
      />

      <AddPipelineModal
        isOpen={isAddPipelineVisible}
        onClose={(success) => {
          setIsAddPipelineVisible(false);
          if (success) {
            setDropdownOpen(true);
          }
        }}
      />

      <AddCategoryModal
        isOpen={isAddCategoryVisible}
        onClose={(success) => {
          setIsAddCategoryVisible(false);
          if (success) {
            setCategoryDropdownOpen(true);
          }
        }}
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
              // font-weight: 500 !important;
              color: #fff !important;
            }

            .ant-select-selection-placeholder {
              color: #fff !important;
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
            // padding: 0 18px!important;
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
            // .ant-select-selector {
            //   // min-height: 48px !important;
            //   // height: auto !important;
            //   padding: 0px 16px !important;
            //   background-color: #f8fafc !important;
            //   border: 1px solid #e6e8eb !important;
            //   border-radius: 10px !important;  
            //   display: flex !important;
            //   align-items: flex-start !important;
            //   flex-wrap: wrap !important;
            // }

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

          .ant-radio-group {
            display: inline-flex !important;
            gap: 8px !important;
          }

          .ant-radio-button-wrapper {
            border: none !important;
            padding: 0 !important;
            height: auto !important;
            line-height: 1 !important;
            background: transparent !important;

            &::before {
              display: none !important;
            }

            &:hover {
              color: #1890FF !important;
            }
          }

          .ant-radio-button-wrapper-checked {
            &::before {
              display: none !important;
            }
          }

          .ant-segmented {
            background-color: transparent !important;
            padding: 4px !important;

            .ant-segmented-item {
              transition: all 0.3s ease !important;
              border-radius: 8px !important;
              height: 40px !important;
              color: #6B7280 !important;
              
              &:hover {
                color: #1890FF !important;
              }

              &-selected {
                background-color: white !important;
                color: #1890FF !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
              }

              .ant-segmented-item-label {
                height: 100% !important;
                line-height: 40px !important;
                font-weight: 500 !important;
                min-height: 40px !important;
                padding: 0 16px !important;
              }
            }
          }

          .ant-tabs {
            .ant-tabs-nav {
              margin: 0 !important;
              &::before {
                border-bottom: 1px solid #E5E7EB !important;
              }
            }

            .ant-tabs-tab {
              padding: 12px 20px !important;
              margin: 0 !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              color: #6B7280 !important;
              transition: all 0.3s ease !important;

              &:hover {
                color: #1890FF !important;
              }

              &.ant-tabs-tab-active {
                .ant-tabs-tab-btn {
                  color: #1890FF !important;
                  font-weight: 600 !important;
                }
              }

              .anticon {
                margin-right: 8px !important;
              }
            }

            .ant-tabs-ink-bar {
              background: #1890FF !important;
              height: 3px !important;
              border-radius: 3px 3px 0 0 !important;
            }
          }

          .ant-select {
            .ant-select-selector {
              padding-left: 16px !important;
              
              .ant-select-selection-item {
                padding-left: 0 !important;
                display: flex !important;
                align-items: center !important;
                gap: '8px' !important;

                > div {
                  display: flex !important;
                  align-items: center !important;
                  gap: 8px !important;
                  width: 100% !important;
                  
                  span {
                    flex-shrink: 0 !important;
                    
                    &:last-child {
                      flex-shrink: 1 !important;
                      overflow: hidden !important;
                      text-overflow: ellipsis !important;
                    }
                  }
                }
              }
            }
          }

          .ant-select-dropdown {
            .ant-select-item-option-content {
              > div {
                width: 100% !important;
                
                > div:last-child {
                  flex: 1 !important;
                  min-width: 0 !important;
                  
                  span:last-child {
                    flex: 1 !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                  }
                }
              }
            }
          }
        }
      `}</style>
    </Modal>
  );
};

export default CreateLead;
