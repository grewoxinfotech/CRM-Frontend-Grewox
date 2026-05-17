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
import CompanyAccountList from "./CompanyAccountList";
import CreateCompanyAccount from "./CreateCompanyAccount";
import EditCompanyAccount from "./EditCompanyAccount";
import { useDeleteCompanyAccountMutation, useGetCompanyAccountsQuery } from "./services/companyAccountApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
import { useGetCategoriesQuery } from "../crmsystem/souce/services/SourceApi";
import { useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import PageHeader from "../../../../components/PageHeader";

const CompanyAccount = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const loggedInUser = useSelector(selectCurrentUser);
  const [deleteCompanyAccount] = useDeleteCompanyAccountMutation();

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
    const perms = userPermissions['dashboards-crm-company-account'];
    if (!perms || perms.length === 0) return false;
    return (perms[0]?.permissions || []).includes(action);
  }, [loggedInUser, userPermissions]);

  const { data: companyAccountsResponse = { data: [], pagination: {} }, isLoading: isCompanyAccountsLoading } =
    useGetCompanyAccountsQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchText,
    });

  const { data: countries = [] } = useGetAllCountriesQuery();
  const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);

  const handleSearchChange = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = async (type) => {
    message.info(`Exporting as ${type.toUpperCase()}...`);
  };

  return (
    <div className="company-account-page standard-page-container">
      <PageHeader
        title="Company Accounts"
        count={companyAccountsResponse?.pagination?.total || 0}
        subtitle="Manage all company accounts in the organization"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: "Company Accounts" },
        ]}
        searchText={searchText}
        onSearch={handleSearchChange}
        searchPlaceholder="Search companies..."
        onAdd={hasPermission('create') ? () => { setSelectedCompany(null); setIsCreateModalOpen(true); } : undefined}
        addText="Create Company"
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
        <CompanyAccountList
          onEdit={(record) => { setSelectedCompany(record); setIsEditModalOpen(true); }}
          onDelete={(id) => {
            Modal.confirm({
                title: 'Delete Company',
                content: 'Are you sure?',
                onOk: async () => {
                    await deleteCompanyAccount(id).unwrap();
                    message.success('Deleted successfully');
                }
            });
          }}
          searchText={searchText}
          loggedInUser={loggedInUser}
          categoriesData={categoriesData}
          companyAccountsResponse={companyAccountsResponse}
          isCompanyAccountsLoading={isCompanyAccountsLoading}
          countries={countries}
          onSearchChange={handleSearchChange}
          onPaginationChange={(page, pageSize) => setPagination({ page, pageSize })}
          hasPermission={hasPermission}
        />
      </Card>

      <CreateCompanyAccount
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        categoriesData={categoriesData}
        loggedInUser={loggedInUser}
      />

      <EditCompanyAccount
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        categoriesData={categoriesData}
        companyData={selectedCompany}
        loggedInUser={loggedInUser}
      />
    </div>
  );
};

export default CompanyAccount;
