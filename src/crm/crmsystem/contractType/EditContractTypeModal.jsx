import React, { useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { useUpdateContractTypeMutation } from "./services/ContractTypeApi";


const EditContractTypeModal = ({ isOpen, onClose, contractType }) => {
  const [form] = Form.useForm();
  const [updateContractType, { isLoading }] = useUpdateContractTypeMutation();

  useEffect(() => {
    if (contractType) {
      form.setFieldsValue({
        name: contractType.name,
      });
    }
  }, [contractType, form]);

  const handleSubmit = async (values) => {
    try {
      await updateContractType({
        id: contractType.id,
        data: {
          name: values.name,
          lableType: "contractType",
        },
      }).unwrap();
      message.success("Contract type updated successfully");
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(error?.data?.message || "Failed to update contract type");
    }
  };

  return (
    <Modal
      title="Edit Contract Type"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="Contract Type Name"
          rules={[
            {
              required: true,
              message: "Please enter the contract type name",
            },
          ]}
        >
          <Input placeholder="Enter contract type name" />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Update Contract Type
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditContractTypeModal;
