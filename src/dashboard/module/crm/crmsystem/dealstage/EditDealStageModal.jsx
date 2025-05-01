import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, Typography, Divider, Switch, message } from "antd";
import { FiX, FiLayers } from "react-icons/fi";
import { useUpdateDealStageMutation, useGetDealStagesQuery } from "./services/dealStageApi";
import { useGetPipelinesQuery } from "../pipeline/services/pipelineApi";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { PlusOutlined } from '@ant-design/icons';
import AddPipelineModal from "../pipeline/AddPipelineModal";

const { Text } = Typography;
const { confirm } = Modal;

const EditDealStageModal = ({ isOpen, onClose, stage }) => {
  const [form] = Form.useForm();
  const [updateDealStage, { isLoading }] = useUpdateDealStageMutation();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: stages = [], refetch: refetchStages } = useGetDealStagesQuery();
  const [isDefault, setIsDefault] = useState(false);
  const [remainingStages, setRemainingStages] = useState([]);
  const [isSelectDefaultModalOpen, setIsSelectDefaultModalOpen] = useState(false);
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);

  useEffect(() => {
    if (stage) {
      form.setFieldsValue({
        name: stage.stageName,
        pipeline: stage.pipeline,
      });
      setIsDefault(stage.isDefault || false);
    }
  }, [stage, form]);

  const showDefaultWarning = (selectedPipeline, callback) => {
    const existingDefaultStage = stages.find(
      s => s.pipeline === selectedPipeline &&
        s.isDefault &&
        s.stageType === "deal" &&
        s.id !== stage.id
    );

    if (existingDefaultStage) {
      confirm({
        title: 'Change Default Stage',
        icon: <ExclamationCircleOutlined />,
        content: `"${existingDefaultStage.stageName}" is currently set as default. Setting this stage as default will remove the default status from "${existingDefaultStage.stageName}". Do you want to continue?`,
        okText: 'Yes',
        okType: 'primary',
        cancelText: 'No',
        onOk() {
          callback(true, existingDefaultStage);
        },
        onCancel() {
          setIsDefault(false);
          callback(false);
        },
      });
    } else {
      callback(true);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const selectedPipeline = values.pipeline || stage.pipeline;

      if (isDefault) {
        showDefaultWarning(selectedPipeline, async (proceed, existingDefaultStage) => {
          if (proceed) {
            // If there's an existing default stage, update it first
            if (existingDefaultStage) {
              try {
                const updateData = {
                  stageName: existingDefaultStage.stageName,
                  pipeline: existingDefaultStage.pipeline,
                  stageType: existingDefaultStage.stageType,
                  isDefault: false,
                  id: existingDefaultStage.id
                };
                await updateDealStage(updateData).unwrap();
              } catch (error) {
                message.error("Failed to update existing default stage");
                return;
              }
            }
            // Then update the current stage
            await submitStage(values, selectedPipeline);
          }
        });
      } else {
        await submitStage(values, selectedPipeline);
      }
    } catch (error) {
      message.error("Failed to update deal stage: " + error.message);
    }
  };

  const submitStage = async (values, selectedPipeline) => {
    try {
      const updateData = {
        stageName: values.name,
        pipeline: selectedPipeline,
        stageType: "deal",
        isDefault: isDefault,
        id: stage.id
      };
      await updateDealStage(updateData).unwrap();

      message.success("Deal stage updated successfully");
      form.resetFields();
      refetchStages(); // Refetch stages to update the list
      onClose(true);
    } catch (error) {
      message.error("Failed to update deal stage");
    }
  };

  const handlePipelineChange = (value) => {
    // Reset isDefault when pipeline changes
    setIsDefault(false);
  };

  const handleAddPipelineClick = () => {
    setIsAddPipelineVisible(true);
  };

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
      await updateDealStage({
        id: newDefaultStageId,
        stageName: newDefaultStage.stageName,
        pipeline: newDefaultStage.pipeline,
        stageType: stage.stageType, // Use the same stage type as current stage
        isDefault: true
      }).unwrap();

      // Now update the current stage with isDefault false
      await updateDealStage({
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

  return (
    <>
      <Modal
        title={null}
        open={isOpen}
        onCancel={() => {
          form.resetFields();
          setIsDefault(false);
          onClose();
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
              form.resetFields();
              setIsDefault(false);
              onClose();
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
                Edit Deal Stage
              </h2>
              <Text
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Update the deal stage information
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
            rules={[{ required: true, message: "Please enter stage name" }]}
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
            rules={[{ required: true, message: "Please select pipeline" }]}
          >
            <Select
              placeholder="Select pipeline"
              onChange={handlePipelineChange}
              style={{
                width: "100%",
                height: "48px",
              }}
              options={pipelines.map((pipeline) => ({
                value: pipeline.id,
                label: pipeline.pipeline_name,
              }))}
            >
              <Select.Option
                value="add-pipeline"
                label="Add Pipeline"
              >
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
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Default Stage</span>}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={isDefault}
                onChange={handleDefaultChange}
              />
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Set as default stage for new deals
              </Text>
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
              onClick={() => {
                form.resetFields();
                setIsDefault(false);
                onClose();
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
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal >

      <AddPipelineModal
        isOpen={isAddPipelineVisible}
        onClose={(success) => {
          setIsAddPipelineVisible(false);
          if (success) {
            setIsDefault(true);
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

export default EditDealStageModal;
