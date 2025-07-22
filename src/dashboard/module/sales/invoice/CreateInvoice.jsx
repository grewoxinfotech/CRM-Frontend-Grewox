import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
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
  FiPlus,
  FiTrash2,
  FiPackage,
  FiPhone,
  FiCreditCard,
} from "react-icons/fi";
import dayjs from "dayjs";
import "./invoice.scss";
import {
  useCreateInvoiceMutation,
  useGetInvoicesQuery,
} from "./services/invoiceApi";
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
} from "../customer/services/custApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import { useGetProductsQuery } from "../product&services/services/productApi";
import { useGetContactsQuery } from "../../crm/contact/services/contactApi";
import { useGetCompanyAccountsQuery } from "../../crm/companyacoount/services/companyAccountApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
import { useGetAllCountriesQuery } from "../../../../superadmin/module/settings/services/settingsApi";

const { Text } = Typography;
const { Option } = Select;

const CreateInvoice = ({
  open,
  onCancel,
  id,
  onSubmit,
  setCreateModalVisible,
  productsData,
  productsLoading,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [createInvoicee, { isLoading }] = useCreateInvoiceMutation();
  const { data: custdata } = useGetCustomersQuery();
  const customers = custdata?.data;
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerForm] = Form.useForm();
  const [createCustomer] = useCreateCustomerMutation();
  const [selectedCurrency, setSelectedCurrency] = useState("₹");
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);
  const [isTaxEnabled, setIsTaxEnabled] = useState(true);
  const [selectedProductCurrency, setSelectedProductCurrency] = useState(null);
  const [isCurrencyDisabled, setIsCurrencyDisabled] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("customer");
  const { data: contactsData } = useGetContactsQuery();
  const loggedInUser = useSelector(selectCurrentUser);
  const { data: companyAccountsData } = useGetCompanyAccountsQuery();
  const { data: countries = [], isLoading: countriesLoading } =
    useGetAllCountriesQuery({
      page: 1,
      limit: 100,
    });

  const { data: invoicesData, error } = useGetInvoicesQuery();

  const contacts = contactsData?.data;
  const companyAccounts = companyAccountsData?.data;

  const { data: currenciesData, isLoading: currenciesLoading } =
    useGetAllCurrenciesQuery({
      page: 1,
      limit: 100,
    });

  useEffect(() => {
    if (currenciesData?.data?.length > 0) {
      const defaultCurrency =
        currenciesData.find((c) => c.currencyCode === "INR") ||
        currenciesData.data[0];
      form.setFieldValue("currency", defaultCurrency.id);
    }
  }, [currenciesData, form]);

  const calculateItemTaxAmount = (item) => {
    if (!item) return 0;
    if (!isTaxEnabled || !item.tax_percentage) return 0;

    const quantity = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const itemAmount = quantity * price;

    const itemDiscount = Number(item.discount || 0);
    const itemDiscountType = item.discount_type || "percentage";
    let itemDiscountAmount = 0;

    if (itemDiscountType === "percentage") {
      itemDiscountAmount = (itemAmount * itemDiscount) / 100;
    } else {
      itemDiscountAmount = itemDiscount;
    }

    const amountAfterDiscount = itemAmount - itemDiscountAmount;
    const taxRate = Number(item.tax_percentage) || 0;

    return (amountAfterDiscount * taxRate) / 100;
  };

  const calculateItemTotal = (item) => {
    if (!item) return 0;

    const quantity = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const itemAmount = quantity * price;

    const itemDiscount = Number(item.discount || 0);
    const itemDiscountType = item.discount_type || "percentage";
    let itemDiscountAmount = 0;

    if (itemDiscountType === "percentage") {
      itemDiscountAmount = (itemAmount * itemDiscount) / 100;
    } else {
      itemDiscountAmount = itemDiscount;
    }

    const amountAfterDiscount = itemAmount - itemDiscountAmount;

    const taxAmount = isTaxEnabled ? calculateItemTaxAmount(item) : 0;

    return amountAfterDiscount + taxAmount;
  };

  const calculateTotals = (items = []) => {
    if (!Array.isArray(items)) {
      items = [];
    }

    let subTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    items.forEach((item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const itemAmount = quantity * price;
      subTotal += itemAmount;

      const itemDiscount = Number(item.discount || 0);
      const itemDiscountType = item.discount_type || "percentage";
      let itemDiscountAmount = 0;

      if (itemDiscountType === "percentage") {
        itemDiscountAmount = (itemAmount * itemDiscount) / 100;
      } else {
        itemDiscountAmount = itemDiscount;
      }

      totalDiscount += itemDiscountAmount;

      if (isTaxEnabled && item.tax_percentage) {
        const amountAfterDiscount = itemAmount - itemDiscountAmount;
        const taxRate = Number(item.tax_percentage) || 0;
        const itemTax = (amountAfterDiscount * taxRate) / 100;
        totalTax += itemTax;
      }
    });

    const totalAmount = subTotal - totalDiscount + (isTaxEnabled ? totalTax : 0);

    form.setFieldsValue({
      subtotal: subTotal.toFixed(2),
      tax: isTaxEnabled ? totalTax.toFixed(2) : "0.00",
      discount: totalDiscount.toFixed(2),
      total: totalAmount.toFixed(2),
    });

    const updatedItems = items.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const itemSubtotal = quantity * price;

      const itemDiscount = Number(item.discount || 0);
      const itemDiscountType = item.discount_type || "percentage";
      let itemDiscountAmount = 0;

      if (itemDiscountType === "percentage") {
        itemDiscountAmount = (itemSubtotal * itemDiscount) / 100;
      } else {
        itemDiscountAmount = itemDiscount;
      }

      let itemTaxAmount = 0;
      if (isTaxEnabled && item.tax_percentage) {
        const amountAfterDiscount = itemSubtotal - itemDiscountAmount;
        const taxRate = Number(item.tax_percentage) || 0;
        itemTaxAmount = (amountAfterDiscount * taxRate) / 100;
      }

      const itemTotal = itemSubtotal - itemDiscountAmount + itemTaxAmount;

      return {
        ...item,
        amount: itemTotal.toFixed(2),
        tax_amount: isTaxEnabled ? itemTaxAmount.toFixed(2) : "0.00",
      };
    });

    form.setFieldsValue({ items: updatedItems });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const formattedItems = values.items?.map((item) => {
        const itemTaxAmount = isTaxEnabled ? calculateItemTaxAmount(item) : 0;
        return {
          product_id: item.id,
          quantity: Number(item.quantity) || 0,
          unit_price: Number(item.unit_price) || 0,
          tax: isTaxEnabled ? item.tax_percentage || 0 : 0,
          tax_name: isTaxEnabled ? item.tax_name || "" : "",
          tax_amount: itemTaxAmount,
          discount: Number(item.discount) || 0,
          discount_type: item.discount_type || "percentage",
          hsn_sac: item.hsn_sac || "",
          amount: calculateItemTotal(item),
        };
      });

      const totalTaxAmount = formattedItems.reduce(
        (sum, item) => sum + (item.tax_amount || 0),
        0
      );

      const totalDiscountAmount = formattedItems.reduce((sum, item) => {
        const itemAmount = item.quantity * item.unit_price;
        let discountAmount = 0;
        if (item.discount_type === "percentage") {
          discountAmount = (itemAmount * (item.discount || 0)) / 100;
        } else {
          discountAmount = Number(item.discount) || 0;
        }
        return sum + discountAmount;
      }, 0);

      const payload = {
        category: values.category,
        customer: values.customer,
        section: "sales-invoice",
        issueDate: values.issueDate?.format("YYYY-MM-DD"),
        dueDate: values.dueDate?.format("YYYY-MM-DD"),
        currency: selectedCurrencyId || values.currency,
        currencyCode: selectedCurrency,
        currencyIcon: selectedCurrency,
        items: formattedItems,
        subtotal: Number(values.subtotal) || 0,
        tax: totalTaxAmount,
        discount: totalDiscountAmount,
        total: Number(values.total) || 0,
        payment_status: values.status || "unpaid",
      };

      await createInvoicee({ id: id, data: payload }).unwrap();
      message.success("Invoice created successfully");
      form.resetFields();
      setCreateModalVisible(false);
      onCancel();
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        "Failed to create invoice";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (values) => {
    try {
      const selectedCountry = countries?.find(
        (c) => c.phoneCode === values.phonecode
      );
      if (!selectedCountry) {
        message.error("Please select a valid phone code");
        return;
      }

      const result = await createCustomer({
        name: values.name,
        contact: values.contact,
        phonecode: selectedCountry.id,
      }).unwrap();

      message.success("Customer created successfully");
      setIsCustomerModalOpen(false);
      customerForm.resetFields();

      form.setFieldValue("customer", result.data.id);
    } catch (error) {
      message.error("Failed to create customer: " + error.message);
    }
  };

  const getOptionsBasedOnCategory = () => {
    switch (selectedCategory) {
      case "customer":
        return (
          customers?.map((customer) => ({
            label: customer.name,
            value: customer.id,
          })) || []
        );
      case "contact":
        return (
          contacts?.map((contact) => ({
            label:
              contact.name ||
              `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
              contact.contact_name ||
              "Unnamed Contact",
            value: contact.id,
          })) || []
        );
      case "company_account":
        return (
          companyAccounts?.map((account) => ({
            label:
              account.company_name ||
              account.name ||
              account.account_name ||
              "Unnamed Company",
            value: account.id,
          })) || []
        );
      default:
        return [];
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    form.setFieldsValue({ customer: undefined });
  };

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
          rules={[{ required: true, message: "Please enter customer name" }]}
        >
          <Input
            prefix={<FiUser style={{ color: "#1890ff" }} />}
            placeholder="Enter customer name"
            size="large"
            style={{ borderRadius: "8px" }}
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Phone Number <span style={{ color: "#ff4d4f" }}>*</span>
            </span>
          }
          style={{ marginTop: '12px' }}
          className="combined-input-item"
        >
          <Input.Group
            compact
            className="phone-input-group"
            style={{
              display: "flex",
              height: "48px",
              backgroundColor: "#f8fafc",
              borderRadius: "10px",
              border: "1px solid #e6e8eb",
              overflow: "hidden",
            }}
          >
            <Form.Item name="phonecode" noStyle initialValue="+91">
              <Select
                size="large"
                style={{
                  width: "120px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
                loading={countriesLoading}
                className="phone-code-select"
                dropdownStyle={{
                  padding: "8px",
                  borderRadius: "10px",
                  backgroundColor: "white",
                }}
                showSearch
                optionFilterProp="children"
                defaultValue="+91"
              >
                {countries?.map((country) => (
                  <Option
                    key={country.id}
                    value={country.phoneCode}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#262626",
                        cursor: "pointer",
                      }}
                    >
                      <span>
                        {country.countryCode} {country.phoneCode}
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="contact" noStyle>
              <Input
                size="large"
                type="number"
                style={{
                  flex: 1,
                  border: "none",
                  borderLeft: "1px solid #e6e8eb",
                  borderRadius: 0,
                  height: "48px",
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                }}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
              />
            </Form.Item>
          </Input.Group>
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
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
            }}
          >
            Create Customer
          </Button>
        </div>
      </Form>
    </Modal>
  );

  const handleCurrencyChange = (value, option) => {
    const currency = currenciesData?.find((c) => c.id === value);
    if (currency) {
      setSelectedCurrency(currency.currencyIcon);
      setSelectedCurrencyId(value);

      const items = form.getFieldValue("items") || [];
      const updatedItems = items.map((item) => ({
        ...item,
        unit_price: item.unit_price || 0,
      }));
      form.setFieldsValue({ items: updatedItems });
      calculateTotals(updatedItems);
    }
  };

  const handleProductSelect = (value, option) => {
    const selectedProduct = productsData?.data?.find(
      (product) => product.id === value
    );
    if (selectedProduct) {
      const productCurrency = currenciesData?.find(
        (c) => c.id === selectedProduct.currency
      );
      if (productCurrency) {
        setSelectedProductCurrency(productCurrency);
        setSelectedCurrency(productCurrency.currencyIcon);
        setSelectedCurrencyId(productCurrency.id);
        setIsCurrencyDisabled(true);
      }

      const items = form.getFieldValue("items") || [];
      const newItems = [...items];
      const lastIndex = newItems.length - 1;
      newItems[lastIndex] = {
        ...newItems[lastIndex],
        id: selectedProduct.id,
        item_name: selectedProduct.name,
        unit_price: selectedProduct.selling_price,
        hsn_sac: selectedProduct.hsn_sac,
        tax_name: selectedProduct.tax_name,
        tax_percentage: selectedProduct.tax_percentage,
        profilePic: selectedProduct.image,
        currency: selectedProduct.currency,
      };
      form.setFieldsValue({
        items: newItems,
        currency: selectedProduct.currency,
      });
      calculateTotals(newItems);
    }
  };

  useEffect(() => {
    const items = form.getFieldValue("items");
    if (items && items.length > 0) {
      calculateTotals(items);
    }
  }, [isTaxEnabled]);

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1300}
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
          status: "unpaid",
        }}
        style={{
          padding: "24px",
        }}
      >
        <div
          className="create-invoice-form-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
          }}
        >
          <Form.Item
            name="customer"
            label={
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                <FiUser style={{ marginRight: "8px", color: "#1890ff" }} />
                {selectedCategory === "customer"
                  ? "Customer"
                  : selectedCategory === "contact"
                  ? "Contact"
                  : "Company Account"}{" "}
                <span style={{ color: "#ff4d4f" }}>*</span>
              </span>
            }
            rules={[
              { required: true, message: `Please select ${selectedCategory}` },
            ]}
          >
            <Select
              listHeight={100}
              dropdownStyle={{
                Height: "100px",
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollBehavior: "smooth",
              }}
              placeholder={`Select ${
                selectedCategory === "customer"
                  ? "Customer"
                  : selectedCategory === "contact"
                  ? "Contact"
                  : "Company Account"
              }`}
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
                  {selectedCategory === "customer" && (
                    <>
                      <Divider style={{ margin: "8px 0" }} />
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <Button
                          type="primary"
                          icon={<FiPlus />}
                          onClick={() => setIsCustomerModalOpen(true)}
                          style={{
                            width: "100%",
                            background:
                              "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                            border: "none",
                            height: "40px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxShadow: "0 2px 8px rgba(24, 144, 255, 0.15)",
                            fontWeight: "500",
                          }}
                        >
                          Add Customer
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
              onChange={(value) => {
                const selectedCustomer = customers?.find((c) => c.id === value);
                if (selectedCustomer) {
                  form.setFieldValue(
                    "tax_number",
                    selectedCustomer.tax_number || ""
                  );
                }
                form.setFieldValue("customer", value);
              }}
            >
              {getOptionsBasedOnCategory().map((option) => (
                <Option key={option.value} value={option.value}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "4px 0",
                    }}
                  >
                    {selectedCategory === "customer" ? (
                      <FiUser style={{ color: "#1890ff" }} />
                    ) : selectedCategory === "contact" ? (
                      <FiPhone style={{ color: "#1890ff" }} />
                    ) : (
                      <FiCreditCard style={{ color: "#1890ff" }} />
                    )}
                    <span>{option.label}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tax_number"
            label={
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                <FiHash style={{ marginRight: "8px", color: "#1890ff" }} />
                GSTIN
              </span>
            }
          >
            <Input
              disabled
              placeholder="Tax number"
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

          <Form.Item
            name="currency"
            label={
              <span className="form-label">
                Currency  <span style={{ color: "#ff4d4f" }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select currency" }]}
          >
            <Select
              placeholder="Select Currency"
              size="large"
              value={selectedCurrencyId}
              onChange={handleCurrencyChange}
              disabled={isCurrencyDisabled}
              style={{
                borderRadius: "10px",
              }}
              optionLabelProp="label"
            >
              {currenciesData?.map((currency) => (
                <Option
                  key={currency.id}
                  value={currency.id}
                  label={`${currency.currencyName} (${currency.currencyIcon})`}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>{currency.currencyIcon}</span>
                    <span>{currency.currencyName}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="issueDate"
            label={
              <span className="form-label">
                Issue Date <span style={{ color: "#ff4d4f" }}>*</span>
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
                Due Date  <span style={{ color: "#ff4d4f" }}>*</span>
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
                Payment Status <span className="required"></span>
              </span>
            }
            rules={[
              { required: true, message: "Please select payment status" },
            ]}
          >
            <Select
              placeholder="Select Status"
              size="large"
              style={{
                width: "100%",
                borderRadius: "10px",
              }}
            >
              <Option value="paid">Paid</Option>
              <Option value="unpaid">Unpaid</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="table-style-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              marginBottom: "16px",
              marginLeft: "16px",
              marginRight: "16px",
            }}
          >
            <span
              style={{ fontSize: "16px", fontWeight: "500", color: "#1f2937" }}
            >
              <FiPackage style={{ marginRight: "8px", color: "#1890ff" }} />
              Items & Services
            </span>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Text style={{ marginRight: "8px" }}>Enable Tax</Text>
              <Switch
                checked={isTaxEnabled}
                onChange={(checked) => {
                  setIsTaxEnabled(checked);
                }}
                size="small"
              />
            </div>
          </div>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <div className="invoice-items-table-wrapper">
                  <table className="invoice-items-table">
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
                          <td >
                            <Form.Item
                              {...restField}
                              name={[name, "item_name"]}
                              style={{marginTop:"-10px"}}
                            >
                              <Select
                                showSearch
                                placeholder="Select Product"
                                optionFilterProp="children"
                                style={{ width: "100%" }}
                                onChange={(value) => {
                                  const selectedProduct =
                                    productsData?.data?.find(
                                      (product) => product.id === value
                                    );
                                  if (selectedProduct) {
                                    const productCurrency = currenciesData?.find(
                                      (c) => c.id === selectedProduct.currency
                                    );
                                    if (productCurrency) {
                                      setSelectedCurrency(
                                        productCurrency.currencyIcon
                                      );
                                      setSelectedCurrencyId(productCurrency.id);
                                      setIsCurrencyDisabled(true);
                                    }

                                    const items =
                                      form.getFieldValue("items") || [];
                                    items[index] = {
                                      ...items[index],
                                      id: selectedProduct.id,
                                      item_name: selectedProduct.name,
                                      unit_price: selectedProduct.selling_price,
                                      hsn_sac: selectedProduct.hsn_sac,
                                      tax_name: selectedProduct.tax_name,
                                      tax_percentage: selectedProduct.tax_percentage,
                                      profilePic: selectedProduct.image,
                                      currency: selectedProduct.currency,
                                    };
                                    form.setFieldsValue({
                                      items,
                                      currency: selectedProduct.currency,
                                    });
                                    calculateTotals(items);
                                  }
                                }}
                              >
                                {productsData?.data?.map((product) => (
                                  <Option key={product.id} value={product.id}>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: "30px",
                                          height: "30px",
                                          borderRadius: "4px",
                                          overflow: "hidden",
                                        }}
                                      >
                                        <img
                                          src={product.image}
                                          alt={product.name}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                          }}
                                        />
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                        }}
                                      >
                                        <span style={{ fontWeight: 500 }}>
                                          {product.name}
                                        </span>
                                      </div>
                                    </div>
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </td>
                          <td>
                            <Form.Item
                              {...restField}
                              name={[name, "quantity"]}
                              rules={[
                                { required: true, message: "Required" },
                                {
                                  validator: (_, value) => {
                                    if (!value) return Promise.resolve();
                                    if (!Number.isInteger(value)) {
                                      return Promise.reject(
                                        "Please enter a valid quantity"
                                      );
                                    }
                                    if (value < 1) {
                                      return Promise.reject(
                                        "Quantity must be at least 1"
                                      );
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                              initialValue={1}
                              style={{ height: "48px",marginTop:"-10px",width:"70px" }}
                            >
                              <InputNumber
                                min={1}
                                precision={0}
                                className="quantity-input"
                                style={{padding:"0px"}}
                                onChange={() =>
                                  calculateTotals(form.getFieldValue("items"))
                                }
                              />
                            </Form.Item>
                          </td>
                          <td>
                            <Form.Item
                              {...restField}
                              name={[name, "unit_price"]}
                              style={{width:"120px"}}
                            >
                              <InputNumber
                                className="price-input"
                                style={{padding:"0px"}}
                                min={0}
                                disabled={true}
                                onChange={() =>
                                  calculateTotals(form.getFieldValue("items"))
                                }
                                formatter={(value) =>
                                  `${selectedCurrency}${value}`.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ","
                                  )
                                }
                                parser={(value) => value.replace(/[^\d.]/g, "")}
                              />
                            </Form.Item>
                          </td>
                          <td>
                            <Form.Item {...restField} name={[name, "hsn_sac"]} style={{width:"120px"}}>
                              <Input
                                placeholder="HSN/SAC"
                                className="hsn-input"
                                disabled={true}
                              />
                            </Form.Item>
                          </td>
                          <td>
                            <Form.Item
                              {...restField}
                              name={[name, "discount"]}
                              style={{ marginTop: "-8px"}}
                            >
                              <Space>
                                <Form.Item
                                  {...restField}
                                  name={[name, "discount_type"]}
                                  style={{ margin: 0 }}
                                >
                                  <Select
                                    size="large"
                                    style={{
                                      width: "100%",
                                      borderRadius: "8px",
                                      height: "48px",
                                    }}
                                    defaultValue="percentage"
                                    onChange={() =>
                                      calculateTotals(form.getFieldValue("items"))
                                    }
                                  >
                                    <Option value="percentage">Percentage</Option>
                                    <Option value="fixed">Fixed Amount</Option>
                                  </Select>
                                </Form.Item>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Form.Item
                                    {...restField}
                                    name={[name, "discount"]}
                                    style={{ margin: 0 }}
                                  >
                                    <InputNumber
                                      className="item-discount-input"
                                      formatter={(value) => {
                                        if (!value && value !== 0) return "";
                                        return value
                                          .toString()
                                          .replace(/[^\d.]/g, "");
                                      }}
                                      parser={(value) => {
                                        const parsed = value?.replace(
                                          /[^\d.]/g,
                                          ""
                                        );
                                        return parsed || "0";
                                      }}
                                      onStep={(value) => {
                                        const items = form.getFieldValue("items");
                                        if (items?.[index]) {
                                          items[index].discount = value || 0;
                                          form.setFieldsValue({ items });
                                          calculateTotals(items);
                                        }
                                      }}
                                      onChange={(value) => {
                                        const items = form.getFieldValue("items");
                                        if (items?.[index]) {
                                          items[index].discount = value || 0;
                                          form.setFieldsValue({ items });
                                          calculateTotals(items);
                                        }
                                      }}
                                      onKeyUp={() => {
                                        calculateTotals(
                                          form.getFieldValue("items")
                                        );
                                      }}
                                      style={{
                                        width: "100px",
                                        borderRadius: "8px",
                                        height: "40px",
                                        padding:"0px"
                                      }}
                                    />
                                  </Form.Item>
                                  <Text style={{ marginLeft: "4px" }}>
                                    {form.getFieldValue("items")?.[index]
                                      ?.discount_type === "fixed"
                                      ? selectedCurrency
                                      : "%"}
                                  </Text>
                                </div>
                              </Space>
                            </Form.Item>
                          </td>
                          <td>
                            <Form.Item
                              {...restField}
                              name={[name, "tax_info"]}
                              style={{ marginTop: "-8px" }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                                <Input
                                  value={isTaxEnabled ? 
                                    (form.getFieldValue("items")?.[index]?.tax_name 
                                      ? `${form.getFieldValue("items")?.[index]?.tax_name} ${form.getFieldValue("items")?.[index]?.tax_percentage || 0}%` 
                                      : "No Tax") 
                                    : "No Tax"}
                                  placeholder="No Tax"
                                  readOnly
                                  disabled={!isTaxEnabled}
                                  style={{ width: "120px",height:"48px" }}
                                />
                                {isTaxEnabled && (
                                  <>
                                    {form.getFieldValue("items")?.[index]?.tax_percentage > 0 ? (
                                      <Button
                                        type="text"
                                        icon={<FiX style={{ color: "#ff4d4f" }} />}
                                        onClick={() => {
                                          const items = form.getFieldValue("items") || [];
                                          if (items[index]) {
                                            items[index] = {
                                              ...items[index],
                                              _original_tax_name: items[index].tax_name,
                                              _original_tax_percentage: items[index].tax_percentage,
                                              tax_name: "",
                                              tax_percentage: 0,
                                              tax_amount: 0,
                                            };
                                            form.setFieldsValue({ items });
                                            calculateTotals(items);
                                          }
                                        }}
                                        style={{ 
                                          padding: "2px", 
                                          display: "flex", 
                                          alignItems: "center",
                                          justifyContent: "center",
                                          borderRadius: "50%",
                                          background: "#fff0f0",
                                          marginLeft: "4px",
                                          height: "20px",
                                          width: "20px",
                                          border: "1px solid #ffccc7"
                                        }}
                                      />
                                    ) : (
                                      <Button
                                        type="text"
                                        icon={<FiPlus style={{ color: "#52c41a" }} />}
                                        onClick={() => {
                                          const items = form.getFieldValue("items") || [];
                                          if (items[index]) {
                                            const originalTaxName = items[index]._original_tax_name;
                                            const originalTaxPercentage = items[index]._original_tax_percentage;
                                            if (originalTaxName || originalTaxPercentage) {
                                              items[index] = {
                                                ...items[index],
                                                tax_name: originalTaxName || "",
                                                tax_percentage: originalTaxPercentage || 0,
                                              };
                                            } 
                                            else if (items[index].id) {
                                              const product = productsData?.data?.find(p => p.id === items[index].id);
                                              if (product) {
                                                items[index] = {
                                                  ...items[index],
                                                  tax_name: product.tax_name || "",
                                                  tax_percentage: product.tax_percentage || 0,
                                                };
                                              }
                                            }
                                            form.setFieldsValue({ items });
                                            calculateTotals(items);
                                          }
                                        }}
                                        style={{ 
                                          padding: "2px", 
                                          display: "flex", 
                                          alignItems: "center",
                                          justifyContent: "center",
                                          borderRadius: "50%",
                                          background: "#f6ffed",
                                          marginLeft: "4px",
                                          height: "20px",
                                          width: "20px",
                                          border: "1px solid #b7eb8f"
                                        }}
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                            </Form.Item>
                          </td>
                          <td>
                            <div className="amount-fields" style={{marginTop:"-8px"}}>
                              <span className="currency-symbols">
                                {selectedCurrency}
                              </span>
                              <span className="amount-values">
                                {calculateItemTotal(
                                  form.getFieldValue("items")[index]
                                )?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                          </td>
                          <td>
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "8px",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: "15px", color: "#4b5563", fontWeight: 500 }}
              >
                Sub Total
              </Text>
              <Form.Item name="subtotal" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: "150px",
                    borderRadius: "8px",
                    height: "45px",
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                  formatter={(value) =>
                    `${selectedCurrency}${value}`.replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )
                  }
                />
              </Form.Item>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "8px",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: "15px", color: "#4b5563", fontWeight: 500 }}
              >
                Discount
              </Text>
              <Form.Item name="discount" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: "150px",
                    borderRadius: "8px",
                    height: "45px",
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                  formatter={(value) =>
                    `${selectedCurrency}${value}`.replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )
                  }
                />
              </Form.Item>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "8px",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: "15px", color: "#4b5563", fontWeight: 500 }}
              >
                Tax
              </Text>
              <Form.Item name="tax" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: "150px",
                    borderRadius: "8px",
                    height: "45px",
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                  formatter={(value) =>
                    `${selectedCurrency}${value}`.replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )
                  }
                />
              </Form.Item>
            </div>
            <Divider style={{ margin: "20px 0", borderColor: "#e5e7eb" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "16px",
                background:
                  "linear-gradient(135deg, #1890ff08 0%, #096dd908 100%)",
                borderRadius: "8px",
                alignItems: "center",
                border: "1px solid #1890ff20",
              }}
            >
              <Text
                style={{ fontSize: "16px", color: "#1f2937", fontWeight: 600 }}
              >
                Total Amount
              </Text>
              <Form.Item name="total" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: "150px",
                    borderRadius: "8px",
                    height: "45px",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1890ff",
                  }}
                  formatter={(value) =>
                    `${selectedCurrency}${value}`.replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )
                  }
                />
              </Form.Item>
            </div>
          </div>
        </div>

        <div className="form-footer">
          <Button onClick={onCancel} className="cancel-btn">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="create-btn"
          >
            Create Invoice
          </Button>
        </div>
      </Form>

      {customerModal}
    </Modal>
  );
};

export default CreateInvoice;
