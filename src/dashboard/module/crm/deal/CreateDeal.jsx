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
  InputNumber,
  Row,
  Col,
  Popconfirm,
  Segmented,
  AutoComplete,
  Tag,
} from "antd";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiX,
  FiBriefcase,
  FiShoppingBag,
  FiDollarSign,
  FiMapPin,
  FiChevronDown,
  FiUsers,
  FiUserPlus,
  FiCalendar,
  FiInfo,
  FiTrash2,
} from "react-icons/fi";
import { useCreateDealMutation, useGetDealsQuery } from "./services/DealApi";
import { useGetCustomFormsQuery } from "../generate-link/services/customFormApi";
import { PlusOutlined } from "@ant-design/icons";

import { selectCurrentUser } from "../../../../auth/services/authSlice";
import AddPipelineModal from "../crmsystem/pipeline/AddPipelineModal";
import "./Deal.scss";

import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useUpdateLeadMutation } from "../lead/services/LeadApi";
import {
  useGetContactsQuery,
  useCreateContactMutation,
} from "../contact/services/contactApi";
import { useGetCompanyAccountsQuery } from "../companyacoount/services/companyAccountApi";
import AddCompanyModal from "../companyacoount/CreateCompanyAccount";
import AddContactModal from "../contact/CreateContact";
import {
  useGetAllCountriesQuery,
  useGetAllCurrenciesQuery,
} from "../../settings/services/settingsApi";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useGetSourcesQuery,
  useDeleteSourceMutation,
} from "../crmsystem/souce/services/SourceApi";
import AddSourceModal from "../crmsystem/souce/AddSourceModal";
import AddCategoryModal from "../crmsystem/souce/AddCategoryModal";
import AddStageModal from "../crmsystem/leadstage/AddLeadStageModal";
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
  console.log("CreateDeal Component Loaded");
  // console.log("leadData", leadData);
  const loggedInUser = useSelector(selectCurrentUser);


  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);
  const selectRef = useRef(null);
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const [isAddStageVisible, setIsAddStageVisible] = useState(false);
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

  // Fetch Active Custom Form for Deal
  // Fetch Active Custom Form for Deal
  const { data: customFormsData } = useGetCustomFormsQuery({ module_type: 'deal', status: 'active' });
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

  const [deleteSource] = useDeleteSourceMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [isAddSourceVisible, setIsAddSourceVisible] = useState(false);
  const [isAddCategoryVisible, setIsAddCategoryVisible] = useState(false);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const sourceSelectRef = useRef(null);
  const categorySelectRef = useRef(null);

  // Add state to track selected pipeline
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [phoneSearchText, setPhoneSearchText] = useState("");

  const { data: contactSuggestions } = useGetContactsQuery(
    {
      search: phoneSearchText,
    },
    { skip: !phoneSearchText || phoneSearchText.length < 2 }
  );

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

    // Add companies
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
        form.setFieldsValue({
          firstName: contact.first_name || '',
          lastName: contact.last_name || '',
          email: contact.email || '',
          telephone: contact.phone || '',
          address: contact.address || '',
          company_id: contact.company_name || undefined,
          contact_id: contact.id
        });
      }
    } else if (option.type === 'company') {
      const company = option.company;
      form.setFieldsValue({
        company_id: company.id,
        telephone: company.phone_number || '',
        address: company.billing_address || '',
        email: company.email || '',
        contact_id: undefined,
        firstName: undefined,
        lastName: undefined,
      });
    }
  };


  // Filter stages based on selected pipeline
  const filteredStages = React.useMemo(() => {
    if (!selectedPipeline || !dealStages) return [];
    
    const currentPipelineId = String(selectedPipeline?.id || selectedPipeline);
    const stagesList = Array.isArray(dealStages) ? dealStages : (dealStages?.data || []);
    
    return stagesList.filter((stage) => {
      const stagePipelineId = String(stage.pipeline?.id || stage.pipeline);
      return stage.stageType === "deal" && stagePipelineId === currentPipelineId;
    });
  }, [dealStages, selectedPipeline]);

  // Get default stage for selected pipeline
  const getDefaultStage = (pipelineId) => {
    const defaultStage = dealStages?.find(
      (stage) =>
        stage.stageType === "deal" &&
        stage.pipeline === pipelineId &&
        stage.isDefault
    );
    return defaultStage?.id;
  };


  // Handle pipeline selection change
  const handlePipelineChange = (value) => {
    setSelectedPipeline(value);
    // Set the default stage for this pipeline
    const defaultStage = getDefaultStage(value);
    if (defaultStage) {
      form.setFieldsValue({
        stage: defaultStage,
      });
    }
  };

  // Handle manual value change
  const handleValueChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setManualValue(numValue);
    form.setFieldsValue({ value: numValue });
  };

  // Add handlers for source and category
  const handleAddSourceClick = (e) => {
    e.stopPropagation();
    setSourceDropdownOpen(false);
    setIsAddSourceVisible(true);
  };

  const handleAddCategoryClick = (e) => {
    e.stopPropagation();
    setCategoryDropdownOpen(false);
    setIsAddCategoryVisible(true);
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

  // Category handlers
  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId).unwrap();
      message.success("Category deleted successfully");
      // Clear the category field if the deleted category was selected
      if (form.getFieldValue("category") === categoryId) {
        form.setFieldValue("category", undefined);
      }
    } catch (error) {
      message.error(error.data?.message || "Failed to delete category");
    }
  };

  // Modify the useEffect to handle lead conversion properly
  useEffect(() => {
    if (leadData && open) {
      console.log("Setting form values with leadData:", leadData);

      // Find the contact if contact_id exists
      const existingContact = contactsResponse?.data?.find(
        (c) => c.id === leadData.contact_id
      );

      // Find if the company exists in companyAccounts
      const existingCompany = companyAccountsResponse?.data?.find(
        (c) => c.id === leadData.company_id
      );

      // Get default stage for the pipeline
      const defaultStage = getDefaultStage(leadData.pipeline);

      // Set form values
      const formValues = {
        dealTitle: leadData.leadTitle || "",
        value: leadData.value || leadData.leadValue || 0, // Try both value and leadValue
        source: leadData.source || null,
        category: leadData.category || null,
        pipeline: leadData.pipeline || null,
        stage: defaultStage || null,
        currency: leadData.currency || defaultCurrency,
        company_id: leadData.company_id || null,
      };

      // If contact exists, set contact-related fields
      if (existingContact) {
        formValues.firstName = existingContact.id;
        formValues.email = existingContact.email || "";
        formValues.telephone = existingContact.phone
          ? existingContact.phone.replace(/^\+\d+\s/, "")
          : "";
        formValues.phoneCode = existingContact.phone_code || defaultPhoneCode;
        formValues.address = existingContact.address || "";
        
        // If lead has no company but contact DOES, use contact's company
        if (!formValues.company_id && existingContact.company_name) {
          formValues.company_id = existingContact.company_name;
        }
        
        setSelectedContact(existingContact);
        setContactMode("existing");
      }

      // If company exists (either from lead or contact), update company-related fields
      const finalCompanyId = formValues.company_id;
      const finalCompany = companyAccountsResponse?.data?.find(c => c.id === finalCompanyId);
      
      if (finalCompany) {
        formValues.company_id = finalCompany.id;
        setNewCompanyName(finalCompany.company_name || "");
        
        // Populate filtered contacts for this company
        if (contactsResponse?.data) {
          const filtered = contactsResponse.data.filter(
            (contact) => contact.company_name === finalCompany.id
          );
          setFilteredContacts(filtered);
        }
      }

      // Set form values
      form.setFieldsValue(formValues);

      // Set manual value for value field
      setManualValue(leadData.value || leadData.leadValue || 0);

      // Set selected pipeline if lead data has pipeline
      if (leadData.pipeline) {
        setSelectedPipeline(leadData.pipeline);
      }

      setContactMode(existingContact ? "existing" : "new");
    }
  }, [
    leadData,
    form,
    open,
    currencies,
    countries,
    companyAccountsResponse?.data,
    contactsResponse?.data,
    defaultCurrency,
    defaultPhoneCode,
    getDefaultStage,
  ]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList([]);
    }
  }, [open, form]);

  // Set default values for blank deal form
  useEffect(() => {
    if (open && !leadData) {
      const updates = {
        currency: defaultCurrency,
        value: 0,
      };

      if (pipelines?.length > 0 && !form.getFieldValue('pipeline')) {
        const firstPipelineId = pipelines[0].id;
        updates.pipeline = firstPipelineId;
        setSelectedPipeline(firstPipelineId);
        
        // Find first stage for this pipeline
        const firstStage = dealStages?.find(s => 
          String(s.pipeline?.id || s.pipeline) === String(firstPipelineId) && 
          s.stageType === 'deal'
        );
        if (firstStage) updates.stage = firstStage.id;
      }
      
      if (sources?.length > 0 && !form.getFieldValue('source')) {
        updates.source = sources[0].id;
      }

      form.setFieldsValue(updates);
    }
  }, [open, leadData, pipelines, dealStages, sources, form, defaultCurrency]);

  const { data: dealsData } = useGetDealsQuery();

  const handleSubmit = async (values) => {
    try {
      // Check if deal with same title already exists
      const dealExists = dealsData?.data?.some(
        (deal) =>
          deal.dealTitle.toLowerCase() === values.dealTitle.toLowerCase()
      );

      if (dealExists) {
        message.error("A deal with this title already exists");
        return;
      }

      let contactId; // Debug log

      // Only proceed with contact creation if deal name is unique
      if (
        contactMode === "new" &&
        (values.firstName ||
          values.lastName ||
          values.email ||
          values.telephone ||
          values.address)
      ) {
        try {
          // Format phone with country code
          let formattedPhone = "";
          if (values.telephone && values.phoneCode) {
            const selectedCountry = countries.find(
              (c) => c.id === values.phoneCode
            );
            if (selectedCountry) {
              formattedPhone = `+${selectedCountry.phoneCode.replace(
                "+",
                ""
              )} ${values.telephone}`;
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
            description: `Contact created from deal form by ${
              loggedInUser?.username || "user"
            }`,
            address: values.address || "",
            client_id: loggedInUser?.client_id,
            contact_owner: loggedInUser?.id,
          };

          const contactResponse = await createContact(contactData).unwrap();

          if (contactResponse?.id) {
            contactId = contactResponse.id;
            message.success("Contact created successfully");
          } else if (contactResponse?.data?.id) {
            contactId = contactResponse.data.id;
            message.success("Contact created successfully");
          } else {
            throw new Error("Contact creation failed - no ID returned");
          }
        } catch (error) {
          message.error(error.data?.message || "Failed to create contact");
          return;
        }
      } else if (contactMode === "existing") {
        contactId = values.firstName; // In existing mode, firstName field contains the contact ID
      }

      // Format phone number for deal
      const formattedPhone = values.telephone
        ? `+${values.phoneCode} ${values.telephone}`
        : null;

      // Get the stage from values or fallback to default
      let stageId = values.stage;
      if (!stageId) {
        stageId = getDefaultStage(values.pipeline);
      }

      if (!stageId) {
        message.error("Please select a stage for the deal");
        return;
      }

      // Extract custom fields if any
      const custom_fields = values.custom_fields || {};

      const dealData = {
        dealTitle: values.dealTitle || "New Deal",
        email: values.email,
        phone: formattedPhone,
        pipeline: values.pipeline || pipelines?.[0]?.id,
        stage: stageId,
        value: parseFloat(values.value) || 0,
        currency: values.currency,
        closedDate: values.closedDate
          ? new Date(values.closedDate).toISOString()
          : null,
        source: values.source || sources?.[0]?.id || null,
        company_id: values.company_id || null,
        contact_id: contactId || null,
        category: values.category,
        address: values.address,
        leadId: leadData?.id,
        custom_fields: custom_fields,
        form_id: activeCustomForm?.id || null,
      };


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
          message.warning(
            "Deal created but failed to update lead status. Please refresh the page."
          );
        }
      }

      message.success("Deal created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
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

  const handleAddStageClick = (e) => {
    e.stopPropagation();
    setIsAddStageVisible(true);
  };

  const handleStageCreationSuccess = (newStage) => {
    setIsAddStageVisible(false);
    form.setFieldsValue({ stage: newStage.id });
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

  const handleFirstNameChange = (contactId) => {
    if (!contactId) {
      form.setFieldsValue({
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        phone: undefined,
        address: undefined,
        company_id: undefined,
      });
      setSelectedContact(null);
      return;
    }

    // Find the selected contact from all contacts
    const contact = contactsResponse?.data?.find((c) => c.id === contactId);
    if (contact) {
      // Sync company with contact
      form.setFieldsValue({
        firstName: contact.id, 
        lastName: contact.last_name, 
        email: contact.email,
        phone: contact.phone?.replace(/^\+\+91\s/, ""),
        address: contact.address,
        company_id: contact.company_name || undefined,
      });
      setSelectedContact(contact);

      // Handle contact list filtering
      if (contact.company_name && contactsResponse?.data) {
        // If contact has a company, filter list to show coworkers
        const filtered = contactsResponse.data.filter(
          (c) => c.company_name === contact.company_name
        );
        setFilteredContacts(filtered);
      } else {
        // If contact has NO company, show all contacts in the list
        setFilteredContacts([]);
      }
    }
  };

  const handleCompanyChange = (companyId) => {
    // Set the company_id field with the selected company ID
    form.setFieldsValue({
      company_id: companyId,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      address: undefined,
    });

    // Filter contacts based on selected company
    if (companyId && contactsResponse?.data) {
      const filteredContacts = contactsResponse.data.filter(
        (contact) => contact.company_name === companyId
      );
      setFilteredContacts(filteredContacts);
    } else {
      setFilteredContacts([]);
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
      company_id: newCompany.id,
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
  const [contactMode, setContactMode] = useState("existing");

  // Update the currency select options rendering
  const renderCurrencyOption = (currency) => (
    <Option key={currency.id} value={currency.id}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "14px" }}>{currency.currencyIcon}</span>
        <span style={{ fontSize: "14px" }}>{currency.currencyCode}</span>
      </div>
    </Option>
  );

  // Add this function to get currency display info
  const getCurrencyDisplay = (currencyId) => {
    const currency = currencies?.find((c) => c.id === currencyId);
    return currency ? (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "14px" }}>{currency.currencyIcon}</span>
        <span style={{ fontSize: "14px" }}>{currency.currencyCode}</span>
      </div>
    ) : null;
  };

  // Move getCurrencyCode inside component where currencies is available
  const getCurrencyCode = (currencyId) => {
    const currency = currencies?.find((c) => c.id === currencyId);
    return currency?.currencyCode || "INR";
  };

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
        className="deal-form custom-form"
        style={{ padding: "24px" }}
      >
        {activeCustomForm ? (
          <div className="dynamic-form-fields" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {Array.isArray(formFields) && formFields
              .filter(field => field.show_in_full !== false)
              .map((field) => {
                // System Field Mapping
                if (field.is_system) {
                  if (field.key === 'dealTitle') {
                    return (
                      <Form.Item
                        key={field.id}
                        name="dealTitle"
                        label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 2', marginBottom: '0px' }}
                        rules={[{ required: field.required, message: `Please enter ${field.label.toLowerCase()}` }]}
                      >
                        <Input prefix={<FiShoppingBag style={prefixIconStyle} />} placeholder={field.placeholder} style={inputStyle} />
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
                        name="telephone"
                                                  label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                      >
                        <AutoComplete
                          options={combinedSuggestions}
                          onSearch={(val) => setPhoneSearchText(val)}
                          onSelect={handleSuggestionSelect}
                        >
                          <Input 
                            prefix={<FiPhone style={prefixIconStyle} />} 
                            placeholder={field.placeholder} 
                            style={inputStyle} 
                          />
                        </AutoComplete>
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

                  if (field.key === 'value') {
                    return (
                      <Form.Item
                        key={field.id}
                                                  label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                        style={{ gridColumn: 'span 2', marginBottom: '0px' }}
                      >
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Form.Item name="currency" noStyle initialValue={defaultCurrency}>
                            <Select style={{ width: '120px' }}>
                              {currencies?.map(c => <Option key={c.id} value={c.id}>{c.currencyCode}</Option>)}
                            </Select>
                          </Form.Item>
                          <Form.Item name="value" noStyle initialValue={0}>
                            <InputNumber style={{ ...inputStyle, width: '100%' }} placeholder={field.placeholder || "Enter amount"} min={0} />
                          </Form.Item>
                        </div>
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
                        <Select 
                          placeholder={field.placeholder || "Select pipeline"}
                          style={selectStyle}
                          onChange={handlePipelineChange}
                        >
                          {pipelines.map(p => <Option key={p.id} value={p.id}>{p.pipeline_name}</Option>)}
                        </Select>
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
                        <Select 
                          placeholder={field.placeholder || "Select stage"}
                          style={selectStyle}
                          disabled={!selectedPipeline}
                        >
                          {filteredStages.map(s => <Option key={s.id} value={s.id}>{s.stageName}</Option>)}
                        </Select>
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
                        <Select placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} style={selectStyle}>
                           {sources?.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                        </Select>
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
                          <Select placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} style={selectStyle}>
                            {categories?.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                          </Select>
                        </Form.Item>
                      );
                    }
                    return null;
                  }

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
                      {field.type === 'phone' && <Input prefix={<FiPhone style={prefixIconStyle} />} placeholder={field.placeholder} style={inputStyle} />}
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
              <div 
                className="form-grid" 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                  marginBottom: '24px'
                }}
              >
                <Form.Item
                  name="dealTitle"
                  label={<span style={formItemStyle}>Deal Title <span style={{ color: "#ff4d4f" }}>*</span></span>}
                  style={{ gridColumn: 'span 2', marginBottom: '0px' }}
                  rules={[{ required: true, message: "Please enter deal title" }]}
                >
                  <Input prefix={<FiShoppingBag style={prefixIconStyle} />} placeholder="Enter deal title" style={inputStyle} />
                </Form.Item>

                <Form.Item
                  name="pipeline"
                  label={<span style={formItemStyle}>Pipeline <span style={{ color: "#ff4d4f" }}>*</span></span>}
                  rules={[{ required: true, message: "Please select pipeline" }]}
                >
                  <Select placeholder="Select pipeline" style={selectStyle} onChange={handlePipelineChange}>
                    {pipelines.map(p => <Option key={p.id} value={p.id}>{p.pipeline_name}</Option>)}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="stage"
                  label={<span style={formItemStyle}>Stage <span style={{ color: "#ff4d4f" }}>*</span></span>}
                  rules={[{ required: true, message: "Please select stage" }]}
                >
                  <Select placeholder="Select stage" style={selectStyle} disabled={!selectedPipeline}>
                    {filteredStages.map(s => <Option key={s.id} value={s.id}>{s.stageName}</Option>)}
                  </Select>
                </Form.Item>

                <>
                  <Form.Item label={<span style={formItemStyle}>Deal Value (Optional)</span>} style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Form.Item name="currency" noStyle initialValue={defaultCurrency}>
                        <Select style={{ width: '120px' }}>
                          {currencies?.map(c => <Option key={c.id} value={c.id}>{c.currencyCode}</Option>)}
                        </Select>
                      </Form.Item>
                      <Form.Item name="value" noStyle initialValue={0}>
                        <InputNumber style={{ ...inputStyle, width: '100%' }} placeholder="Enter amount" min={0} />
                      </Form.Item>
                    </div>
                  </Form.Item>

                  <Form.Item name="source" label={<span style={formItemStyle}>Source (Optional)</span>}>
                    <Select placeholder="Select source" style={selectStyle}>
                      {sources?.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                    </Select>
                  </Form.Item>

                  <Form.Item name="category" label={<span style={formItemStyle}>Category (Optional)</span>}>
                    <Select placeholder="Select category" style={selectStyle}>
                      {categories?.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                    </Select>
                  </Form.Item>

                  <Divider style={{ gridColumn: 'span 2' }}>Associations (Optional)</Divider>

                  <Form.Item name="contact_id" label={<span style={formItemStyle}>Select Contact (Optional)</span>}>
                    <Select placeholder="Select contact" style={selectStyle}>
                      {contactsResponse?.data?.map(c => <Option key={c.id} value={c.id}>{c.first_name} {c.last_name}</Option>)}
                    </Select>
                  </Form.Item>

                  <Form.Item name="company_id" label={<span style={formItemStyle}>Select Company (Optional)</span>}>
                    <Select placeholder="Select company" style={selectStyle}>
                      {companyAccountsResponse?.data?.map(c => <Option key={c.id} value={c.id}>{c.company_name}</Option>)}
                    </Select>
                  </Form.Item>
                </>
              </div>
            )}

            <Divider style={{ margin: "24px 0" }} />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <Button
                onClick={handleCancel}
                size="large"
                style={{
                  padding: "8px 24px",
                  height: "44px",
                  borderRadius: "10px",
                  border: "1px solid #e6e8eb",
                  fontWeight: "500"
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreatingDeal}
                size="large"
                style={{
                  padding: "8px 24px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                  border: "none",
                  fontWeight: "500"
                }}
              >
                Create Deal
              </Button>
            </div>
          </Form>
        </Spin>

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

        <AddSourceModal
          isOpen={isAddSourceVisible}
          onClose={(success) => {
            setIsAddSourceVisible(false);
            if (success) {
              setSourceDropdownOpen(true);
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

        <style>{`
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
            .ant-select:not(.ant-select-customize-input) .ant-select-selector {
              background-color: #f8fafc !important;
              border: 1px solid #e6e8eb !important;
              border-radius: 10px !important;
              min-height: 48px !important;
              padding: 8px !important;
              display: flex !important;
              align-items: center !important;
            }
          }
        `}</style>
      </Modal>
    </>
  );
};

export default CreateDeal;
