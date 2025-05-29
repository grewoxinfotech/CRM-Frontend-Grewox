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
  FiChevronDown,
  FiCalendar,
  FiUsers,
  FiTag,
  FiShield,
  FiUserPlus,
  FiBox,
  FiTrash2,
  FiLayers,
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
import { useGetProductsQuery } from "../../sales/product&services/services/productApi";
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
  const [selectedProductPrices, setSelectedProductPrices] = useState({});
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
  const { data: productsData } = useGetProductsQuery(loggedInUser?.id);

  const sources = sourcesData?.data || [];
  const labels = labelsData?.data || [];
  const products = productsData?.data || [];
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
      let assignedTo = initialValues.assigned_to;
      if (typeof assignedTo === "string") {
        try {
          assignedTo = JSON.parse(assignedTo);
        } catch (e) {
          assignedTo = { assigned_to: [] };
        }
      }

      // Parse products if it's a string
      let selectedProducts = [];
      if (typeof initialValues.products === "string") {
        try {
          const parsedProducts = JSON.parse(initialValues.products);
          selectedProducts = parsedProducts.products || [];
        } catch (e) {
          selectedProducts = [];
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
        products: selectedProducts,
        closedDate: initialValues.closedDate ? dayjs(initialValues.closedDate) : null,
        status: initialValues.status || "pending",
        assigned_to: dealMembers,
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
      let contactId;

      if (contactMode === "existing") {
        contactId = values.contact_id;
      } else {
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

          const contactData = {
            contact_owner: loggedInUser?.id || "",
            first_name: values.firstName || "",
            last_name: values.lastName || "",
            company_name: values.company_id || "",
            email: values.email || "",
            phone_code: values.phoneCode || "",
            phone: values.telephone ? values.telephone.toString() : "",
            contact_source: "deal",
            description: `Contact created from deal form by ${loggedInUser?.username || "user"
              } on ${new Date().toLocaleDateString()}`,
            address: values.address || "",
            client_id: loggedInUser?.client_id,
          };

          const response = await createContact(contactData).unwrap();

          if (response?.data?.id) {
            contactId = response.data.id;
            message.success("Contact created successfully");
          } else {
            throw new Error("Contact creation failed - no ID returned");
          }
        } catch (error) {
          message.error(error.data?.message || "Failed to create contact");
          return;
        }
      }

      // Get the selected currency object
      const selectedCurrencyObj = currencies?.find(
        (c) => c.id === values.currency
      );

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
        contact_id: contactId || null,
        category: values.category,
        source: values.source,
        products: { products: values.products || [] },
        assigned_to: { assigned_to: values.assigned_to || [] },
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

  // Add handler for value input change
  const handleValueChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setManualValue(numValue);

    // Calculate total product prices
    const productPricesTotal = Object.values(selectedProductPrices).reduce(
      (sum, price) => sum + price,
      0
    );

    // Set form value to manual value plus product prices
    form.setFieldsValue({ value: numValue + productPricesTotal });
  };

  // Handle products selection change
  const handleProductsChange = (selectedProductIds) => {
    const newSelectedPrices = {};

    // Calculate prices for selected products
    selectedProductIds.forEach((productId) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        newSelectedPrices[productId] = product.price || 0;
      }
    });

    // Update selected product prices
    setSelectedProductPrices(newSelectedPrices);

    // Calculate total of selected product prices
    const productPricesTotal = Object.values(newSelectedPrices).reduce(
      (sum, price) => sum + price,
      0
    );

    // Update form value with manual value plus product prices
    form.setFieldsValue({ value: manualValue + productPricesTotal });
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
  <style jsx>{`
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
          {/* Deal Details Section */}
          <div className="section-title">
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
              label={<span style={formItemStyle}>Deal Title</span>}
              rules={[
                { required: true, message: "Deal title is required" },
                { min: 3, message: "Deal title must be at least 3 characters" },
                { max: 100, message: "Deal title cannot exceed 100 characters" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (!/[a-z]/.test(value) && !/[A-Z]/.test(value)) {
                      return Promise.reject(
                        new Error('Deal title must contain both uppercase or lowercase English letters')
                      );
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                prefix={<FiHash style={prefixIconStyle} />}
                placeholder="Enter deal title"
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              name="value"
              label={<span style={formItemStyle}>Deal Value</span>}
              className="combined-input-item"
            >
              <Input.Group compact className="value-input-group">
                <Form.Item
                  name="currency"
                  noStyle
                  initialValue={initialValues?.currency || defaultCurrency}
                  rules={[{ required: true, message: "Currency is required" }]}
                >
                  <Select
                    style={{ width: "120px" }}
                    className="currency-select"
                    dropdownMatchSelectWidth={false}
                    suffixIcon={<FiChevronDown size={14} />}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                      const currencyData = currencies?.find((c) => c.id === option.value);
                      return (
                        currencyData?.currencyName?.toLowerCase().includes(input.toLowerCase()) ||
                        currencyData?.currencyCode?.toLowerCase().includes(input.toLowerCase())
                      );
                    }}
                    dropdownStyle={{ minWidth: "180px" }}
                    popupClassName="custom-select-dropdown"
                  >
                    {currencies?.map((currency) => (
                      <Option key={currency.id} value={currency.id}>
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
                  name="value"
                  noStyle
                  rules={[
                    { required: true, message: "Deal value is required" },
                    {
                      type: "number",
                      min: 0,
                      message: "Deal value must be greater than or equal to 0",
                    },
                  ]}
                >
                  <Input
                    style={{ width: "calc(100% - 120px)",height:"48px"  }}
                    placeholder="Enter amount"
                    type="number"
                    onChange={(e) => handleValueChange(e.target.value)}
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>

            <Form.Item
              name="pipeline"
              label={
                <span style={formItemStyle}>
                  Pipeline <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Pipeline is required" }]}
              initialValue={initialValues?.pipeline}
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
                        onClick={handleAddPipelineClick}
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
              name="stage"
              label={<span style={formItemStyle}>Stage</span>}
              rules={[{ required: true, message: "Stage is required" }]}
            >
              <Select
                placeholder="Select stage"
                style={selectStyle}
                suffixIcon={<FiChevronDown size={14} />}
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsAddStageVisible(true);
                        }}
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
                        Add Stage
                      </Button>
                    </div>
                  </div>
                )}
              >
                {dealStages
                  ?.filter(
                    (stage) =>
                      stage.pipeline === initialValues?.pipeline &&
                      stage.stageType === "deal"
                  )
                  .map((stage) => (
                    <Option key={stage.id} value={stage.id}>
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
                              backgroundColor: stage.color || "#1890ff",
                            }}
                          />
                          {stage.stageName}
                        </div>
                        {form.getFieldValue("stage") !== stage.id && (
                          <Popconfirm
                            title="Delete Stage"
                            description="Are you sure you want to delete this stage?"
                            onConfirm={(e) => {
                              e?.stopPropagation?.();
                              handleDeleteStage(e, stage.id);
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

            <Form.Item
              name="source"
              label={<span style={formItemStyle}>Source</span>}
              rules={[{ required: true, message: "Source is required" }]}
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
                      {form.getFieldValue("source") !== source.id && (
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

            <Form.Item
              name="category"
              label={<span style={formItemStyle}>Category</span>}
              rules={[{ required: true, message: "Category is required" }]}
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
                  option.children.props.children[0].props.children[1]
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
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
                        onClick={handleAddCategoryClick}
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
                        Add Category
                      </Button>
                    </div>
                  </div>
                )}
              >
                {categories?.map((category) => (
                  <Option key={category.id} value={category.id}>
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
                            backgroundColor: category.color || "#1890ff",
                          }}
                        />
                        {category.name}
                      </div>
                      {form.getFieldValue("category") !== category.id && (
                        <Popconfirm
                          title="Delete Category"
                          description="Are you sure you want to delete this category?"
                          onConfirm={(e) => {
                            e?.stopPropagation?.();
                            handleDeleteCategory(category.id);
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

            <Form.Item
              name="closedDate"
              label={<span style={formItemStyle}>Expected Close Date</span>}
              rules={[
                { required: true, message: "Expected close date is required" },
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
          <Form.Item
            name="products"
            label={<Text style={formItemStyle}>Products</Text>}
            className="products-section"
          >
            <Select
              mode="multiple"
              placeholder="Select products"
              style={{ width: "100%" }}
              optionFilterProp="children"
              showSearch
              onChange={handleProductsChange}
              listHeight={200}
              maxTagCount={2}
              maxTagTextLength={15}
              dropdownStyle={{
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollBehavior: "smooth",
              }}
              className="custom-multiple-select"
            >
              {products?.map((product) => (
                <Option key={product.id} value={product.id}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <span
                          style={{
                            fontSize: "18px",
                            color: "#1890ff",
                            fontWeight: "500",
                          }}
                        >
                          {product?.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "500" }}>{product.name}</span>
                      <span style={{ fontSize: "12px", color: "#6B7280" }}>
                        {product.selling_price}
                      </span>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Team Members Section */}
          <div className="section-title" style={{ marginBottom: "16px" }}>
            <Text strong style={{ fontSize: "16px", color: "#1f2937" }}>
              Team Members
            </Text>
          </div>
          <div style={{ marginBottom: "32px" }}>
            <Form.Item name="assigned_to" style={{ marginBottom: "16px" }}>
              <Select
                mode="multiple"
                placeholder="Select team members"
                style={{
                  width: "100%",
                  minHeight: "48px",
                }}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      type="text"
                      icon={<FiUserPlus />}
                      onClick={handleCreateUser}
                      style={{ width: "100%", textAlign: "left" }}
                    >
                      Add New User
                    </Button>
                  </>
                )}
              >
                {users?.map((user) => {
                  const role =
                    rolesData?.data?.find((r) => r.id === user.role_id)
                      ?.role_name || "User";
                  const roleColor = getRoleColor(role);

                  return (
                    <Option key={user.id} value={user.id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{user.name || user.username}</span>
                        <span
                          style={{
                            fontSize: "12px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: roleColor.bg,
                            color: roleColor.color,
                            gap: "8px",
                            textTransform: "capitalize",
                          }}
                        >
                          {role}
                        </span>
                      </div>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>
          {/* Basic Information Section */}
          <div className="section-title" style={{ marginBottom: "16px" }}>
            <Text strong style={{ fontSize: "16px", color: "#1f2937" }}>
              Basic Information
            </Text>
          </div>

          {/* Contact mode toggle */}
          <div
            className="contact-mode-toggle"
            style={{
              display: "flex",
              borderBottom: "1px solid #e5e7eb",
              marginBottom: "24px",
            }}
          >
            <div
              className={`mode-option ${contactMode === "existing" ? "active" : ""
                }`}
              onClick={() => handleContactModeChange("existing")}
              style={{
                padding: "12px 24px",
                cursor: "pointer",
                position: "relative",
                color: contactMode === "existing" ? "#1890ff" : "#6b7280",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FiUsers style={{ fontSize: "16px" }} />
              Select Existing
              {contactMode === "existing" && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "-1px",
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: "#1890ff",
                  }}
                />
              )}
            </div>
            <div
              className={`mode-option ${contactMode === "new" ? "active" : ""}`}
              onClick={() => handleContactModeChange("new")}
              style={{
                padding: "12px 24px",
                cursor: "pointer",
                position: "relative",
                color: contactMode === "new" ? "#1890ff" : "#6b7280",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FiUserPlus style={{ fontSize: "16px" }} />
              Add New
              {contactMode === "new" && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "-1px",
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: "#1890ff",
                  }}
                />
              )}
            </div>
          </div>

          {/* Form fields based on mode */}
          <div
            className="form-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            {contactMode === "existing" ? (
              <>
                <Form.Item
                  name="company_id"
                  label={<span style={formItemStyle}>Company Name</span>}
                >
                  <Select
                    placeholder={isCompanyLoading ? "Loading companies..." : "Select company"}
                    onChange={handleCompanyChange}
                    style={{
                      ...selectStyle,
                      dropdownStyle: {
                        maxHeight: "400px",
                        overflow: "hidden",
                      },
                    }}
                    allowClear
                    suffixIcon={null}
                    value={form.getFieldValue("company_id")}
                    loading={isCompanyLoading}
                  >
                    {companyAccountsData?.data?.map((company) => (
                      <Option key={company.id} value={company.id}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "4px 0",
                          }}
                        >
                          <FiBriefcase
                            style={{ color: "#1890FF", fontSize: "16px" }}
                          />
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <span
                              style={{
                                fontWeight: "500",
                                color: "#111827",
                              }}
                            >
                              {company.company_name}
                            </span>
                            {company.company_site && (
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "#6B7280",
                                }}
                              >
                                {company.company_site}
                              </span>
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
                    style={{
                      ...selectStyle,
                      dropdownStyle: {
                        maxHeight: "400px",
                        overflow: "hidden",
                      },
                    }}
                    suffixIcon={null}
                    showSearch
                    allowClear
                    onChange={handleContactChange}
                    value={form.getFieldValue("contact_id")}
                    filterOption={(input, option) => {
                      const contact = contactsData?.data?.find(
                        (c) => c.id === option.value
                      );
                      if (!contact) return false;
                      const fullName = `${contact.first_name || ""} ${contact.last_name || ""
                        }`.toLowerCase();
                      const companyName =
                        companyAccountsData?.data
                          ?.find((c) => c.id === contact.company_name)
                          ?.company_name?.toLowerCase() || "";
                      return (
                        fullName.includes(input.toLowerCase()) ||
                        companyName.includes(input.toLowerCase())
                      );
                    }}
                  >
                    {contactsData?.data?.map((contact) => {
                      const companyName =
                        companyAccountsData?.data?.find(
                          (c) => c.id === contact.company_name
                        )?.company_name || "No Company";

                      return (
                        <Option key={contact.id} value={contact.id}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "4px 0",
                            }}
                          >
                            <FiUser
                              style={{ color: "#1890FF", fontSize: "16px" }}
                            />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: "500",
                                  color: "#111827",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >{`${contact.first_name || ""} ${contact.last_name || ""
                                }`}</span>
                              <span
                                style={{
                                  color: "#6B7280",
                                  fontSize: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                <FiBriefcase style={{ fontSize: "12px" }} />
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
                      validateTrigger: ["onChange", "onBlur"],
                      transform: (value) => value?.trim() || null,
                    },
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
                    <Form.Item
                      name="phoneCode"
                      noStyle
                      initialValue={defaultPhoneCode}
                    >
                      <Select
                        style={{ width: "120px" }}
                        className="phone-code-select"
                        dropdownMatchSelectWidth={120}
                        suffixIcon={<FiChevronDown size={14} />}
                        popupClassName="custom-select-dropdown sticky-add-button"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option?.children?.props?.children[0]?.props?.children
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {countries?.map((country) => (
                          <Option key={country.id} value={country.id}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span style={{ fontSize: "14px" }}>
                                {country.countryCode}
                              </span>
                              <span style={{ fontSize: "14px" }}>
                                +{country.phoneCode.replace("+", "")}
                              </span>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item name="telephone" noStyle>
                      <InputNumber
                        style={{
                          width: "calc(100% - 100px)",
                          padding: "0 16px",
                        }}
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
