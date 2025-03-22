import React, { useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import AddPipelineModal from "./AddPipelineModal";
import EditPipelineModal from "./EditPipelineModal";
import {
  useGetPipelinesQuery,
  useDeletePipelineMutation,
} from "./services/pipelineApi";
import "./pipeline.scss";
import { Button } from "antd";

const Pipeline = ({ isModalOpen, setIsModalOpen }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);

  const { data, isLoading, error } = useGetPipelinesQuery();
  const [deletePipeline] = useDeletePipelineMutation();

  // Ensure pipelines is always an array
  const pipelines = Array.isArray(data?.pipelines)
    ? data.pipelines
    : Array.isArray(data)
    ? data
    : [];

  const handleAddPipeline = (newPipeline) => {
    setIsModalOpen(false);
  };

  const handleEditClick = (pipeline) => {
    setSelectedPipeline(pipeline);
    setIsEditModalOpen(true);
  };

  const handleEditPipeline = (updatedPipeline) => {
    setIsEditModalOpen(false);
    setSelectedPipeline(null);
  };

  const handleDeletePipeline = async (id) => {
    try {
      await deletePipeline(id);
    } catch (error) {
      console.error("Failed to delete pipeline:", error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading pipelines...</div>;
  }

  if (error) {
    return (
      <div className="error">Error loading pipelines: {error.message}</div>
    );
  }

  return (
    <div className="pipeline-container">
      <div className="pipeline-table">
        <h2
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "600",
            color: "#111827",
          }}
        >
          {/* Sources */}
        </h2>
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
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            marginBottom: "24px",
          }}
        >
          Add Pipeline
        </Button>
        <div className="table-header">
          <div className="header-cell pipeline-name">Pipeline</div>
          <div className="header-cell action">Action</div>
        </div>
        <div className="table-body">
          {pipelines.length === 0 ? (
            <div className="table-row empty">
              <div className="cell">No pipelines found</div>
            </div>
          ) : (
            pipelines.map((pipeline) => (
              <div key={pipeline.id} className="table-row">
                <div className="cell pipeline-name">
                  {pipeline.pipeline_name}
                </div>
                <div className="cell action">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditClick(pipeline)}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeletePipeline(pipeline.id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddPipelineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddPipeline}
      />

      <EditPipelineModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPipeline(null);
        }}
        onEdit={handleEditPipeline}
        pipeline={selectedPipeline}
      />
    </div>
  );
};

export default Pipeline;
