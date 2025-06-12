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
} from "antd";
import {
  FiUser,
  FiMail,
  FiX,
  FiBriefcase,
  FiMapPin,
  FiCamera,
  FiChevronDown,
  FiTag,
  FiUserPlus,
  FiShield,
  FiUsers,
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
import { useGetCompanyAccountsQuery } from '../companyacoount/services/companyAccountApi';
import { useGetContactsQuery } from '../contact/services/contactApi';
import AddStageModal from "../crmsystem/leadstage/AddLeadStageModal";
import AddSourceModal from "../crmsystem/souce/AddSourceModal";
import AddCategoryModal from "../crmsystem/souce/AddCategoryModal";
import AddStatusModal from "../crmsystem/souce/AddStatusModal";

const { Text } = Typography;
const { Option } = Select;

const EditLead = ({ open, onCancel, initialValues, pipelines, currencies, countries, categoriesData, sourcesData, statusesData }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);
  const dispatch = useDispatch();
  const [updateLead, { isLoading }] = useUpdateLeadMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectRef = React.useRef(null);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const { data: stagesData } = useGetLeadStagesQuery();
  const { data: companyAccountsData } = useGetCompanyAccountsQuery();
  const { data: contactsData } = useGetContactsQuery();
  const [isAddCompanyVisible, setIsAddCompanyVisible] = useState(false);
  const [isAddContactVisible, setIsAddContactVisible] = useState(false);
  const [contactMode, setContactMode] = useState('existing');
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

  // Replace the hardcoded statuses with API data
  const statuses = statusesData?.data || [];
  const sources = sourcesData?.data || [];
  const categories = categoriesData?.data || [];
  // Fetch users data with roles
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();

  // Filter stages to only show lead type stages
  const stages = stagesData?.filter(stage => stage.stageType === "lead") || [];

  // Get subclient role ID to filter it out
  const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;

  // Filter users to get team members (excluding subclients)
  const users = usersResponse?.data?.filter(user =>
    user?.created_by === loggedInUser?.username &&
    user?.role_id !== subclientRoleId
  ) || [];

  // Find default currency and phone code
  const inrCurrency = currencies?.find(c => c.currencyCode === 'INR');
  const indiaCountry = countries?.find(c => c.countryCode === 'IN');
  const defaultCurrency = inrCurrency?.id || 'JJXdfl6534FX7PNEIC3qJTK';
  const defaultPhoneCode = indiaCountry?.id || 'K9GxyQ8rrXQycdLQNkGhczL';

  // Interest level options
  const interestLevels = [
    { value: "high", label: "High Interest", color: "#52c41a" },
    { value: "medium", label: "Medium Interest", color: "#faad14" },
    { value: "low", label: "Low Interest", color: "#ff4d4f" },
  ];

  // Add getRoleColor function
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

  // Filter stages based on selected pipeline
  const filteredStages = stagesData?.filter(
    stage => stage.stageType === "lead" && stage.pipeline === selectedPipeline
  ) || [];

  // Add getPipelineName function
  const getPipelineName = (pipelineId) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    return pipeline?.pipeline_name || 'Not assigned';
  };

  // Handle pipeline selection change
  const handlePipelineChange = (value) => {
    setSelectedPipeline(value);
    // Clear stage selection when pipeline changes
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
      // Parse phone number to extract country code and number
      const phoneMatch = initialValues.telephone?.match(/^\+(\d+)\s(.*)$/);
      const phoneNumber = phoneMatch ? phoneMatch[2] : initialValues.telephone || '';

      // Find country by phone code
      const phoneCode = phoneMatch ? phoneMatch[1] : '';
      const country = countries?.find(c => c.phoneCode.replace('+', '') === phoneCode);
      const countryId = country?.id || defaultPhoneCode;

      // Find currency by code
      const currencyObj = currencies?.find(c => c.currencyCode === initialValues.currency);
      const currencyId = currencyObj?.id || defaultCurrency;

      // Set selected pipeline
      setSelectedPipeline(initialValues.pipeline);

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

      // Find contact and its company if contact_id exists
      const existingContact = contactsData?.data?.find(c => c.id === initialValues.contact_id);
      const company_id = existingContact?.company_name || initialValues.company_id || null;

      console.log("Setting form with contact:", existingContact, "company_id:", company_id);

      form.setFieldsValue({
        ...initialValues,
        phoneCode: countryId,
        telephone: phoneNumber,
        currency: currencyId,
        leadValue: initialValues.leadValue,
        lead_members: leadMembers,
        pipeline: initialValues.pipeline,
        leadStage: initialValues.leadStage,
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

      // Set contact mode based on whether we have a contact
      setContactMode(initialValues.contact_id ? 'existing' : 'new');
    }
  }, [initialValues, form, defaultPhoneCode, defaultCurrency, countries, currencies, contactsData, usersResponse, loggedInUser]);

  const handleSubmit = async (values) => {
    try {
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

      // Get all selected members (including logged-in user)
      // const memberIds = values.lead_members?.map(username => {
      //   const user = usersResponse?.data?.find(u => u.username === username);
      //   return user?.id;
      // }).filter(id => id) || [];

      // Add logged-in user's ID if not already present
      if (loggedInUser?.id && !memberIds.includes(loggedInUser.id)) {
        memberIds.push(loggedInUser.id);
      }

      // Format lead_members as an object with all member IDs
      const leadMembers = {
        lead_members: memberIds
      };

      // Get company_id from contact if available
      const selectedContact = contactsData?.data?.find(c => c.id === values.contact_id);
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
        contact_id: values.contact_id || null,
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
    }
  };

  // Handler for company selection change
  const handleCompanyChange = (companyId) => {
    form.setFieldValue('company_id', companyId);

    // If company is cleared, also clear the contact
    if (!companyId) {
      form.setFieldValue('contact_id', undefined);
      return;
    }

    // If a contact is already selected, check if it belongs to the new company
    const currentContactId = form.getFieldValue('contact_id');
    if (currentContactId) {
      const contact = contactsData?.data?.find(c => c.id === currentContactId);
      if (contact?.company_name !== companyId) {
        form.setFieldValue('contact_id', undefined);
      }
    }
  };

  // Handler for contact selection change
  const handleContactChange = (contactId) => {
    form.setFieldValue('contact_id', contactId);

    if (!contactId) {
      return;
    }

    // Get the selected contact's data
    const contact = contactsData?.data?.find(c => c.id === contactId);
    if (contact) {
      // Update company if contact has one
      if (contact.company_name) {
        form.setFieldValue('company_id', contact.company_name);
      }

      // Set other contact-related fields if needed
      form.setFieldsValue({
        email: contact.email || '',
        telephone: contact.phone ? contact.phone.replace(/^\+\d+\s/, '') : '',
        address: contact.address || ''
      });
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
    form.setFieldValue('company_id', newCompany.id);
  };

  // Handler for successful contact creation
  const handleContactCreationSuccess = (newContact) => {
    setIsAddContactVisible(false);
    form.setFieldValue('contact_id', newContact.id);
    if (newContact.company_name) {
      form.setFieldValue('company_id', newContact.company_name);
    }
  };

  // Add contact mode change handler
  const handleContactModeChange = (mode) => {
    setContactMode(mode);
    // Clear form fields when switching modes
    if (mode === 'new') {
      form.setFieldsValue({
        company_id: undefined,
        contact_id: undefined,
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        address: ''
      });
    } else {
      form.setFieldsValue({
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        address: ''
      });
    }
  };

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
            <Select
              ref={selectRef}
              open={dropdownOpen}
              onDropdownVisibleChange={setDropdownOpen}
              placeholder="Select pipeline"
              onChange={handlePipelineChange}
              style={{
                ...selectStyle,
                dropdownStyle: {
                  maxHeight: '400px',
                  overflow: 'hidden'
                }
              }}
              listHeight={350}
              popupClassName="custom-select-dropdown sticky-add-button"
            >
              {pipelines.map((pipeline) => (
                <Option key={pipeline.id} value={pipeline.id}>
                  {pipeline.pipeline_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="leadStage"
            label={<span style={formItemStyle}>Stage</span>}
            rules={[{ required: true, message: "Please select a stage" }]}
          >
            <Select
              placeholder={selectedPipeline ? "Select stage" : "Select pipeline first"}
              disabled={!selectedPipeline}
              style={{
                ...selectStyle,
                dropdownStyle: {
                  maxHeight: '400px',
                  overflow: 'hidden'
                }
              }}
              suffixIcon={<FiChevronDown size={14} />}
              popupClassName="custom-select-dropdown sticky-add-button"
              dropdownRender={(menu) => (
                <div
                  style={{
                    position: 'relative',
                    maxHeight: '400px'
                  }}
                >
                  <div style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    paddingBottom: '48px'
                  }}>
                    {menu}
                  </div>
                  <div style={{
                    position: 'sticky',
                    bottom: 0,
                    padding: '8px 12px',
                    borderTop: '1px solid #f0f0f0',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddStageClick}
                      disabled={!selectedPipeline}
                      style={{
                        width: '100%',
                        background: selectedPipeline ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' : '#f5f5f5',
                        border: 'none',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: selectedPipeline ? '0 2px 8px rgba(24, 144, 255, 0.15)' : 'none',
                        fontWeight: '500',
                        opacity: selectedPipeline ? 1 : 0.5,
                        cursor: selectedPipeline ? 'pointer' : 'not-allowed',
                        color: selectedPipeline ? '#ffffff' : 'rgba(0, 0, 0, 0.25)'
                      }}
                    >
                      Add Stage
                    </Button>
                  </div>
                </div>
              )}
            >
              {filteredStages.map((stage) => (
                <Option key={stage.id} value={stage.id}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 0'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: stage.color || '#1890ff'
                      }} />
                      <span style={{ marginRight: '8px' }}>{stage.stageName}</span>
                      {stage.isDefault && (
                        <Tag
                          color="blue"
                          style={{
                            margin: 0,
                            fontSize: '12px',
                            padding: '0 8px',
                            borderRadius: '4px',
                            background: '#e6f4ff',
                            border: '1px solid #91caff',
                            color: '#0958d9'
                          }}
                        >
                          Default
                        </Tag>
                      )}
                    </div>
                    {form.getFieldValue('leadStage') !== stage.id && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Button
                          type="text"
                          icon={<FiTrash2 style={{ fontSize: '16px' }} />}
                          onClick={(e) => handleDeleteStage(e, stage.id, stage.stageName)}
                          className="delete-stage-btn"
                          style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            border: 'none',
                            borderRadius: '6px',
                            color: '#ff4d4f',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Interest Level */}
          <Form.Item
            name="interest_level"
            label={<span style={formItemStyle}>Interest Level</span>}
          >
            <Select
              placeholder="Select interest level"
              style={{
                ...selectStyle,
                dropdownStyle: {
                  maxHeight: '400px',
                  overflow: 'hidden'
                }
              }}
              popupClassName="custom-select-dropdown sticky-add-button"
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
                  popupClassName="custom-select-dropdown sticky-add-button"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const currencyCode = option?.children?.props?.children?.[1]?.props?.children;
                    const currencyIcon = option?.children?.props?.children?.[0]?.props?.children;
                    return (
                      currencyCode?.toString().toLowerCase().includes(input.toLowerCase()) ||
                      currencyIcon?.toString().toLowerCase().includes(input.toLowerCase())
                    );
                  }}
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
                rules={[{ required: true, message: 'Please enter lead value' }]}
              >
                <InputNumber
                  style={{ width: 'calc(100% - 120px)', padding: '0px 16px',height:"48px"  }}
                  placeholder="Enter amount"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                  step={1}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          {/* Source Select */}
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
              style={{
                ...selectStyle,
                dropdownStyle: {
                  maxHeight: '400px',
                  overflow: 'hidden'
                }
              }}
              popupClassName="custom-select-dropdown sticky-add-button"
              dropdownRender={(menu) => (
                <div
                  style={{
                    position: 'relative',
                    maxHeight: '400px'
                  }}
                >
                  <div style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    paddingBottom: '48px'
                  }}>
                    {menu}
                  </div>
                  <div style={{
                    position: 'sticky',
                    bottom: 0,
                    padding: '8px 12px',
                    borderTop: '1px solid #f0f0f0',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
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
                    {form.getFieldValue('source') !== source.id && (
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
                    )}
                  </div>
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
              ref={statusSelectRef}
              open={statusDropdownOpen}
              onDropdownVisibleChange={setStatusDropdownOpen}
              placeholder="Select status"
              style={{
                ...selectStyle,
                dropdownStyle: {
                  maxHeight: '400px',
                  overflow: 'hidden'
                }
              }}
              popupClassName="custom-select-dropdown sticky-add-button"
              dropdownRender={(menu) => (
                <div
                  style={{
                    position: 'relative',
                    maxHeight: '400px'
                  }}
                >
                  <div style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    paddingBottom: '48px'
                  }}>
                    {menu}
                  </div>
                  <div style={{
                    position: 'sticky',
                    bottom: 0,
                    padding: '8px 12px',
                    borderTop: '1px solid #f0f0f0',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddStatusClick}
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
                      Add Status
                    </Button>
                  </div>
                </div>
              )}
            >
              {statusesData?.data?.map((status) => (
                <Option key={status.id} value={status.id}>
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
                          backgroundColor: status.color || '#1890ff'
                        }}
                      />
                      {status.name}
                    </div>
                    {form.getFieldValue('status') !== status.id && (
                      <Popconfirm
                        title="Delete Status"
                        description="Are you sure you want to delete this status?"
                        onConfirm={(e) => handleDeleteStatus(e, status.id)}
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
                    )}
                  </div>
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
              ref={categorySelectRef}
              open={categoryDropdownOpen}
              onDropdownVisibleChange={setCategoryDropdownOpen}
              placeholder="Select or type to filter categories"
              style={{
                ...selectStyle,
                dropdownStyle: {
                  maxHeight: '400px',
                  overflow: 'hidden'
                }
              }}
              showSearch
              allowClear
              filterOption={(input, option) =>
                option.children.props.children[0].props.children[1].toLowerCase().includes(input.toLowerCase())
              }
              dropdownRender={(menu) => (
                <div
                  style={{
                    position: 'relative',
                    maxHeight: '400px'
                  }}
                >
                  <div style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    paddingBottom: '48px'
                  }}>
                    {menu}
                  </div>
                  <div style={{
                    position: 'sticky',
                    bottom: 0,
                    padding: '8px 12px',
                    borderTop: '1px solid #f0f0f0',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
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
                    {form.getFieldValue('category') !== category.id && (
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
                    )}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Team Members Section */}
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
              popupClassName="custom-select-dropdown sticky-add-button"
              showSearch
              optionFilterProp="children"
              maxTagCount={2}
              maxTagTextLength={15}
              loading={usersLoading}
              open={teamMembersOpen}
              onDropdownVisibleChange={setTeamMembersOpen}
              filterOption={(input, option) => {
                const username = option?.username?.toLowerCase();
                return username?.includes(input.toLowerCase());
              }}
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
                  <Option key={user.id} value={user.id} username={user.username}>
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

        {/* Basic Information */}
        <div className="section-title" style={{ marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Basic Information</Text>
        </div>

        {/* Contact mode toggle */}
        <div className="contact-mode-toggle" style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '24px'
        }}>
          <div
            className={`mode-option ${contactMode === 'existing' ? 'active' : ''}`}
            onClick={() => handleContactModeChange('existing')}
            style={{
              padding: '12px 24px',
              cursor: 'pointer',
              position: 'relative',
              color: contactMode === 'existing' ? '#1890ff' : '#6b7280',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiUsers style={{ fontSize: '16px' }} />
            Select Existing
            {contactMode === 'existing' && (
              <div style={{
                position: 'absolute',
                bottom: '-1px',
                left: 0,
                right: 0,
                height: '2px',
                background: '#1890ff'
              }} />
            )}
          </div>
          <div
            className={`mode-option ${contactMode === 'new' ? 'active' : ''}`}
            onClick={() => handleContactModeChange('new')}
            style={{
              padding: '12px 24px',
              cursor: 'pointer',
              position: 'relative',
              color: contactMode === 'new' ? '#1890ff' : '#6b7280',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiUserPlus style={{ fontSize: '16px' }} />
            Add New
            {contactMode === 'new' && (
              <div style={{
                position: 'absolute',
                bottom: '-1px',
                left: 0,
                right: 0,
                height: '2px',
                background: '#1890ff'
              }} />
            )}
          </div>
        </div>

        {/* Form fields based on mode */}
        <div className="form-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {contactMode === 'existing' ? (
            <>
              <Form.Item
                name="company_id"
                label={<span style={formItemStyle}>Company Name</span>}
              >
                <Select
                  placeholder="Select company"
                  onChange={handleCompanyChange}
                  style={{
                    ...selectStyle,
                    dropdownStyle: {
                      maxHeight: '400px',
                      overflow: 'hidden'
                    }
                  }}
                  allowClear
                  suffixIcon={null}
                  dropdownRender={(menu) => (
                    <div
                      style={{
                        position: 'relative',
                        maxHeight: '400px'
                      }}
                    >
                      <div style={{
                        maxHeight: '150px',
                        overflowY: 'auto',
                        paddingBottom: '48px'
                      }}>
                        {menu}
                      </div>
                      <div style={{
                        position: 'sticky',
                        bottom: 0,
                        padding: '8px 12px',
                        borderTop: '1px solid #f0f0f0',
                        backgroundColor: '#ffffff',
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
                  {companyAccountsData?.data?.map((company) => (
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
                  style={{
                    ...selectStyle,
                    dropdownStyle: {
                      maxHeight: '400px',
                      overflow: 'hidden'
                    }
                  }}
                  suffixIcon={null}
                  showSearch
                  allowClear
                  onChange={handleContactChange}
                  filterOption={(input, option) => {
                    const contact = contactsData?.data?.find(
                      (c) => c.id === option.value
                    );
                    if (!contact) return false;
                    const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase();
                    const companyName = companyAccountsData?.data?.find(
                      (c) => c.id === contact.company_name
                    )?.company_name?.toLowerCase() || '';
                    return fullName.includes(input.toLowerCase()) ||
                      companyName.includes(input.toLowerCase());
                  }}
                  dropdownRender={(menu) => (
                    <div
                      style={{
                        position: 'relative',
                        maxHeight: '400px'
                      }}
                    >
                      <div style={{
                        maxHeight: '150px',
                        overflowY: 'auto',
                        paddingBottom: '48px'
                      }}>
                        {menu}
                      </div>
                      <div style={{
                        position: 'sticky',
                        bottom: 0,
                        padding: '8px 12px',
                        borderTop: '1px solid #f0f0f0',
                        backgroundColor: '#ffffff',
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
                  {contactsData?.data?.map((contact) => {
                    const companyName = companyAccountsData?.data?.find(
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
                      popupClassName="custom-select-dropdown sticky-add-button"
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

      <style jsx global>{`
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
