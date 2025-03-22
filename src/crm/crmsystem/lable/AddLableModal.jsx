import React, { useState } from "react";
import { Modal, Form, Input, Button, ColorPicker, message } from "antd";
import { useCreateLableMutation } from "./services/LableApi";
import { useParams } from "react-router-dom";
import { selectCurrentUser } from "../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const AddLableModal = ({ isOpen, onClose }) => {
  const [form] = Form.useForm();
  const [createLable, { isLoading }] = useCreateLableMutation();
  const user = useSelector(selectCurrentUser);

  const handleSubmit = async (values) => {
    try {
      await createLable({
        id: user?.id,
        data: {
          name: values.name,
          color: values.color?.toHexString() || "#1677ff",
          lableType: "lable",
        },
      }).unwrap();

      message.success("Lable created successfully");
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(error?.data?.message || "Failed to create lable");
    }
  };

  return (
    <Modal
      title="Add New Lable"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Lable Name"
          rules={[{ required: true, message: "Please enter lable name" }]}
        >
          <Input placeholder="Enter lable name" />
        </Form.Item>

        <Form.Item name="color" label="Color">
          <ColorPicker />
        </Form.Item>

        <Form.Item className="text-right">
          <Button type="default" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Add Lable
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddLableModal;
