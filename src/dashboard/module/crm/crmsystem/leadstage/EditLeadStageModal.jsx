import React, { useEffect, useState, useRef } from "react";
import { Modal, Form, Input, Select, Button, Typography, Divider, Switch, message } from "antd";
import { FiX, FiLayers } from "react-icons/fi";
import { useUpdateLeadStageMutation, useGetLeadStagesQuery } from "./services/leadStageApi";
import { useGetPipelinesQuery } from "../pipeline/services/pipelineApi";
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import AddPipelineModal from "../pipeline/AddPipelineModal";

const { Text } = Typography;
const { confirm } = Modal;

const EditLeadStageModal = ({ isOpen, onClose, stage }) => {
  const [form] = Form.useForm();
  const [updateLeadStage, { isLoading }] = useUpdateLeadStageMutation();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: stages = [], refetch: refetchStages } = useGetLeadStagesQuery();
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isSelectDefaultModalOpen, setIsSelectDefaultModalOpen] = useState(false);
  const [remainingStages, setRemainingStages] = useState([]);
  const selectRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (stage) {
      form.setFieldsValue({
        name: stage.stageName,
        pipeline: stage.pipeline,
      });
      setIsDefault(stage.isDefault || false);
    }
  }, [stage, form]);

  const handleDefaultChange = (checked) => {
    if (!checked && stage?.isDefault) {
      // Get the current pipeline ID and stage type
      const currentPipeline = stage.pipeline;
      const currentStageType = stage.stageType;

      // Filter stages to only show those from the current pipeline AND same stage type
      const otherStagesInPipeline = stages.filter(s =>
        // Must be same pipeline
        s.pipeline === currentPipeline &&
        // Must be same stage type (lead/deal)
        s.stageType === currentStageType &&
        // Don't show the current stage
        s.id !== stage.id &&
        // Don't show stages that are already default
        !s.isDefault
      );

      if (otherStagesInPipeline.length > 0) {
        setRemainingStages(otherStagesInPipeline);
        setIsSelectDefaultModalOpen(true);
      } else {
        message.error('Cannot remove default status: No other stages available in this pipeline');
        setIsDefault(true); // Keep it default
        return;
      }
    }
    setIsDefault(checked);
  };

  const handleSetNewDefault = async (newDefaultStageId) => {
    try {
      // First set the new default stage
      const newDefaultStage = remainingStages.find(s => s.id === newDefaultStageId);
      if (!newDefaultStage) {
        message.error('Selected stage not found');
        return;
      }

      // Update the new default stage
      await updateLeadStage({
        id: newDefaultStageId,
        stageName: newDefaultStage.stageName,
        pipeline: newDefaultStage.pipeline,
        stageType: stage.stageType, // Use the same stage type as current stage
        isDefault: true
      }).unwrap();

      // Now update the current stage with isDefault false
      await updateLeadStage({
        id: stage.id,
        stageName: form.getFieldValue('name'),
        pipeline: form.getFieldValue('pipeline'),
        stageType: stage.stageType, // Use the same stage type as current stage
        isDefault: false
      }).unwrap();

      message.success('Default stage updated successfully');
      setIsSelectDefaultModalOpen(false);
      onClose();
      refetchStages();
    } catch (error) {
      console.error('Stage operation error:', error);
      message.error(error?.data?.message || 'Failed to update stages');
      setIsDefault(true); // Revert back to default
      setIsSelectDefaultModalOpen(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      await updateLeadStage({
        id: stage.id,
        stageName: values.name,
        pipeline: values.pipeline,
        stageType: "lead",
        isDefault: isDefault
      }).unwrap();

      message.success('Lead stage updated successfully');
      refetchStages();
      onClose();
    } catch (error) {
      message.error(error?.data?.message || 'Failed to update lead stage');
    }
  };

  const handleAddPipelineClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setIsAddPipelineVisible(true);
  };

  const handlePipelineChange = (value) => {
    // Reset isDefault when pipeline changes
    setIsDefault(false);
  };

  const renderStageOption = (stage) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div>{stage.stageName}</div>
      <div style={{
        fontSize: '12px',
        color: '#8c8c8c',
        marginLeft: 'auto'
      }}>
        {stage.pipelineName}
      </div>
    </div>
  );

  return (
    <>
      <Modal
        title={null}
        open={isOpen}
        onCancel={onClose}
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
            onClick={onClose}
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
                Edit Lead Stage
              </h2>
              <Text
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Update lead stage information
              </Text>
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          style={{ padding: "24px" }}
        >
          <Form.Item
            name="name"
            label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Stage Name</span>}
            rules={[{ required: true, message: "Please enter the stage name" }]}
          >
            <Input
              placeholder="Enter stage name"
              style={{
                borderRadius: "10px",
                padding: "8px 16px",
                height: "48px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e6e8eb",
              }}
            />
          </Form.Item>

          <Form.Item
            name="pipeline"
            label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Pipeline</span>}
            rules={[{ required: true, message: "Please select a pipeline" }]}
          >
            <Select
              ref={selectRef}
              placeholder="Select pipeline"
              style={{ width: "100%" }}
              onDropdownVisibleChange={setDropdownOpen}
              onChange={handlePipelineChange}
              open={dropdownOpen}
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <Button
                    type="text"
                    icon={<PlusOutlined style={{ color: '#ffffff' }} />}
                    onClick={handleAddPipelineClick}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    Add Pipeline
                  </Button>
                </div>
              )}
            >
              {pipelines.map((pipeline) => (
                <Select.Option key={pipeline.id} value={pipeline.id}>
                  {pipeline.pipeline_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch checked={isDefault} onChange={handleDefaultChange} />
              <span>Set as default stage</span>
            </div>
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              onClick={onClose}
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
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{
                padding: "8px 32px",
                height: "44px",
                borderRadius: "10px",
                fontWeight: "500",
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
              }}
            >
              Update Stage
            </Button>
          </div>
        </Form>
      </Modal>

      <AddPipelineModal
        isOpen={isAddPipelineVisible}
        onClose={(success) => {
          setIsAddPipelineVisible(false);
          if (success) {
            setDropdownOpen(true);
          }
        }}
      />

      <Modal
        title={null}
        open={isSelectDefaultModalOpen}
        onCancel={() => {
          setIsSelectDefaultModalOpen(false);
          setIsDefault(true); // Revert back to default
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
              setIsDefault(true); // Revert back to default
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
              Since you're removing default status from this stage, please select a new default stage for this pipeline:
            </Text>
          </div>
          <div className="stage-grid" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {remainingStages.map(stage => (
              <Button
                key={stage.id}
                onClick={() => handleSetNewDefault(stage.id)}
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
                <div className="stage-info" style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1f36' }}>
                    {stage.stageName}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    {stage.pipelineName}
                  </div>
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
                setIsDefault(true); // Revert back to default
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
    </>
  );
};

export default EditLeadStageModal;
