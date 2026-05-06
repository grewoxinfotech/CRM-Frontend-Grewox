import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  message,
  Input,
  Dropdown,
  Menu,
  Breadcrumb,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiHome,
  FiChevronDown,
} from "react-icons/fi";
import { Link, useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ContactList from "../../../contact/ContactList";
import CreateContact from "../../../contact/CreateContact";
import EditContact from "../../../contact/EditContact";
import {
  useGetContactsQuery,
  useDeleteContactMutation,
  useUpdateContactMutation,
} from "../../../contact/services/contactApi";
import { useGetCompanyAccountsQuery } from "../../../companyacoount/services/companyAccountApi";
import { useGetAllCountriesQuery } from "../../../../../module/settings/services/settingsApi";
import { selectCurrentUser } from "../../../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
import moment from "moment";

const { Title, Text } = Typography;

const CompanyContactList = ({ company }) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updateContact] = useUpdateContactMutation();
  const { data: countries = [] } = useGetAllCountriesQuery();

  const { data: contactsResponse, isLoading: isContactsLoading, error } = useGetContactsQuery({
    page: 1,
    pageSize: -1,
    search: ''
  });
  const {
    data: companyAccountsResponse = { data: [] },
    isLoading: isCompanyAccountsLoading,
  } = useGetCompanyAccountsQuery({
    page: 1,
    pageSize: -1,
    search: ''
  });
  
  const loggedInUser = useSelector(selectCurrentUser);

  // Filter contacts by company ID
  const filteredContactsResponse = React.useMemo(() => {
    if (!contactsResponse?.data || !company?.id) return contactsResponse;
    
    const filteredData = contactsResponse.data.filter(
      (contact) => contact.company_name === company.id
    );
    
    return {
      ...contactsResponse,
      data: filteredData
    };
  }, [contactsResponse, company]);


  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedContact(record);
    setIsEditModalOpen(true);
  };

  const handleView = (record) => {
    navigate(`/dashboard/crm/contact/${record.id}`);
  };

  // const handleDelete = (id) => {
  //   Modal.confirm({
  //     title: 'Delete Contact',
  //     content: 'Are you sure you want to delete this contact?',
  //     okText: 'Yes',
  //     okType: 'danger',
  //     cancelText: 'No',
  //     bodyStyle: {
  //       padding: '20px',
  //     },
  //     onOk: async () => {
  //       try {
  //         await deleteContact(id).unwrap();
  //         message.success('Contact deleted successfully');
  //       } catch (error) {
  //         console.error("Delete Error:", error);
  //         message.error(error?.data?.message || 'Failed to delete contact');
  //       }
  //     },
  //   });
  // };

  const handleEditSubmit = async (values) => {
    try {
      // Get the selected country's phone code
      const selectedCountry = countries.find(c => c.id === values.phoneCode);
      const phoneNumber = values.phone ? values.phone.replace(/^0+/, '') : '';

      const updatedContactData = {
        id: selectedContact.id,
        contact_owner: selectedContact.contact_owner,
        first_name: values.first_name || "",
        last_name: values.last_name || "",
        email: values.email || "",
        phone_code: selectedCountry?.id || "",
        phone: phoneNumber,
        company_name: values.company_name || "",
        contact_source: values.contact_source || "",
        description: values.description || "",
        address: values.address || "",
        city: values.city || "",
        state: values.state || "",
        country: values.country || "",
        section: "contact",
      };

      await updateContact({
        id: selectedContact.id,
        data: updatedContactData
      }).unwrap();

      message.success("Contact updated successfully");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Update Error:", error);
      message.error(error?.data?.message || "Failed to update contact");
    }
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Company Contacts</Title>
          <Text type="secondary">Manage all contacts for this company</Text>
        </div>
        <div className="header-actions">
          <div className="search-filter-group">
            <Input
              prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
              placeholder="Search contacts..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              className="search-input"
              style={{
                width: "300px",
                borderRadius: "20px",
                height: "38px",
              }}
            />
          </div>
          <div className="action-buttons">
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={handleCreate}
              className="add-button"
            >
              Create Contact
            </Button>
          </div>
        </div>
      </div>

      <Card className="content-card">
        <ContactList
          onEdit={handleEdit}
          onView={handleView}
          searchText={searchText}
          isLoading={isContactsLoading}
          loggedInUser={loggedInUser}
          contactsResponse={filteredContactsResponse}
          companyAccountsResponse={companyAccountsResponse}
          isCompanyAccountsLoading={isCompanyAccountsLoading}
        />
      </Card>

      <EditContact
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        contactData={selectedContact}
        isLoading={isContactsLoading}
        loggedInUser={loggedInUser}
        contactsResponse={filteredContactsResponse}
        companyAccountsResponse={companyAccountsResponse}
        isCompanyAccountsLoading={isCompanyAccountsLoading}
      />

      <CreateContact
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        companyId={company?.id}
        loggedInUser={loggedInUser}
        companyAccountsResponse={companyAccountsResponse}
      />
    </div>
  );
};

export default CompanyContactList;
