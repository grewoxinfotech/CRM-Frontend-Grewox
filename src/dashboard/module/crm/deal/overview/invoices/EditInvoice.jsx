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
import { useUpdateDealInvoiceMutation } from "./services/dealinvoiceApi";
const { Text } = Typography;
const { Option } = Select;

const EditInvoice = ({ open, deal,currencies, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [updateDealInvoice, { isLoading: isUpdating }] = useUpdateDealInvoiceMutation();
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const { data: taxesData = [] } = useGetAllTaxesQuery();
  
  const taxes = taxesData?.data || [];
  
  const [enableTax, setEnableTax] = useState(true);
  const [discountType, setDiscountType] = useState('percentage');

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
            amount: value.amount || 0,
            discount_amount: value.discount_amount || 0
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
              discount: value.discount || 0,
              tax: value.tax || 0,
              tax_name: value.tax_name || "",
              tax_amount: value.tax_amount || 0,
              amount: value.amount || 0,
              discount_amount: value.discount_amount || 0
            }));
          }
        }
      } catch (error) {
        console.error("Error parsing items:", error);
        items = [];
      }


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
          discount: 0,
          tax: 0,
          tax_name: "",
          tax_amount: 0,
          amount: 0,
          discount_amount: 0
        }],
        subtotal: initialValues.subtotal || 0,
        discount: initialValues.discount || 0,
        tax: initialValues.tax || 0,
        total_discount: initialValues.total_discount || 0,
        total: initialValues.total || 0,
      };

      // Set form values
      form.setFieldsValue(formattedValues);

      // Calculate initial totals
      calculateTotals(items);

      // Set tax enabled if any item has tax
      const hasTax = items.some(item => item.tax > 0);
      setEnableTax(hasTax);
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

    const itemDiscount = Number(form.getFieldValue("discount")) || 0;
    const discountType = form.getFieldValue("discount_type") || 'percentage';
    let additionalDiscountAmount = 0;
    
    if (discountType === 'percentage') {
      additionalDiscountAmount = (subTotal * itemDiscount) / 100;
    } else {
      additionalDiscountAmount = itemDiscount;
    }
    
    const totalAmount = subTotal - additionalDiscountAmount + totalTax;

    // Update form values
    form.setFieldsValue({
      subtotal: subTotal.toFixed(2),
      tax: totalTax.toFixed(2),
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
        subtotal: values.subtotal,
        discount: values.discount,
        tax: values.tax,
        total_discount: values.total_discount,
        total: values.total,
      };

      const data = {
       ...formData
      }
      await updateDealInvoice({id: initialValues.id, data}).unwrap();
      message.success("Invoice updated successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error("Failed to update invoice: " + (error.data?.message || "Unknown error")); 
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
        <div className="form-grid-2">
            <Form.Item
              name="customer"
              label={
              <span className="form-label">
                Customer <span className="required">*</span>
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
          
            <Form.Item
              name="currency"
              label={
              <span className="form-label">
                Currency <span className="required">*</span>
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
              listHeight={100}
              dropdownStyle={{
                maxHeight: '100px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollBehavior: 'smooth'
              }}
            >
              {currencies.map((currency) => (
                <Option key={currency.id} value={currency.id}>
                  {currency.currencyIcon} - {currency.currencyName}
                </Option>
              ))}
            </Select>
            </Form.Item>
        </div>

        <div className="form-grid-3">
            <Form.Item
            name="issueDate"
              label={
              <span className="form-label">
                Issue Date <span className="required">*</span>
                </span>
              }
            rules={[{ required: true, message: "Please select issue date" }]}
            >
              <DatePicker
              format="DD-MM-YYYY"
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
            <Form.Item
            name="dueDate"
              label={
              <span className="form-label">
                Due Date <span className="required">*</span>
                </span>
              }
            rules={[{ required: true, message: "Please select due date" }]}
            >
            <DatePicker
              format="DD-MM-YYYY"
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
            <Form.Item
              name="status"
              label={
              <span className="form-label">
                Payment Status <span className="required">*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select status" }]}
            initialValue="draft"
            >
              <Select
                placeholder="Select Status"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              defaultValue="draft"
              >
                <Option value="draft">Draft</Option>
                <Option value="pending">Pending</Option>
                <Option value="paid">Paid</Option>
                <Option value="overdue">Overdue</Option>
              </Select>
            </Form.Item>
        </div>

        <div className="table-style-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>
              <FiPackage style={{ marginRight: '8px', color: '#1890ff' }} />
              Products & Services
            </span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text style={{ marginRight: '8px' }}>Enable Tax</Text>
            <Switch
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
                size="small"
            />
          </div>
          </div>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
                <table className="proposal-items-table" style={{ marginTop: '16px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>Item</th>
                      <th style={{ width: '10%' }}>Quantity</th>
                      <th style={{ width: '15%' }}>Unit Price</th>
                      <th style={{ width: '15%' }}>HSN/SAC</th>
                      <th style={{ width: '20%' }}>Tax</th>
                      <th style={{ width: '15%' }}>Amount</th>
                      <th style={{ width: '5%' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
              {fields.map(({ key, name, ...restField }, index) => (
                      <tr key={key} className="item-row">
                        <td>
                      <Form.Item
                        {...restField}
                        name={[name, "item_name"]}
                        rules={[{ required: true, message: "Required" }]}
                            style={{ margin: 0 }}
                      >
                        <Input
                          placeholder="Item Name"
                              className="table-input"
                        />
                      </Form.Item>
                        </td>
                        <td>
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        rules={[{ required: true, message: "Required" }]}
                            style={{ margin: 0 }}
                      >
                        <InputNumber
                          min={1}
                              className="table-input-number"
                              controls={false}
                              placeholder="1"
                              onChange={() => calculateTotals(form.getFieldValue("items"))}
                        />
                      </Form.Item>
                        </td>
                        <td>
                      <Form.Item
                        {...restField}
                        name={[name, "unit_price"]}
                        rules={[{ required: true, message: "Required" }]}
                            style={{ margin: 0 }}
                      >
                        <InputNumber
                          min={0}
                              className="table-input-number"
                              controls={false}
                              placeholder={selectedCurrency?.currencyIcon || '₹'}
                              formatter={(value) => `${selectedCurrency?.currencyIcon || '₹'}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          parser={(value) => value.replace(/[^\d.]/g, "")}
                          onChange={(value) => handleItemChange(value, "unit_price", name)}
                        />
                      </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            {...restField}
                            name={[name, "hsn_sac"]}
                            style={{ margin: 0 }}
                          >
                        <Input
                          placeholder="HSN/SAC"
                              className="table-input"
                        />
                      </Form.Item>
                        </td>
                        <td>
                      <Form.Item
                        {...restField}
                        name={[name, "tax"]}
                            style={{ margin: 0 }}
                            initialValue="0"
                      >
                        <Select
                              placeholder="Select Tax"
                          disabled={!enableTax}
                              onChange={(value) => handleItemChange(value || "0", "tax", name)}
                              className="table-select"
                              optionLabelProp="label"
                              allowClear
                              defaultValue="0"
                              dropdownMatchSelectWidth={false}
                        >
                          {taxes.map((tax) => (
                                <Option 
                                  key={tax.id} 
                                  value={tax.id}
                                  label={`${tax.gstName} (${tax.gstPercentage}%)`}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                                    <span>{tax.gstName}</span>
                                    <span style={{ fontWeight: 'bold' }}>{tax.gstPercentage}%</span>
                                  </div>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                        </td>
                        <td>
                          <div className="amount-field">
                            <span className="currency-symbol">{selectedCurrency?.currencyIcon || '₹'}</span>
                            <span className="amount-value">
                              {form.getFieldValue("items")[index]?.amount || '0.00'}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                              className="delete-btn"
                              icon={<FiTrash2 style={{ color: "#ff4d4f", fontSize: '16px' }} />}
                        onClick={() => {
                          remove(name);
                                calculateTotals(form.getFieldValue("items"));
                        }}
                      />
                    )}
                        </td>
                      </tr>
              ))}
                  </tbody>
                </table>

                <div className="add-item-container">
              <Button
                    type="primary"
                onClick={() => add()}
                icon={<FiPlus />}
                    className="add-item-btn"
                  >
                    Add Items
              </Button>
                </div>
            </>
          )}
        </Form.List>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <Text>Sub Total</Text>
                <Form.Item name="subtotal" style={{ margin: 0 }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <Text>Discount</Text>
              <Space>
                <Form.Item name="discount_type" style={{ margin: 0 }}>
                  <Select
                style={{
                      width: '120px',
                      borderRadius: '8px',
                      height: '40px',
                    }}
                    defaultValue="percentage"
                    onChange={(value) => {
                      setDiscountType(value);
                      calculateTotals(form.getFieldValue("items"));
                    }}
                  >
                    <Option value="percentage">Percentage</Option>
                    <Option value="fixed">Fixed Amount</Option>
                  </Select>
                </Form.Item>
                  <Form.Item name="discount" style={{ margin: 0 }}>
                    <InputNumber
                    placeholder={discountType === 'fixed' ? 'Amount' : '%'}
                      size="large"
                      style={{
                      width: '100px',
                      borderRadius: '8px',
                      height: '40px',
                    }}
                    formatter={(value) => discountType === 'fixed' ? 
                      `${selectedCurrency?.currencyIcon || '₹'}${value}` : 
                      `${value}`
                    }
                    parser={(value) => discountType === 'fixed' ? 
                      value.replace(/[^\d.]/g, "") : 
                      value.replace("%", "")
                    }
                    onChange={() => calculateTotals(form.getFieldValue("items"))}
                    />
                  </Form.Item>
                {discountType === 'percentage' && <Text>%</Text>}
                </Space>
              </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <Text>Tax</Text>
                <Form.Item name="tax" style={{ margin: 0 }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
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
        </div>

        <div className="form-footer">
          <Button
            size="large"
            onClick={handleCancel}
            className="cancel-btn"
          >
            Cancel
          </Button>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            loading={loading}
            className="create-btn"
          >
            Update Invoice
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditInvoice;