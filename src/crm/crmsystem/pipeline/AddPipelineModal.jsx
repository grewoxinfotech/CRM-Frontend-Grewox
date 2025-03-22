import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { useAddPipelineMutation } from "./services/pipelineApi";

const AddPipelineModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [addPipeline] = useAddPipelineMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPipeline({ pipeline_name: name });
      setName("");
      onClose();
    } catch (error) {
      console.error("Failed to add pipeline:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Pipeline</h2>
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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPipelineModal;
