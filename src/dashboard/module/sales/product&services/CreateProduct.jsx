import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Row,
  Col,
  Upload,
  message,
  InputNumber,
  Divider,
} from "antd";
import {
  FiBox,
  FiTag,
  FiUpload,
  FiDollarSign,
  FiHash,
  FiFileText,
  FiX,
} from "react-icons/fi";
import { useCreateProductMutation } from "./services/productApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateProduct = ({ visible, onClose, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const user = useSelector(selectCurrentUser);
  const currentUser = useSelector(selectCurrentUser);

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Append form fields
      formData.append("name", values.name);
      formData.append("category", values.category);
      formData.append("price", values.price);
      formData.append("sku", values.sku || "");
      formData.append("tax", values.tax || "");
      formData.append("hsn_sac", values.hsn_sac || "");
      formData.append("description", values.description || "");
      formData.append("created_by", currentUser?.id || "");

      // Append image if exists
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      await onSubmit(formData);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error(error?.data?.message || "Failed to create product");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must be smaller than 2MB!");
        return false;
      }
      return false;
    },
    onChange: ({ fileList }) => setFileList(fileList),
    fileList,
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="pro-modal custom-modal"
      styles={{
        body: {
          padding: 0,
          borderRadius: "8px",
          overflow: "hidden",
        },
      }}
    >
      <div
        className="modal-header"
        style={{
          background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
          padding: "24px",
          color: "#ffffff",
          position: "relative",
        }}
      >
        <Button
          type="text"
          onClick={handleCancel}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            color: "#ffffff",
            width: "32px",
            height: "32px",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          }}
        >
          <FiX style={{ fontSize: "20px" }} />
        </Button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiBox style={{ fontSize: "24px", color: "#ffffff" }} />
          </div>
          <div>
            <h2
              style={{
                margin: "0",
                fontSize: "24px",
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              Create New Product
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create product
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        style={{
          padding: "24px",
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Product Name
                </span>
              }
              rules={[{ required: true, message: "Please enter product name" }]}
            >
              <Input
                prefix={
                  <FiBox style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter product name"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Category
                </span>
              }
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select
                placeholder="Select category"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
              >
                <Option value="electronics">Electronics</Option>
                <Option value="clothing">Clothing</Option>
                <Option value="food">Food</Option>
                <Option value="beverages">Beverages</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="price"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Price
                </span>
              }
              rules={[{ required: true, message: "Please enter price" }]}
            >
              <InputNumber
                prefix={
                  <FiDollarSign style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter price"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
                min={0}
                precision={2}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="sku"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  SKU
                </span>
              }
            >
              <Input
                prefix={
                  <FiHash style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter SKU"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
         
          <Col span={12}>
            <Form.Item
              name="hsn_sac"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  HSN/SAC Code
                </span>
              }
            >
              <Input
                placeholder="Enter HSN/SAC code"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Description
            </span>
          }
        >
          <TextArea
            prefix={
              <FiFileText style={{ color: "#1890ff", fontSize: "16px" }} />
            }
            placeholder="Enter product description"
            size="large"
            style={{
              borderRadius: "10px",
              padding: "8px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb",
            }}
            rows={4}
          />
        </Form.Item>

        <Form.Item
          name="image"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Product Image
            </span>
          }
        >
          <Upload {...uploadProps}>
            <Button
              icon={<FiUpload />}
              size="large"
              style={{
                borderRadius: "10px",
                height: "48px",
                backgroundColor: "#f8fafc",
                border: "1px dashed #e6e8eb",
                width: "100%",
              }}
            >
              Click to upload
            </Button>
          </Upload>
        </Form.Item>

        <Divider style={{ margin: "24px 0" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <Button
            onClick={handleCancel}
            size="large"
            style={{
              borderRadius: "10px",
              height: "48px",
              padding: "0 24px",
              border: "1px solid #e6e8eb",
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            style={{
              borderRadius: "10px",
              height: "48px",
              padding: "0 24px",
              background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
              border: "none",
            }}
          >
            Create Product
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateProduct;
