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
  Divider,
  InputNumber,
  DatePicker,
  Space,
  message,
} from "antd";
import {
  FiFileText,
  FiX,
  FiUser,
  FiCalendar,
  FiHash,
  FiDollarSign,
  FiPlus,
  FiTrash2,
  FiPackage,
} from "react-icons/fi";
import dayjs from "dayjs";
import "./invoice.scss";
import { useCreateInvoiceMutation } from "./services/invoiceApi";
import { useGetCustomersQuery } from "../customer/services/custApi";

const { Text } = Typography;
const { Option } = Select;

const CreateInvoice = ({ open, onCancel, onSubmit, setCreateModalVisible }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
  const { data: custdata } = useGetCustomersQuery();
  const customers = custdata?.data;
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Convert items array to object with numbered keys
      const itemsObject = {};
      values.items?.forEach((item, index) => {
        itemsObject[`item${index + 1}`] = item;
      });

      const payload = {
        customer: values.customer || "",
        issueDate: values.issueDate?.format("YYYY-MM-DD") || "",
        dueDate: values.dueDate?.format("YYYY-MM-DD") || "",
        category: values.category || "",
        currency: values.currency || "",
        items: itemsObject,
        sub_total: values.sub_total || 0,
        item_discount: values.item_discount || 0,
        total_tax: values.total_tax || 0,
        total: values.total || 0,
      };

      const result = await createInvoice(payload).unwrap();
      message.success("Invoice created successfully");
      form.resetFields();
      setCreateModalVisible(false);
      onCancel();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (items = []) => {
    const subTotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const discount = Number(item.discount) || 0;
      const amount = quantity * price - discount;
      return sum + amount;
    }, 0);

    const itemDiscount = form.getFieldValue("item_discount") || 0;
    const totalTax = form.getFieldValue("total_tax") || 0;
    const totalAmount = subTotal - itemDiscount + totalTax;

    form.setFieldsValue({
      sub_total: subTotal.toFixed(2),
      total: totalAmount.toFixed(2),
    });
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
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
          onClick={onCancel}
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
            <FiFileText style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Create New Invoice
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create invoice
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        initialValues={{
          items: [{}],
        }}
        style={{
          padding: "24px",
        }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="customer"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiUser style={{ marginRight: "8px", color: "#1890ff" }} />
                  Customer <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select customer" }]}
            >
              <Select
                placeholder="Select Customer"
                showSearch
                optionFilterProp="children"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                {customers?.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="category"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiPackage style={{ marginRight: "8px", color: "#1890ff" }} />
                  Category <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter category" }]}
            >
              <Input
                placeholder="Enter category"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="issueDate"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCalendar
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Issue Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select issue date" }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
                suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="dueDate"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCalendar
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Due Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select due date" }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
                suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="currency"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiDollarSign
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Currency <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select currency" }]}
            >
              <Select
                placeholder="Select Currency"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                <Option value="INR">INR - Indian Rupee</Option>
                <Option value="USD">USD - US Dollar</Option>
                <Option value="EUR">EUR - Euro</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" style={{ margin: "24px 0" }}>
          <span
            style={{ fontSize: "16px", fontWeight: "500", color: "#1f2937" }}
          >
            <FiPackage style={{ marginRight: "8px", color: "#1890ff" }} />
            Products & Services
          </span>
        </Divider>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              <div style={{ marginBottom: "16px" }}>
                <Row
                  gutter={16}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #e6e8eb",
                  }}
                >
                  <Col span={6}>
                    <Text strong>Item*</Text>
                  </Col>
                  <Col span={3}>
                    <Text strong>Quantity*</Text>
                  </Col>
                  <Col span={4}>
                    <Text strong>Unit Price*</Text>
                  </Col>
                  <Col span={4}>
                    <Text strong>HSN/SAC</Text>
                  </Col>
                  <Col span={3}>
                    <Text strong>Discount</Text>
                  </Col>
                  <Col span={2}>
                    <Text strong>TAX (%)</Text>
                  </Col>
                  <Col span={2}>
                    <Text strong>Amount</Text>
                  </Col>
                </Row>
              </div>

              {fields.map(({ key, name, ...restField }, index) => (
                <div
                  key={key}
                  style={{
                    marginBottom: "16px",
                    padding: "16px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                  }}
                >
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, "item_name"]}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input
                          placeholder="Item Name"
                          size="large"
                          style={{
                            borderRadius: "8px",
                            height: "40px",
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <InputNumber
                          // placeholder="1"
                          min={1}
                          size="large"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            height: "40px",
                            textAlign: "center",
                          }}
                          onChange={() =>
                            calculateTotals(form.getFieldValue("items"))
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "unit_price"]}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <InputNumber
                          placeholder="₹0"
                          min={0}
                          size="large"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            height: "40px",
                          }}
                          formatter={(value) =>
                            `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                          onChange={() =>
                            calculateTotals(form.getFieldValue("items"))
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item {...restField} name={[name, "hsn_sac"]}>
                        <Input
                          placeholder="HSN/SAC"
                          size="large"
                          style={{
                            borderRadius: "8px",
                            height: "40px",
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item {...restField} name={[name, "discount"]}>
                        <InputNumber
                          placeholder="%"
                          min={0}
                          max={100}
                          size="large"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            height: "40px",
                          }}
                          formatter={(value) => `${value}%`}
                          parser={(value) => value.replace("%", "")}
                          onChange={() =>
                            calculateTotals(form.getFieldValue("items"))
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Form.Item {...restField} name={[name, "tax"]}>
                        <InputNumber
                          placeholder="%"
                          min={0}
                          max={100}
                          size="large"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            height: "40px",
                          }}
                          onChange={() =>
                            calculateTotals(form.getFieldValue("items"))
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Form.Item {...restField} name={[name, "amount"]}>
                        <InputNumber
                          disabled
                          size="large"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            height: "40px",
                          }}
                          formatter={(value) =>
                            `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={23}>
                      <Form.Item {...restField} name={[name, "description"]}>
                        <Input.TextArea
                          placeholder="Description"
                          rows={2}
                          style={{
                            borderRadius: "8px",
                            backgroundColor: "#ffffff",
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={1}>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          icon={<FiTrash2 style={{ color: "#ff4d4f" }} />}
                          onClick={() => {
                            remove(name);
                            calculateTotals(form.getFieldValue("items"));
                          }}
                        />
                      )}
                    </Col>
                  </Row>
                </div>
              ))}

              <Button
                // type="dashed"
                onClick={() => add()}
                icon={<FiPlus />}
                style={{
                  width: "150px",
                  height: "48px",
                  borderRadius: "8px",
                  marginTop: "16px",
                  borderColor: "#1890ff",
                  color: "#1890ff",
                }}
              >
                Add Item
              </Button>
            </>
          )}
        </Form.List>

        <Divider orientation="left" style={{ margin: "24px 0" }}>
          <span
            style={{ fontSize: "16px", fontWeight: "500", color: "#1f2937" }}
          >
            <FiDollarSign style={{ marginRight: "8px", color: "#1890ff" }} />
            Total Amount
          </span>
        </Divider>

        <Row justify="end">
          <Col span={8}>
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "16px",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <Text>Sub Total</Text>
                <Form.Item name="sub_total" style={{ margin: 0 }}>
                  <InputNumber
                    disabled
                    size="large"
                    style={{
                      width: "120px",
                      borderRadius: "8px",
                      height: "40px",
                    }}
                    formatter={(value) =>
                      `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <Text>Item Discount</Text>
                <Space>
                  <Form.Item name="item_discount" style={{ margin: 0 }}>
                    <InputNumber
                      placeholder="%"
                      size="large"
                      style={{
                        width: "100px",
                        borderRadius: "8px",
                        height: "40px",
                      }}
                      formatter={(value) => `${value}`}
                      parser={(value) => value.replace("%", "")}
                      onChange={() =>
                        calculateTotals(form.getFieldValue("items"))
                      }
                    />
                  </Form.Item>
                  <Text>%</Text>
                </Space>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <Text>Total Tax</Text>
                <Form.Item name="total_tax" style={{ margin: 0 }}>
                  <InputNumber
                    disabled
                    size="large"
                    style={{
                      width: "120px",
                      borderRadius: "8px",
                      height: "40px",
                    }}
                    formatter={(value) =>
                      `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
              </div>
              <Divider style={{ margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong>Total Amount</Text>
                <Form.Item name="total" style={{ margin: 0 }}>
                  <InputNumber
                    disabled
                    size="large"
                    style={{
                      width: "120px",
                      borderRadius: "8px",
                      height: "40px",
                    }}
                    formatter={(value) =>
                      `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
              </div>
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: "24px 0" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <Button
            size="large"
            onClick={onCancel}
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
            size="large"
            type="primary"
            htmlType="submit"
            loading={loading}
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
            Create Invoice
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateInvoice;
