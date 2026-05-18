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
import CustomerList from "./CustomerList";
import CreateCustomer from "./CreateCustomer";
import EditCustomer from "./EditCustomer";
import "./customer.scss";
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from "./services/custApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetRolesQuery } from "../../hrm/role/services/roleApi";
import PageHeader from "../../../../components/PageHeader";

const Customer = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const loggedInUser = useSelector(selectCurrentUser);
  const { data: rolesData } = useGetRolesQuery(undefined, {
    skip: !loggedInUser || loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client'
  });

  const userRoleData = rolesData?.message?.data?.find(role => role.id === loggedInUser?.role_id);
  const userPermissions = React.useMemo(() => {
    if (!userRoleData?.permissions) return null;
    try {
      return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
    } catch (e) {
      return null;
    }
  }, [userRoleData]);

  const hasPermission = React.useCallback((action) => {
    if (!loggedInUser) return false;
    if (loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client') return true;
    if (!userPermissions) return false;
    const modulePerms = userPermissions['dashboards-sales-customer'];
    if (!modulePerms || modulePerms.length === 0) return false;
    const allowed = modulePerms[0]?.permissions || [];
    return allowed.includes(action);
  }, [loggedInUser, userPermissions]);

  const { data: custdata, isLoading } = useGetCustomersQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    search: searchText
  });

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();

  const handleCreateCustomer = async (data) => {
    try {
      const response = await createCustomer(data).unwrap();
      if (response.success) {
        message.success("Customer created successfully");
        setIsCreateModalOpen(false);
      } else {
        throw new Error(response.message || "Failed to create customer");
      }
    } catch (error) {
      console.error("Create Customer Error:", error);
      throw error; // Propagate error for LimitReachedModal handling in CreateCustomer
    }
  };

  const handleEditCustomer = async (data) => {
    try {
      const response = await updateCustomer({ id: selectedCustomer.id, data }).unwrap();
      if (response.success) {
        message.success("Customer updated successfully");
        setIsEditModalOpen(false);
        setSelectedCustomer(null);
      } else {
        throw new Error(response.message || "Failed to update customer");
      }
    } catch (error) {
      console.error("Edit Customer Error:", error);
      throw error;
    }
  };

  const handleExport = async (type) => {
    message.info(`Exporting as ${type.toUpperCase()}...`);
  };

  return (
    <div className="customer-page standard-page-container">
      <PageHeader
        title="Customers"
        count={custdata?.pagination?.total || 0}
        subtitle="Manage all customers in the organization"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: "Sales" },
          { title: "Customers" },
        ]}
        searchText={searchText}
        onSearch={setSearchText}
        searchPlaceholder="Search customers..."
        onAdd={hasPermission('create') ? () => setIsCreateModalOpen(true) : undefined}
        addText="Add Customer"
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
        <CustomerList
          loading={isLoading}
          custdata={custdata}
          onEdit={(record) => { setSelectedCustomer(record); setIsEditModalOpen(true); }}
          onDelete={(record) => {
            Modal.confirm({
              title: "Delete Customer",
              content: `Are you sure you want to delete customer "${record.name}"? This action cannot be undone.`,
              okText: "Yes, Delete",
              okType: "danger",
              cancelText: "No",
              onOk: async () => {
                try {
                  const response = await deleteCustomer(record.id).unwrap();
                  if (response.success) {
                    message.success("Customer deleted successfully");
                  } else {
                    message.error(response.message || "Failed to delete customer");
                  }
                } catch (error) {
                  message.error("Failed to delete customer");
                }
              }
            });
          }}
          onView={(record) => console.log("View:", record)}
          searchText={searchText}
          pagination={pagination}
          onChange={(newPagination) => setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }))}
          hasPermission={hasPermission}
        />
      </Card>

      <CreateCustomer
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCustomer}
        loading={isCreating}
      />

      <EditCustomer
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        initialValues={selectedCustomer}
        onSubmit={handleEditCustomer}
        loading={isUpdating}
      />
    </div>
  );
};

export default Customer;
