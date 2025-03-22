import React, { useEffect } from "react";
import { Modal, Form, Input, Button, ColorPicker, message } from "antd";
import { useUpdateLableMutation } from "./services/LableApi";


const EditLableModal = ({ isOpen, onClose, lable }) => {
  const [form] = Form.useForm();
  const [updateLable, { isLoading }] = useUpdateLableMutation();

  useEffect(() => {
    if (lable) {
      form.setFieldsValue({
        name: lable.name,
        color: lable.color,
      });
    }
  }, [lable, form]);

  const handleSubmit = async (values) => {
    try {
      await updateLable({
        id: lable.id,
        data: {
          name: values.name,
          color: "#1677ff" || values.color?.toHexString(),
          lableType: "lable",
        },
      }).unwrap();

      message.success("Lable updated successfully");
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(error?.data?.message || "Failed to update lable");
    }
  };

  return (
    <Modal
      title="Edit Lable"
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
            Update Lable
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditLableModal;
