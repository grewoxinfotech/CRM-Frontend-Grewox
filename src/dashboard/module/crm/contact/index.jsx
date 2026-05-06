import React, { useState } from "react";
import {
  Card,
  message,
  Modal,
} from "antd";
import {
  FiPlus,
  FiDownload,
  FiHome,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import ContactList from "./ContactList";
import CreateContact from "./CreateContact";
import EditContact from "./EditContact";
import { useGetContactsQuery, useDeleteContactMutation } from "./services/contactApi";
import { useGetCompanyAccountsQuery } from "../companyacoount/services/companyAccountApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
import PageHeader from "../../../../components/PageHeader";

const Contact = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const { data: contactsResponse, isLoading } = useGetContactsQuery({
    page: currentPage,
    pageSize,
    search: searchText
  });

  const { data: companyAccountsResponse = { data: [] }, isLoading: isCompanyAccountsLoading } = useGetCompanyAccountsQuery();
  const [deleteContact] = useDeleteContactMutation();
  const loggedInUser = useSelector(selectCurrentUser);

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleExport = async (type) => {
    message.info(`Exporting as ${type.toUpperCase()}...`);
  };

  return (
    <div className="contact-page standard-page-container">
      <PageHeader
        title="Contacts"
        count={contactsResponse?.pagination?.total || 0}
        subtitle="Manage all contacts in the organization"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: "Contacts" },
        ]}
        searchText={searchText}
        onSearch={handleSearch}
        searchPlaceholder="Search contacts..."
        onAdd={() => { setSelectedContact(null); setIsCreateModalOpen(true); }}
        addText="Create Contact"
        isSearchVisible={isSearchVisible}
        onSearchVisibleChange={setIsSearchVisible}
        exportMenu={{
          items: [
            { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
            { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
            { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
          ]
        }}
      />

      <Card className="standard-content-card">
        <ContactList
          onEdit={(record) => { setSelectedContact(record); setIsEditModalOpen(true); }}
          onView={(record) => console.log("View contact:", record)}
          onDelete={(id) => {
            Modal.confirm({
                title: 'Delete Contact',
                content: 'Are you sure?',
                onOk: async () => {
                    await deleteContact(id).unwrap();
                    message.success('Deleted successfully');
                }
            });
          }}
          searchText={searchText}
          isLoading={isLoading}
          loggedInUser={loggedInUser}
          contactsResponse={contactsResponse}
          companyAccountsResponse={companyAccountsResponse}
          isCompanyAccountsLoading={isCompanyAccountsLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: contactsResponse?.pagination?.total || 0,
            onChange: (page, size) => { setCurrentPage(page); setPageSize(size); }
          }}
        />
      </Card>

      <CreateContact
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        loggedInUser={loggedInUser}
        companyAccountsResponse={companyAccountsResponse}
      />

      <EditContact
        open={isEditModalOpen}
        onCancel={() => { setIsEditModalOpen(false); setSelectedContact(null); }}
        contactData={selectedContact}
        loggedInUser={loggedInUser}
        companyAccountsResponse={companyAccountsResponse}
      />
    </div>
  );
};

export default Contact;
