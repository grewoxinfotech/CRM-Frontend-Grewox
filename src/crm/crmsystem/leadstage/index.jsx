import React, { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import AddLeadStageModal from "./AddLeadStageModal";
import EditLeadStageModal from "./EditLeadStageModal";
import {
  useGetLeadStagesQuery,
  useDeleteLeadStageMutation,
} from "./services/leadStageApi";
import "./leadstage.scss";
import { Button } from "antd";

const LeadStages = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  const { data: leadStages = [], isLoading } = useGetLeadStagesQuery();
  const [deleteLeadStage] = useDeleteLeadStageMutation();

  const handleEdit = (stage) => {
    setSelectedStage(stage);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteLeadStage(id);
    } catch (error) {
      console.error("Failed to delete lead stage:", error);
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading lead stages...</div>;
  }

  return (
    <div className="lead-stages-wrapper">
      <div className="lead-stages-container">
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
          Add Lead Stage
        </Button>
        <div className="lead-stages-grid">
          {Array.isArray(leadStages) && leadStages.length > 0 ? (
            leadStages.map((stage) => (
              <div key={stage.id} className="lead-stage-card">
                <div className="stage-content">
                  <h3>{stage.stageName}</h3>
                </div>
                <div className="stage-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(stage)}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(stage.id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-stages">
              <p>No lead stages found. Create one to get started.</p>
            </div>
          )}
        </div>
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
    </div>
  );
};

export default LeadStages;
