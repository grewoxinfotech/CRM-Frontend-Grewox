import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Divider,
  DatePicker,
  message,
  InputNumber,
  Popconfirm,
  Tag,
  AutoComplete,
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
  FiCalendar,
  FiUsers,
  FiTag,
  FiShield,
  FiUserPlus,
  FiBox,
  FiTrash2,
  FiLayers,
  FiHash,
} from "react-icons/fi";
import { useUpdateDealMutation, useGetDealsQuery } from "./services/DealApi";
import {
  useGetAllCurrenciesQuery,
  useGetAllCountriesQuery,
} from "../../../module/settings/services/settingsApi";
import "./Deal.scss";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import {
  useGetDealStagesQuery,
  useDeleteDealStageMutation,
  useUpdateDealStageMutation,
} from "../crmsystem/dealstage/services/dealStageApi";
import AddPipelineModal from "../crmsystem/pipeline/AddPipelineModal";
import { PlusOutlined } from "@ant-design/icons";
import { useGetUsersQuery } from "../../user-management/users/services/userApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetRolesQuery } from "../../hrm/role/services/roleApi";
import CreateUser from "../../user-management/users/CreateUser";
import {
  useGetLabelsQuery,
  useGetSourcesQuery,
} from "../crmsystem/souce/services/SourceApi";
import AddCompanyModal from "../companyacoount/CreateCompanyAccount";
import AddContactModal from "../contact/CreateContact";
import { useGetCompanyAccountsQuery } from "../companyacoount/services/companyAccountApi";
import { useGetContactsQuery } from "../contact/services/contactApi";
import { useCreateContactMutation } from "../contact/services/contactApi";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "../crmsystem/souce/services/SourceApi";
import { useDeleteSourceMutation } from "../crmsystem/souce/services/SourceApi";
import AddSourceModal from "../crmsystem/souce/AddSourceModal";
import AddCategoryModal from "../crmsystem/souce/AddCategoryModal";
import AddDealStageModal from "../crmsystem/dealstage/AddDealStageModal";
import { useGetCustomFormsQuery } from '../generate-link/services/customFormApi';

// import { useGetAllUsersQuery } from "../../../module/user/services/userApi";
dayjs.extend(customParseFormat);

const { Text } = Typography;
const { Option } = Select;

