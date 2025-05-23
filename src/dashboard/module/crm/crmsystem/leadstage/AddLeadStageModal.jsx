import React, { useState, useRef } from "react";
import { Modal, Form, Input, Select, Button, Typography, Divider, Switch, message } from "antd";
import { FiX, FiLayers } from "react-icons/fi";
import { useAddLeadStageMutation, useGetLeadStagesQuery, useUpdateLeadStageMutation } from "./services/leadStageApi";
import { useGetPipelinesQuery } from "../pipeline/services/pipelineApi";
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import AddPipelineModal from "../pipeline/AddPipelineModal";

const { Text } = Typography;
const { confirm } = Modal;

const AddLeadStageModal = ({ isOpen, onClose, pipelineId }) => {
  const [form] = Form.useForm();
  const [addLeadStage, { isLoading: isAddingStage }] = useAddLeadStageMutation();
  const [updateLeadStage, { isLoading: isUpdatingStage }] = useUpdateLeadStageMutation();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: stages = [], refetch: refetchStages } = useGetLeadStagesQuery();
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const selectRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSubmit = async (values) => {
    try {
      const selectedPipeline = values.pipeline || pipelineId;
      const createData = {
        stageName: values.name,
        pipeline: selectedPipeline,
        stageType: "lead",
        isDefault: isDefault
      };

      // If there's an existing default stage and this is set as default,
      // update the existing default stage silently
      if (isDefault) {
        const existingDefaultStage = stages.find(
          stage => stage.pipeline === selectedPipeline &&
            stage.isDefault &&
            stage.stageType === "lead"
        );

        if (existingDefaultStage) {
          try {
            await updateLeadStage({
              stageName: existingDefaultStage.stageName,
              pipeline: existingDefaultStage.pipeline,
              stageType: existingDefaultStage.stageType,
              isDefault: false,
              id: existingDefaultStage.id
            }).unwrap();
          } catch (error) {
            console.error("Failed to update existing default stage:", error);
          }
        }
      }

      // Create the new stage
      await addLeadStage(createData).unwrap();
      message.success("Lead stage created successfully");
      form.resetFields();
      setIsDefault(false);
      refetchStages();
      onClose(true);
    } catch (error) {
      message.error("Failed to add lead stage: " + error.message);
    }
  };

  const handleAddPipelineClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setIsAddPipelineVisible(true);
  };

  const handlePipelineChange = (value) => {
    setIsDefault(false);
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
                Add Lead Stage
              </h2>
              <Text
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Fill in the information to create lead stage
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
            label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Stage Name <span style={{ color: "#ff4d4f" }}>*</span></span>}
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

          {!pipelineId && (
            <Form.Item
              name="pipeline"
              label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Pipeline <span style={{ color: "#ff4d4f" }}>*</span></span>}
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
          )}

          <Form.Item
            label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Default Stage</span>}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={isDefault}
                onChange={(checked) => {
                  const selectedPipeline = form.getFieldValue('pipeline') || pipelineId;
                  if (checked && selectedPipeline) {
                    const existingDefaultStage = stages.find(
                      stage => stage.pipeline === selectedPipeline &&
                        stage.isDefault &&
                        stage.stageType === "lead"
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
                          setIsDefault(true);
                        },
                        onCancel() {
                          setIsDefault(false);
                        },
                      });
                    } else {
                      setIsDefault(true);
                    }
                  } else {
                    setIsDefault(false);
                  }
                }}
              />
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Set as default stage for new leads
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
              loading={isAddingStage || isUpdatingStage}
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
              Add Stage
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
    </>
  );
};

export default AddLeadStageModal;
