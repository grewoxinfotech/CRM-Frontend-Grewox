import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import { useUpdateDealStageMutation } from "./services/dealStageApi";
import { useGetPipelinesQuery } from "../pipeline/services/pipelineApi";

const EditDealStageModal = ({ isOpen, onClose, stage }) => {
  const [form] = Form.useForm();
  const [updateDealStage, { isLoading }] = useUpdateDealStageMutation();
  const { data: pipelines = [] } = useGetPipelinesQuery();

  useEffect(() => {
    if (stage) {
      form.setFieldsValue({
        name: stage.stageName,
        pipeline: stage.pipeline,
      });
    }
  }, [stage, form]);

  const handleSubmit = async () => {
    if (!stage?.id) return;

    try {
      const values = await form.validateFields();
      await updateDealStage({
        id: stage.id,
        stageName: values.name,
        pipeline: values.pipeline,
        stageType: "deal",
      });
      onClose();
    } catch (error) {
      console.error("Failed to update deal stage:", error);
    }
  };

  return (
    <Modal
      title="Edit Deal Stage"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="Update Stage"
      centered
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="name"
          label="Stage Name"
          rules={[{ required: true, message: "Please enter stage name" }]}
        >
          <Input placeholder="Enter stage name" />
        </Form.Item>

        <Form.Item
          name="pipeline"
          label="Pipeline"
          rules={[{ required: true, message: "Please select a pipeline" }]}
        >
          <Select placeholder="Select pipeline">
            {pipelines.map((pipeline) => (
              <Select.Option key={pipeline.id} value={pipeline.id}>
                {pipeline.pipeline_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditDealStageModal;
