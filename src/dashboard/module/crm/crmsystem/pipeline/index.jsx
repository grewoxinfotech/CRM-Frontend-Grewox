import React, { useState } from "react";
import { FiEdit2, FiPlus, FiTrash2, FiMoreVertical, FiGrid, FiList, FiGitBranch, FiLayers } from "react-icons/fi";
import AddPipelineModal from "./AddPipelineModal";
import EditPipelineModal from "./EditPipelineModal";
import {
  useGetPipelinesQuery,
  useDeletePipelineMutation,
} from "./services/pipelineApi";
import "./pipeline.scss";
import { Button, Card, Table, Dropdown, message, Modal, Tooltip, Space, Tag, Typography } from "antd";
import { useGetLeadsQuery } from "../../lead/services/LeadApi";
import { useGetDealsQuery } from "../../deal/services/DealApi";

const { Title } = Typography;

const Pipeline = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [viewType, setViewType] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useGetPipelinesQuery();
  const { data: leadsResponse } = useGetLeadsQuery({
    page: 1,
    pageSize: 100 // Get more leads since we need to check pipeline usage
  });
  const { data: dealsResponse } = useGetDealsQuery({
    page: 1,
    pageSize: 100 // Get more deals since we need to check pipeline usage
  });
  const [deletePipeline] = useDeletePipelineMutation();

  // Ensure data is always an array
  const leadsData = leadsResponse?.data || [];
  const dealsData = dealsResponse?.data || [];

  // Ensure pipelines is always an array
  const pipelines = Array.isArray(data?.pipelines)
    ? data.pipelines
    : Array.isArray(data)
      ? data
      : [];

  // Check pipeline usage in leads and deals
  const getPipelineUsage = (pipelineId) => {
    const usedInLeads = leadsData.some(lead => lead.pipeline === pipelineId);
    const usedInDeals = dealsData.some(deal => deal.pipeline === pipelineId);

    if (usedInLeads && usedInDeals) {
      return { type: 'both', label: 'Used in Leads & Deals' };
    } else if (usedInLeads) {
      return { type: 'leads', label: 'Used in Leads' };
    } else if (usedInDeals) {
      return { type: 'deals', label: 'Used in Deals' };
    }
    return { type: 'none', label: '' };
  };

  const isPipelineInUse = (pipelineId) => {
    const usage = getPipelineUsage(pipelineId);
    return usage.type !== 'none';
  };

  const paginatedPipelines = pipelines.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleEdit = (pipeline) => {
    setSelectedPipeline(pipeline);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Pipeline',
      content: 'Are you sure you want to delete this pipeline? This will also delete all associated stages.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deletePipeline(id).unwrap();
          message.success('Pipeline deleted successfully');
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete pipeline');
        }
      },
    });
  };

  const actionMenu = (record) => {
    const isUsed = isPipelineInUse(record.id);
    return {
      items: [
        {
          key: 'edit',
          label: 'Edit',
          icon: <FiEdit2 />,
          onClick: () => handleEdit(record),
          disabled: isUsed,
        },
        {
          key: 'delete',
          label: 'Delete',
          icon: <FiTrash2 />,
          danger: true,
          onClick: () => handleDelete(record.id),
          disabled: isUsed,
        },
      ],
    };
  };

  const columns = [
    {
      title: 'Pipeline Name',
      dataIndex: 'pipeline_name',
      key: 'pipeline_name',
      render: (text, record) => (
        <Space direction="vertical" size={4}>
          <Space>
            <FiLayers className="pipeline-icon" />
            <Tooltip title={text}>
              <span style={{
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block'
              }}>
                {text}
              </span>
            </Tooltip>
          </Space>
          {getPipelineUsage(record.id).type !== 'none' && (
            <Tooltip title={`This pipeline is currently being used in ${getPipelineUsage(record.id).type === 'both' ? 'leads and deals' : getPipelineUsage(record.id).type}`}>
              <Tag className="stage-label" style={{
                margin: 0,
                padding: '2px 8px',
                fontSize: '11px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                height: '20px',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                color: 'white',
                border: 'none',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                cursor: 'help'
              }}>
                Used
              </Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isUsed = isPipelineInUse(record.id);
        return (
          <Space size="middle">
            {!isUsed && (
              <>
                <Button
                  type="text"
                  icon={<FiEdit2 />}
                  onClick={() => handleEdit(record)}
                  className="edit-button"
                />
                <Button
                  type="text"
                  danger
                  icon={<FiTrash2 />}
                  onClick={() => handleDelete(record.id)}
                  className="delete-button"
                />
              </>
            )}
          </Space>
        );
      },
    },
  ];

  if (error) {
    return <div>Error loading pipelines: {error.message}</div>;
  }

  return (
    <div className="pipeline-wrapper">
      <div className="pipeline-container">
        <div className="header-section" style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="view-toggle" style={{ display: 'flex', gap: '8px' }}>
              <Tooltip title="Grid View">
                <Button
                  type={viewType === 'grid' ? 'primary' : 'default'}
                  icon={<FiGrid />}
                  onClick={() => setViewType('grid')}
                  style={{
                    background: viewType === 'grid' ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' : 'transparent',
                  }}
                />
              </Tooltip>
              <Tooltip title="List View">
                <Button
                  type={viewType === 'list' ? 'primary' : 'default'}
                  icon={<FiList />}
                  onClick={() => setViewType('list')}
                  style={{
                    background: viewType === 'list' ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' : 'transparent',
                  }}
                />
              </Tooltip>
            </div>
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={() => setIsModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: "40px",
                padding: "0 16px",
                borderRadius: "8px",
                fontWeight: "500",
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                boxShadow: "0 2px 4px rgba(24, 144, 255, 0.15)",
              }}
            >
              Add Pipeline
            </Button>
          </div>
        </div>

        {viewType === 'grid' ? (
          <>
            <div className="pipeline-grid">
              {pipelines && pipelines.length > 0 ? (
                paginatedPipelines.map((pipeline) => {
                  const usage = getPipelineUsage(pipeline.id);
                  const isUsed = usage.type !== 'none';
                  return (
                    <div key={pipeline.id} className="pipeline-card">
                      <div className="pipeline-content">
                        <div className="pipeline-header">
                          <div className="pipeline-info-wrapper">
                            <div className="pipeline-icon">
                              <FiGitBranch />
                            </div>
                            <div className="pipeline-info">
                              <Tooltip title={pipeline.pipeline_name}>
                                <h3 style={{
                                  margin: 0,
                                  maxWidth: '200px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {pipeline.pipeline_name}
                                </h3>
                              </Tooltip>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {usage.type !== 'none' && (
                                  <Tooltip title={`This pipeline is currently being used in ${usage.type === 'both' ? 'leads and deals' : usage.type}`}>
                                    <Tag className="stage-label" style={{
                                      margin: 0,
                                      padding: '2px 8px',
                                      fontSize: '11px',
                                      borderRadius: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      height: '20px',
                                      fontWeight: 500,
                                      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                      color: 'white',
                                      border: 'none',
                                      letterSpacing: '0.02em',
                                      textTransform: 'uppercase',
                                      cursor: 'help'
                                    }}>
                                      Used
                                    </Tag>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="pipeline-actions">
                            {!isPipelineInUse(pipeline.id) && (
                              <>
                                <Button
                                  type="text"
                                  icon={<FiEdit2 />}
                                  onClick={() => handleEdit(pipeline)}
                                  className="edit-button"
                                />
                                <Button
                                  type="text"
                                  danger
                                  icon={<FiTrash2 />}
                                  onClick={() => handleDelete(pipeline.id)}
                                  className="delete-button"
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-pipelines">
                  <FiGitBranch size={48} />
                  <p>No pipelines found. Create one to get started.</p>
                </div>
              )}
            </div>
            {pipelines.length > pageSize && (
              <div className="grid-pagination">
                <Table
                  pagination={{
                    total: pipelines.length,
                    pageSize: pageSize,
                    current: currentPage,
                    onChange: setCurrentPage,
                    position: ['bottomRight'],
                    showSizeChanger: false,
                    showQuickJumper: false,
                    showTotal: false,
                  }}
                  className="pagination-only"
                />
              </div>
            )}
          </>
        ) : (
          <Table
            columns={columns}
            dataSource={pipelines}
            rowKey="id"
            pagination={{
              total: pipelines.length,
              pageSize: pageSize,
              position: ['bottomRight'],
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: false,
            }}
            className="pipeline-table"
          />
        )}  
      </div>

      <AddPipelineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditPipelineModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPipeline(null);
        }}
        pipeline={selectedPipeline}
      />
    </div>
  );
};

export default Pipeline;
