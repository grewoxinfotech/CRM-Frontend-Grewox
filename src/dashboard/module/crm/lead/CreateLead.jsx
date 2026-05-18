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
  Space,
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
  FiPlus,
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
import { useGetCustomFormsQuery } from "../generate-link/services/customFormApi";
import { PlusOutlined } from '@ant-design/icons';

import AddPipelineModal from "../crmsystem/pipeline/AddPipelineModal";
import AddSourceModal from "../crmsystem/souce/AddSourceModal";
import AddCategoryModal from "../crmsystem/souce/AddCategoryModal";
import AddCompanyModal from "../companyacoount/CreateCompanyAccount";
import AddContactModal from "../contact/CreateContact";
import CommonSelect from "../../../../components/CommonSelect";
import indianStatesAndCities from "../../../../utils/Indian_Cities_In_States_JSON.json";

const { Text } = Typography;
const { Option } = Select;

// Find the Indian currency and phone code IDs
const findIndianDefaults = (currencies, countries) => {
  const inrCurrency = currencies?.find(c => c.currencyCode === 'INR');
  const indiaCountry = countries?.find(c => c.phoneCode === '91' || c.phoneCode === '+91' || c.countryCode === 'IN');
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
  const [isQuick, setIsQuick] = useState(isQuickMode);
  const [createContact] = useCreateContactMutation();
  const [phoneSearchText, setPhoneSearchText] = useState("");
  const selectedCompanyId = Form.useWatch('company_id', form);
  const selectedPipelineId = Form.useWatch('pipeline', form);
  const selectedState = Form.useWatch('state', form);

  const availableCities = React.useMemo(() => {
    if (!selectedState) return [];
    return indianStatesAndCities[selectedState] || [];
  }, [selectedState]);

  // Fetch Active Custom Form for Lead
  const { data: customFormsData } = useGetCustomFormsQuery({ module_type: 'lead', status: 'active' });
  const activeCustomForm = customFormsData?.data?.[0];

  const formFields = React.useMemo(() => {
    if (!activeCustomForm?.fields) return [];
    try {
      return typeof activeCustomForm.fields === 'string'
        ? JSON.parse(activeCustomForm.fields)
        : activeCustomForm.fields;
    } catch (e) {
      console.error("Failed to parse form fields:", e);
      return [];
    }
  }, [activeCustomForm]);


  useEffect(() => {
    if (open) {
      setIsQuick(isQuickMode);
    }
  }, [open, isQuickMode]);

  const { data: contactSuggestions } = useGetContactsQuery(
    {
      search: phoneSearchText,
      ...(selectedCompanyId && { company_name: selectedCompanyId })
    },
    { skip: !phoneSearchText || phoneSearchText.length < 2 }
  );




  const selectedContactId = Form.useWatch('contact_id', form);

  // Get stages data
  const { data: stagesData } = useGetLeadStagesQuery();

  // Find others category
  const othersCategory = categoriesData?.data?.find(cat => cat.name.toLowerCase() === "others") || null;

  // Filter stages to only show lead type stages
  const stages = (Array.isArray(stagesData) ? stagesData : (stagesData?.data || [])).filter(stage => stage.stageType === "lead") || [];

  const normalizeId = (value) => {
    if (!value) return undefined;
    if (typeof value === 'object') return value.id || value._id || value.value;
    return value;
  };

  const filteredStages = React.useMemo(() => {
    const pipelineId = normalizeId(selectedPipelineId);
    if (!pipelineId) return [];
    return stages.filter((stage) => normalizeId(stage.pipeline) === pipelineId);
  }, [stages, selectedPipelineId]);

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

  const combinedSuggestions = React.useMemo(() => {
    const suggestions = [];

    // Add contacts
    contactSuggestions?.data?.forEach(c => {
      suggestions.push({
        value: c.phone || c.mobile || '',
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px' }}><Tag color="blue" style={{ fontSize: '10px' }}>CONTACT</Tag> {c.first_name} {c.last_name}</span>
            <span style={{ color: '#999', fontSize: '11px' }}>{c.phone || c.mobile}</span>
          </div>
        ),
        type: 'contact',
        contact: c
      });
    });

    // Add companies (filtering the already fetched company list)
    if (phoneSearchText && phoneSearchText.length >= 2) {
      companyAccountsResponse?.data?.filter(company =>
        (company.phone_number && company.phone_number.includes(phoneSearchText)) ||
        (company.company_name && company.company_name.toLowerCase().includes(phoneSearchText.toLowerCase()))
      ).slice(0, 5).forEach(comp => {
        suggestions.push({
          value: comp.phone_number || '',
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px' }}><Tag color="green" style={{ fontSize: '10px' }}>COMPANY</Tag> {comp.company_name}</span>
              <span style={{ color: '#999', fontSize: '11px' }}>{comp.phone_number}</span>
            </div>
          ),
          type: 'company',
          company: comp
        });
      });
    }

    return suggestions;
  }, [contactSuggestions, companyAccountsResponse, phoneSearchText]);

  const handleSuggestionSelect = (value, option) => {
    if (option.type === 'contact') {
      const contact = option.contact;
      if (contact) {
        const selectedCode = countries?.find(c => c.id === contact.phone_code || c.id === form.getFieldValue('phoneCode'));
        let displayPhone = contact.phone || '';

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
          city: contact.city || '',
          state: contact.state || '',
          country: contact.country || '',
          company_id: contact.company_name || undefined,
          contact_id: contact.id,
          phoneCode: contact.phone_code || form.getFieldValue('phoneCode')
        });
      }
    } else if (option.type === 'company') {
      const company = option.company;
      form.setFieldsValue({
        company_id: company.id,
        telephone: company.phone_number || '',
        address: company.billing_address || '',
        city: company.billing_city || '',
        state: company.billing_state || '',
        country: company.billing_country || '',
        email: company.email || '',
        // Clear contact fields as we found a company match
        contact_id: undefined,
        firstName: undefined,
        lastName: undefined,
      });
    }
  };

  useEffect(() => {
    if (open) {
      const { defaultCurrency } = findIndianDefaults(currencies, countries);

      const updates = {
        currency: defaultCurrency,
        leadValue: 0,
      };

      // Auto-select first pipeline and stage if available
      if (pipelines?.length > 0 && !form.getFieldValue('pipeline')) {
        const firstPipelineId = pipelines[0].id;
        updates.pipeline = firstPipelineId;
        setSelectedPipeline(firstPipelineId);

        // Find first stage for this pipeline
        const firstStage = stages.find(s => normalizeId(s.pipeline) === normalizeId(firstPipelineId));
        if (firstStage) {
          updates.stage = firstStage.id;
          updates.leadStage = firstStage.id; // Also set leadStage for fallback form
        }
      }

      // Only set defaults if initialValues are NOT providing them
      if (!initialValues?.source && sourcesData?.data?.length > 0 && !form.getFieldValue('source')) {
        const manualSource = sourcesData.data.find(s => s.name.trim().toLowerCase() === 'manual');
        if (manualSource) {
          updates.source = manualSource.id;
        } else {
          // If no "Manual" source found, don't set a default in the UI to avoid confusion
          // Backend or handleSubmit will handle the ultimate fallback
        }
      }

      form.setFieldsValue(updates);
    }
  }, [open, pipelines, sourcesData, stages, currencies, countries, form, initialValues]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        currency: initialValues.currency || defaultCurrency,
        phoneCode: initialValues.phoneCode || defaultPhoneCode,
      });
    }
  }, [initialValues, form, defaultCurrency, defaultPhoneCode]);

  const stripCode = (phone, codeId) => {
    if (!phone) return '';
    const country = countries?.find(c => c.id === codeId);
    if (!country) return phone;
    const cleanCode = country.phoneCode.toString().replace(/\D/g, '');
    const cleanPhone = phone.toString().replace(/\D/g, '');
    if (cleanPhone.startsWith(cleanCode)) {
      return cleanPhone.slice(cleanCode.length);
    }
    return phone;
  };

  useEffect(() => {
    if (!selectedContactId) return;

    const selectedContact = contactsResponse?.data?.find(c => c.id === selectedContactId);
    if (!selectedContact) return;

    form.setFieldsValue({
      firstName: selectedContact.first_name || '',
      lastName: selectedContact.last_name || '',
      email: selectedContact.email || '',
      telephone: stripCode(selectedContact.phone, selectedContact.phone_code || defaultPhoneCode),
      address: selectedContact.address || '',
      city: selectedContact.city || '',
      state: selectedContact.state || '',
      country: selectedContact.country || '',
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
      // Ensure pipeline & leadStage are always set (quick mode may not show these fields)
      const fallbackPipelineId = values.pipeline || pipelines?.[0]?.id;
      const normalizedPipelineId = normalizeId(fallbackPipelineId);

      if (!normalizedPipelineId) {
        message.error('Please select a pipeline');
        return;
      }

      const stagesForPipeline = stages.filter((s) => normalizeId(s.pipeline) === normalizedPipelineId);
      const fallbackStageId = values.leadStage || stagesForPipeline?.[0]?.id;

      if (!fallbackStageId) {
        message.error('No stage found for the selected pipeline');
        return;
      }

      // Extract custom fields if any
      const custom_fields = values.custom_fields || {};

      // Prepare the lead data with auto-logic for contact and defaults
      const leadFormData = {
        leadTitle: values.leadTitle || `${values.firstName || ''} ${values.lastName || ''} - New Lead`.trim(),
        leadStage: fallbackStageId,
        pipeline: normalizedPipelineId,
        currency: values.currency,
        leadValue: values.leadValue || 0,
        source: values.source || sourcesData?.data?.find(s => s.name.trim().toLowerCase() === 'manual')?.id || sourcesData?.data?.[0]?.id || "Manual",
        category: values.category || null,
        status: values.status || (isQuickMode ? undefined : pendingStatus?.id),
        interest_level: values.interest_level || "medium",
        inquiry_id: values.inquiry_id || initialValues?.inquiry_id || null,
        company_id: values.company_id || null,
        contact_id: values.contact_id || null,
        description: values.description || null,
        created_via: isQuick ? 'quick' : 'normal',
        custom_fields: custom_fields,
        form_id: activeCustomForm?.id || null,
        address: values.address || null,
        city: values.city || null,
        state: values.state || null,
        country: values.country || null,
        // Auto-contact fields
        phone: values.telephone ? stripCode(values.telephone, values.phoneCode || defaultPhoneCode) : null,
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
    // Clear stage when pipeline changes; we'll auto-select a default below
    form.setFieldValue('leadStage', undefined);
  };

  // Auto-select first stage when pipeline selected (and stage not set)
  useEffect(() => {
    const pipelineId = normalizeId(selectedPipelineId);
    if (!pipelineId) return;
    const currentStage = form.getFieldValue('leadStage');
    if (currentStage) return;
    if (!filteredStages.length) return;
    form.setFieldValue('leadStage', filteredStages[0].id);
  }, [selectedPipelineId, filteredStages, form]);

  // Auto-select "Interested" status by default
  useEffect(() => {
    if (open && statusesData?.data?.length > 0 && !form.getFieldValue('status')) {
      const interestedStatus = statusesData.data.find(s => s.name.toLowerCase() === 'interested');
      if (interestedStatus) {
        form.setFieldValue('status', interestedStatus.id);
      }
    }
  }, [open, statusesData, form]);

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
        city: undefined,
        state: undefined,
        country: undefined,
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
        city: selectedContact.city || '',
        state: selectedContact.state || '',
        country: selectedContact.country || '',
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
        city: undefined,
        state: undefined,
        country: undefined,
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
      city: undefined,
      state: undefined,
      country: undefined,
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
      city: undefined,
      state: undefined,
      country: undefined,
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2
                style={{
                  margin: "0",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                {isQuick ? "Quick Create Lead" : "Create New Lead"}
              </h2>
            </div>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              {isQuick ? "Fill essential info to quickly create a lead" : "Fill in the information to create lead"}
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
        <Form.Item name="inquiry_id" hidden={true}>
          <Input type="hidden" />
        </Form.Item>

        {activeCustomForm ? (
          <div className="dynamic-form-fields" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {Array.isArray(formFields) && formFields
              .filter(field => {
                if (isQuick) {
                  // Show if explicitly enabled for quick mode OR if it's an essential system field
                  return field.show_in_quick || (field.is_system && ['leadTitle', 'firstName', 'telephone', 'email'].includes(field.key));
                }
                return field.show_in_full !== false;
              })
              .map((field) => {
                // System Field Mapping
                if (field.is_system) {
                  if (field.key === 'leadTitle') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="leadTitle"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 2', marginBottom: '0px' }}
                        rules={[{ required: field.required, message: `Please enter ${field.label.toLowerCase()}` }]}
                      >
                        <Input prefix={<FiUser style={prefixIconStyle} />} placeholder={field.placeholder} style={inputStyle} />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'leadValue') {
                    return (
                      <Form.Item
                        key={field.id}
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 2', marginBottom: '0px' }}
                      >
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Form.Item name="currency" noStyle initialValue={defaultCurrency}>
                            <CommonSelect style={{ width: '120px' }} options={currencies?.map(c => ({ id: c.id, name: c.currencyIcon === c.currencyCode ? c.currencyCode : `${c.currencyIcon} ${c.currencyCode}` }))} allowClear={false} />
                          </Form.Item>
                          <Form.Item name="leadValue" noStyle initialValue={0}>
                            <InputNumber style={{ ...inputStyle, width: '100%' }} placeholder={field.placeholder || "Enter amount"} min={0} />
                          </Form.Item>
                        </div>
                      </Form.Item>
                    );
                  }

                  if (field.key === 'firstName') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="firstName"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                        rules={[{ required: field.required, message: `Please enter ${field.label.toLowerCase()}` }]}
                      >
                        <Input prefix={<FiUser style={prefixIconStyle} />} placeholder={field.placeholder} style={inputStyle} />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'lastName') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="lastName"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                      >
                        <Input prefix={<FiUser style={prefixIconStyle} />} placeholder={field.placeholder} style={inputStyle} />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'telephone') {
                    return (
                      <Form.Item
                        key={field.id}
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                      >
                        <Space.Compact style={{ width: '100%' }}>
                          <Form.Item name="phoneCode" noStyle initialValue={defaultPhoneCode}>
                            <Select 
                              showSearch
                              optionFilterProp="children"
                              style={{ width: '100px', height: '48px' }}
                              dropdownStyle={{ minWidth: '150px' }}
                              className="phone-code-select-modern"
                            >
                              {countries?.map(c => (
                                <Option key={c.id} value={c.id}>
                                  {c.phoneCode.startsWith('+') ? c.phoneCode : `+${c.phoneCode}`}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                          <Form.Item 
                            name="telephone" 
                            noStyle 
                            rules={[{ required: field.required, message: `Please enter ${field.label.toLowerCase()}` }]}
                          >
                            <AutoComplete
                              options={combinedSuggestions}
                              onSearch={(val) => setPhoneSearchText(val)}
                              onSelect={handleSuggestionSelect}
                              style={{ flex: 1 }}
                            >
                              <Input
                                placeholder={field.placeholder}
                                prefix={<FiPhone style={prefixIconStyle} />}
                                style={{ ...inputStyle, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                              />
                            </AutoComplete>
                          </Form.Item>
                        </Space.Compact>
                      </Form.Item>
                    );
                  }

                  if (field.key === 'email') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="email"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                      >
                        <Input prefix={<FiMail style={prefixIconStyle} />} placeholder={field.placeholder} style={inputStyle} />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'contact_id') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="contact_id"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                      >
                        <CommonSelect
                          placeholder={field.placeholder}
                          options={contactsResponse?.data?.map(c => ({ id: c.id, name: `${c.first_name} ${c.last_name}` }))}
                        />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'company_id') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="company_id"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                      >
                        <CommonSelect
                          placeholder={field.placeholder}
                          options={companyAccountsResponse?.data?.map(c => ({ id: c.id, name: c.company_name }))}
                        />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'address') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="address"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 2', marginBottom: '0px' }}
                      >
                        <Input.TextArea placeholder={field.placeholder} rows={2} style={{ borderRadius: '10px' }} />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'city') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="city"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                        rules={[{ required: field.required, message: `Please enter ${field.label.toLowerCase()}` }]}
                      >
                        <Select
                          showSearch
                          placeholder={field.placeholder || "Select city"}
                          style={selectStyle}
                          disabled={!selectedState}
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={availableCities.map(cityName => ({
                            label: cityName,
                            value: cityName
                          }))}
                        />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'state') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="state"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                        rules={[{ required: field.required, message: `Please enter ${field.label.toLowerCase()}` }]}
                      >
                        <Select
                          showSearch
                          placeholder={field.placeholder || "Select state"}
                          style={selectStyle}
                          onChange={() => {
                            form.setFieldValue('city', undefined);
                            form.setFieldValue('country', 'India');
                          }}
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={Object.keys(indianStatesAndCities).map(stateName => ({
                            label: stateName,
                            value: stateName
                          }))}
                        />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'country') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="country"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                        rules={[{ required: field.required, message: `Please enter ${field.label.toLowerCase()}` }]}
                      >
                        <Input placeholder={field.placeholder || "Enter country"} style={inputStyle} />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'pipeline') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="pipeline"
                        label={<span style={formItemStyle}>{field.label} <span style={{ color: "#ff4d4f" }}>*</span></span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                        rules={[{ required: true, message: "Please select pipeline" }]}
                      >
                        <CommonSelect
                          placeholder={field.placeholder || "Select pipeline"}
                          options={pipelines?.map(p => ({ name: p.pipeline_name, id: p.id }))}
                          onChange={handlePipelineChange}
                        />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'stage') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="stage"
                        label={<span style={formItemStyle}>{field.label} <span style={{ color: "#ff4d4f" }}>*</span></span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                        rules={[{ required: true, message: "Please select stage" }]}
                      >
                        <CommonSelect
                          placeholder={field.placeholder || "Select stage"}
                          options={(Array.isArray(stagesData) ? stagesData : (stagesData?.data || []))
                            .filter(s => normalizeId(s.pipeline) === normalizeId(selectedPipelineId))
                            .map(s => ({ name: s.stageName, id: s.id, color: s.color }))}
                          disabled={!selectedPipelineId}
                        />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'source') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="source"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                      >
                        <CommonSelect
                          placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
                          options={sourcesData?.data?.map(s => ({ label: s.name, value: s.id }))}
                        />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'category') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="category"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                      >
                        <CommonSelect
                          placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
                          options={categoriesData?.data?.map(c => ({ label: c.name, value: c.id }))}
                        />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'status') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="status"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                      >
                        <CommonSelect
                          placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
                          options={statusesData?.data?.map(s => ({ label: s.name, value: s.id }))}
                        />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'interest_level') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="interest_level"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                      >
                        <Select
                          placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
                          options={[
                            { label: 'High Interest', value: 'high' },
                            { label: 'Medium Interest', value: 'medium' },
                            { label: 'Low Interest', value: 'low' },
                          ]}
                          style={{ height: '48px', borderRadius: '10px' }}
                        />
                      </Form.Item>
                    );
                  }

                  if (field.key === 'description') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="description"
                        label={<span style={formItemStyle}>{(isQuick ? "Note / Requirement" : field.label).replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 2', marginBottom: '0px' }}
                      >
                        <Input.TextArea placeholder={field.placeholder} rows={isQuick ? 1 : 2} style={{ borderRadius: '10px' }} />
                      </Form.Item>
                    );
                  }

                  return null;
                }

                // Custom Fields
                return (
                  <Form.Item
                    key={field.id}
                    name={['custom_fields', field.id]}
                    label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                    style={{ gridColumn: field.type === 'textarea' || field.type === 'heading' ? 'span 2' : 'span 1', marginBottom: '0px' }}
                    rules={[{ required: field.required, message: `Please enter ${field.label}` }]}
                  >
                    {field.type === 'text' && <Input placeholder={field.placeholder} style={inputStyle} />}
                    {field.type === 'number' && <InputNumber style={{ ...inputStyle, width: '100%' }} placeholder={field.placeholder} />}
                    {field.type === 'email' && <Input type="email" placeholder={field.placeholder} style={inputStyle} />}
                    {field.type === 'phone' && <Input placeholder={field.placeholder} style={inputStyle} />}
                    {field.type === 'textarea' && <Input.TextArea placeholder={field.placeholder} rows={2} style={{ borderRadius: '10px' }} />}
                    {field.type === 'select' && (
                      <Select placeholder={field.placeholder} style={selectStyle}>
                        {field.options?.map(o => <Option key={o} value={o}>{o}</Option>)}
                      </Select>
                    )}
                    {field.type === 'rating' && <Rate />}
                  </Form.Item>
                );
              })}
          </div>
        ) : (
          <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Standard Fallback Form */}
            {!isQuick && (
              <Form.Item
                name="leadTitle"
                label={<span style={formItemStyle}>Lead Title <span style={{ color: "#ff4d4f" }}>*</span></span>}
                style={{ gridColumn: 'span 2', marginBottom: '0px' }}
                rules={[{ required: true, message: "Please enter lead title" }]}
              >
                <Input prefix={<FiUser style={prefixIconStyle} />} placeholder="Enter lead title" style={inputStyle} />
              </Form.Item>
            )}

            {!isQuick && (
              <Form.Item
                name="leadValue"
                label={<span style={formItemStyle}>Lead Value</span>}
                style={{ gridColumn: 'span 2', marginBottom: '0px' }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Form.Item name="currency" noStyle initialValue={defaultCurrency}>
                    <CommonSelect style={{ width: '120px' }} options={currencies?.map(c => ({ id: c.id, name: c.currencyCode }))} allowClear={false} />
                  </Form.Item>
                  <Form.Item name="leadValue" noStyle initialValue={0}>
                    <InputNumber style={{ ...inputStyle, width: '100%' }} placeholder="Enter amount" min={0} />
                  </Form.Item>
                </div>
              </Form.Item>
            )}

            <Form.Item name="firstName" label={<span style={formItemStyle}>Full Name <span style={{ color: "#ff4d4f" }}>*</span></span>} rules={[{ required: true, message: "Full Name is required" }]}>
              <Input prefix={<FiUser style={prefixIconStyle} />} placeholder="Enter full name" style={inputStyle} />
            </Form.Item>

            <Form.Item name="lastName" label={<span style={formItemStyle}>Last Name (Optional)</span>}>
              <Input prefix={<FiUser style={prefixIconStyle} />} placeholder="Last Name" style={inputStyle} />
            </Form.Item>

            <Form.Item name="telephone" label={<span style={formItemStyle}>Phone Number (Optional)</span>}>
              <Input prefix={<FiPhone style={prefixIconStyle} />} placeholder="Enter phone number" style={inputStyle} />
            </Form.Item>

            <Form.Item name="email" label={<span style={formItemStyle}>Email (Optional)</span>}>
              <Input prefix={<FiMail style={prefixIconStyle} />} placeholder="Email" style={inputStyle} />
            </Form.Item>

            <Form.Item name="description" label={<span style={formItemStyle}>{isQuick ? "Note / Requirement" : "Description (Optional)"}</span>} style={{ gridColumn: 'span 2' }}>
              <Input.TextArea placeholder={isQuick ? "Enter note / requirement" : "Enter description"} rows={isQuick ? 1 : 2} style={{ borderRadius: '10px' }} />
            </Form.Item>

            {!isQuick && (
              <>
                {/* Sales Pipeline Info */}
                <Form.Item
                  name="pipeline"
                  label={<span style={formItemStyle}>Pipeline <span style={{ color: "#ff4d4f" }}>*</span></span>}
                  rules={[{ required: true, message: "Please select pipeline" }]}
                >
                  <CommonSelect
                    placeholder="Select pipeline"
                    options={pipelines}
                    onChange={handlePipelineChange}
                    onAddClick={handleAddPipelineClick}
                    addButtonText="Create Pipeline"
                  />
                </Form.Item>

                <Form.Item
                  name="stage"
                  label={<span style={formItemStyle}>Stage <span style={{ color: "#ff4d4f" }}>*</span></span>}
                  rules={[{ required: true, message: "Please select stage" }]}
                >
                  <CommonSelect
                    placeholder="Select stage"
                    options={stagesData?.filter(s => s.pipeline_id === selectedPipelineId)}
                    disabled={!selectedPipelineId}
                  />
                </Form.Item>

                <Form.Item name="source" label={<span style={formItemStyle}>Source <span style={{ color: "#ff4d4f" }}>*</span></span>} rules={[{ required: true, message: "Please select source" }]}>
                  <CommonSelect
                    placeholder="Select source"
                    options={sourcesData?.data}
                    onAddClick={handleAddSourceClick}
                    addButtonText="Create Source"
                    onDelete={handleDeleteSource}
                  />
                </Form.Item>

                <Form.Item name="category" label={<span style={formItemStyle}>Category (Optional)</span>}>
                  <CommonSelect
                    placeholder="Select category"
                    options={categoriesData?.data}
                    onAddClick={handleAddCategoryClick}
                    addButtonText="Create Category"
                    onDelete={handleDeleteCategory}
                  />
                </Form.Item>

                {/* Additional Details */}
                <Divider style={{ gridColumn: 'span 2' }}>Additional Details</Divider>

                <Form.Item name="company_id" label={<span style={formItemStyle}>Select Company (Optional)</span>} style={{ gridColumn: 'span 1' }}>
                  <CommonSelect
                    placeholder="Select company"
                    options={companyAccountsResponse?.data?.map(c => ({ id: c.id, name: c.company_name }))}
                    onAddClick={handleAddCompanyClick}
                    addButtonText="Create Company"
                    onChange={handleCompanyChange}
                  />
                </Form.Item>

                <Form.Item name="address" label={<span style={formItemStyle}>Address (Optional)</span>} style={{ gridColumn: 'span 1' }}>
                  <Input.TextArea placeholder="Enter address" rows={1} style={{ borderRadius: '10px' }} />
                </Form.Item>
              </>
            )}
          </div>
        )}

        <Divider style={{ margin: "24px 0" }} />

        {/* Form Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          {isQuick && (
            <Button
              size="large"
              onClick={() => setIsQuick(false)}
              style={{
                borderRadius: "10px",
                fontWeight: "500",
                marginRight: 'auto',
                color: '#1890ff',
                borderColor: '#1890ff'
              }}
            >
              Add More Details
            </Button>
          )}
          <Button size="large" onClick={handleCancel} style={{ borderRadius: "10px", fontWeight: "500" }}>
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={isLoading}
            style={{
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              fontWeight: "500",
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

      <style>{`
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
