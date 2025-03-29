import React, { useState, useEffect } from "react";
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
  Switch,
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
  FiTarget,
} from "react-icons/fi";
import dayjs from "dayjs";
import "./invoices.scss";
import { useGetAllTaxesQuery } from "../../../../settings/tax/services/taxApi";
import { useGetAllCurrenciesQuery } from "../../../../settings/services/settingsApi";

const { Text } = Typography;
const { Option } = Select;

const EditInvoice = ({ open, deal, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const { data: taxesData = [] } = useGetAllTaxesQuery();
  const { data: currencies = [] } = useGetAllCurrenciesQuery({
    page: 1,
    limit: 100
  });
  
  const taxes = taxesData?.data || [];
  
  const [enableTax, setEnableTax] = useState(true);

  useEffect(() => {
    if (initialValues) {
      let items = [];
      try {
        // Handle items based on different possible formats
        if (Array.isArray(initialValues.items)) {
          items = initialValues.items;
        } else if (typeof initialValues.items === 'object' && !Array.isArray(initialValues.items)) {
          // Convert object format to array format
          items = Object.entries(initialValues.items).map(([key, value]) => ({
            item_name: value.item_name || "",
            quantity: value.quantity || 1,
            unit_price: value.unit_price || 0,
            hsn_sac: value.hsn_sac || "",
            discount: value.discount || 0,
            tax: value.tax || 0,
            tax_name: value.tax_name || "",
            tax_amount: value.tax_amount || 0,
            amount: value.amount || 0
          }));
        } else if (typeof initialValues.items === 'string') {
          const parsedItems = JSON.parse(initialValues.items);
          if (Array.isArray(parsedItems)) {
            items = parsedItems;
          } else {
            items = Object.entries(parsedItems).map(([key, value]) => ({
              item_name: value.item_name || "",
              quantity: value.quantity || 1,
              unit_price: value.unit_price || 0,
              hsn_sac: value.hsn_sac || "",
              tax: value.tax || 0,
              tax_name: value.tax_name || "",
              tax_amount: value.tax_amount || 0,
              amount: value.amount || 0
            }));
          }
        }
      } catch (error) {
        console.error("Error parsing items:", error);
        items = [];
      }

      console.log("Processed items:", items);

      // Format the initial values
      const formattedValues = {
        customer: initialValues.customer || "",
        issueDate: initialValues.issueDate ? dayjs(initialValues.issueDate) : null,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null,
        currency: initialValues.currency || "",
        status: initialValues.status || "draft",
        items: items.length > 0 ? items : [{
          item_name: "",
          quantity: 1,
          unit_price: 0,
          hsn_sac: "",
          tax: 0,
          tax_name: "",
          tax_amount: 0,
          amount: 0
        }],
        sub_total: initialValues.sub_total || 0,
        item_discount: initialValues.item_discount || 0,
        total_tax: initialValues.total_tax || 0,
        total: initialValues.total || 0,
      };

      // Set form values
      form.setFieldsValue(formattedValues);

      // Calculate initial totals
      calculateTotals(items);
    }
  }, [initialValues, form]);

  const calculateItemAmount = (item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const discount = Number(item.discount) || 0;
    const tax = enableTax ? (Number(item.tax) || 0) : 0;

    const subtotal = quantity * price;
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = enableTax ? (afterDiscount * tax) / 100 : 0;

    return {
      amount: afterDiscount + taxAmount,
      tax_amount: taxAmount,
      discount_amount: discountAmount
    };
  };

  const calculateTotals = (items = []) => {
    if (!Array.isArray(items)) {
      items = [];
    }

    let subTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    items.forEach(item => {
      const { amount, tax_amount, discount_amount } = calculateItemAmount(item);
      subTotal += amount - tax_amount; // Subtract tax amount to get pure subtotal
      totalTax += tax_amount;
      totalDiscount += discount_amount;
    });

    const itemDiscount = Number(form.getFieldValue("item_discount")) || 0;
    const additionalDiscountAmount = (subTotal * itemDiscount) / 100;
    const totalAmount = subTotal - additionalDiscountAmount + totalTax;

    // Update form values
    form.setFieldsValue({
      sub_total: subTotal.toFixed(2),
      total_tax: totalTax.toFixed(2),
      total_discount: (totalDiscount + additionalDiscountAmount).toFixed(2),
      total: totalAmount.toFixed(2),
    });

    // Update individual item amounts
    const updatedItems = items.map(item => {
      const { amount, tax_amount, discount_amount } = calculateItemAmount(item);
      return {
        ...item,
        amount: amount.toFixed(2),
        tax_amount: tax_amount.toFixed(2),
        discount_amount: discount_amount.toFixed(2)
      };
    });

    form.setFieldsValue({ items: updatedItems });
  };

  const handleItemChange = (value, field, name) => {
    const items = form.getFieldValue("items");
    const currentItem = items[name];

    // Update the changed field
    if (field === "tax") {
      const selectedTax = taxes.find(t => t.id === value);
      if (selectedTax) {
        currentItem.tax = Number(selectedTax.gstPercentage);
        currentItem.tax_name = selectedTax.gstName;
      }
    } else {
      currentItem[field] = value;
    }

    // Recalculate amount for this item
    const { amount, tax_amount } = calculateItemAmount(currentItem);
    currentItem.amount = amount.toFixed(2);
    currentItem.tax_amount = tax_amount.toFixed(2);

    // Update items and recalculate totals
    items[name] = currentItem;
    form.setFieldsValue({ items });
    calculateTotals(items);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Convert items array to object with numbered keys
      const itemsObject = {};
      values.items?.forEach((item, index) => {
        itemsObject[`item${index + 1}`] = item;
      });

      const formData = {
        customer: values.customer,
        issueDate: values.issueDate?.format("YYYY-MM-DD"),
        dueDate: values.dueDate?.format("YYYY-MM-DD"),
        currency: values.currency,
        status: values.status,
        items: itemsObject,
        sub_total: values.sub_total,
        item_discount: values.item_discount,
        total_tax: values.total_tax,
        total: values.total,
      };

      await onSubmit(formData);
      message.success("Invoice updated successfully");
    } catch (error) {
      message.error("Failed to update invoice");
      console.error("Submit Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal is closed
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
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
              Edit Invoice
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update invoice information
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
              rules={[{ required: true, message: "Please enter customer name" }]}
            >
              <Input
                placeholder="Enter Customer Name"
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
        </Row>

        <Row gutter={16}>
          <Col span={12}>
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
                onChange={(value) => {
                  const selected = currencies.find(c => c.id === value);
                  setSelectedCurrency(selected);
                }}
              >
                {currencies.map((currency) => (
                  <Option key={currency.id} value={currency.id}>
                    {currency.currencyIcon} - {currency.currencyName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiTarget
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Status <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select
                placeholder="Select Status"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                <Option value="draft">Draft</Option>
                <Option value="pending">Pending</Option>
                <Option value="paid">Paid</Option>
                <Option value="overdue">Overdue</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" style={{ margin: "24px 0" }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: "16px", fontWeight: "500", color: "#1f2937" }}>
              <FiPackage style={{ marginRight: "8px", color: "#1890ff" }} />
              Products & Services
            </span>
            <div style={{ flex: 1, minWidth: '650px' }}></div>
            <Switch
              checkedChildren="Tax On"
              unCheckedChildren="Tax Off"
              checked={enableTax}
              onChange={(checked) => {
                setEnableTax(checked);
                const items = form.getFieldValue("items");
                if (items) {
                  const updatedItems = items.map(item => ({
                    ...item,
                    tax: checked ? item.tax : 0,
                    tax_amount: checked ? calculateItemAmount(item).tax_amount : 0
                  }));
                  form.setFieldsValue({ items: updatedItems });
                  calculateTotals(updatedItems);
                }
              }}
            />
          </div>
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
                  <Col span={4}>
                    <Text strong>Item*</Text>
                  </Col>
                  <Col span={3}>
                    <Text strong>Quantity*</Text>
                  </Col>
                  <Col span={4}>
                    <Text strong>Unit Price*</Text>
                  </Col>
                  <Col span={5}>
                    <Text strong>HSN/SAC</Text>
                  </Col>
                  <Col span={4}>
                    <Text strong>TAX (%)</Text>
                  </Col>
                  <Col span={4}>
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
                    <Col span={4}>
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
                          onChange={(value) => handleItemChange(value, "item_name", name)}
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
                          min={1}
                          size="large"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            height: "40px",
                            textAlign: "center",
                          }}
                          onChange={(value) => handleItemChange(value, "quantity", name)}
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
                          placeholder={`${selectedCurrency?.currencyIcon || '₹'}0`}
                          min={0}
                          size="large"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            height: "40px",
                          }}
                          formatter={(value) =>
                            `${selectedCurrency?.currencyIcon || '₹'}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/[^\d.]/g, "")}
                          onChange={(value) => handleItemChange(value, "unit_price", name)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item {...restField} name={[name, "hsn_sac"]}>
                        <Input
                          placeholder="HSN/SAC"
                          size="large"
                          style={{
                            borderRadius: "8px",
                            height: "40px",
                          }}
                          onChange={(value) => handleItemChange(value, "hsn_sac", name)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "tax"]}
                        rules={[{ required: enableTax, message: "Required" }]}
                      >
                        <Select
                          placeholder="Tax"
                          size="large"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                          }}
                          onChange={(value) => handleItemChange(value, "tax", name)}
                          disabled={!enableTax}
                        >
                          {taxes.map((tax) => (
                            <Option key={tax.id} value={tax.id}>
                              {tax.gstName} ({tax.gstPercentage}%)
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "amount"]}
                      >
                        <InputNumber
                          disabled
                          size="large"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            height: "40px",
                          }}
                          formatter={(value) =>
                            `${selectedCurrency?.currencyIcon || '₹'}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "discount"]}
                        rules={[{ required: false, message: "Required" }]}
                      >
                        <InputNumber
                          placeholder="Discount %"
                          min={0}
                          max={100}
                          size="large"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            height: "40px",
                          }}
                          formatter={(value) => `${value}%`}
                          parser={(value) => value.replace('%', '')}
                          onChange={(value) => handleItemChange(value, "discount", name)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        icon={<FiTrash2 style={{ color: "#ff4d4f" }} />}
                        onClick={() => {
                          remove(name);
                          calculateTotals();
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}

              <Button
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
                      `${selectedCurrency?.currencyIcon || '₹'}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                      onChange={(value) => handleItemChange(value, "item_discount", "item0")}
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
                      `${selectedCurrency?.currencyIcon || '₹'}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                <Text>Total Discount</Text>
                <Form.Item name="total_discount" style={{ margin: 0 }}>
                  <InputNumber
                    disabled
                    size="large"
                    style={{
                      width: "120px",
                      borderRadius: "8px",
                      height: "40px",
                    }}
                    formatter={(value) =>
                      `${selectedCurrency?.currencyIcon || '₹'}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                      `${selectedCurrency?.currencyIcon || '₹'}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
            onClick={handleCancel}
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
            Update Invoice
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditInvoice;