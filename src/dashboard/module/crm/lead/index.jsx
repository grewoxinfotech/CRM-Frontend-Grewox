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
  Select,
  message,
  Form,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiDownload,
  FiGrid,
  FiList,
  FiHome,
  FiLink,
  FiCopy,
} from "react-icons/fi";
import "./Lead.scss";
import CreateLead from "./CreateLead";
import LeadCard from "./LeadCard";
import LeadList from "./LeadList";
import { Link, useNavigate } from "react-router-dom";
import EditLead from "./EditLead";
import { useGetLeadsQuery } from "./services/LeadApi";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useGetAllCountriesQuery, useGetAllCurrenciesQuery } from "../../settings/services/settingsApi";
import { useGetCategoriesQuery, useGetSourcesQuery, useGetStatusesQuery } from "../crmsystem/souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";

const { Title, Text } = Typography;
const { Option } = Select;

const Lead = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [searchText, setSearchText] = useState("");
  const loggedInUser = useSelector(selectCurrentUser);
  const { data: leads, isLoading } = useGetLeadsQuery();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: currencies = [] } = useGetAllCurrenciesQuery();
  const { data: countries = [] } = useGetAllCountriesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
  const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);
  const { data: stagesData } = useGetLeadStagesQuery();
  const [isGenerateLinkModalOpen, setIsGenerateLinkModalOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [generatedLink, setGeneratedLink] = useState("");

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredLeads = React.useMemo(() => {
    if (!leads?.data) return [];

    return leads.data.filter(lead => {
      const searchLower = searchText.toLowerCase();
      return (
        lead.leadTitle?.toLowerCase().includes(searchLower) ||
        lead.company_name?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.toLowerCase().includes(searchLower)
      );
    });
  }, [leads?.data, searchText]);

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

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setSelectedLead(null);
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

  const filteredStages = React.useMemo(() => {
    if (!stagesData) return [];
    return stagesData.filter(
      stage => stage.stageType === "lead" && stage.pipeline === selectedPipeline
    );
  }, [stagesData, selectedPipeline]);

  const handleGenerateLink = () => {
    if (!selectedPipeline || !selectedStage) {
      message.error("Please select both pipeline and stage");
      return;
    }

    const baseUrl = window.location.origin;
    const formUrl = new URL("/lead-form", baseUrl);
    formUrl.searchParams.set("pipeline", selectedPipeline);
    formUrl.searchParams.set("stage", selectedStage);
    formUrl.searchParams.set("source", "web-form");
    
    setGeneratedLink(formUrl.toString());
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    message.success("Link copied to clipboard!");
  };

  const handleOpenForm = () => {
    if (generatedLink) {
      window.open(generatedLink, '_blank');
    }
  };

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
                  icon={<FiLink size={16} />}
                  onClick={() => setIsGenerateLinkModalOpen(true)}
                  className="generate-link-button"
                  style={{
                    marginRight: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Generate Link
                </Button>
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
            leads={{ data: filteredLeads }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onLeadClick={handleLeadClick}
          />
        ) : (
          <LeadCard
            leads={{ data: filteredLeads }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            categoriesData={categoriesData}
            sourcesData={sourcesData}
            statusesData={statusesData}
            currencies={currencies}
            countries={countries}
            pipelines={pipelines}
            onView={handleView}
            onLeadClick={handleLeadClick}
          />
        )}
      </Card>

      <CreateLead open={isModalOpen} pipelines={pipelines}
        currencies={currencies}
        countries={countries}
        sourcesData={sourcesData}
        statusesData={statusesData}
        categoriesData={categoriesData}
        onCancel={() => setIsModalOpen(false)} />
      <EditLead
        open={isEditModalOpen}
        pipelines={pipelines}
        currencies={currencies}
        countries={countries}
        sourcesData={sourcesData}
        statusesData={statusesData}
        categoriesData={categoriesData}
        onCancel={handleEditCancel}
        initialValues={selectedLead}
        key={selectedLead?.id}
      />

      <Modal
        title="Generate Lead Form Link"
        open={isGenerateLinkModalOpen}
        onCancel={() => setIsGenerateLinkModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
        className="generate-link-modal"
      >
        <div style={{ marginBottom: '24px' }}>
          <Text type="secondary">
            Select a pipeline and stage to generate a shareable lead form link.
          </Text>
        </div>

        <Form layout="vertical">
          <Form.Item
            label="Select Pipeline"
            required
            style={{ marginBottom: '16px' }}
          >
            <Select
              placeholder="Choose a pipeline"
              value={selectedPipeline}
              onChange={(value) => {
                setSelectedPipeline(value);
                setSelectedStage(null);
              }}
              style={{ width: '100%' }}
            >
              {pipelines.map((pipeline) => (
                <Option key={pipeline.id} value={pipeline.id}>
                  {pipeline.pipeline_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Select Stage"
            required
            style={{ marginBottom: '24px' }}
          >
            <Select
              placeholder={selectedPipeline ? "Choose a stage" : "Select pipeline first"}
              value={selectedStage}
              onChange={setSelectedStage}
              disabled={!selectedPipeline}
              style={{ width: '100%' }}
            >
              {filteredStages.map((stage) => (
                <Option key={stage.id} value={stage.id}>
                  {stage.stageName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <Button
              type="primary"
              onClick={handleGenerateLink}
              style={{ flex: 1 }}
              disabled={!selectedPipeline || !selectedStage}
            >
              Generate Link
            </Button>
          </div>

          {generatedLink && (
            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                background: '#f5f5f5',
                borderRadius: '8px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Generated Link:</Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}
              >
                <Input
                  value={generatedLink}
                  readOnly
                  style={{ flex: 1 }}
                />
                <Button
                  icon={<FiCopy size={16} />}
                  onClick={handleCopyLink}
                  tooltip="Copy to clipboard"
                >
                  Copy
                </Button>
                <Button
                  type="primary"
                  onClick={handleOpenForm}
                >
                  Open Form
                </Button>
              </div>
            </div>
          )}
        </Form>
      </Modal>

      <style jsx global>{`
        .generate-link-modal {
          .ant-modal-content {
            border-radius: 12px;
            overflow: hidden;
          }
          
          .ant-modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid #f0f0f0;
          }

          .ant-modal-body {
            padding: 24px;
          }

          .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
            border-color: #40a9ff;
          }

          .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
            border-color: #1890ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
          }
        }
      `}</style>
    </div>
  );
};

export default Lead;
