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
  FiCreditCard,
  FiPhone,
} from "react-icons/fi";
import dayjs from "dayjs";
import "./invoice.scss";
import { useGetCustomersQuery, useCreateCustomerMutation } from "../customer/services/custApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import { useGetAllTaxesQuery } from "../../settings/tax/services/taxApi";
import { useGetProductsQuery } from "../product&services/services/productApi";

const { Text } = Typography;
const { Option } = Select;

const EditInvoice = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { data: custdata } = useGetCustomersQuery();
  const customers = custdata?.data || [];
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerForm] = Form.useForm();
  const [createCustomer] = useCreateCustomerMutation();
  const { data: currenciesData } = useGetAllCurrenciesQuery();
  const [selectedCurrency, setSelectedCurrency] = useState('₹');
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);
  const [isTaxEnabled, setIsTaxEnabled] = useState(false);
  const { data: taxesData, isLoading: taxesLoading } = useGetAllTaxesQuery();
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery();

  useEffect(() => {
    if (initialValues) {
      let items = [];
      try {
        // Parse the items string into an object
        const itemsObject = JSON.parse(initialValues.items);
        // Convert the object with numbered keys into an array
        items = Object.values(itemsObject);
      } catch (error) {
        console.error("Error parsing items:", error);
        items = [];
      }

      // Check if any item has tax to enable tax switch
      const hasTax = items?.some(item => item.taxAmount > 0 || item.taxId);
      setIsTaxEnabled(hasTax);

      // Format the initial values
      const formattedValues = {
        customer: initialValues.customer || "",
        issueDate: initialValues.issueDate
          ? dayjs(initialValues.issueDate)
          : null,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null,
        reference_number: initialValues.salesInvoiceNumber || "",
        currency: initialValues.currency || "",
        status: initialValues.status || "pending",
        items: items.length > 0
          ? items.map(item => ({
              ...item,
              discount: item.discount || 0,
              discount_type: 'percentage',
              tax: item.taxAmount || 0,
              taxId: item.taxId || null,
              taxAmount: item.taxAmount || 0
            }))
          : [{ description: "", quantity: 1, unit_price: 0, discount: 0 }],
        subTotal: initialValues.subTotal || 0,
        item_discount: initialValues.discount || 0,
        total_tax: initialValues.tax || 0,
        total: initialValues.total || 0,
      };

      // Set form values
      form.setFieldsValue(formattedValues);

      // Calculate initial totals
      calculateTotals(items);

      // Auto-select product if items exist and products data is available
      if (items.length > 0 && productsData?.data) {
        const firstItem = items[0];
        const matchingProduct = productsData.data.find(
          product => product.name === firstItem.item_name
        );
        if (matchingProduct) {
          form.setFieldValue('product_id', matchingProduct.id);
        }
      }
    }

    if (initialValues?.currency && currenciesData) {
      const currencyDetails = currenciesData.find(curr => curr.id === initialValues.currency);
      if (currencyDetails) {
        setSelectedCurrency(currencyDetails.currencyIcon || '₹');
        setSelectedCurrencyId(currencyDetails.id);
      }
    }
  }, [initialValues, form, currenciesData, productsData]);

  const calculateTotals = (items = []) => {
    if (!Array.isArray(items)) {
      items = [];
    }

    let subTotal = 0;
    let totalTaxAmount = 0;
    let totalDiscountAmount = 0;

    items.forEach(item => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const itemAmount = quantity * price;

      // Calculate item discount based on type
      const itemDiscount = Number(item.discount || 0);
      const itemDiscountType = item.discount_type || 'percentage';
      let itemDiscountAmount = 0;

      if (itemDiscountType === 'percentage') {
        itemDiscountAmount = (itemAmount * itemDiscount) / 100;
      } else {
        itemDiscountAmount = itemDiscount;
      }

      totalDiscountAmount += itemDiscountAmount;

      // Calculate tax on amount after discount
      const taxRate = Number(item.tax || 0);
      const amountAfterDiscount = itemAmount - itemDiscountAmount;
      const itemTaxAmount = (amountAfterDiscount * taxRate) / 100;
      totalTaxAmount += itemTaxAmount;

      // Add to subtotal (amount after discount)
      subTotal += amountAfterDiscount;
    });

    // Calculate global discount
    const discountType = form.getFieldValue('discount_type') || 'percentage';
    const discountValue = Number(form.getFieldValue('item_discount')) || 0;
    let globalDiscountAmount = 0;

    if (discountType === 'percentage') {
      globalDiscountAmount = (subTotal * discountValue) / 100;
    } else {
      globalDiscountAmount = discountValue;
    }

    // Final total = subtotal - global discount + tax
    const totalAmount = subTotal - globalDiscountAmount + totalTaxAmount;

    form.setFieldsValue({
      subTotal: subTotal.toFixed(2),
      total_tax: totalTaxAmount.toFixed(2),
      total: totalAmount.toFixed(2)
    });
  };

  const handleItemChange = () => {
    const items = form.getFieldValue("items");
    calculateTotals(items);
  };

  const handleCurrencyChange = (value) => {
    const currencyDetails = currenciesData?.find(curr => curr.id === value);
    if (currencyDetails) {
      setSelectedCurrency(currencyDetails.currencyIcon || '₹');
      setSelectedCurrencyId(value);
    }
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
        reference_number: values.reference_number,
        currency: values.currency,
        status: values.status,
        items: itemsObject,
        subTotal: values.subTotal,
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

  const handleCreateCustomer = async (values) => {
    try {
      const result = await createCustomer({
        name: values.name,
        contact: values.contact,
      }).unwrap();

      message.success('Customer created successfully');
      setIsCustomerModalOpen(false);
      customerForm.resetFields();

      // Automatically select the newly created customer
      form.setFieldValue('customer', result.data.id);
    } catch (error) {
      message.error('Failed to create customer: ' + error.message);
    }
  };

  // Reset form when modal is closed
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const calculateItemTotal = (item) => {
    if (!item) return 0;

    const quantity = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const itemAmount = quantity * price;

    // Calculate item discount
    const itemDiscount = Number(item.discount || 0);
    const itemDiscountType = item.discount_type || 'percentage';
    let itemDiscountAmount = 0;

    if (itemDiscountType === 'percentage') {
      itemDiscountAmount = (itemAmount * itemDiscount) / 100;
    } else {
      itemDiscountAmount = itemDiscount;
    }

    // Calculate tax
    const taxRate = Number(item.tax || 0);
    const amountAfterDiscount = itemAmount - itemDiscountAmount;
    const itemTaxAmount = (amountAfterDiscount * taxRate) / 100;

    // Final amount = amount after discount + tax
    return amountAfterDiscount + itemTaxAmount;
  };

  const customerSelect = (
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
        dropdownRender={(menu) => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                type="link"
                icon={<FiPlus />}
                onClick={() => setIsCustomerModalOpen(true)}
                style={{ padding: '8px 12px' }}
              >
                Add New Customer
              </Button>
            </div>
          </>
        )}
      >
        {customers?.map((customer) => (
          <Option key={customer.id} value={customer.id}>
            {customer.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );

  const customerModal = (
    <Modal
      title={null}
      open={isCustomerModalOpen}
      onCancel={() => {
        setIsCustomerModalOpen(false);
        customerForm.resetFields();
      }}
      footer={null}
      width={500}
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
        style={{
          background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
          padding: "24px",
          color: "#ffffff",
          position: "relative",
        }}
      >
        <Button
          type="text"
          onClick={() => {
            setIsCustomerModalOpen(false);
            customerForm.resetFields();
          }}
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
            <FiUser style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Create New Customer
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Add a new customer to the system
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={customerForm}
        layout="vertical"
        onFinish={handleCreateCustomer}
        requiredMark={false}
        style={{
          padding: "24px",
        }}
      >
        <Form.Item
          name="name"
          label="Customer Name"
          rules={[{ required: true, message: 'Please enter customer name' }]}
        >
          <Input
            prefix={<FiUser style={{ color: '#1890ff' }} />}
            placeholder="Enter customer name"
            size="large"
            style={{
              borderRadius: '8px',
              height: "40px",
              backgroundColor: "#f8fafc",
            }}
          />
        </Form.Item>

        <Form.Item
          name="contact"
          label="Phone Number"
          rules={[
            { required: true, message: 'Please enter phone number' },
            { pattern: /^\d{10}$/, message: 'Please enter a valid 10-digit phone number' }
          ]}
        >
          <Input
            prefix={<FiPhone style={{ color: '#1890ff' }} />}
            placeholder="Enter phone number"
            size="large"
            style={{
              borderRadius: '8px',
              height: "40px",
              backgroundColor: "#f8fafc",
            }}
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <Button
            size="large"
            onClick={() => {
              setIsCustomerModalOpen(false);
              customerForm.resetFields();
            }}
            style={{
              padding: "8px 24px",
              height: "44px",
              borderRadius: "8px",
              border: "1px solid #e6e8eb",
              fontWeight: "500",
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            style={{
              padding: "8px 24px",
              height: "44px",
              borderRadius: "8px",
              fontWeight: "500",
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
            }}
          >
            Create Customer
          </Button>
        </div>
      </Form>
    </Modal>
  );

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {customerSelect}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="currency"
              label={
                <span className="form-label">
                  Currency <span className="required"></span>
                </span>
              }
              rules={[{ required: true, message: "Please select currency" }]}
            >
              <Select
                placeholder="Select Currency"
                size="large"
                onChange={handleCurrencyChange}
                style={{
                  width: "450px",
                  borderRadius: "10px",
                }}
              >
                {currenciesData?.map((currency) => (
                  <Option
                    key={currency.id}
                    value={currency.id}
                    symbol={currency.currencyIcon}
                  >
                    {currency.currencyName} ({currency.currencyIcon})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="issueDate"
            label={
              <span className="form-label">
                Issue Date <span className="required"></span>
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
                Due Date <span className="required"></span>
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
                Status <span className="required"></span>
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
              <Option value="pending">Pending</Option>
              <Option value="paid">Paid</Option>
              <Option value="overdue">Overdue</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="table-style-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', marginBottom: '16px', marginLeft: '16px', marginRight: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>
              <FiPackage style={{ marginRight: '8px', color: '#1890ff' }} />
              Items & Services
            </span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text style={{ marginRight: '8px' }}>Enable Tax</Text>
              <Switch
                checked={isTaxEnabled}
                onChange={(checked) => {
                  setIsTaxEnabled(checked);
                  if (!checked) {
                    const items = form.getFieldValue('items') || [];
                    const updatedItems = items.map(item => ({
                      ...item,
                      tax: 0,
                      taxId: null,
                      taxAmount: 0
                    }));
                    form.setFieldsValue({ items: updatedItems });
                    calculateTotals(updatedItems);
                  }
                }}
                size="small"
              />
            </div>
          </div>

          <Form.Item
            name="product_id"
            rules={[{ required: true, message: 'Please select product' }]}
          >
            <Select
              placeholder="Select Product"
              size="large"
              loading={productsLoading}
              style={{
                width: '30%',
                marginLeft: '16px',
                marginRight: '16px',
                marginTop: '16px',
                marginBottom: '16px',
                borderRadius: '10px',
              }}
              value={form.getFieldValue('items')?.[0]?.item_name}
              onChange={(value, option) => {
                const items = form.getFieldValue('items') || [];
                const newItems = [...items];
                const lastIndex = newItems.length - 1;
                newItems[lastIndex] = {
                  ...newItems[lastIndex],
                  item_name: option.label,
                  unit_price: option.price,
                  hsn_sac: option.hsn_sac,
                  profilePic: option.image
                };
                form.setFieldsValue({ items: newItems });
                calculateTotals(newItems);
              }}
            >
              {(productsData?.data || []).map(product => (
                <Option
                  key={product.id}
                  value={product.id}
                  label={product.name}
                  price={product.price}
                  hsn_sac={product.hsn_sac}
                  profilePic={product.image}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '4px', overflow: 'hidden' }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex' }}>
                      <div>
                        <span style={{ fontWeight: 400 }}>{product.name}</span>
                      </div>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <table className="proposal-items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>HSN/SAC</th>
                      <th>Discount</th>
                      <th>Tax</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <tr key={key} className="item-data-row">
                        <td>
                          <Form.Item
                            {...restField}
                            name={[name, "item_name"]}
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <Input
                              placeholder="Item Name"
                              className="item-input"
                              onChange={handleItemChange}
                            />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            {...restField}
                            name={[name, "quantity"]}
                            rules={[{ required: true, message: "Required" }]}
                            initialValue={1}
                          >
                            <InputNumber
                              min={1}
                              className="quantity-input"
                              onChange={handleItemChange}
                            />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            {...restField}
                            name={[name, "unit_price"]}
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <InputNumber
                              className="price-input"
                              formatter={value => `${selectedCurrency} ${value}`}
                              parser={value => value.replace(selectedCurrency, '').trim()}
                              onChange={handleItemChange}
                              defaultValue={0}
                            />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item {...restField} name={[name, "hsn_sac"]}>
                            <Input placeholder="HSN/SAC" className="item-input" />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item {...restField} name={[name, "discount"]} style={{ margin: 0 }}>
                            <Space>
                              <Form.Item
                                {...restField}
                                name={[name, "discount_type"]}
                                style={{ margin: 0 }}
                              >
                                <Select
                                  size="large"
                                  style={{
                                    width: '120px',
                                    borderRadius: '8px',
                                    height: '40px',
                                  }}
                                  defaultValue="percentage"
                                  onChange={handleItemChange}
                                >
                                  <Option value="percentage">Percentage</Option>
                                  <Option value="fixed">Fixed Amount</Option>
                                </Select>
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "discount"]}
                                style={{ margin: 0 }}
                              >
                                <InputNumber
                                  className="item-discount-input"
                                  placeholder={form.getFieldValue('items')?.[index]?.discount_type === 'fixed' ? 'Amount' : '%'}
                                  formatter={value => form.getFieldValue('items')?.[index]?.discount_type === 'fixed' ? `${selectedCurrency}${value}` : `${value}`}
                                  parser={value => form.getFieldValue('items')?.[index]?.discount_type === 'fixed' ? value.replace(selectedCurrency, '').trim() : value.replace('%', '')}
                                  onChange={handleItemChange}
                                  style={{
                                    width: '100px',
                                    borderRadius: '8px',
                                    height: '40px',
                                  }}
                                />
                              </Form.Item>
                              {form.getFieldValue('items')?.[index]?.discount_type === 'percentage' && <Text style={{ marginTop: '10px' }}>%</Text>}
                            </Space>
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item {...restField} name={[name, "taxId"]}>
                            <Select
                              placeholder="Select Tax"
                              loading={taxesLoading}
                              disabled={!isTaxEnabled}
                              onChange={(value, option) => {
                                const items = form.getFieldValue('items') || [];
                                items[index].tax = option?.taxRate;
                                form.setFieldsValue({ items });
                                calculateTotals(items);
                              }}
                            >
                              {taxesData?.data?.map(tax => (
                                <Option
                                  key={tax.id}
                                  value={tax.id}
                                  taxRate={tax.gstPercentage}
                                >
                                  {tax.gstName} ({tax.gstPercentage}%)
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </td>
                        <td>
                          <div className="amount-field">
                            <span className="currency-symbol">{selectedCurrency}</span>
                            <span className="amount-value">
                              {calculateItemTotal(form.getFieldValue("items")?.[index])?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </td>
                        <td>
                          {fields.length > 1 && (
                            <Button
                              type="text"
                              className="delete-btn"
                              icon={<FiTrash2 style={{ color: '#ff4d4f' }} />}
                              onClick={() => {
                                remove(name);
                                handleItemChange();
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
                    icon={<FiPlus />}
                    onClick={() => add()}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Text style={{ marginTop: '10px' }}>Sub Total</Text>
              <Form.Item name="subTotal" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: '120px',
                    borderRadius: '8px',
                    height: '40px',
                  }}
                  formatter={value => `${selectedCurrency}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Text style={{ marginTop: '10px' }}>Item Discount</Text>
              <Space>
                <Form.Item
                  name="discount_type"
                  style={{ margin: 0 }}
                >
                  <Select
                    size="large"
                    style={{
                      width: '120px',
                      borderRadius: '8px',
                      height: '40px',
                    }}
                    defaultValue="percentage"
                    onChange={handleItemChange}
                  >
                    <Option value="percentage">Percentage</Option>
                    <Option value="fixed">Fixed Amount</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="item_discount"
                  style={{ margin: 0 }}
                >
                  <InputNumber
                    placeholder={form.getFieldValue('discount_type') === 'fixed' ? 'Amount' : '%'}
                    size="large"
                    style={{
                      width: '100px',
                      borderRadius: '8px',
                      height: '40px',
                    }}
                    formatter={value => form.getFieldValue('discount_type') === 'fixed' ? `${selectedCurrency}${value}` : `${value}`}
                    parser={value => form.getFieldValue('discount_type') === 'fixed' ? value.replace(selectedCurrency, '').trim() : value.replace('%', '')}
                    onChange={handleItemChange}
                  />
                </Form.Item>
                {form.getFieldValue('discount_type') === 'percentage' && <Text style={{ marginTop: '10px' }}>%</Text>}
              </Space>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Text style={{ marginTop: '10px' }}>Total Tax</Text>
              <Form.Item name="total_tax" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: '120px',
                    borderRadius: '8px',
                    height: '40px',
                  }}
                  formatter={value => `${selectedCurrency}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ marginTop: '10px' }}>Total Amount</Text>
              <Form.Item name="total" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: '120px',
                    borderRadius: '8px',
                    height: '40px',
                  }}
                  formatter={value => `${selectedCurrency}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </div>
          </div>
        </div>

        <div className="form-footer">
          <Button
            onClick={handleCancel}
            className="cancel-btn"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="create-btn"
          >
            Update Invoice
          </Button>
        </div>
      </Form>
      {customerModal}
    </Modal>
  );
};

export default EditInvoice;
