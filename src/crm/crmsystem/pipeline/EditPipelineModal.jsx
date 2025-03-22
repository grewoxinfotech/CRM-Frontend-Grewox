import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useUpdatePipelineMutation } from "./services/pipelineApi";

const EditPipelineModal = ({ isOpen, onClose, pipeline }) => {
  const [name, setName] = useState("");
  const [updatePipeline] = useUpdatePipelineMutation();

  useEffect(() => {
    if (pipeline) {
      setName(pipeline.pipeline_name);
    }
  }, [pipeline]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePipeline({ id: pipeline.id, pipeline_name: name });
      onClose();
    } catch (error) {
      console.error("Failed to update pipeline:", error);
    }
  };

  if (!isOpen || !pipeline) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Pipeline</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              Pipeline Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Pipeline Name"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPipelineModal;
