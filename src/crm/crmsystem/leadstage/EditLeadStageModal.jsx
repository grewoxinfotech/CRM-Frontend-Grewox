import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import { useUpdateLeadStageMutation } from "./services/leadStageApi";
import { useGetPipelinesQuery } from "../pipeline/services/pipelineApi";

const EditLeadStageModal = ({ isOpen, onClose, stage }) => {
  const [form] = Form.useForm();
  const [updateLeadStage, { isLoading }] = useUpdateLeadStageMutation();
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
    try {
      const values = await form.validateFields();
      await updateLeadStage({
        id: stage.id,
        stageName: values.name,
        pipeline: values.pipeline,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update lead stage:", error);
    }
  };

  return (
    <Modal
      title="Edit Lead Stage"
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

export default EditLeadStageModal;