const EditDeal = ({ open, onCancel, initialValues }) => {
  const [form] = Form.useForm();
  const [updateDeal, { isLoading }] = useUpdateDealMutation();
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const [isAddCompanyVisible, setIsAddCompanyVisible] = useState(false);
  const [isAddContactVisible, setIsAddContactVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [manualValue, setManualValue] = useState(0);
    const selectRef = useRef(null);

  // Get logged in user first
  const loggedInUser = useSelector(selectCurrentUser);

  // Group all queries together
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: dealStages = [], refetch: refetchDealStages } =
    useGetDealStagesQuery();
  const { refetch } = useGetDealsQuery();
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const { data: currencies } = useGetAllCurrenciesQuery({
    page: 1,
    limit: 100,
  });
  const { data: countries = [] } = useGetAllCountriesQuery({
    page: 1,
    limit: 100,
  });
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);
  const { data: companyAccountsData, isLoading: isCompanyLoading } = useGetCompanyAccountsQuery();
  const { data: contactsData, isLoading: isContactLoading } = useGetContactsQuery();
  const [createContact] = useCreateContactMutation();

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

  // Find default country (India) for phone code
  const indiaCountry = countries?.find((c) => c.countryCode === "IN");
  const defaultPhoneCode = indiaCountry?.id;

  // Find default currency (INR) or use first available
  const defaultCurrency =
    currencies?.find((c) => c.currencyCode === "INR")?.id ||
    currencies?.[0]?.id;
  const selectedCurrency = initialValues?.currency || defaultCurrency;

  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
  const { data: labelsData } = useGetLabelsQuery(loggedInUser?.id);
  const products = []; // productsData?.data || []; // This line is removed

  const sources = sourcesData?.data || [];
  const labels = labelsData?.data || [];
  const categories = categoriesData?.data || [];

  const [contactMode, setContactMode] = useState("existing");
  const [isAddSourceVisible, setIsAddSourceVisible] = useState(false);
  const [isAddCategoryVisible, setIsAddCategoryVisible] = useState(false);

  const [deleteSource] = useDeleteSourceMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  // Add state variables for dropdowns
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const sourceSelectRef = useRef(null);
  const categorySelectRef = useRef(null);

  const [isAddStageVisible, setIsAddStageVisible] = useState(false);
  const [deleteStage] = useDeleteDealStageMutation();
  const [updateStage] = useUpdateDealStageMutation();
  const [isSelectDefaultModalOpen, setIsSelectDefaultModalOpen] =
    useState(false);
  const [stageToDelete, setStageToDelete] = useState(null);

  // Get pipeline name by ID
  const getPipelineName = (pipelineId) => {
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    return pipeline ? pipeline.pipeline_name : "";
  };

  // Get stage name by ID
  const getStageName = (stageId) => {
    const stage = dealStages.find((s) => s.id === stageId);
    return stage ? stage.stageName : "";
  };

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
      companyAccountsData?.data?.filter(company => 
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
  }, [contactSuggestions, companyAccountsData, phoneSearchText]);

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

  // Filter stages by pipeline and type
  const filteredStages = dealStages?.filter(
    (stage) =>
      stage.stageType === "deal" && stage.pipeline === initialValues?.pipeline
  );

  // const { data: users = [] } = useGetAllUsersQuery({
  //   page: 1,
  //   limit: 100,
  // });
  const subclientRoleId = rolesData?.data?.find(
    (role) => role?.role_name === "sub-client"
  )?.id;

  // Filter users to get team members (excluding subclients)
  const users =
    usersResponse?.data?.filter(
      (user) =>
        user?.created_by === loggedInUser?.username &&
        user?.role_id !== subclientRoleId
    ) || [];

  const handlePipelineChange = (value) => {
    setSelectedPipeline(value);
    form.setFieldValue("stage", undefined);
  };

  const handleCreateUser = () => {
    setIsCreateUserVisible(true);
  };

  const handleCreateUserSuccess = (newUser) => {
    setIsCreateUserVisible(false);
    // Add the newly created user to the selected team members
    const currentMembers = form.getFieldValue("deal_members") || [];
    form.setFieldValue("deal_members", [...currentMembers, newUser.id]);
  };

  useEffect(() => {
    if (initialValues) {
      // Parse assigned_to if it's a string
      let assignedTo = initialValues.deal_members;
      if (typeof assignedTo === "string") {
        try {
          assignedTo = JSON.parse(assignedTo);
        } catch (e) {
          assignedTo = { deal_members: [] };
        }
      }

      // Parse deal_members if it's a string
      let dealMembers = [];
      if (typeof initialValues.deal_members === "string") {
        try {
          const parsedDealMembers = JSON.parse(initialValues.deal_members);
          dealMembers = parsedDealMembers.deal_members || [];
        } catch (e) {
          dealMembers = [];
        }
      }

      // Set contact mode based on whether there's an existing contact
      setContactMode(initialValues.contact_id ? "existing" : "new");

      // Find the currency object from the currencies array
      const currencyObj =
        currencies?.find((c) => c.id === initialValues.currency) ||
        currencies?.find((c) => c.currencyCode === "INR");

      const formValues = {
        dealTitle: initialValues.dealTitle,
        value: initialValues.value || 0,
        currency: initialValues.currency,
        pipeline: initialValues.pipeline,
        stage: initialValues.stage,
        company_id: initialValues.company_id,
        contact_id: initialValues.contact_id,
        source: initialValues.source,
        category: initialValues.category,
        closedDate: initialValues.closedDate ? dayjs(initialValues.closedDate) : null,
        status: initialValues.status || "pending",
        deal_members: dealMembers,
        is_won: initialValues.is_won,
        // Add contact details for 'new' mode
        firstName: initialValues.firstName || "",
        lastName: initialValues.lastName || "",
        email: initialValues.email || "",
        phoneCode: initialValues.phoneCode || defaultPhoneCode,
        telephone: initialValues.telephone || "",
        address: initialValues.address || "",
      };

      // Set the selected pipeline for stage filtering
      setSelectedPipeline(initialValues.pipeline);

      // Set form values
      form.setFieldsValue(formValues);
    }
  }, [initialValues, form, currencies, defaultPhoneCode, defaultCurrency]);

  // Add a new useEffect to handle data loading and form updates
  useEffect(() => {
    if (companyAccountsData?.data && contactsData?.data && initialValues) {
      const selectedCompany = companyAccountsData.data.find(
        (company) => company.id === initialValues.company_id
      );
      const selectedContact = contactsData.data.find(
        (contact) => contact.id === initialValues.contact_id
      );

      if (selectedCompany || selectedContact) {
        const updatedValues = {};
        
        if (selectedCompany) {
          updatedValues.company_id = selectedCompany.id;
        }
        
        if (selectedContact) {
          updatedValues.contact_id = selectedContact.id;
          updatedValues.firstName = selectedContact.first_name || "";
          updatedValues.lastName = selectedContact.last_name || "";
          updatedValues.email = selectedContact.email || "";
          updatedValues.telephone = selectedContact.phone || "";
          updatedValues.address = selectedContact.address || "";
        }

        form.setFieldsValue(updatedValues);
      }
    }
  }, [companyAccountsData?.data, contactsData?.data, initialValues, form]);

  const getRoleColor = (role) => {
    const roleColors = {
      employee: {
        color: "#D46B08",
        bg: "#FFF7E6",
        border: "#FFD591",
      },
      admin: {
        color: "#096DD9",
        bg: "#E6F7FF",
        border: "#91D5FF",
      },
      manager: {
        color: "#08979C",
        bg: "#E6FFFB",
        border: "#87E8DE",
      },
      default: {
        color: "#531CAD",
        bg: "#F9F0FF",
        border: "#D3ADF7",
      },
    };
    return roleColors[role?.toLowerCase()] || roleColors.default;
  };

  const handleSubmit = async (values) => {
    try {
      // Get all selected team members
      const selectedMembers = values.deal_members || [];

      // Prepare deal update data
      const dealData = {
        id: initialValues.id,
        dealTitle: values.dealTitle,
        currency: values.currency,
        value: parseFloat(values.value) || 0,
        pipeline: values.pipeline,
        stage: values.stage,
        status: values.status,
        closedDate: values.closedDate
          ? dayjs(values.closedDate).format("YYYY-MM-DD")
          : null,
        company_id: values.company_id || null,
        contact_id: values.contact_id || null,
        category: values.category,
        source: values.source,
        description: values.description,
        custom_fields: values.custom_fields,
        deal_members: { deal_members: selectedMembers }, // Send all selected members
        is_won:
          values.status === "won"
            ? true
            : values.status === "lost"
              ? false
              : null,
      };

      // Update the deal
      await updateDeal(dealData).unwrap();
      message.success("Deal updated successfully");
      await refetch();
      onCancel();
    } catch (error) {
      message.error(error.data?.message || "Failed to update deal");
    }
  };

  const selectStyle = {
    width: "100%",
    height: "48px",
  };

  // Add prefixIconStyle definition
  const prefixIconStyle = {
    color: "#1890ff",
    fontSize: "16px",
    marginRight: "8px",
  };

  // Add inputStyle definition
  const inputStyle = {
    height: "48px",
    borderRadius: "10px",
    padding: "8px 16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e6e8eb",
    transition: "all 0.3s ease",
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };
  const formItemStyle = {
    fontSize: "14px",
    fontWeight: "500",
  };

  const handleAddPipelineClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setIsAddPipelineVisible(true);
  };

  // Add contact mode change handler
  const handleContactModeChange = (mode) => {
    setContactMode(mode);
    // Clear form fields when switching modes
    if (mode === "new") {
      form.setFieldsValue({
        company_id: undefined,
        contact_id: undefined,
        firstName: "",
        lastName: "",
        email: "",
        telephone: "",
        address: "",
      });
    } else {
      form.setFieldsValue({
        firstName: "",
        lastName: "",
        email: "",
        telephone: "",
        address: "",
      });
    }
  };

  // Update handleContactChange to properly handle contact selection
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

    const selectedContact = contactsData?.data?.find((c) => c.id === contactId);
    if (selectedContact) {
      // Update form with contact details
      form.setFieldsValue({
        contact_id: contactId,
        firstName: selectedContact.first_name || "",
        lastName: selectedContact.last_name || "",
        email: selectedContact.email || "",
        telephone: selectedContact.phone || "",
        address: selectedContact.address || "",
        company_id: selectedContact.company_name, // Set company_id from contact's company_name
      });
    }
  };

  // Update handleCompanyChange to properly handle company selection
  const handleCompanyChange = (companyId) => {
    if (!companyId) {
      // If company is cleared and we're in existing contact mode
      if (contactMode === "existing") {
        form.setFieldsValue({
          company_id: undefined,
          contact_id: undefined // Clear contact when company is cleared
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

    // Find the selected company
    const selectedCompany = companyAccountsData?.data?.find(
      (company) => company.id === companyId
    );

    if (selectedCompany) {
      // Set the company ID
      form.setFieldsValue({
        company_id: companyId,
      });

      // If in existing contact mode, filter contacts for this company
      if (contactMode === "existing") {
        // Clear the contact field to allow selecting a new one
        form.setFieldsValue({
          contact_id: undefined
        });
      }
    }
  };

  // Handler for adding new company
  const handleAddCompanyClick = (e) => {
    e.stopPropagation();
    setIsAddCompanyVisible(true);
  };

  // Handler for adding new contact
  const handleAddContactClick = (e) => {
    e.stopPropagation();
    setIsAddContactVisible(true);
  };

  // Handler for successful company creation
  const handleCompanyCreationSuccess = (newCompany) => {
    setIsAddCompanyVisible(false);
    form.setFieldValue("company_id", newCompany.id);
  };

  // Handler for successful contact creation
  const handleContactCreationSuccess = (newContact) => {
    setIsAddContactVisible(false);
    form.setFieldValue("contact_id", newContact.id);
    if (newContact.company_name) {
      form.setFieldValue("company_id", newContact.company_name);
    }
  };

  // Add this style to make currency display better
  <style jsx="true">{`
    .currency-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .currency-icon {
      font-size: 16px;
      color: #1890ff;
    }
    .currency-details {
      display: flex;
      flex-direction: column;
    }
    .currency-code {
      font-weight: 500;
      color: #111827;
    }
    .currency-name {
      font-size: 12px;
      color: #6B7280;
    }
    .ant-select-selection-item .currency-option {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .ant-select-selection-item .currency-details {
      display: none;
    }
  `}</style>

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

  // Add handler for stage creation success
  const handleStageCreationSuccess = async (newStage) => {
    setIsAddStageVisible(false);
    await refetchDealStages(); // Refetch stages after adding new one
    form.setFieldValue("stage", newStage.id);
  };

  // Add handler for stage deletion
  const handleDeleteStage = async (e, stageId) => {
    e.stopPropagation();
    const stage = dealStages.find((s) => s.id === stageId);

    if (stage.isDefault) {
      const otherStagesInPipeline = dealStages.filter(
        (s) =>
          s.pipeline === stage.pipeline &&
          s.id !== stageId &&
          s.stageType === "deal"
      );

      if (otherStagesInPipeline.length > 0) {
        setStageToDelete(stage);
        setIsSelectDefaultModalOpen(true);
      } else {
        showDeleteConfirmation(stage);
      }
    } else {
      showDeleteConfirmation(stage);
    }
  };

  const showDeleteConfirmation = (stage) => {
    Modal.confirm({
      title: "Delete Deal Stage",
      content: "Are you sure you want to delete this deal stage?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteStage(stage.id).unwrap();
          message.success("Deal stage deleted successfully");
          if (form.getFieldValue("stage") === stage.id) {
            form.setFieldValue("stage", undefined);
          }
        } catch (error) {
          message.error("Failed to delete deal stage");
        }
      },
    });
  };

  const handleSetNewDefaultAndDelete = async (newDefaultStageId) => {
    try {
      const newDefaultStage = dealStages.find(
        (s) => s.id === newDefaultStageId
      );
      if (newDefaultStage) {
        await updateStage({
          stageName: newDefaultStage.stageName,
          pipeline: newDefaultStage.pipeline,
          stageType: "deal",
          isDefault: true,
          id: newDefaultStage.id,
        }).unwrap();

        await deleteStage(stageToDelete.id).unwrap();
        message.success(
          "Deal stage deleted and new default stage set successfully"
        );
        setIsSelectDefaultModalOpen(false);
        setStageToDelete(null);
        await refetchDealStages();

        if (form.getFieldValue("stage") === stageToDelete.id) {
          form.setFieldValue("stage", undefined);
        }
      }
    } catch (error) {
      message.error("Failed to update stages");
    }
  };

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
                Edit Deal
              </h2>
              <Text
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Update deal information
              </Text>
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            phoneCode: "91",
            currency: "INR",
          }}
          className="lead-form"
          style={{ padding: "24px" }}
        >
          <div className="dynamic-form-fields" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {Array.isArray(formFields) && formFields.map((field) => {
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
                      <Input prefix={<FiHash style={prefixIconStyle} />} placeholder={field.placeholder} style={inputStyle} />
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
                        <Form.Item name="currency" noStyle>
                          <Select 
                            style={{ width: '120px', height: '48px' }} 
                            options={currencies?.map(c => ({ 
                              value: c.id, 
                              label: c.currencyCode 
                            }))}
                          />
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
                        {pipelines?.map(p => <Option key={p.id} value={p.id}>{p.pipeline_name}</Option>)}
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
                        {filteredStages?.map(s => <Option key={s.id} value={s.id}>{s.stageName}</Option>)}
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

                if (field.key === 'closedDate') {
                  return (
                    <Form.Item
                      key={field.id}
                      name="closedDate"
                      label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                      style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                    >
                      <DatePicker
                        format="DD-MM-YYYY"
                        style={{ ...inputStyle, width: '100%' }}
                        placeholder={field.placeholder}
                        disabledDate={(current) => current && current < dayjs().startOf("day")}
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
                      <Select style={selectStyle} placeholder={field.placeholder}>
                        <Option value="pending">Pending</Option>
                        <Option value="won">Won</Option>
                        <Option value="lost">Lost</Option>
                      </Select>
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
                      <Select
                        showSearch
                        placeholder={field.placeholder}
                        style={selectStyle}
                        onChange={handleContactChange}
                        filterOption={(input, option) => {
                          const contact = contactsData?.data?.find(c => c.id === option.value);
                          return `${contact?.first_name} ${contact?.last_name}`.toLowerCase().includes(input.toLowerCase());
                        }}
                      >
                        {contactsData?.data?.map(c => (
                          <Option key={c.id} value={c.id}>{c.first_name} {c.last_name}</Option>
                        ))}
                      </Select>
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
                      <Select
                        showSearch
                        placeholder={field.placeholder}
                        style={selectStyle}
                        onChange={handleCompanyChange}
                        filterOption={(input, option) => {
                          const company = companyAccountsData?.data?.find(c => c.id === option.value);
                          return company?.company_name.toLowerCase().includes(input.toLowerCase());
                        }}
                      >
                        {companyAccountsData?.data?.map(c => (
                          <Option key={c.id} value={c.id}>{c.company_name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  );
                }

                if (field.key === 'description') {
                  return (
                    <Form.Item
                      key={field.id}
                      name="description"
                      label={<span style={formItemStyle}>{field.label.replace(/\s*\(Optional\)$/i, '')} {field.required ? <span style={{ color: "#ff4d4f" }}>*</span> : <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}</span>}
                      style={{ gridColumn: 'span 2', marginBottom: '0px' }}
                    >
                      <Input.TextArea placeholder={field.placeholder} rows={2} style={{ borderRadius: '10px' }} />
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
                  {field.type === 'phone' && <Input prefix={<FiPhone style={prefixIconStyle} />} placeholder={field.placeholder} style={inputStyle} />}
                  {field.type === 'textarea' && <Input.TextArea placeholder={field.placeholder} rows={2} style={{ borderRadius: '10px' }} />}
                  {field.type === 'select' && (
                    <Select placeholder={field.placeholder} style={selectStyle}>
                      {field.options?.map(o => <Option key={o} value={o}>{o}</Option>)}
                    </Select>
                  )}
                </Form.Item>
              );
            })}
            <Form.Item
              name="deal_members"
              label={<span style={formItemStyle}>Team Members</span>}
              style={{ gridColumn: 'span 2', marginBottom: '0px' }}
            >
              <Select
                mode="multiple"
                placeholder="Select team members"
                style={{ width: "100%", minHeight: "48px" }}
                open={teamMembersOpen}
                onDropdownVisibleChange={setTeamMembersOpen}
                tagRender={(props) => {
                  const { label, closable, onClose } = props;
                  return (
                    <Tag closable={closable} onClose={onClose} color="blue" style={{ marginRight: 3 }}>
                      {label}
                    </Tag>
                  );
                }}
              >
                {users?.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.name || user.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              onClick={handleCancel}
              style={{
                height: "44px",
                padding: "0 24px",
                borderRadius: "10px",
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
              loading={isLoading}
              style={{
                height: "44px",
                padding: "0 24px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Update Deal
            </Button>
          </div>
        </Form>
      </Modal>

      <AddPipelineModal
        isOpen={isAddPipelineVisible}
        onClose={() => setIsAddPipelineVisible(false)}
      />

      <CreateUser
        visible={isCreateUserVisible}
        onCancel={() => setIsCreateUserVisible(false)}
        onSubmit={handleCreateUserSuccess}
      />

      <AddCompanyModal
        open={isAddCompanyVisible}
        onCancel={() => setIsAddCompanyVisible(false)}
        onSuccess={handleCompanyCreationSuccess}
      />

      <AddContactModal
        open={isAddContactVisible}
        onCancel={() => setIsAddContactVisible(false)}
        onSuccess={handleContactCreationSuccess}
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

      <AddDealStageModal
        isOpen={isAddStageVisible}
        onClose={async (success) => {
          setIsAddStageVisible(false);
          if (success) {
            await refetchDealStages();
          }
        }}
        onSuccess={async (newStage) => {
          await refetchDealStages();
          form.setFieldValue("stage", newStage.id);
          setIsAddStageVisible(false);
        }}
        pipelineId={initialValues?.pipeline}
      />

      <Modal
        title={null}
        open={isSelectDefaultModalOpen}
        onCancel={() => {
          setIsSelectDefaultModalOpen(false);
          setStageToDelete(null);
        }}
        footer={null}
        width={520}
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
            onClick={() => {
              setIsSelectDefaultModalOpen(false);
              setStageToDelete(null);
            }}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              color: "#ffffff",
              width: "32px",
              height: "32px",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              border: "none",
            }}
          >
            <FiX style={{ fontSize: "20px" }} />
          </Button>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
              <FiLayers style={{ fontSize: "24px", color: "#ffffff" }} />
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
                Select New Default Stage
              </h2>
              <Text
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Choose a new default stage for this pipeline
              </Text>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          <div style={{ marginBottom: "20px" }}>
            <Text type="secondary">
              Since you're deleting a default stage, please select a new default
              stage for this pipeline:
            </Text>
          </div>
          <div
            className="stage-grid"
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {dealStages
              .filter(
                (s) =>
                  s.pipeline === stageToDelete?.pipeline &&
                  s.id !== stageToDelete?.id &&
                  s.stageType === "deal"
              )
              .map((stage) => (
                <Button
                  key={stage.id}
                  onClick={() => handleSetNewDefaultAndDelete(stage.id)}
                  className="stage-card"
                  style={{
                    width: "100%",
                    height: "auto",
                    margin: 0,
                    padding: "16px",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: "16px",
                    border: "1px solid rgba(24, 144, 255, 0.1)",
                    borderRadius: "12px",
                    background: "white",
                    boxShadow:
                      "0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(24, 144, 255, 0.02)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <div
                    className="stage-icon"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background:
                        "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
                    }}
                  >
                    <FiLayers style={{ fontSize: "20px" }} />
                  </div>
                  <div className="stage-info">
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#1a1f36",
                      }}
                    >
                      {stage.stageName}
                    </h3>
                  </div>
                </Button>
              ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
              borderTop: "1px solid #f0f0f0",
              paddingTop: "24px",
            }}
          >
            <Button
              onClick={() => {
                setIsSelectDefaultModalOpen(false);
                setStageToDelete(null);
              }}
              style={{
                padding: "8px 24px",
                height: "44px",
                borderRadius: "10px",
                border: "1px solid #e6e8eb",
                fontWeight: "500",
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EditDeal;
