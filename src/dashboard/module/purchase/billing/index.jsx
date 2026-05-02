import React, { useState } from "react";
import {
  Card,
  message,
  Modal,
  Alert,
} from "antd";
import {
  FiPlus,
  FiDownload,
  FiHome,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import BillingList from "./BillingList";
import CreateBilling from "./CreateBilling";
import EditBilling from "./EditBilling";
import "./billing.scss";
import {
  useGetBillingsQuery,
  useDeleteBillingMutation,
} from "./services/billingApi";
import { useGetVendorsQuery } from "./services/billingApi";
import { useSelector } from "react-redux";
import PageHeader from "../../../../components/PageHeader";

const getCompanyId = (state) => {
  const user = state.auth.user;
  return user?.companyId || user?.company_id || user?.id;
};

const Billing = () => {
  const companyId = useSelector(getCompanyId);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: billingsData, isLoading } = useGetBillingsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchText,
  });

  const { data: vendorsDataa, isLoading: vendorsLoading } = useGetVendorsQuery({
    page: 1,
    pageSize: -1,
    search: ''
  });

  const [deleteBilling] = useDeleteBillingMutation();
  const vendorsData = vendorsDataa?.message || [];

  const handleExport = async (type) => {
    message.info(`Exporting as ${type.toUpperCase()}...`);
  };

  return (
    <div className="billing-page standard-page-container">
      <PageHeader
        title="Purchase Billings"
        count={billingsData?.total || 0}
        subtitle="Manage all billings in the organization"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: "Purchase" },
          { title: "Billings" },
        ]}
        searchText={searchText}
        onSearch={setSearchText}
        searchPlaceholder="Search billings..."
        onAdd={() => { setSelectedBilling(null); setIsCreateModalVisible(true); }}
        addText="Create Billing"
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

      {!companyId && (
        <Alert
          message="Warning"
          description="Company ID not found. Some features may not work properly."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card className="standard-content-card">
        <BillingList
          billings={billingsData?.message?.data || []}
          onEdit={(record) => { setSelectedBilling(record); setIsEditModalVisible(true); }}
          onDelete={(record) => {
            Modal.confirm({
              title: "Delete Bill",
              content: "Are you sure?",
              onOk: async () => {
                await deleteBilling(record.id || record._id).unwrap();
                message.success("Deleted successfully");
              },
            });
          }}
          onView={(record) => console.log("View billing:", record)}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: billingsData?.total || 0,
            onChange: (page, size) => { setCurrentPage(page); setPageSize(size); }
          }}
        />
      </Card>

      <CreateBilling
        open={isCreateModalVisible}
        vendorsLoading={vendorsLoading}
        vendorsData={vendorsData}
        onCancel={() => setIsCreateModalVisible(false)}
      />

      <EditBilling
        open={isEditModalVisible}
        vendorsLoading={vendorsLoading}
        vendorsData={vendorsData}
        onCancel={() => { setIsEditModalVisible(false); setSelectedBilling(null); }}
        initialData={selectedBilling}
      />
    </div>
  );
};

export default Billing;
