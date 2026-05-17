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
import { useGetRolesQuery } from "../../hrm/role/services/roleApi";
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

  const { data: rolesData } = useGetRolesQuery(undefined, {
    skip: !loggedInUser || loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client'
  });
  const userRoleData = rolesData?.message?.data?.find(role => role.id === loggedInUser?.role_id);
  const userPermissions = React.useMemo(() => {
    if (!userRoleData?.permissions) return null;
    try {
      return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
    } catch (e) { return null; }
  }, [userRoleData]);
  const hasPermission = React.useCallback((action) => {
    if (!loggedInUser) return false;
    if (loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client') return true;
    if (!userPermissions) return false;
    const perms = userPermissions['dashboards-crm-contact'];
    if (!perms || perms.length === 0) return false;
    return (perms[0]?.permissions || []).includes(action);
  }, [loggedInUser, userPermissions]);

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
        onAdd={hasPermission('create') ? () => { setSelectedContact(null); setIsCreateModalOpen(true); } : undefined}
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
          hasPermission={hasPermission}
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
