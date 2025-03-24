import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  Input,
  Dropdown,
  Menu,
  Space,
  Breadcrumb,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiDownload,
  FiGrid,
  FiList,
  FiHome,
} from "react-icons/fi";
import "./Lead.scss";
import CreateLead from "./CreateLead";
import LeadCard from "./LeadCard";
import LeadList from "./LeadList";
import { Link } from "react-router-dom";
import EditLead from "./EditLead";
import { useGetLeadsQuery } from "./services/LeadApi";

const { Title, Text } = Typography;

const Lead = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [searchText, setSearchText] = useState("");
  const { data: leads, isLoading } = useGetLeadsQuery();

  const handleCreate = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleDelete = (lead) => {
    Modal.confirm({
      title: "Delete Lead",
      content: "Are you sure you want to delete this lead?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        // Handle delete action
      },
    });
  };

  const handleView = (lead) => {
    setSelectedLead(lead);
  };

  const exportMenu = (
    <Menu>
      <Menu.Item key="csv">Export as CSV</Menu.Item>
      <Menu.Item key="excel">Export as Excel</Menu.Item>
      <Menu.Item key="pdf">Export as PDF</Menu.Item>
    </Menu>
  );

  return (
    <div className="lead-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Lead</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="header-left">
          <Title level={2}>Leads</Title>
          <p className="subtitle">Manage all leads in the system</p>
        </div>
        <div className="header-right">
          <Input
            prefix={<FiSearch />}
            placeholder="Search leads by name, email..."
            allowClear
            className="search-input"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="view-buttons">
            <div className="view-toggle">
              <Button
                type={viewMode === "table" ? "primary" : "default"}
                icon={<FiList />}
                onClick={() => setViewMode("table")}
              />
              <Button
                type={viewMode === "card" ? "primary" : "default"}
                icon={<FiGrid />}
                onClick={() => setViewMode("card")}
              />
            </div>
          </div>
          <Dropdown overlay={exportMenu} trigger={["click"]}>
            <Button>
              <FiDownload /> Export <FiChevronDown />
            </Button>
          </Dropdown>
          <Button type="primary" icon={<FiPlus />} onClick={handleCreate}>
            Add Lead
          </Button>
        </div>
      </div>

      <Card className="lead-content">
        {viewMode === "table" ? (
          <LeadList
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <LeadCard
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        )}
      </Card>

      <CreateLead open={isModalOpen} onCancel={() => setIsModalOpen(false)} />

      <EditLead
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedLead(null);
        }}
        initialValues={selectedLead}
      />
    </div>
  );
};

export default Lead;
