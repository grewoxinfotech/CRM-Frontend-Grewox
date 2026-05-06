import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Divider,
  message,
  InputNumber,
  Tag,
  Popconfirm,
  Tabs,
  AutoComplete,
} from "antd";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiX,
  FiBriefcase,
  FiMapPin,
  FiCamera,
  FiChevronDown,
  FiTag,
  FiUserPlus,
  FiShield,
  FiTrash2,
  FiLayers,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateLeadMutation } from "./services/LeadApi";
import { useGetAllCurrenciesQuery, useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import CreateUser from '../../user-management/users/CreateUser';
import { useGetSourcesQuery, useGetStatusesQuery, useGetCategoriesQuery, useDeleteSourceMutation, useDeleteCategoryMutation, useDeleteStatusMutation } from '../crmsystem/souce/services/SourceApi';
import { useGetLeadStagesQuery, useDeleteLeadStageMutation, useUpdateLeadStageMutation } from '../crmsystem/leadstage/services/leadStageApi';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import AddPipelineModal from "../crmsystem/pipeline/AddPipelineModal";
import AddCompanyModal from "../companyacoount/CreateCompanyAccount";
import AddContactModal from "../contact/CreateContact";
import CommonSelect from "../../../../components/CommonSelect";
import { useGetCompanyAccountsQuery } from '../companyacoount/services/companyAccountApi';
import { useGetContactsQuery, useCreateContactMutation } from '../contact/services/contactApi';
import AddStageModal from "../crmsystem/leadstage/AddLeadStageModal";
import AddSourceModal from "../crmsystem/souce/AddSourceModal";
import AddCategoryModal from "../crmsystem/souce/AddCategoryModal";
import AddStatusModal from "../crmsystem/souce/AddStatusModal";

const { Text } = Typography;
const { Option } = Select;

const EditLead = ({ open, onCancel, initialValues, pipelines, currencies, countries, categoriesData, sourcesData, statusesData }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [phoneSearchText, setPhoneSearchText] = useState("");
  const dispatch = useDispatch();
  const [updateLead, { isLoading }] = useUpdateLeadMutation();
  const [createContact] = useCreateContactMutation();

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
  const loggedInUser = useSelector(selectCurrentUser);
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectRef = React.useRef(null);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const { data: stagesData } = useGetLeadStagesQuery();
  const { data: companyAccountsData } = useGetCompanyAccountsQuery();
  const { data: contactsData, refetch: refetchContacts } = useGetContactsQuery();

  const selectedContactId = Form.useWatch('contact_id', form);
  const [isAddCompanyVisible, setIsAddCompanyVisible] = useState(false);
  const [isAddContactVisible, setIsAddContactVisible] = useState(false);
  const [isAddStageVisible, setIsAddStageVisible] = useState(false);
  const [deleteLeadStage] = useDeleteLeadStageMutation();
  const [updateLeadStage] = useUpdateLeadStageMutation();
  const [isSelectDefaultModalOpen, setIsSelectDefaultModalOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState(null);
  const [isAddSourceVisible, setIsAddSourceVisible] = useState(false);
  const [isAddCategoryVisible, setIsAddCategoryVisible] = useState(false);
  const [deleteSource] = useDeleteSourceMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const sourceSelectRef = React.useRef(null);
  const categorySelectRef = React.useRef(null);
  const [deleteStatus] = useDeleteStatusMutation();
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusSelectRef = React.useRef(null);
  const [isAddStatusVisible, setIsAddStatusVisible] = useState(false);

  const statuses = statusesData?.data || [];
  const sources = sourcesData?.data || [];
  const categories = categoriesData?.data || [];
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();

  const stages = React.useMemo(() => {
    if (!stagesData) return [];
    const actualStages = Array.isArray(stagesData) ? stagesData : (stagesData.data || []);
    console.log("Actual stages loaded:", actualStages.length);
    return actualStages.filter(stage => stage.stageType === "lead");
  }, [stagesData]);

  const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;

  const users = usersResponse?.data?.filter(user =>
    user?.created_by === loggedInUser?.username &&
    user?.role_id !== subclientRoleId
  ) || [];

  const inrCurrency = currencies?.find(c => c.currencyCode === 'INR');
  const indiaCountry = countries?.find(c => c.countryCode === 'IN');
  const defaultCurrency = inrCurrency?.id || 'JJXdfl6534FX7PNEIC3qJTK';
  const defaultPhoneCode = indiaCountry?.id || 'K9GxyQ8rrXQycdLQNkGhczL';

  const interestLevels = [
    { value: "high", label: "High Interest", color: "#52c41a" },
    { value: "medium", label: "Medium Interest", color: "#faad14" },
    { value: "low", label: "Low Interest", color: "#ff4d4f" },
  ];

  const getRoleColor = (role) => {
    const roleColors = {
      'employee': {
        color: '#D46B08',
        bg: '#FFF7E6',
        border: '#FFD591'
      },
      'default': {
        color: '#531CAD',
        bg: '#F9F0FF',
        border: '#D3ADF7'
      }
    };
    return roleColors[role?.toLowerCase()] || roleColors.default;
  };

  const filteredStages = React.useMemo(() => {
    if (!selectedPipeline || !stages.length) return [];

    // Normalize selectedPipeline to string
    const currentPipelineId = String(selectedPipeline?.id || selectedPipeline);

    return stages.filter(stage => {
      // Normalize stage.pipeline to string
      const stagePipelineId = String(stage.pipeline?.id || stage.pipeline);
      return stagePipelineId === currentPipelineId;
    });
  }, [stages, selectedPipeline]);

  const getPipelineName = (pipelineId) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    return pipeline?.pipeline_name || 'Not assigned';
  };

  const handlePipelineChange = (value) => {
    setSelectedPipeline(value);
    form.setFieldValue('leadStage', undefined);
  };

  // Handle add pipeline click
  const handleAddPipelineClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setIsAddPipelineVisible(true);
  };

  // Set form values when initialValues changes
  useEffect(() => {
    if (initialValues) {
      // Find contact and its company if contact_id exists
      const existingContact = contactsData?.data?.find(c => c.id === initialValues.contact_id);
      
      // Parse phone number from existingContact
      const contactPhone = existingContact?.phone || '';
      let phoneNumber = contactPhone;
      let phoneCode = existingContact?.phone_code || '';

      if (contactPhone.startsWith('+')) {
        // Try space-based first
        const spaceMatch = contactPhone.match(/^\+(\d+)\s(.*)$/);
        if (spaceMatch) {
          phoneCode = spaceMatch[1];
          phoneNumber = spaceMatch[2];
        } else {
          // If no space, try to match against known countries
          const digitsOnly = contactPhone.substring(1);
          // Sort countries by phone code length descending to match the longest code first (e.g. +1242 vs +1)
          const sortedCountries = [...(countries || [])].sort((a, b) => b.phoneCode.length - a.phoneCode.length);
          
          for (const country of sortedCountries) {
            const codeDigits = country.phoneCode.replace(/\D/g, '');
            if (digitsOnly.startsWith(codeDigits)) {
              phoneCode = codeDigits;
              phoneNumber = digitsOnly.substring(codeDigits.length);
              break;
            }
          }
        }
      }

      // Find country by phone code
      const country = countries?.find(c => c.phoneCode.replace(/\D/g, '') === phoneCode.replace(/\D/g, ''));
      const countryId = country?.id || defaultPhoneCode;

      const company_id = existingContact?.company_name || initialValues.company_id || null;

      console.log("Setting form with contact:", existingContact, "company_id:", company_id);

      // Find currency by code
      const currencyObj = currencies?.find(c => c.currencyCode === initialValues.currency);
      const currencyId = currencyObj?.id || defaultCurrency;

      // Extract IDs if they are objects
      const pipelineId = initialValues.pipeline?.id || (typeof initialValues.pipeline === 'object' ? null : initialValues.pipeline);
      const leadStageId = initialValues.leadStage?.id || (typeof initialValues.leadStage === 'object' ? null : initialValues.leadStage);
      const statusId = initialValues.status?.id || (typeof initialValues.status === 'object' ? null : initialValues.status);
      const sourceId = initialValues.source?.id || (typeof initialValues.source === 'object' ? null : initialValues.source);
      const categoryId = initialValues.category?.id || (typeof initialValues.category === 'object' ? null : initialValues.category);

      // Set selected pipeline
      setSelectedPipeline(pipelineId);

      // Parse lead_members from string if needed
      let leadMembers = [];
      try {
        if (typeof initialValues.lead_members === 'string') {
          const parsedMembers = JSON.parse(initialValues.lead_members);
          leadMembers = parsedMembers.lead_members || [];
        } else if (initialValues.lead_members?.lead_members) {
          leadMembers = initialValues.lead_members.lead_members;
        }

        // Convert user IDs to usernames
        const usernames = leadMembers.map(userId => {
          const user = usersResponse?.data?.find(u => u.id === userId);
          return user?.username;
        }).filter(username => username);

        // Add logged in user's username if not already present
        const loggedInUserDetails = usersResponse?.data?.find(user => user.id === loggedInUser?.id);
        if (loggedInUserDetails && !usernames.includes(loggedInUserDetails.username)) {
          usernames.push(loggedInUserDetails.username);
        }

        leadMembers = usernames;
      } catch (error) {
        console.error('Error parsing lead_members:', error);
        // If there's an error, at least add the logged in user
        const loggedInUserDetails = usersResponse?.data?.find(user => user.id === loggedInUser?.id);
        if (loggedInUserDetails) {
          leadMembers = [loggedInUserDetails.username];
        }
      }

      form.setFieldsValue({
        ...initialValues,
        firstName: existingContact?.first_name || initialValues.firstName || '',
        lastName: existingContact?.last_name || initialValues.lastName || '',
        email: existingContact?.email || initialValues.email || '',
        phoneCode: countryId,
        telephone: phoneNumber,
        currency: currencyId,
        leadValue: initialValues.leadValue,
        lead_members: leadMembers,
        pipeline: pipelineId,
        leadStage: leadStageId,
        status: statusId,
        source: sourceId,
        category: categoryId,
        company_id: company_id,
        contact_id: initialValues.contact_id
      });

      if (initialValues.profilePic) {
        setFileList([
          {
            uid: "-1",
            name: "profile-picture.png",
            status: "done",
            url: initialValues.profilePic,
          },
        ]);
      }
    }
  }, [initialValues, form, defaultPhoneCode, defaultCurrency, countries, currencies, contactsData, usersResponse, loggedInUser, stagesData]);

  const handleSubmit = async (values) => {
    try {
      let contactId = values.contact_id;

      // Get the selected country's phone code
      const selectedCountry = countries.find(c => c.id === values.phoneCode);

      // Format phone number with country code
      const formattedPhone = values.telephone ?
        `+${selectedCountry?.phoneCode?.replace('+', '')} ${values.telephone}` :
        null;

      // Get the selected currency
      const selectedCurrency = currencies.find(c => c.id === values.currency);

      // Format lead value
      const leadValue = values.leadValue || 0;

      const memberIds = values.lead_members || [];

      // Add logged-in user's ID if not already present
      if (loggedInUser?.id && !memberIds.includes(loggedInUser.id)) {
        memberIds.push(loggedInUser.id);
      }

      // Format lead_members as an object with all member IDs
      const leadMembers = {
        lead_members: memberIds
      };

      // A new contact should be created ONLY if NO existing contact is selected
      // AND there is enough information to create a contact
      const hasManualContactInfo = (values.firstName || values.lastName || values.telephone || values.email);
      const shouldCreateContact = !values.contact_id && hasManualContactInfo;

      if (shouldCreateContact) {
        if (!values.firstName) {
          message.error('First Name is required to auto-create a contact');
          return;
        }
        if (!values.telephone) {
          message.error('Phone Number is required to auto-create a contact');
          return;
        }

        try {
          // Create contact first
          const contactData = {
            contact_owner: loggedInUser?.id || "",
            first_name: values.firstName || "",
            last_name: values.lastName || "",
            company_name: values.company_id || "",
            email: values.email || "",
            phone_code: values.phoneCode || defaultPhoneCode,
            phone: values.telephone ? values.telephone.toString() : "",
            contact_source: values.source || "website",
            description: `Contact created automatically during lead edit by ${loggedInUser?.name} on ${new Date().toLocaleDateString()}`,
            address: values.address || "",
            client_id: loggedInUser.client_id
          };

          const contactResponse = await createContact(contactData).unwrap();
          contactId = contactResponse.data.id;
        } catch (error) {
          message.error(error.data?.message || 'Failed to auto-create contact');
          return;
        }
      }

      // Get company_id from contact if available
      const selectedContact = contactsData?.data?.find(c => c.id === contactId);
      const company_id = selectedContact?.company_name || values.company_id || null;

      // Format the payload with all required fields
      const formData = {
        id: initialValues.id,
        leadTitle: values.leadTitle,
        firstName: values.firstName || '',
        lastName: values.lastName || '',
        email: values.email || '',
        telephone: formattedPhone,
        company_id: company_id,
        contact_id: contactId || null,
        address: values.address || '',
        leadValue: leadValue,
        currency: selectedCurrency?.currencyCode || defaultCurrency,
        lead_members: leadMembers,
        pipeline: values.pipeline,
        leadStage: values.leadStage,
        status: values.status || 'active',
        source: values.source || 'website',
        category: values.category || '',
        interest_level: values.interest_level || 'medium',
        assigned: values.assigned || [],
        files: values.files || [],
        profilePic: fileList[0]?.url || initialValues?.profilePic || '',
        created_by: loggedInUser?.username || '',
        updated_by: loggedInUser?.username || ''
      };

      // Remove any undefined or null values
      Object.keys(formData).forEach(key => {
        if (formData[key] === undefined || formData[key] === null) {
          delete formData[key];
        }
      });

      console.log("Submitting form data:", formData);

      await updateLead({ id: initialValues.id, data: formData }).unwrap();
      message.success("Lead updated successfully");
      onCancel();
    } catch (error) {
      message.error(
        error.data?.message || "Failed to update lead"
      );
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
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
    marginRight: "8px"
  };

  // Add selectStyle for Select components
  const selectStyle = {
    width: '100%',
    height: '48px',
  };

  // Handler for contact selection change
  const handleContactChange = (contactId) => {
    if (!contactId) {
      form.setFieldsValue({
        contact_id: undefined,
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        address: '',
        company_id: undefined
      });
      return;
    }

    // Get the selected contact's data
    const contact = contactsData?.data?.find(c => c.id === contactId);
    if (contact) {
      // Update form with contact details
      form.setFieldsValue({
        contact_id: contact.id,
        firstName: contact.first_name || '',
        lastName: contact.last_name || '',
        email: contact.email || '',
        telephone: contact.phone ? contact.phone.replace(/^\+\d+\s/, '') : '',
        address: contact.address || '',
        company_id: contact.company_name || undefined
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
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        address: '',
      });
    }
  };

  // If company changes and selected contact doesn't belong to it, clear contact + fields
  useEffect(() => {
    if (!selectedContactId) return;

    const contact = contactsData?.data?.find(c => c.id === selectedContactId);
    if (!contact) return;

    if (selectedCompanyId && contact.company_name !== selectedCompanyId) {
      form.setFieldsValue({
        contact_id: undefined,
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        address: '',
      });
    }
  }, [selectedCompanyId, selectedContactId, contactsData?.data, form]);

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
  const handleCompanyCreationSuccess = async (newCompany) => {
    setIsAddCompanyVisible(false);

    if (newCompany.contact_id) {
      await refetchContacts();
    }

    form.setFieldsValue({
      company_id: newCompany.id,
      contact_id: newCompany.contact_id || undefined,
      email: newCompany.email || undefined,
      phoneCode: newCompany.phone_code || form.getFieldValue('phoneCode'),
      telephone: newCompany.phone_number || undefined,
      address: newCompany.billing_address || undefined,
    });
  };

  // Handler for successful contact creation
  const handleContactCreationSuccess = (newContact) => {
    setIsAddContactVisible(false);
    form.setFieldValue('contact_id', newContact.id);
    if (newContact.company_name) {
      form.setFieldValue('company_id', newContact.company_name);
    }
  };

  // Global styles to fix Select cursor alignment
  const globalStyles = (
    <style jsx="true" global="true">{`
      .ant-select-selection-search-input {
        display: flex !important;
        align-items: center !important;
      }
      .ant-select-selection-item {
        display: flex !important;
        align-items: center !important;
      }
      .ant-select-single .ant-select-selector {
        height: 48px !important;
        display: flex !important;
        align-items: center !important;
      }

      .ant-select-single .ant-select-selector .ant-select-selection-search {
        display: flex !important;
        align-items: center !important;
      }
      
      .ant-select:not(.ant-select-customize-input) .ant-select-selector:hover,
      .ant-input:hover {
        border-color: #1890ff !important;
      }

      .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector,
      .ant-input:focus,
      .ant-input-focused {
        border-color: #1890ff !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
      }
    `}</style>
  );

  // Update the handler to properly stop event propagation
  const handleAddStageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddStageVisible(true);
  };

  // Add handler for stage creation success
  const handleStageCreationSuccess = (newStage) => {
    setIsAddStageVisible(false);
    form.setFieldValue('leadStage', newStage.id);
  };

  const handleDeleteStage = async (e, stageId, stageName) => {
    e.stopPropagation();
    const stage = filteredStages.find(s => s.id === stageId);

    if (stage.isDefault) {
      const otherStagesInPipeline = filteredStages.filter(s =>
        s.pipeline === stage.pipeline && s.id !== stageId
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
      title: 'Delete Lead Stage',
      content: 'Are you sure you want to delete this lead stage?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteLeadStage({ id: stage.id }).unwrap();
          message.success('Lead stage deleted successfully');
          if (form.getFieldValue('leadStage') === stage.id) {
            form.setFieldValue('leadStage', undefined);
          }
        } catch (error) {
          message.error('Failed to delete lead stage');
        }
      },
    });
  };

  const handleSetNewDefaultAndDelete = async (newDefaultStageId) => {
    try {
      const newDefaultStage = filteredStages.find(s => s.id === newDefaultStageId);
      if (newDefaultStage) {
        await updateLeadStage({
          stageName: newDefaultStage.stageName,
          pipeline: newDefaultStage.pipeline,
          stageType: newDefaultStage.stageType,
          isDefault: true,
          id: newDefaultStage.id
        }).unwrap();
      }

      await deleteLeadStage({
        id: stageToDelete.id,
        newDefaultId: newDefaultStageId
      }).unwrap();

      message.success('Lead stage deleted and new default stage set successfully');
      setIsSelectDefaultModalOpen(false);
      setStageToDelete(null);

      if (form.getFieldValue('leadStage') === stageToDelete.id) {
        form.setFieldValue('leadStage', undefined);
      }
    } catch (error) {
      message.error('Failed to update stages');
    }
  };

  // Add handler for source deletion
  const handleDeleteSource = async (e, sourceId) => {
    e.stopPropagation();
    try {
      await deleteSource(sourceId).unwrap();
      message.success("Source deleted successfully");
      if (form.getFieldValue('source') === sourceId) {
        form.setFieldValue('source', undefined);
      }
    } catch (error) {
      message.error(error.data?.message || "Failed to delete source");
    }
  };

  // Add handler for category deletion
  const handleDeleteCategory = async (e, categoryId) => {
    e.stopPropagation();
    try {
      await deleteCategory(categoryId).unwrap();
      message.success("Category deleted successfully");
      if (form.getFieldValue('category') === categoryId) {
        form.setFieldValue('category', undefined);
      }
    } catch (error) {
      message.error(error.data?.message || "Failed to delete category");
    }
  };

  // Add handler for adding new source
  const handleAddSourceClick = (e) => {
    e.stopPropagation();
    setSourceDropdownOpen(false);
    setIsAddSourceVisible(true);
  };

  // Add handler for adding new category
  const handleAddCategoryClick = (e) => {
    e.stopPropagation();
    setCategoryDropdownOpen(false);
    setIsAddCategoryVisible(true);
  };

  // Add handler for status deletion
  const handleDeleteStatus = async (e, statusId) => {
    e.stopPropagation();
    try {
      await deleteStatus(statusId).unwrap();
      message.success("Status deleted successfully");
      if (form.getFieldValue('status') === statusId) {
        form.setFieldValue('status', undefined);
      }
    } catch (error) {
      message.error(error.data?.message || "Failed to delete status");
    }
  };

  // Add handler for adding new status
  const handleAddStatusClick = (e) => {
    e.stopPropagation();
    setStatusDropdownOpen(false);
    setIsAddStatusVisible(true);
  };

  if (isLoading) {
    return (
      <Modal
        open={open}
        footer={null}
        closable={false}
        centered
        width={800}
      >
        <div style={{
          padding: "48px 24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div>Loading lead data...</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
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
          zIndex: 1000
        },
        content: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
        wrapper: {
          zIndex: 1001
        }
      }}
    >
      {globalStyles}
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
              Edit Lead
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update lead information
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ padding: "24px" }}
      >
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
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (!/[a-z]/.test(value) && !/[A-Z]/.test(value)) {
                    return Promise.reject(
                      new Error('Lead title must contain both uppercase or lowercase English letters')
                    );
                  }
                  return Promise.resolve();
                }
              }
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
            rules={[{ required: true, message: "Please select a pipeline" }]}
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
            label={<span style={formItemStyle}>Stage</span>}
            rules={[{ required: true, message: "Please select a stage" }]}
          >
            <CommonSelect
              placeholder={selectedPipeline ? "Select stage" : "Select pipeline first"}
              disabled={!selectedPipeline}
              options={filteredStages.map(s => ({ 
                id: s.id, 
                name: s.stageName,
                color: s.color 
              }))}
              onAddClick={handleAddStageClick}
              addButtonText="Add Stage"
              onDelete={handleDeleteStage}
              deleteTitle="Delete Stage"
            />
          </Form.Item>

          {/* Interest Level */}
          <Form.Item
            name="interest_level"
            label={<span style={formItemStyle}>Interest Level</span>}
          >
            <CommonSelect
              placeholder="Select interest level"
              options={interestLevels.map(level => ({
                id: level.value,
                name: level.label,
                color: level.color
              }))}
            />
          </Form.Item>

          <Form.Item
            name="leadValueGroup"
            label={<span style={formItemStyle}>Lead Value</span>}
            className="combined-input-item"
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

          {/* Source Select */}
          <Form.Item
            name="source"
            label={<span style={formItemStyle}>Source</span>}
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

          {/* Status Select */}
          <Form.Item
            name="status"
            label={<span style={formItemStyle}>Status</span>}
          >
            <CommonSelect
              placeholder="Select status"
              options={statusesData?.data}
              onAddClick={handleAddStatusClick}
              addButtonText="Add Status"
              onDelete={handleDeleteStatus}
              deleteTitle="Delete Status"
            />
          </Form.Item>

          {/* Category Select */}
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

        {/* Team Members Section */}
        <div style={{ marginBottom: '32px' }}>
          <Form.Item
            name="lead_members"
            label={<span style={formItemStyle}>Team Members</span>}
            style={{ marginBottom: '16px' }}
          >
            <CommonSelect
              mode="multiple"
              placeholder="Select team members"
              options={users.map(user => {
                const userRole = rolesData?.data?.find(role => role.id === user.role_id);
                return {
                  id: user.id,
                  name: user.username,
                  subLabel: userRole?.role_name || 'User',
                  image: user.profilePic
                };
              })}
              onAddClick={handleCreateUser}
              addButtonText="Add New User"
            />
          </Form.Item>
        </div>

        {/* Basic Information */}
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
            name="company_id"
            label={<span style={formItemStyle}>Select Company</span>}
          >
            <CommonSelect
              placeholder="Select company"
              options={companyAccountsData?.data?.map(c => ({ 
                id: c.id, 
                name: c.company_name,
                icon: FiBriefcase
              }))}
              onChange={handleCompanyChange}
              onAddClick={handleAddCompanyClick}
              addButtonText="Create Company"
              icon={FiBriefcase}
            />
          </Form.Item>

          <Form.Item
            name="contact_id"
            label={<span style={formItemStyle}>Select Contact Name</span>}
          >
            <CommonSelect
              placeholder="Select contact name"
              options={contactsData?.data?.filter(contact => {
                const selectedCompanyId = form.getFieldValue('company_id');
                if (!selectedCompanyId) return true;
                const companyId = typeof contact.company_name === 'object' ? contact.company_name?._id || contact.company_name?.id : contact.company_name;
                return companyId === selectedCompanyId;
              }).map(contact => {
                const companyId = typeof contact.company_name === 'object' ? contact.company_name?._id || contact.company_name?.id : contact.company_name;
                const companyName = typeof contact.company_name === 'object' ? contact.company_name?.company_name || contact.company_name?.name : companyAccountsData?.data?.find(c => c.id === companyId)?.company_name;
                
                return {
                  id: contact.id,
                  name: `${contact.first_name || ''} ${contact.last_name || ''}`,
                  icon: FiUser,
                  subLabel: companyName || "No Company",
                  subIcon: FiBriefcase
                };
              })}
              onChange={handleContactChange}
              onAddClick={handleAddContactClick}
              addButtonText="Create Contact"
              icon={FiUser}
            />
          </Form.Item>

          <Form.Item
            name="firstName"
            label={<span style={formItemStyle}>First Name</span>}
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
          >
            <Input
              prefix={<FiUser style={prefixIconStyle} />}
              placeholder="Last name"
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <Form.Item name="phoneCode" noStyle initialValue={defaultPhoneCode}>
                <CommonSelect
                  style={{ width: '120px' }}
                  options={countries?.map(country => ({
                    id: country.id,
                    name: `${country.countryCode} +${country.phoneCode.replace('+', '')}`
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
                    ...inputStyle, 
                    flex: 1, 
                    padding: 0
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
                              : (companyAccountsData?.data?.find(acc => acc.id === c.company_name)?.company_name || c.company_name)}
                          </Tag>
                        )}
                      </div>
                    ),
                    contact: c
                  }))}
                />
              </Form.Item>
            </div>
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
            Update Lead
          </Button>
        </div>
      </Form>

      <CreateUser
        open={isCreateUserVisible}
        onCancel={() => setIsCreateUserVisible(false)}
        onSuccess={handleCreateUserSuccess}
      />

      <AddPipelineModal
        isOpen={isAddPipelineVisible}
        onClose={() => setIsAddPipelineVisible(false)}
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

      <AddStageModal
        isOpen={isAddStageVisible}
        onClose={() => setIsAddStageVisible(false)}
        onSuccess={handleStageCreationSuccess}
        pipelineId={selectedPipeline}
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

      <AddStatusModal
        isOpen={isAddStatusVisible}
        onClose={(success) => {
          setIsAddStatusVisible(false);
          if (success) {
            setStatusDropdownOpen(true);
          }
        }}
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
      >
        <div className="modal-header" style={{
          background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
          padding: "24px",
          color: "#ffffff",
          position: "relative",
        }}>
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
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              border: "none",
              width: "32px",
              height: "32px",
              display: "flex",
              padding: 0,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiX style={{ fontSize: "20px" }} />
          </Button>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <FiLayers style={{ fontSize: "24px", color: "#ffffff" }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600, color: "#ffffff" }}>
                Select New Default Stage
              </h2>
              <Text style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.85)" }}>
                Choose a new default stage for this pipeline
              </Text>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
            Since you're deleting a default stage, please select a new default stage for this pipeline:
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredStages
              .filter(s => s.pipeline === stageToDelete?.pipeline && s.id !== stageToDelete?.id)
              .map(stage => (
                <Button
                  key={stage.id}
                  onClick={() => handleSetNewDefaultAndDelete(stage.id)}
                  style={{
                    width: '100%',
                    height: 'auto',
                    padding: '16px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '16px',
                    border: '1px solid #e6e8eb',
                    borderRadius: '10px',
                    background: '#ffffff',
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}>
                    <FiLayers style={{ fontSize: '20px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
                      {stage.stageName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>
                      {getPipelineName(stage.pipeline)}
                    </div>
                  </div>
                </Button>
              ))}
          </div>
          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <Button
              onClick={() => {
                setIsSelectDefaultModalOpen(false);
                setStageToDelete(null);
              }}
              style={{
                padding: '8px 24px',
                height: '44px',
                borderRadius: '10px',
                border: '1px solid #e6e8eb',
                fontWeight: 500,
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <style jsx="true" global="true">{`
        .lead-form-modal {
          .currency-select, .phone-code-select {
            cursor: pointer;
            .ant-select-selector {
              padding: 8px 12px !important;
              height: 48px !important;
              border-top-right-radius: 0 !important;
              border-bottom-right-radius: 0 !important;
              border-right: none !important;
            }
            
            .ant-select-selection-search {
              input {
                height: 100% !important;
              }
            }

            .ant-select-selection-item {
              padding-right: 20px !important;
              // font-weight: 500 !important;
            }

            .ant-select-selection-placeholder {
              color: #9CA3AF !important;
            }
          }

          .ant-input-number {
          .ant-select-single .ant-select-selector .ant-select-selection-item,
          .ant-select-single .ant-select-selector .ant-select-selection-placeholder,
          .ant-select-single .ant-select-selector .ant-select-selection-search,
          .ant-select-single .ant-select-selector .ant-select-selection-search-input {
            line-height: 48px !important;
            height: 48px !important;
            display: flex !important;
            align-items: center !important;
            padding: 0 !important;
          }

          .ant-select-auto-complete .ant-select-selector {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
            height: 48px !important;
            display: flex !important;
            align-items: center !important;
          }
          
          .ant-select-auto-complete .ant-select-selection-search {
            inset-inline-start: 16px !important;
            inset-inline-end: 16px !important;
            height: 100% !important;
          }

          .ant-select-single .ant-select-selector .ant-select-selection-search,
          .ant-select-single .ant-select-selector .ant-select-selection-search-input {
            height: 100% !important;
            line-height: 48px !important;
            display: flex !important;
            align-items: center !important;
          }

            .ant-input-number-input-wrap {
              height: 100%;
              display: flex;
              align-items: center;
            }

            .ant-input-number-input {
              height: 48px !important;
              padding: 0 16px !important;
              line-height: 48px !important;
            }
          }

          .value-input-group, .phone-input-group {
            display: flex !important;
            align-items: stretch !important;
            width: 100% !important;

            .ant-select {
              .ant-select-selector {
                height: 100% !important;
                border-top-right-radius: 0 !important;
                border-bottom-right-radius: 0 !important;
              }
            }

            .ant-input-number, .ant-input {
              height: 48px !important;
              border-top-left-radius: 0 !important;
              border-bottom-left-radius: 0 !important;
              border-left: none !important;

              &:focus, &-focused {
                box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
                border-color: #1890ff !important;

                & + .ant-select .ant-select-selector {
                  border-color: #1890ff !important;
                }
              }
            }

            .ant-input-number {
              .ant-input-number-input {
                height: 46px !important;
                padding: 0 16px !important;
              }
            }

            .ant-input {
              padding: 8px 16px !important;
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
            // .ant-select-selector {
            //   min-height: 48px !important;
            //   height: auto !important;
            //   padding: 4px 8px !important;
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

          .ant-select-item {
            &:hover {
              .delete-stage-btn {
                opacity: 1;
                &:hover {
                  background-color: #fff1f0;
                }
              }
            }
          }
        }

        .sticky-add-button {
          .ant-select-dropdown-content {
            position: relative;
          }

          .ant-select-item {
            padding: 8px 12px;
          }

          .ant-select-item-option-content {
            white-space: normal;
            word-break: break-word;
          }
        }
      `}</style>
    </Modal>
  );
};

export default EditLead;
