import React, { useEffect } from "react";
import { Modal, Form, Input, Button, ColorPicker, message } from "antd";
import { useUpdateSourceMutation } from "./services/SourceApi";
import { selectCurrentUser } from "../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const EditSourceModal = ({ isOpen, onClose, source }) => {
  const [form] = Form.useForm();
  const [updateSource, { isLoading }] = useUpdateSourceMutation();
  const userdata = useSelector(selectCurrentUser);

  useEffect(() => {
    if (source) {
      form.setFieldsValue({
        name: source.name,
        color: source.color,
      });
    }
  }, [source, form]);

  const handleSubmit = async (values) => {
    if (!source?.id || !userdata?.id) {
      message.error("Invalid source or user data");
      return;
    }

    try {
      await updateSource({
        id: source.id,
        data: {
          name: values.name,
          color: source.color || values.color?.toHexString(),
          lableType: "source",
          user_id: userdata.id,
        },
      }).unwrap();

      message.success("Source updated successfully");
      onClose();
    } catch (error) {
      message.error(error?.data?.message || "Failed to update source");
    }
  };

  return (
    <Modal
      title="Edit Source"
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
            Update Source
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSourceModal;
