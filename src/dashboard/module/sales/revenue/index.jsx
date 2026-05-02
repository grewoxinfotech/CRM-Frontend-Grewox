import React, { useState } from "react";
import {
  Card,
  message,
  Modal,
} from "antd";
import {
  FiDownload,
  FiHome,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import RevenueList from "./RevenueList";
import CreateRevenue from "./CreateRevenue";
import EditRevenue from "./EditRevenue";
import "./revenue.scss";
import { useGetRevenueQuery } from "./services/revenueApi";
import PageHeader from "../../../../components/PageHeader";

const Revenue = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: revenueData, isLoading: isRevenueLoading } = useGetRevenueQuery({
    page: currentPage,
    pageSize,
    search: searchText
  });

  const handleExport = (type) => {
    message.info(`Exporting as ${type.toUpperCase()}...`);
  };

  return (
    <div className="revenue-page standard-page-container">
      <PageHeader
        title="Revenue"
        count={revenueData?.pagination?.total || 0}
        subtitle="Manage all revenue entries in the organization"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: "Sales" },
          { title: "Revenue" },
        ]}
        searchText={searchText}
        onSearch={(val) => { setSearchText(val); setCurrentPage(1); }}
        searchPlaceholder="Search revenue..."
        onAdd={() => setIsCreateModalOpen(true)}
        addText="Add Entry"
        exportMenu={{
          items: [
            { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
            { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
            { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
          ]
        }}
      />

      <Card className="standard-content-card">
        <RevenueList
          data={revenueData?.data || []}
          loading={isRevenueLoading}
          onEdit={(record) => { setSelectedRevenue(record); setIsEditModalOpen(true); }}
          onDelete={(record) => {
            Modal.confirm({
              title: "Delete Entry",
              content: "Are you sure?",
              onOk: () => message.success("Deleted successfully")
            });
          }}
          onView={(record) => console.log("View:", record)}
          searchText={searchText}
          pagination={{
            current: currentPage,
            pageSize,
            total: revenueData?.pagination?.total || 0,
            onChange: (page) => setCurrentPage(page),
            onSizeChange: (size) => { setPageSize(size); setCurrentPage(1); }
          }}
        />
      </Card>

      <CreateRevenue
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSubmit={() => {
          setIsCreateModalOpen(false);
          message.success("Revenue entry created successfully");
        }}
      />

      <EditRevenue
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedRevenue(null);
        }}
        onSubmit={() => {
          setIsEditModalOpen(false);
          setSelectedRevenue(null);
        }}
        initialValues={selectedRevenue}
      />
    </div>
  );
};

export default Revenue;
