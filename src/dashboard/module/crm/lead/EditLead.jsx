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
  Space,
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
import { useGetCompanyAccountsQuery, useUpdateCompanyAccountMutation, useGetCompanyAccountByIdQuery } from '../companyacoount/services/companyAccountApi';
import { useGetContactsQuery, useCreateContactMutation, useUpdateContactMutation, useGetContactByIdQuery } from '../contact/services/contactApi';
import AddStageModal from "../crmsystem/leadstage/AddLeadStageModal";
import AddSourceModal from "../crmsystem/souce/AddSourceModal";
import AddCategoryModal from "../crmsystem/souce/AddCategoryModal";
import AddStatusModal from "../crmsystem/souce/AddStatusModal";
import { useGetCustomFormsQuery } from '../generate-link/services/customFormApi';

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
  const [updateContact] = useUpdateContactMutation();
  const [updateCompanyAccount] = useUpdateCompanyAccountMutation();

  const selectedCompanyId = Form.useWatch('company_id', form);
  const selectedContactId = Form.useWatch('contact_id', form);
  const selectedPipelineId = Form.useWatch('pipeline', form);
  const pendingLeadStageIdRef = useRef(null);

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

  const normalizeCompanyId = (value) => {
    if (!value) return undefined;
    if (typeof value === 'object') return value.id || value._id || value.value;
    return value;
  };

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
        city: contact.city || '',
        state: contact.state || '',
        country: contact.country || '',
        company_id: normalizeCompanyId(contact.company_name) || undefined,
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


  const { data: watchedContact } = useGetContactByIdQuery(selectedContactId, { skip: !selectedContactId });
  const { data: watchedCompany } = useGetCompanyAccountByIdQuery(selectedCompanyId, { skip: !selectedCompanyId });

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
  const indiaCountry = countries?.find(c => c.phoneCode === '91' || c.phoneCode === '+91' || c.countryCode === 'IN');
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
      const { leadStage: _ignoredLeadStage, ...restInitialValues } = initialValues || {};
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
      pendingLeadStageIdRef.current = leadStageId || null;

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
        ...restInitialValues,
        firstName: existingContact?.first_name || initialValues.firstName || '',
        lastName: existingContact?.last_name || initialValues.lastName || '',
        email: existingContact?.email || initialValues.email || '',
        phoneCode: countryId,
        telephone: phoneNumber,
        currency: currencyId,
        leadValue: initialValues.leadValue,
        lead_members: leadMembers,
        pipeline: pipelineId,
        // leadStage is set after filteredStages are ready to avoid showing raw ID
        status: statusId,
        source: sourceId,
        category: categoryId,
        city: existingContact?.city || initialValues.city || '',
        state: existingContact?.state || initialValues.state || '',
        country: existingContact?.country || initialValues.country || '',
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
    const pendingId = pendingLeadStageIdRef.current;
    if (!pendingId) return;
    if (!filteredStages?.length) return;
    const exists = filteredStages.some(s => String(s.id) === String(pendingId));
    if (!exists) return;
    form.setFieldValue('leadStage', pendingId);
    pendingLeadStageIdRef.current = null;
  }, [filteredStages, form]);

  const handleSubmit = async (values) => {
    try {
      let contactId = values.contact_id;

      // Get the selected country's phone code
      const selectedCountry = countries.find(c => c.id === values.phoneCode);

      // Format phone number with country code
      const cleanTelephone = stripCode(values.telephone, values.phoneCode || defaultPhoneCode);
      const formattedPhone = cleanTelephone ?
        `+${selectedCountry?.phoneCode?.replace('+', '')} ${cleanTelephone}` :
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
      // Auto-create should only happen when we have the minimum required fields.
      // If user typed partial info, do NOT block lead save with validation errors.
      const canAutoCreateContact = Boolean(values.firstName && values.telephone);
      const shouldCreateContact = !values.contact_id && hasManualContactInfo && canAutoCreateContact;

      if (shouldCreateContact) {
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
        city: values.city || '',
        state: values.state || '',
        country: values.country || '',
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

      // Sync updates to Contact if it exists
      if (contactId && !shouldCreateContact) {
        try {
          const contactUpdateData = {
            contact_owner: watchedContact?.contact_owner || loggedInUser?.id || "",
            first_name: values.firstName || "",
            last_name: values.lastName || "",
            email: values.email || "",
            phone_code: values.phoneCode || defaultPhoneCode,
            phone: values.telephone ? values.telephone.toString() : "",
            address: values.address || "",
            city: values.city || "",
            state: values.state || "",
            country: values.country || "",
            company_name: company_id || ""
          };
          await updateContact({ id: contactId, data: contactUpdateData }).unwrap();
        } catch (contactError) {
          console.error("Failed to sync contact details:", contactError);
        }
      }

      // Sync updates to Company if it exists
      if (company_id) {
        try {
          const companyUpdateData = {
            account_owner: watchedCompany?.account_owner || loggedInUser?.id || "",
            company_name: watchedCompany?.company_name || "",
            email: values.email || "",
            phone_code: values.phoneCode || defaultPhoneCode,
            phone_number: values.telephone ? values.telephone.toString() : "",
            billing_address: values.address || "",
            billing_city: values.city || "",
            billing_state: values.state || "",
            billing_country: values.country || ""
          };
          await updateCompanyAccount({ id: company_id, data: companyUpdateData }).unwrap();
        } catch (companyError) {
          console.error("Failed to sync company details:", companyError);
        }
      }

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
        city: '',
        state: '',
        country: '',
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
        city: contact.city || '',
        state: contact.state || '',
        country: contact.country || '',
        company_id: normalizeCompanyId(contact.company_name) || undefined
      });
    }
  };

  const handleCompanyChange = (companyId) => {
    const prevCompanyId = form.getFieldValue('company_id');
    const normalizedCompanyId = normalizeCompanyId(companyId);
    const normalizedPrevCompanyId = normalizeCompanyId(prevCompanyId);
    form.setFieldsValue({ company_id: normalizedCompanyId || undefined });

    const companyChanged = normalizedPrevCompanyId !== (normalizedCompanyId || undefined);
    const companyCleared = !normalizedCompanyId;

    if (companyChanged || companyCleared) {
      // Clear dependent contact info
      form.setFieldsValue({
        contact_id: undefined,
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
      });

      if (companyId) {
        // Try to find company in currently loaded data to fill address immediately
        const company = companyAccountsData?.data?.find(c => c.id === normalizedCompanyId);
        if (company) {
          form.setFieldsValue({
            address: company.billing_address || '',
            city: company.billing_city || '',
            state: company.billing_state || '',
            country: company.billing_country || '',
            email: company.email || '',
            telephone: company.phone_number || '',
            phoneCode: company.phone_code || form.getFieldValue('phoneCode')
          });

          // Auto-select first contact for this company
          const firstContact = contactsData?.data?.find(c => {
            const cCompanyId = normalizeCompanyId(c.company_name);
            return cCompanyId === normalizedCompanyId;
          });

          if (firstContact) {
            handleContactChange(firstContact.id);
          }
        }
      } else {
        form.setFieldsValue({
          address: '',
          city: '',
          state: '',
          country: '',
        });
      }
    }
  };

  // When a company is selected and no contact is selected, auto-select the first contact for that company
  useEffect(() => {
    const companyId = normalizeCompanyId(selectedCompanyId);
    if (!companyId) return;
    if (selectedContactId) return;

    const firstContact = contactsData?.data?.find((c) => normalizeCompanyId(c.company_name) === companyId);
    if (firstContact) {
      form.setFieldsValue({ contact_id: firstContact.id });
      handleContactChange(firstContact.id);
    }
  }, [selectedCompanyId, selectedContactId, contactsData?.data, form]);

  // Auto-fill contact details when contact is selected and data is loaded
  useEffect(() => {
    if (watchedContact) {
      const currentValues = form.getFieldsValue();

      // We only want to auto-fill if the fields are currently empty
      form.setFieldsValue({
        firstName: currentValues.firstName || watchedContact.first_name || '',
        lastName: currentValues.lastName || watchedContact.last_name || '',
        email: currentValues.email || watchedContact.email || '',
        telephone: currentValues.telephone || (watchedContact.phone ? watchedContact.phone.replace(/^\+\d+\s/, '') : ''),
        address: currentValues.address || watchedContact.address || '',
        city: currentValues.city || watchedContact.city || '',
        state: currentValues.state || watchedContact.state || '',
        country: currentValues.country || watchedContact.country || '',
        company_id: currentValues.company_id || normalizeCompanyId(watchedContact.company_name) || undefined
      });
    }
  }, [watchedContact, form]);

  // Auto-fill company details when company is selected and data is loaded
  useEffect(() => {
    if (watchedCompany) {
      const currentValues = form.getFieldsValue();

      // If no contact is selected, we want to use company info for these fields
      if (!currentValues.contact_id) {
        form.setFieldsValue({
          address: currentValues.address || watchedCompany.billing_address || '',
          city: currentValues.city || watchedCompany.billing_city || '',
          state: currentValues.state || watchedCompany.billing_state || '',
          country: currentValues.country || watchedCompany.billing_country || '',
          email: currentValues.email || watchedCompany.email || '',
          telephone: currentValues.telephone || watchedCompany.phone_number || '',
          phoneCode: currentValues.phoneCode || watchedCompany.phone_code || defaultPhoneCode
        });
      }
    }
  }, [watchedCompany, form]);

  // If company changes and selected contact doesn't belong to it, clear contact + fields
  useEffect(() => {
    if (!selectedContactId) return;

    const contact = contactsData?.data?.find(c => c.id === selectedContactId);
    if (!contact) return;

    const contactCompanyId = normalizeCompanyId(contact.company_name);
    const currentCompanyId = normalizeCompanyId(selectedCompanyId);

    if (currentCompanyId && contactCompanyId !== currentCompanyId) {
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
        <div className="dynamic-form-fields" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {Array.isArray(formFields) && formFields.map((field) => {
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
                      <Form.Item name="currency" noStyle>
                        <CommonSelect 
                          style={{ width: '120px' }} 
                          options={currencies?.map(c => ({ 
                            id: c.id, 
                            name: c.currencyIcon === c.currencyCode ? c.currencyCode : `${c.currencyIcon} ${c.currencyCode}` 
                          }))} 
                          allowClear={false} 
                        />
                      </Form.Item>
                      <Form.Item name="leadValue" noStyle>
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
                          options={contactSuggestions?.data?.map(c => ({
                            value: c.phone,
                            label: (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <span>{c.first_name} {c.last_name || ''}</span>
                                <span style={{ color: '#999', fontSize: '12px' }}>{c.phone}</span>
                              </div>
                            ),
                            contact: c
                          }))}
                          onSearch={(val) => setPhoneSearchText(val)}
                          onSelect={handleContactSelect}
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
                    rules={[{ type: 'email', message: "Please enter a valid email" }]}
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
                      options={(() => {
                        const baseOptions = contactsData?.data?.map(c => ({ id: c.id, name: `${c.first_name} ${c.last_name}` })) || [];
                        if (watchedContact && !baseOptions.find(o => o.id === watchedContact.id)) {
                          baseOptions.push({ id: watchedContact.id, name: `${watchedContact.first_name} ${watchedContact.last_name}` });
                        }
                        return baseOptions;
                      })()}
                      onChange={handleContactChange}
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
                      options={(() => {
                        const baseOptions = companyAccountsData?.data?.map(c => ({ id: c.id, name: c.company_name })) || [];
                        if (watchedCompany && !baseOptions.find(o => o.id === watchedCompany.id)) {
                          baseOptions.push({ id: watchedCompany.id, name: watchedCompany.company_name });
                        }
                        return baseOptions;
                      })()}
                      onChange={handleCompanyChange}
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
                    <Input placeholder={field.placeholder || "Enter city"} style={inputStyle} />
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
                    <Input placeholder={field.placeholder || "Enter state"} style={inputStyle} />
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
                    name="leadStage"
                    label={<span style={formItemStyle}>{field.label} <span style={{ color: "#ff4d4f" }}>*</span></span>}
                    style={{ gridColumn: 'span 1', marginBottom: '0px' }}
                    rules={[{ required: true, message: "Please select stage" }]}
                  >
                    <CommonSelect
                      placeholder={field.placeholder || "Select stage"}
                      options={filteredStages.map(s => ({ name: s.stageName, id: s.id, color: s.color }))}
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
                      options={sourcesData?.data}
                      onAddClick={handleAddSourceClick}
                      onDelete={handleDeleteSource}
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
                      options={categoriesData?.data}
                      onAddClick={handleAddCategoryClick}
                      onDelete={handleDeleteCategory}
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
                      options={statusesData?.data}
                      onAddClick={handleAddStatusClick}
                      onDelete={handleDeleteStatus}
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
                {field.type === 'phone' && <Input placeholder={field.placeholder} style={inputStyle} />}
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
            name="lead_members"
            label={<span style={formItemStyle}>Team Members</span>}
            style={{ gridColumn: 'span 2', marginBottom: '0px' }}
          >
            <CommonSelect
              mode="multiple"
              placeholder="Select team members"
              options={users.map(user => ({
                id: user.id,
                name: user.username,
                subLabel: rolesData?.data?.find(role => role.id === user.role_id)?.role_name || 'User',
                image: user.profilePic
              }))}
              onAddClick={handleCreateUser}
              addButtonText="Add New User"
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

      <style>{`
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
