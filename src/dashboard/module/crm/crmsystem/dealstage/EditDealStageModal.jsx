import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, Typography, Divider, Switch, message } from "antd";
import { FiX } from "react-icons/fi";
import { useUpdateDealStageMutation, useGetDealStagesQuery } from "./services/dealStageApi";
import { useGetPipelinesQuery } from "../pipeline/services/pipelineApi";
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { confirm } = Modal;

const EditDealStageModal = ({ isOpen, onClose, stage }) => {
  const [form] = Form.useForm();
  const [updateDealStage, { isLoading }] = useUpdateDealStageMutation();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: stages = [], refetch: refetchStages } = useGetDealStagesQuery();
  const [isDefault, setIsDefault] = useState(false);

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

  return (
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
      <div className="modal-header">
        <div className="left-section">
          <h2>Edit Deal Stage</h2>
        </div>
        <Button
          type="text"
          className="close-button"
          onClick={() => {
            form.resetFields();
            setIsDefault(false);
            onClose();
          }}
          icon={<FiX size={20} />}
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="modal-form"
      >
        <Form.Item
          name="name"
          label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Stage Name</span>}
          rules={[{ required: true, message: "Please enter stage name" }]}
        >
          <Input placeholder="Enter stage name" />
        </Form.Item>

        <Form.Item
          name="pipeline"
          label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Pipeline</span>}
          rules={[{ required: true, message: "Please select pipeline" }]}
        >
          <Select
            placeholder="Select pipeline"
            onChange={handlePipelineChange}
            options={pipelines.map((pipeline) => ({
              value: pipeline.id,
              label: pipeline.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Default Stage</span>}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Switch
              checked={isDefault}
              onChange={(checked) => {
                const selectedPipeline = form.getFieldValue('pipeline') || stage.pipeline;
                if (checked && selectedPipeline) {
                  showDefaultWarning(selectedPipeline, (proceed) => {
                    setIsDefault(proceed);
                  });
                } else {
                  setIsDefault(checked);
                }
              }}
            />
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Set as default stage for new deals
            </Text>
          </div>
        </Form.Item>

        <Divider style={{ margin: "24px 0" }} />

        <div className="modal-footer">
          <Button
            onClick={() => {
              form.resetFields();
              setIsDefault(false);
              onClose();
            }}
            style={{
              padding: "8px 32px",
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
            }}
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditDealStageModal;
