import React from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { useAddContractTypeMutation } from "./services/ContractTypeApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../auth/services/authSlice";

const AddContractTypeModal = ({ isOpen, onClose }) => {
  const [form] = Form.useForm();
  const [addContractType, { isLoading }] = useAddContractTypeMutation();
  const userdata = useSelector(selectCurrentUser);
  console.log("userdata", userdata);

  const handleSubmit = async (values) => {
    console.log("values", values);
    try {
      await addContractType({
        id: userdata?.id,
        data: {
          name: values.name,
          lableType: "contractType",
        },
      }).unwrap();
      message.success("Contract type added successfully");
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(error?.data?.message || "Failed to add contract type");
    }
  };

  return (
    <Modal
      title="Add Contract Type"
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
            Add Contract Type
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddContractTypeModal;
