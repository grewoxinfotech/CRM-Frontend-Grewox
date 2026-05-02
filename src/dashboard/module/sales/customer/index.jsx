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
} from "./services/custApi";
import PageHeader from "../../../../components/PageHeader";

const Customer = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const { data: custdata, isLoading } = useGetCustomersQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    search: searchText
  });

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
        onAdd={() => setIsCreateModalOpen(true)}
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
              content: "Are you sure?",
              onOk: () => message.success("Deleted successfully")
            });
          }}
          onView={(record) => console.log("View:", record)}
          searchText={searchText}
          pagination={pagination}
          onChange={(newPagination) => setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }))}
        />
      </Card>

      <CreateCustomer
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      <EditCustomer
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        initialValues={selectedCustomer}
      />
    </div>
  );
};

export default Customer;
