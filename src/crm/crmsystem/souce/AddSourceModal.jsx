import React, { useState } from "react";
import { Modal, Form, Input, Button, ColorPicker } from "antd";
import { useCreateSourceMutation } from "./services/SourceApi";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { selectCurrentUser } from "../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const AddSourceModal = ({ isOpen, onClose }) => {
  const [form] = Form.useForm();
  const [createSource, { isLoading }] = useCreateSourceMutation();
  const user = useSelector(selectCurrentUser);

  const handleSubmit = async (values) => {
    try {
      await createSource({
        id: user?.id,
        data: {
          name: values.name,
          color: values.color?.toHexString() || "#1677ff",
        },
      }).unwrap();

      toast.success("Source created successfully");
      form.resetFields();
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create source");
    }
  };

  return (
    <Modal
      title="Add New Source"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Source Name"
          rules={[{ required: true, message: "Please enter source name" }]}
        >
          <Input placeholder="Enter source name" />
        </Form.Item>

        <Form.Item name="color" label="Color">
          <ColorPicker />
        </Form.Item>

        <Form.Item className="text-right">
          <Button type="default" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Add Source
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSourceModal;
