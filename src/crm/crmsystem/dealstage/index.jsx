import React, { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import AddDealStageModal from "./AddDealStageModal";
import EditDealStageModal from "./EditDealStageModal";
import {
  useGetDealStagesQuery,
  useDeleteDealStageMutation,
} from "./services/dealStageApi";
import "./dealstage.scss";

const DealStages = ({ isModalOpen, setIsModalOpen }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  const { data: dealStages = [], isLoading, error } = useGetDealStagesQuery();
  const [deleteDealStage] = useDeleteDealStageMutation();

  const handleEdit = (stage) => {
    setSelectedStage(stage);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDealStage(id);
    } catch (error) {
      console.error("Failed to delete deal stage:", error);
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading...</div>;
  if (error) {
    console.error("Error loading deal stages:", error);
    return (
      <div className="error-message">
        Error loading deal stages. Please try again later.
      </div>
    );
  }

  return (
    <div className="deal-stages-wrapper">
      <div className="deal-stages-container">
        {Array.isArray(dealStages) && dealStages.length > 0 ? (
          <div className="deal-stages-grid">
            {dealStages.map((stage) => (
              <div key={stage.id} className="deal-stage-card">
                <div className="stage-content">
                  <h3>{stage.stageName}</h3>
                  {stage.probability && (
                    <div className="probability">
                      Probability: {stage.probability}%
                    </div>
                  )}
                </div>
                <div className="stage-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(stage)}
                    title="Edit Stage"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(stage.id)}
                    title="Delete Stage"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-stages">
            <p>No deal stages found. Create one to get started.</p>
          </div>
        )}
      </div>

      <AddDealStageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditDealStageModal
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

export default DealStages;
