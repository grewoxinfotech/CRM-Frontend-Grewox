import React, { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiLayers, FiGrid, FiList, FiMoreVertical, FiFilter, FiX } from "react-icons/fi";
import AddLeadStageModal from "./AddLeadStageModal";
import EditLeadStageModal from "./EditLeadStageModal";
import {
  useGetLeadStagesQuery,
  useDeleteLeadStageMutation,
  useUpdateLeadStageMutation,
} from "./services/leadStageApi";
import { useGetPipelinesQuery } from "../pipeline/services/pipelineApi";
import "./leadstage.scss";
import { Button, Modal, message, Table, Tooltip, Dropdown, Select, Typography } from "antd";

const { Text } = Typography;

const LeadStages = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [viewType, setViewType] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedPipeline, setSelectedPipeline] = useState('all');
  const [isSelectDefaultModalOpen, setIsSelectDefaultModalOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState(null);

  const { data: stagesData = [], isLoading } = useGetLeadStagesQuery();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const [deleteLeadStage] = useDeleteLeadStageMutation();
  const [updateLeadStage] = useUpdateLeadStageMutation();

  // Filter for lead stages only
  const leadStages = stagesData?.filter(stage => stage?.stageType === "lead") || [];

  // Filter stages based on selected pipeline
  const filteredStages = selectedPipeline === 'all'
    ? leadStages
    : leadStages.filter(stage => stage.pipeline === selectedPipeline);

  const getPipelineName = (pipelineId) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    return pipeline?.pipeline_name || 'Not assigned';
  };

  const handleEdit = (stage) => {
    setSelectedStage(stage);
    setIsEditModalOpen(true);
  };

  const handleDelete = (stage) => {
    setStageToDelete(stage);

    if (stage.isDefault) {
      // Get other stages from the same pipeline that could be set as default
      const otherStagesInPipeline = leadStages.filter(s =>
        s.pipeline === stage.pipeline && s.id !== stage.id
      );

      if (otherStagesInPipeline.length > 0) {
        setIsSelectDefaultModalOpen(true);
      } else {
        // If no other stages in pipeline, just confirm deletion
        showDeleteConfirmation(stage);
      }
    } else {
      // For non-default stages, just show normal confirmation
      showDeleteConfirmation(stage);
    }
  };

  const showDeleteConfirmation = (stage) => {
    Modal.confirm({
      title: 'Delete Lead Stage',
      content: 'Are you sure you want to delete this lead stage?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: {
        padding: '20px',
      },
      onOk: async () => {
        try {
          await deleteLeadStage(stage.id).unwrap();
          message.success('Lead stage deleted successfully');
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete lead stage');
        }
      },
    });
  };

  const handleSetNewDefaultAndDelete = async (newDefaultStageId) => {
    try {
      // First set the new default stage
      const newDefaultStage = leadStages.find(s => s.id === newDefaultStageId);
      if (newDefaultStage) {
        await updateLeadStage({
          stageName: newDefaultStage.stageName,
          pipeline: newDefaultStage.pipeline,
          stageType: newDefaultStage.stageType,
          isDefault: true,
          id: newDefaultStage.id
        }).unwrap();
      }

      // Then delete the old default stage
      await deleteLeadStage(stageToDelete.id).unwrap();

      message.success('Lead stage deleted and new default stage set successfully');
      setIsSelectDefaultModalOpen(false);
      setStageToDelete(null);
    } catch (error) {
      message.error('Failed to update stages: ' + (error?.data?.message || error.message));
    }
  };

  // Update paginated stages to use filtered stages
  const paginatedStages = filteredStages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const actionMenu = (record) => ({
    items: [
      {
        key: 'edit',
        label: 'Edit',
        icon: <FiEdit2 />,
        onClick: () => handleEdit(record),
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <FiTrash2 />,
        danger: true,
        onClick: () => handleDelete(record),
      },
    ],
  });

  const columns = [
    {
      title: 'Stage',
      dataIndex: 'stageName',
      key: 'stageName',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <FiLayers />
          </div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Pipeline',
      dataIndex: 'pipeline',
      key: 'pipeline',
      render: (pipelineId) => getPipelineName(pipelineId),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={actionMenu(record)}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-button"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Dropdown>
      ),
    },
  ];

  if (isLoading) {
    return <div className="loading-spinner">Loading lead stages...</div>;
  }

  return (
    <div className="lead-stages-wrapper">
      <div className="lead-stages-container">
        <div className="header-section" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div className="filter-section">
            <Select
              value={selectedPipeline}
              onChange={setSelectedPipeline}
              style={{ width: 240 }}
              placeholder="Filter by Pipeline"
              suffixIcon={
                <div className="filter-icon">
                  <FiFilter size={16} style={{ strokeWidth: 2 }} />
                </div>
              }
              options={[
                { value: 'all', label: 'All Pipelines' },
                ...pipelines.map(pipeline => ({
                  value: pipeline.id,
                  label: pipeline.pipeline_name
                }))
              ]}
              dropdownStyle={{ minWidth: 240 }}
            />
          </div>
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
              Add Stage
            </Button>
          </div>
        </div>

        {viewType === 'grid' ? (
          <>
            <div className="stage-grid">
              {filteredStages && filteredStages.length > 0 ? (
                paginatedStages.map((stage) => (
                  <div key={stage.id} className="stage-card">
                    <div className="stage-content">
                      <div className="stage-header">
                        <div className="stage-info-wrapper">
                          <div className="stage-icon">
                            <FiLayers />
                          </div>
                          <div className="stage-info">
                            <h3>{stage.stageName}</h3>
                            <p className="pipeline-name">
                              {getPipelineName(stage.pipeline)}
                            </p>
                          </div>
                        </div>
                        <div className="stage-actions">
                          <Button
                            type="text"
                            icon={<FiEdit2 />}
                            onClick={() => handleEdit(stage)}
                            className="edit-button"
                          />
                          <Button
                            type="text"
                            icon={<FiTrash2 />}
                            onClick={() => handleDelete(stage)}
                            className="delete-button"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-stages">
                  <FiLayers size={48} />
                  <p>No lead stages found. Create one to get started.</p>
                </div>
              )}
            </div>
            {filteredStages.length > pageSize && (
              <div className="grid-pagination">
                <Table
                  pagination={{
                    total: filteredStages.length,
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
            dataSource={filteredStages}
            rowKey="id"
            pagination={{
              total: filteredStages.length,
              pageSize: pageSize,
              position: ['bottomRight'],
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: false,
            }}
            className="stage-table"
          />
        )}
      </div>

      <AddLeadStageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditLeadStageModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStage(null);
        }}
        stage={selectedStage}
      />

      <Modal
        title={null}
        open={isSelectDefaultModalOpen}
        onCancel={() => {
          setIsSelectDefaultModalOpen(false);
          setStageToDelete(null);
        }}
        footer={null}
        width={520}
        destroyOnClose={true}
        centered
        closeIcon={null}
        className="pro-modal custom-modal"
        styles={{
          body: {
            padding: 0,
            borderRadius: '8px',
            overflow: 'hidden',
          }
        }}
      >
        <div
          className="modal-header"
          style={{
            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
            padding: "24px",
            color: "#ffffff",
            position: "relative",
          }}
        >
          <Button
            type="text"
            onClick={() => {
              setIsSelectDefaultModalOpen(false);
              setStageToDelete(null);
            }}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              color: "#ffffff",
              width: "32px",
              height: "32px",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              border: "none",
            }}
          >
            <FiX style={{ fontSize: "20px" }} />
          </Button>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiLayers style={{ fontSize: "24px", color: "#ffffff" }} />
            </div>
            <div>
              <h2
                style={{
                  margin: "0",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                Select New Default Stage
              </h2>
              <Text
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Choose a new default stage for this pipeline
              </Text>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Text type="secondary">
              Since you're deleting a default stage, please select a new default stage for this pipeline:
            </Text>
          </div>
          <div className="stage-grid" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leadStages
              .filter(s => s.pipeline === stageToDelete?.pipeline && s.id !== stageToDelete?.id)
              .map(stage => (
                <Button
                  key={stage.id}
                  onClick={() => handleSetNewDefaultAndDelete(stage.id)}
                  className="stage-card"
                  style={{
                    width: '100%',
                    height: 'auto',
                    margin: 0,
                    padding: '16px',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: '16px',
                    border: '1px solid rgba(24, 144, 255, 0.1)',
                    borderRadius: '12px',
                    background: 'white',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(24, 144, 255, 0.02)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div
                    className="stage-icon"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                    }}
                  >
                    <FiLayers style={{ fontSize: '20px' }} />
                  </div>
                  <div className="stage-info">
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1f36' }}>
                      {stage.stageName}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
                      {getPipelineName(stage.pipeline)}
                    </p>
                  </div>
                </Button>
              ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
              borderTop: "1px solid #f0f0f0",
              paddingTop: "24px",
            }}
          >
            <Button
              onClick={() => {
                setIsSelectDefaultModalOpen(false);
                setStageToDelete(null);
              }}
              style={{
                padding: "8px 24px",
                height: "44px",
                borderRadius: "10px",
                border: "1px solid #e6e8eb",
                fontWeight: "500",
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeadStages;
