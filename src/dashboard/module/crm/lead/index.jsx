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
  Tooltip,
  Row,
  Col,
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
import { Link, useNavigate } from "react-router-dom";
import EditLead from "./EditLead";
import { useGetLeadsQuery } from "./services/LeadApi";

const { Title, Text } = Typography;

const Lead = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [searchText, setSearchText] = useState("");
  const { data: leads, isLoading } = useGetLeadsQuery();

  const handleLeadClick = (lead) => {
    navigate(`/dashboard/crm/lead/${lead.id}`);
  };

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
        <Row justify="center" className="header-actions-wrapper">
          <Col xs={24} sm={24} md={20} lg={16} xl={14}>
            <div className="header-actions">
              <Input
                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                placeholder="Search leads"
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                className="search-input"
              />
              <div className="action-buttons">
                <Button.Group className="view-toggle">
                  <Button
                    type={viewMode === 'table' ? 'primary' : 'default'}
                    icon={<FiList size={16} />}
                    onClick={() => setViewMode('table')}
                  />
                  <Button
                    type={viewMode === 'card' ? 'primary' : 'default'}
                    icon={<FiGrid size={16} />}
                    onClick={() => setViewMode('card')}
                  />
                </Button.Group>
                <Dropdown overlay={exportMenu} trigger={["click"]}>
                  <Button className="export-button">
                    <FiDownload size={16} />
                    <span>Export</span>
                    <FiChevronDown size={14} />
                  </Button>
                </Dropdown>
                <Button
                  type="primary"
                  icon={<FiPlus size={16} />}
                  onClick={handleCreate}
                  className="add-button"
                >
                  Add Lead
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Card className="lead-content">
        {viewMode === "table" ? (
          <LeadList
            lead={leads}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onLeadClick={handleLeadClick}
          />
        ) : (
          <LeadCard
            lead={leads}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onLeadClick={handleLeadClick}
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
