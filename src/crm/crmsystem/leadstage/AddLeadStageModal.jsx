import React, { useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import { useAddLeadStageMutation } from "./services/leadStageApi";
import { useGetPipelinesQuery } from "../pipeline/services/pipelineApi";

const AddLeadStageModal = ({ isOpen, onClose }) => {
  const [form] = Form.useForm();
  const [addLeadStage, { isLoading }] = useAddLeadStageMutation();
  const { data: pipelines = [] } = useGetPipelinesQuery();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await addLeadStage({
        stageName: values.name,
        pipeline: values.pipeline,
        stageType: "lead",
      });
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Failed to add lead stage:", error);
    }
  };

  return (
    <Modal
      title="Add Lead Stage"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="Add Stage"
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

export default AddLeadStageModal;
