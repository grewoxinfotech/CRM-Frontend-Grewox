import React from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  message,
  ColorPicker,
} from "antd";
import {
  FiTag,
  FiX,
  FiType,
  FiInfo,
  FiToggleRight,
} from "react-icons/fi";
import { useCreateCategoryMutation } from "../souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../auth/services/authSlice";

const { Text } = Typography;
const { Option } = Select;

const AddCategoryModal = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const user = useSelector(selectCurrentUser);

  const handleSubmit = async (values) => {
    try {
      await createCategory({
        id: user?.id,
        data: {
          name: values.name,
          lableType: "category",
        },
      }).unwrap();
      
      message.success("Category created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error(error?.data?.message || "Failed to create category");
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="custom-modal"
    >
      <div className="modal-header">
        <Button type="text" onClick={onCancel} className="close-button">
          <FiX style={{ fontSize: "20px" }} />
        </Button>
        <div className="header-content">
          <div className="header-icon">
            <FiTag style={{ fontSize: "24px", color: "#ffffff" }} />
          </div>
          <div>
            <h2>Add New Category</h2>
            <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>
              Create a new category for better organization
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="category-form"
      >
        <Form.Item
          name="name"
          label={
            <span>
              <FiType style={{ marginRight: "8px" }} />
              Category Name
            </span>
          }
          rules={[{ required: true, message: "Please enter category name" }]}
        >
          <Input placeholder="Enter category name" />
        </Form.Item>

        <div className="form-actions">
          <Button onClick={onCancel} className="cancel-button">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="submit-button"
          >
            Create Category
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal; 