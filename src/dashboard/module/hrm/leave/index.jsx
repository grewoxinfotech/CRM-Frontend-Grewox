import React, { useState } from "react";
import {
  Card,
  message,
} from "antd";
import {
  FiPlus,
  FiDownload,
  FiHome,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import CreateLeave from "./CreateLeave";
import LeaveList from "./LeaveList";
import EditLeave from "./Editleave";
import { useGetLeaveQuery } from "./services/leaveApi";
import "./leave.scss";
import PageHeader from "../../../../components/PageHeader";

const Leave = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: response = {}, isLoading: isLeaveLoading } = useGetLeaveQuery({
    page: currentPage,
    pageSize,
    search: searchText,
  });

  const leaves = response.data || [];
  const pagination = response.pagination || { total: 0 };

  const handleEdit = (record) => {
    setSelectedLeave(record);
    setIsEditModalOpen(true);
  };

  const handleExport = (type) => {
    message.info(`Exporting as ${type.toUpperCase()}...`);
  };

  return (
    <div className="leave-page standard-page-container">
      <PageHeader
        title="Leave Management"
        count={pagination.total}
        subtitle="Manage employee leave requests"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
          { title: "HRM" },
          { title: "Leave" },
        ]}
        searchText={searchText}
        onSearch={setSearchText}
        searchPlaceholder="Search leaves..."
        onAdd={() => { setSelectedLeave(null); setIsCreateModalOpen(true); }}
        addText="New Request"
        exportMenu={{
          items: [
            { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
            { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
            { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
          ]
        }}
      />

      <Card className="standard-content-card">
        <LeaveList
          loading={isLeaveLoading}
          leaves={leaves}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: pagination.total,
            onChange: (page, size) => { setCurrentPage(page); setPageSize(size); }
          }}
          onEdit={handleEdit}
        />
      </Card>

      <CreateLeave
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      {isEditModalOpen && selectedLeave && (
        <EditLeave
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          initialValues={selectedLeave}
        />
      )}
    </div>
  );
};

export default Leave;
