import React, { useState } from "react";
import { Modal, Form, Input, Button, Typography, ColorPicker, message, Popover } from "antd";
import { FiX, FiTag } from "react-icons/fi";
import { useCreateLabelMutation } from "../souce/services/SourceApi";
import { selectCurrentUser } from "../../../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const { Text } = Typography;

const AddLableModal = ({ isOpen, onClose }) => {
  const [form] = Form.useForm();
  const [createLabel, { isLoading }] = useCreateLabelMutation();
  const user = useSelector(selectCurrentUser);
  const [selectedColor, setSelectedColor] = useState('#1890ff');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const handleSubmit = async (values) => {
    try {
      await createLabel({
        id: user?.id,
        data: {
          name: values.name,
          color: typeof values.color === 'string' ? values.color : values.color?.toHexString(),
          lableType: "label",
        },
      }).unwrap();

      message.success("Label created successfully");
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(error?.data?.message || "Failed to create label");
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    form.setFieldsValue({ color });
  };

  const handleColorSelect = (color) => {
    handleColorChange(color);
    form.setFieldsValue({ color });
    setColorPickerOpen(false);
  };

  const defaultColors = [
    '#1890ff', // Blue
    '#52c41a', // Green
    '#f5222d', // Red
    '#faad14', // Gold
    '#722ed1', // Purple
    '#13c2c2', // Cyan
    '#fa541c', // Orange
    '#eb2f96', // Pink
  ];

  const ColorPickerContent = (
    <div style={{
      padding: '12px',
      width: '240px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '12px',
      }}>
        {defaultColors.map((color) => (
          <div
            key={color}
            onClick={() => handleColorSelect(color)}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: color,
              borderRadius: '6px',
              cursor: 'pointer',
              border: selectedColor === color ? '2px solid #1890ff' : '2px solid transparent',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
      <ColorPicker
        value={selectedColor}
        onChange={(color) => {
          handleColorSelect(color.toHexString());
        }}
        style={{ width: '100%' }}
      />
    </div>
  );

  return (
    <>
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="pro-modal custom-modal"
      styles={{
        body: {
          padding: 0,
          borderRadius: '8px',
          overflow: 'hidden',
        }
      }}
    >
      <div
        className="modal-header"
        style={{
          background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
          padding: "24px",
          color: "#ffffff",
          position: "relative",
        }}
      >
        <Button
          type="text"
          onClick={onClose}
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
          }}
        >
          <FiX style={{ fontSize: "20px" }} />
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
            <FiTag style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Add Label
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create label
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ color: '#1890ff' }}
        autoComplete="off"
        style={{ padding: "24px" }}
      >
        <Form.Item
          name="name"
          label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Label Name <span style={{ color: "#ff4d4f" }}>*</span></span>}
          rules={[{ required: true, message: "Please enter label name" }]}
        >
          <Input
            placeholder="Enter label name"
            style={{
              borderRadius: "10px",
              padding: "8px 16px",
              height: "48px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb",
            }}
          />
        </Form.Item>

        <Form.Item
          name="color"
          label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Color</span>}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Popover
              content={ColorPickerContent}
              trigger="click"
              placement="bottomLeft"
              open={colorPickerOpen}
              onOpenChange={setColorPickerOpen}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor: selectedColor,
                  border: '1px solid #e6e8eb',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            </Popover>
            <Input
              value={selectedColor}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="#000000"
              style={{
                flex: 1,
                borderRadius: '10px',
                height: '48px',
              }}
            />
          </div>
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <Button
            onClick={onClose}
            style={{
              padding: "8px 24px",
              height: "44px",
              borderRadius: "10px",
              border: "1px solid #e6e8eb",
              fontWeight: "500",
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            style={{
              padding: "8px 32px",
              height: "44px",
              borderRadius: "10px",
              fontWeight: "500",
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
            }}
          >
            Add Label
          </Button>
        </div>
      </Form>
    </Modal>
    <style>
      {`
        .ant-form-item-required::before {
          display: none !important;
        }
      `}
    </style>
    </>
  );
};

export default AddLableModal;
