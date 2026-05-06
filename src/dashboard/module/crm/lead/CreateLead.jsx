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
  AutoComplete,
  Tag,
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
import { useGetContactsQuery, useCreateContactMutation, contactApi } from '../contact/services/contactApi';
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
import CommonSelect from "../../../../components/CommonSelect";

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
  isQuickMode,
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
  const [createContact] = useCreateContactMutation();
  const [phoneSearchText, setPhoneSearchText] = useState("");
  const selectedCompanyId = Form.useWatch('company_id', form);

  const { data: contactSuggestions } = useGetContactsQuery(
    { 
      search: phoneSearchText,
      ...(selectedCompanyId && { company_name: selectedCompanyId })
    },
    { skip: !phoneSearchText || phoneSearchText.length < 2 }
  );

  const handleContactSelect = (value, option) => {
    const contact = option.contact;
    if (contact) {
      const selectedCode = countries?.find(c => c.id === contact.phone_code || c.id === form.getFieldValue('phoneCode'));
      let displayPhone = contact.phone || '';
      
      // If the phone number starts with the selected code's phone code, strip it
      if (selectedCode && displayPhone.startsWith(`+${selectedCode.phoneCode.replace('+', '')}`)) {
        displayPhone = displayPhone.replace(`+${selectedCode.phoneCode.replace('+', '')}`, '').trim();
      } else if (selectedCode && displayPhone.startsWith(selectedCode.phoneCode.replace('+', ''))) {
        displayPhone = displayPhone.replace(selectedCode.phoneCode.replace('+', ''), '').trim();
      }

      form.setFieldsValue({
        firstName: contact.first_name || '',
        lastName: contact.last_name || '',
        email: contact.email || '',
        telephone: displayPhone,
        address: contact.address || '',
        company_id: contact.company_name || undefined,
        contact_id: contact.id,
        phoneCode: contact.phone_code || form.getFieldValue('phoneCode')
      });
    }
  };


  const selectedContactId = Form.useWatch('contact_id', form);

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
    refetch: refetchContacts,
  } = useGetContactsQuery();

  useEffect(() => {
    if (open) {
      const { defaultCurrency } = findIndianDefaults(currencies, countries);

      const updates = {
        currency: defaultCurrency,
        leadValue: 0,
      };

      // Auto-select first pipeline if available
      if (pipelines?.length > 0 && !form.getFieldValue('pipeline')) {
        updates.pipeline = pipelines[0].id;
        setSelectedPipeline(pipelines[0].id);
      }

      // Auto-select first source if available
      if (sourcesData?.data?.length > 0 && !form.getFieldValue('source')) {
        updates.source = sourcesData.data[0].id;
      }

      form.setFieldsValue(updates);
    }
  }, [open, pipelines, sourcesData, currencies, countries, form]);

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
    if (!selectedContactId) return;

    const selectedContact = contactsResponse?.data?.find(c => c.id === selectedContactId);
    if (!selectedContact) return;

    form.setFieldsValue({
      firstName: selectedContact.first_name || '',
      lastName: selectedContact.last_name || '',
      email: selectedContact.email || '',
      telephone: selectedContact.phone || '',
      address: selectedContact.address || '',
      company_id: selectedContact.company_name || undefined
    });
  }, [selectedContactId, contactsResponse?.data, form]);

  // If company changes and existing selected contact doesn't belong to it, clear contact + fields
  useEffect(() => {
    if (!selectedContactId) return;

    const selectedContact = contactsResponse?.data?.find(c => c.id === selectedContactId);
    if (!selectedContact) return;

    if (selectedCompanyId && selectedContact.company_name !== selectedCompanyId) {
      form.setFieldsValue({
        contact_id: undefined,
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        telephone: undefined,
        address: undefined,
      });
      setSelectedContact(null);
    }
  }, [selectedCompanyId, selectedContactId, contactsResponse?.data, form]);

  const handleSubmit = async (values) => {
    try {
      // Prepare the lead data with auto-logic for contact and defaults
      const leadFormData = {
        leadTitle: values.leadTitle || `${values.firstName || ''} ${values.lastName || ''} - New Lead`.trim(),
        leadStage: values.leadStage,
        pipeline: values.pipeline,
        currency: values.currency,
        leadValue: values.leadValue || 0,
        source: values.source || (isQuickMode ? "manual" : undefined),
        category: values.category || (isQuickMode ? undefined : othersCategory?.id),
        status: isQuickMode ? undefined : pendingStatus?.id,
        interest_level: "medium",
        inquiry_id: values.inquiry_id || initialValues?.inquiry_id || null,
        company_id: values.company_id || null,
        contact_id: values.contact_id || null,
        description: values.description || null,
        created_via: isQuickMode ? 'quick' : 'normal',
        // Auto-contact fields
        phone: values.telephone ? values.telephone.toString() : null,
        first_name: values.firstName || null,
        last_name: values.lastName || null,
        email: values.email || null,
        phone_code: values.phoneCode || defaultPhoneCode
      };

      // Create the lead with all the data (Backend handles contact matching/creation)
      await createLead(leadFormData).unwrap();
      
      // Force the Contacts list to refresh so the auto-created contact appears immediately
      dispatch(contactApi.util.invalidateTags(['Contacts']));
      message.success("Lead created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
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
    height: "40px",
    borderRadius: "10px",
    padding: "4px 12px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e6e8eb",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
  };

  const prefixIconStyle = {
    color: "#1890ff",
    fontSize: "16px",
    marginRight: "8px",
    display: "flex",
    alignItems: "center",
  };

  // Update the selectStyle
  const selectStyle = {
    width: '100%',
    height: '48px',
  };

  // Handle source deletion
  const handleDeleteSource = async (sourceId) => {
    try {
      await deleteSource(sourceId).unwrap();
      message.success("Source deleted successfully");
      // Clear the category field if the deleted category was selected
      if (form.getFieldValue('source') === sourceId) {
        form.setFieldValue('source', undefined);
      }
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
  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId).unwrap();
      message.success("Category deleted successfully");
      // Clear the category field if the deleted category was selected
      if (form.getFieldValue('category') === categoryId) {
        form.setFieldValue('category', undefined);
      }
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
    const prevCompanyId = form.getFieldValue('company_id');

    form.setFieldsValue({ company_id: companyId || undefined });

    const companyChanged = prevCompanyId !== (companyId || undefined);
    const companyCleared = !companyId;

    // Always clear dependent contact + contact-filled fields when company changes/clears
    if (companyChanged || companyCleared) {
      form.setFieldsValue({
        contact_id: undefined,
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        telephone: undefined,
        address: undefined,
      });
      setSelectedContact(null);
    }
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

  const handleCompanyCreationSuccess = async (newCompany) => {
    setIsAddCompanyVisible(false);

    if (newCompany.contact_id) {
      await refetchContacts();
    }

    form.setFieldsValue({
      company_id: newCompany.id,
      contact_id: newCompany.contact_id || undefined,
      firstName: undefined,
      lastName: undefined,
      email: newCompany.email || undefined,
      phoneCode: newCompany.phone_code || form.getFieldValue('phoneCode'),
      telephone: newCompany.phone_number || undefined,
      address: newCompany.billing_address || undefined,
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

        <div className="form-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {!isQuickMode && (
            <Form.Item
              name="leadTitle"
              label={<span style={formItemStyle}>Lead Title <span style={{ color: "#ff4d4f" }}>*</span></span>}
              style={{ gridColumn: 'span 2', marginBottom: '0px' }}
              rules={[
                { required: true, message: "Please enter lead title" },
                { min: 3, message: "Lead title must be at least 3 characters" }
              ]}
            >
              <Input
                prefix={<FiUser style={prefixIconStyle} />}
                placeholder="Enter lead title"
                style={inputStyle}
              />
            </Form.Item>
          )}

          {!isQuickMode && (
            <Form.Item
              name="leadValueGroup"
              label={<span style={formItemStyle}>Lead Value</span>}
              className="combined-input-item"
              style={{ gridColumn: 'span 2', marginBottom: '0px' }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <Form.Item
                  name="currency"
                  noStyle
                  initialValue={defaultCurrency}
                  rules={[{ required: true, message: 'Please select currency' }]}
                >
                <CommonSelect
                  style={{ width: '120px' }}
                  options={currencies?.map(currency => ({
                    id: currency.id,
                    name: currency.currencyIcon === currency.currencyCode 
                      ? currency.currencyCode 
                      : `${currency.currencyIcon} ${currency.currencyCode}`
                  }))}
                  allowClear={false}
                />
                </Form.Item>
                <Form.Item
                  name="leadValue"
                  noStyle
                  initialValue={0}
                  rules={[
                    { type: 'number', min: 0, message: 'Value must be greater than or equal to 0' }
                  ]}
                >
                  <InputNumber
                    style={{ ...inputStyle, width: '100%' }}
                    placeholder="Enter amount"
                    min={0}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Form.Item>
              </div>
            </Form.Item>
          )}

          {/* Common fields for both modes: First Name & Last Name */}
          <Form.Item
            name="firstName"
            label={<span style={formItemStyle}>Full Name <span style={{ color: "#ff4d4f" }}>*</span></span>}
            style={{ gridColumn: 'span 1', marginBottom: '0px' }}
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input
              prefix={<FiUser style={prefixIconStyle} />}
              placeholder="First name"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={<span style={formItemStyle}>Last Name</span>}
            style={{ gridColumn: 'span 1', marginBottom: '0px' }}
          >
            <Input
              prefix={<FiUser style={prefixIconStyle} />}
              placeholder="Last name"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="phoneGroup"
            label={<span style={formItemStyle}>Phone Number <span style={{ color: '#8c8c8c', fontWeight: 'normal', fontSize: '12px' }}>(Optional)</span></span>}
            style={{ gridColumn: 'span 1', marginBottom: '0px' }}
            dependencies={['telephone']}
            rules={[
              {
                validator: (_, value) => {
                  const telephone = form.getFieldValue('telephone');
                  if (telephone) {
                    if (!/^\d+$/.test(telephone)) {
                      return Promise.reject(new Error('Phone number must contain only digits'));
                    }
                    if (telephone.length < 7 || telephone.length > 15) {
                      return Promise.reject(new Error('Phone number must be between 7 and 15 digits'));
                    }
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Form.Item
                name="phoneCode"
                noStyle
                initialValue={defaultPhoneCode}
                rules={[{ required: true, message: 'Please select code' }]}
              >
                <CommonSelect
                  className="phone-code-select"
                  style={{ width: '100px' }}
                  options={countries?.map(country => ({
                    id: country.id,
                    name: `+${country.phoneCode.replace('+', '')}`
                  }))}
                  allowClear={false}
                />
              </Form.Item>
              <Form.Item
                name="telephone"
                noStyle
              >
                <AutoComplete
                  style={{ 
                    flex: 1, 
                  }}
                  placeholder="Enter phone number"
                  onSearch={(val) => setPhoneSearchText(val)}
                  onSelect={handleContactSelect}
                  popupClassName="custom-select-dropdown"
                  options={contactSuggestions?.data?.map(c => ({
                    value: c.phone,
                    label: (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                          <div style={{ 
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '50%', 
                            backgroundColor: '#e6f7ff', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#1890ff',
                            flexShrink: 0
                          }}>
                            <FiUser size={14} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <span style={{ fontWeight: '500', fontSize: '13px', color: '#1f1f1f', lineHeight: '1.4', display: 'block' }}>
                              {c.first_name} {c.last_name || ''}
                            </span>
                            <span style={{ fontSize: '11px', color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: '4px', lineHeight: '1.4' }}>
                              <FiPhone size={9} /> {c.phone}
                            </span>
                          </div>
                        </div>
                        {c.company_name && (
                          <Tag 
                            icon={<FiBriefcase size={10} />} 
                            color="blue" 
                            style={{ 
                              margin: 0, 
                              borderRadius: '4px', 
                              fontSize: '11px',
                              marginLeft: '8px'
                            }}
                          >
                            {typeof c.company_name === 'object' 
                              ? (c.company_name.company_name || c.company_name.name) 
                              : (companyAccountsResponse?.data?.find(acc => acc.id === c.company_name)?.company_name || c.company_name)}
                          </Tag>
                        )}
                      </div>
                    ),
                    contact: c
                  }))}
                >
                   <Input 
                     prefix={<FiPhone style={prefixIconStyle} />}
                     style={inputStyle}
                   />
                </AutoComplete>
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={formItemStyle}>Email <span style={{ color: '#8c8c8c', fontWeight: 'normal', fontSize: '12px' }}>(Optional)</span></span>}
            style={{ gridColumn: 'span 1', marginBottom: '0px' }}
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

          {/* Description / Note field for both modes */}
          <Form.Item
            name="description"
            label={<span style={formItemStyle}>{isQuickMode ? "Note / Requirement" : "Description"} <span style={{ color: '#8c8c8c', fontWeight: 'normal', fontSize: '12px' }}>(Optional)</span></span>}
            style={{ gridColumn: 'span 2', marginBottom: '0px' }}
          >
            <Input.TextArea
              placeholder={isQuickMode ? "Enter requirement details" : "Enter lead description"}
              style={{ ...inputStyle, height: 'auto', minHeight: '80px', padding: '12px 16px' }}
              rows={3}
            />
          </Form.Item>
        </div>

        {!isQuickMode && (
          <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginTop: '24px',
            marginBottom: '24px'
          }}>
            <Form.Item
              name="pipeline"
              label={<span style={formItemStyle}>Pipeline <span style={{ color: "#ff4d4f" }}>*</span></span>}
              rules={[{ required: true, message: "Please select pipeline" }]}
              style={{ marginBottom: '0px' }}
            >
              <CommonSelect
                placeholder="Select pipeline"
                options={pipelines.map(p => ({ id: p.id, name: p.pipeline_name }))}
                onChange={handlePipelineChange}
                onAddClick={handleAddPipelineClick}
                addButtonText="Create Pipeline"
              />
            </Form.Item>

            <Form.Item
              name="leadStage"
              label={<span style={formItemStyle}>Stage <span style={{ color: "#ff4d4f" }}>*</span></span>}
              rules={[{ required: true, message: "Please select stage" }]}
              style={{ marginBottom: '0px' }}
            >
              <CommonSelect
                placeholder="Select stage"
                disabled={!form.getFieldValue('pipeline')}
                options={stages
                  .filter(stage => stage.pipeline === form.getFieldValue('pipeline'))
                  .map(s => ({ id: s.id, name: s.name, color: s.color }))}
              />
            </Form.Item>
            <Form.Item
              name="source"
              label={<span style={formItemStyle}>Source <span style={{ color: "#ff4d4f" }}>*</span></span>}
              rules={[{ required: true, message: "Please select source" }]}
            >
              <CommonSelect
                placeholder="Select source"
                options={sourcesData?.data}
                onAddClick={handleAddSourceClick}
                addButtonText="Create Source"
                onDelete={handleDeleteSource}
                deleteTitle="Delete Source"
              />
            </Form.Item>

            <Form.Item
              name="category"
              label={<span style={formItemStyle}>Category</span>}
            >
              <CommonSelect
                placeholder="Select category"
                options={categoriesData?.data}
                onAddClick={handleAddCategoryClick}
                addButtonText="Create Category"
                onDelete={handleDeleteCategory}
                deleteTitle="Delete Category"
              />
            </Form.Item>
          </div>
        )}

        {!isQuickMode && (
          <>
            <Divider style={{ margin: '32px 0' }} />
            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ fontSize: '16px', color: '#1f2937', marginBottom: '16px', display: 'block' }}>
                Additional Details
              </Text>
            </div>

            <div className="form-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <Form.Item
                name="company_id"
                label={<span style={formItemStyle}>Select Company</span>}
              >
                <CommonSelect
                  placeholder="Select company"
                  options={companyAccountsResponse?.data?.map(c => ({ id: c.id, name: c.company_name }))}
                  onChange={handleCompanyChange}
                  onAddClick={handleAddCompanyClick}
                  addButtonText="Create Company"
                  icon={FiBriefcase}
                />
              </Form.Item>



              <Form.Item
                name="address"
                label={<span style={formItemStyle}>Address</span>}
                style={{ gridColumn: 'span 2' }}
              >
                <Input
                  prefix={<FiMapPin style={prefixIconStyle} />}
                  placeholder="Enter address"
                  style={inputStyle}
                />
              </Form.Item>
            </div>
          </>
        )}

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
              padding: 0 8px !important;
              height: 40px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            
            .ant-select-selection-search {
              input {
                height: 100% !important;
                color: #000000 !important;
              }
            }

            .ant-select-selection-item {
              padding-right: 0 !important;
              color: #000000 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              width: 100% !important;
              font-weight: 400 !important;
            }

            .ant-select-selection-placeholder {
              color: #000000 !important;
            }
          }

          .ant-select-dropdown {
            padding: 4px !important;
            border-radius: 8px !important;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;

            .ant-select-item {
              padding: 5px 12px !important;
              border-radius: 6px !important;
              min-height: 32px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: flex-start !important;
              color: #1f2937 !important;

              &-option-selected {
                background-color: #E6F4FF !important;
                font-weight: 400 !important;
                color: #1890ff !important;
              }

              &-option-active {
                background-color: #F3F4F6 !important;
              }
            }

            .ant-select-item-option-content {
              font-size: 13px !important;
              line-height: 1.2 !important;
              display: flex !important;
              align-items: center !important;
              font-weight: 400 !important;
            }

            .ant-select-item-empty {
              color: #9CA3AF !important;
            }
          }

          .ant-input-number {
            display: flex !important;
            align-items: center !important;
            padding: 0 !important;

            .ant-input-number-input-wrap {
              height: 100%;
              display: flex;
              align-items: center;
            }

            .ant-input-number-input {
              height: 40px !important;
              padding: 0 12px !important;
              line-height: 40px !important;
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
            height: 40px !important;
            min-height: 40px !important;
            padding: 0 12px !important;
            display: flex !important;
            align-items: center !important;
          }

          .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
            border-color: #1890ff !important;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
          }

          .ant-select-single {
            height: 40px !important;
            font-size: 14px !important;
          }

          .ant-select-single .ant-select-selector .ant-select-selection-item,
          .ant-select-single .ant-select-selector .ant-select-selection-placeholder,
          .ant-select-single .ant-select-selector .ant-select-selection-search,
          .ant-select-single .ant-select-selector .ant-select-selection-search-input {
            line-height: 40px !important;
            height: 40px !important;
            display: flex !important;
            align-items: center !important;
            padding: 0 !important;
          }

          .ant-select-single .ant-select-selector .ant-select-selection-search,
          .ant-select-single .ant-select-selector .ant-select-selection-search-input {
            height: 100% !important;
            line-height: 40px !important;
            display: flex !important;
            align-items: center !important;
            padding: 0 !important;
          }

          .ant-select-auto-complete .ant-select-selector {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
            height: 40px !important;
            display: flex !important;
            align-items: center !important;
          }
          
          .ant-select-auto-complete .ant-select-selection-search {
            inset-inline-start: 0 !important;
            inset-inline-end: 0 !important;
            height: 100% !important;
            width: 100% !important;
          }

          .ant-select-arrow {
             top: 50% !important;
             transform: translateY(-50%) !important;
             margin-top: 0 !important;
             display: flex !important;
             align-items: center !important;
             justify-content: center !important;
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





          .ant-form-item-required::before {
          display: none !important;
        }
        
        .ant-form-item-required::after {
          display: inline-block;
          margin-left: 4px;
          color: #ff4d4f;
          font-size: 14px;
          font-family: SimSun, sans-serif;
          line-height: 1;
          content: '*';
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
          .ant-select:not(.ant-select-customize-input) .ant-select-selector:hover,
          .ant-input:hover {
            border-color: #1890ff !important;
          }

          .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector,
          .ant-input:focus,
          .ant-input-focused,
          .ant-input-affix-wrapper-focused {
            border-color: #1890ff !important;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
          }

          .ant-input-affix-wrapper,
          .ant-select-auto-complete .ant-select-selection-search-input.ant-input-affix-wrapper {
            height: 40px !important;
            padding: 0 12px !important;
            display: flex !important;
            align-items: center !important;
            background-color: #f8fafc !important;
            border: 1px solid #e6e8eb !important;
            border-radius: 10px !important;

            .ant-input {
              background: transparent !important;
              border: none !important;
              &:focus {
                box-shadow: none !important;
              }
            }

            .ant-input-prefix {
              margin-inline-end: 8px !important;
              display: flex !important;
              align-items: center !important;
              color: #1890ff !important;
            }
          }
        `}</style>
    </Modal>
  );
};

export default CreateLead;
