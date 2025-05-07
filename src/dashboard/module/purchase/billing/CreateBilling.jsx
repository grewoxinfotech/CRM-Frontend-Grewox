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
  FiPhone,
} from "react-icons/fi";
import dayjs from "dayjs";
import "./billing.scss";
import {
  useGetVendorsQuery,
  useCreateVendorMutation,
} from "../vendor/services/vendorApi";
import { useGetProductsQuery } from "../../sales/product&services/services/productApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import { useGetAllTaxesQuery } from "../../settings/tax/services/taxApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
import { useGetAllCountriesQuery } from "../../settings/services/settingsApi";

const { Text } = Typography;
const { Option } = Select;

const CreateBilling = ({ open, onCancel, onSubmit, billings }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("₹");
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);
  const [isCurrencyDisabled, setIsCurrencyDisabled] = useState(true);
  const [isTaxEnabled, setIsTaxEnabled] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorForm] = Form.useForm();
  const [createVendor] = useCreateVendorMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const { data: vendorsData, isLoading: vendorsLoading } = useGetVendorsQuery();

  // Fetch currencies
  const { data: currenciesData, isLoading: currenciesLoading } =
    useGetAllCurrenciesQuery({
      page: 1,
      limit: 100,
    });

  // Fetch taxes
  const { data: taxesData, isLoading: taxesLoading } = useGetAllTaxesQuery();

  // Fetch products
  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery(loggedInUser?.id);
  // Fetch countries
  const { data: countries = [], loading: countriesLoading } =
    useGetAllCountriesQuery();

  useEffect(() => {
    if (currenciesData?.data?.length > 0) {
      const defaultCurrency =
        currenciesData.find((c) => c.currencyCode === "INR") ||
        currenciesData.data[0];
      form.setFieldValue("currency", defaultCurrency.id);
    }
  }, [currenciesData, form]);

  useEffect(() => {
    if (countries.length > 0) {
      const india = countries.find(
        (country) => country.countryName === "India"
      );
      if (india) {
        setSelectedCountry(india);
        form.setFieldValue("phonecode", india.phoneCode);
      }
    }
  }, [countries]);

  const handleCurrencyChange = (value, option) => {
    const currency = currenciesData?.find((c) => c.id === value);
    if (currency) {
      setSelectedCurrency(currency.currencyIcon);
      setSelectedCurrencyId(value);

      // Update all prices with new currency
      const items = form.getFieldValue("items") || [];
      const updatedItems = items.map((item) => ({
        ...item,
        unit_price: item.unit_price || 0,
        currency: value,
        currencyIcon: currency.currencyIcon,
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
      // Get the product's currency from currencies list
      const productCurrency = currenciesData?.find(
        (c) => c.id === selectedProduct.currency
      );
      if (productCurrency) {
        setSelectedCurrency(productCurrency.currencyIcon);
        setSelectedCurrencyId(productCurrency.id);
        setIsCurrencyDisabled(true);

        // Update the form with the product's currency
        form.setFieldsValue({
          currency: productCurrency.id,
        });

        // Update the items list
        const items = form.getFieldValue("items") || [];
        const newItems = [...items];
        const lastIndex = newItems.length - 1;
        newItems[lastIndex] = {
          ...newItems[lastIndex],
          id: selectedProduct.id,
          item_name: selectedProduct.name,
          unit_price: selectedProduct.selling_price,
          hsn_sac: selectedProduct.hsn_sac,
          tax: selectedProduct.tax,
          profilePic: selectedProduct.image,
          currency: selectedProduct.currency,
          currencyIcon: productCurrency.currencyIcon,
          item_discount: 0,
          item_discount_type: "percentage",
        };
        form.setFieldsValue({
          items: newItems,
          currency: selectedProduct.currency,
        });
        calculateTotals(newItems);
      }
    }
  };

  const handleCreateVendor = async (values) => {
    try {
      const selectedCountry = countries?.find(
        (c) => c.phoneCode === values.phoneCode
      );
      if (!selectedCountry) {
        message.error("Please select a valid phone code");
        return;
      }

      const result = await createVendor({
        name: values.name,
        contact: values.contact,
        phonecode: selectedCountry.id
      }).unwrap();

      message.success("Vendor created successfully");
      setIsVendorModalOpen(false);
      vendorForm.resetFields();

      // Automatically select the newly created vendor
      form.setFieldValue("vendor_id", result.data.id);
    } catch (error) {
      message.error("Failed to create vendor: " + error.message);
    }
  };

  // Get next bill number based on existing bills
  const getNextBillNumber = () => {
    if (!billings || billings.length === 0) return "BILL#1";

    // Filter bills based on client_id and logged in user
    const relevantBills = billings.filter(
      (bill) => bill.client_id === loggedInUser?.id || loggedInUser?.client_id
    );

    if (relevantBills.length === 0) return "BILL#1";

    // Find highest bill number
    let highestNumber = 0;
    relevantBills.forEach((bill) => {
      if (bill.billNumber) {
        const numberPart = parseInt(bill.billNumber.replace("BILL#", ""));
        if (!isNaN(numberPart) && numberPart > highestNumber) {
          highestNumber = numberPart;
        }
      }
    });

    return `BILL#${highestNumber + 1}`;
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Find selected currency details
      const selectedCurrencyData = currenciesData?.find(
        (curr) => curr.id === values.currency
      );

      // Format items for backend
      const formattedItems = values.items?.map((item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.unit_price) || 0;
        const itemAmount = quantity * price;

        // Calculate item discount
        const itemDiscount = Number(item.discount || 0);
        const itemDiscountType = item.discount_type || "percentage";
        let discountAmount = 0;

        if (itemDiscountType === "percentage") {
          discountAmount = (itemAmount * itemDiscount) / 100;
        } else {
          discountAmount = itemDiscount;
        }

        // Calculate tax amount
        const itemTaxAmount = isTaxEnabled ? calculateItemTaxAmount(item) : 0;

        // Calculate final amount for this item
        const finalAmount = itemAmount - discountAmount + itemTaxAmount;

        return {
          product_id: item.id,
          itemName: item.item_name,
          quantity: quantity,
          unitPrice: price,
          hsnSac: item.hsn_sac || "",
          tax: item.taxId,
          taxAmount: itemTaxAmount,
          amount: finalAmount,
          discount_type: itemDiscountType,
          discount: itemDiscount,
          discountAmount: discountAmount,
          currency: item.currency || values.currency,
          currencyIcon: item.currencyIcon || selectedCurrencyData?.currencyIcon,
        };
      });

      // Get next bill number
      const nextBillNumber = getNextBillNumber();

      // Get values directly from form
      const subTotal = Number(form.getFieldValue("sub_total")) || 0;
      const totalAmount = Number(form.getFieldValue("total_amount")) || 0;
      const totalItemDiscounts = formattedItems.reduce(
        (sum, item) => sum + item.discountAmount,
        0
      );
      const totalItemTaxes = formattedItems.reduce(
        (sum, item) => sum + item.taxAmount,
        0
      );

      // Get overall tax details
      const selectedOverallTaxId = form.getFieldValue("overall_tax");
      const selectedOverallTax = selectedOverallTaxId
        ? taxesData?.data?.find((tax) => tax.id === selectedOverallTaxId)
        : null;

      // Format the data according to your API requirements
      const formattedData = {
        vendor: values.vendor_id,
        billNumber: nextBillNumber,
        billDate: values.billDate
          ? dayjs(values.billDate).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        discription: values.discription || "",
        status: values.status,
        currency: selectedCurrencyData?.id || values.currency,
        currencyCode: selectedCurrencyData?.currencyCode,
        currencyIcon: selectedCurrencyData?.currencyIcon,
        items: formattedItems,
        amount: subTotal, // Original amount before any calculations
        subTotal: subTotal, // Same as amount
        total: totalAmount, // Final amount after all calculations
        discount: totalItemDiscounts,
        tax: totalItemTaxes,
        overallDiscount: Number(form.getFieldValue("discount") || 0),
        overallDiscountType:
          form.getFieldValue("discount_type") || "percentage",
        overallDiscountAmount: Number(
          form.getFieldValue("discount_value") || 0
        ),
        overallTax: selectedOverallTaxId || null, // Pass the tax ID here
        overallTaxAmount: Number(form.getFieldValue("overall_tax_amount") || 0),
      };

      console.log("Submitting data:", formattedData); // Debug log

      const response = await onSubmit(formattedData);
      console.log("API Response:", response); // Debug log

      form.resetFields();
      onCancel();
      message.success("Bill created successfully");
    } catch (error) {
      console.error("Submit Error Details:", {
        error,
        message: error?.data?.message || error?.message,
        status: error?.status,
        data: error?.data,
      });
      message.error(
        error?.data?.message || error?.message || "Failed to create bill"
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateItemSubtotal = (item) => {
    if (!item) return 0;
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    return quantity * price;
  };

  const calculateItemDiscount = (item) => {
    if (!item) return 0;
    const subtotal = calculateItemSubtotal(item);
    const itemDiscount = Number(item.discount || 0);
    const itemDiscountType = item.discount_type || "percentage";

    if (itemDiscountType === "percentage") {
      return (subtotal * itemDiscount) / 100;
    }
    return itemDiscount;
  };

  const calculateItemTaxAmount = (item) => {
    if (!item) return 0;
    if (!isTaxEnabled || !item.taxId) return 0;

    // Get amount after item-level discount
    const subtotal = calculateItemSubtotal(item);
    const itemDiscount = calculateItemDiscount(item);
    const amountAfterDiscount = subtotal - itemDiscount;

    // Get tax rate from selected tax
    const selectedTax = taxesData?.data?.find((tax) => tax.id === item.taxId);
    const taxRate = selectedTax ? Number(selectedTax.gstPercentage) || 0 : 0;

    // Calculate tax on discounted amount
    return (amountAfterDiscount * taxRate) / 100;
  };

  const calculateItemTotal = (item) => {
    if (!item) return 0;

    // Step 1: Calculate subtotal
    const subtotal = calculateItemSubtotal(item);

    // Step 2: Apply item discount
    const itemDiscount = calculateItemDiscount(item);
    const amountAfterDiscount = subtotal - itemDiscount;

    // Step 3: Apply item tax
    const itemTax = calculateItemTaxAmount(item);

    // Return total = discounted amount + tax
    return amountAfterDiscount + itemTax;
  };

  const calculateTotals = (items = []) => {
    if (!Array.isArray(items)) {
      items = [];
    }

    // Step 1: Calculate totals for all items
    let totalBeforeOverallDiscount = 0;
    let totalItemDiscounts = 0;
    let totalItemTaxes = 0;

    items.forEach((item) => {
      const itemSubtotal = calculateItemSubtotal(item);
      const itemDiscount = calculateItemDiscount(item);
      const itemTax = calculateItemTaxAmount(item);

      totalBeforeOverallDiscount += itemSubtotal - itemDiscount + itemTax;
      totalItemDiscounts += itemDiscount;
      totalItemTaxes += itemTax;
    });

    // Step 2: Apply overall bill discount
    const overallDiscountType =
      form.getFieldValue("discount_type") || "percentage";
    const overallDiscountValue = Number(form.getFieldValue("discount")) || 0;
    let overallDiscountAmount = 0;

    if (overallDiscountType === "percentage") {
      overallDiscountAmount =
        (totalBeforeOverallDiscount * overallDiscountValue) / 100;
    } else {
      overallDiscountAmount = overallDiscountValue;
    }

    // Calculate amount after overall discount
    const amountAfterOverallDiscount =
      totalBeforeOverallDiscount - overallDiscountAmount;

    // Step 3: Apply overall tax
    const selectedOverallTaxId = form.getFieldValue("overall_tax");
    const selectedOverallTax = taxesData?.data?.find(
      (tax) => tax.id === selectedOverallTaxId
    );
    const overallTaxPercentage = selectedOverallTax
      ? Number(selectedOverallTax.gstPercentage)
      : 0;
    const overallTaxAmount =
      (amountAfterOverallDiscount * overallTaxPercentage) / 100;

    // Calculate final amount including overall tax
    const finalAmount = amountAfterOverallDiscount + overallTaxAmount;

    // Update form values
    form.setFieldsValue({
      sub_total: totalBeforeOverallDiscount.toFixed(2),
      item_tax_amount: totalItemTaxes.toFixed(2),
      item_discount_value: totalItemDiscounts.toFixed(2),
      discount_value: overallDiscountAmount.toFixed(2),
      overall_tax_amount: overallTaxAmount.toFixed(2),
      total_amount: finalAmount.toFixed(2),
    });
  };

  // Update the onChange handler for overall tax select
  const handleOverallTaxChange = (value, option) => {
    const selectedTax = taxesData?.data?.find((tax) => tax.id === value);
    if (selectedTax) {
      form.setFieldsValue({
        overall_tax: value,
        overall_tax_name: `${selectedTax.gstName} (${selectedTax.gstPercentage}%)`,
      });
      calculateTotals(form.getFieldValue("items"));
    } else {
      form.setFieldsValue({
        overall_tax: null,
        overall_tax_name: "",
        overall_tax_amount: "0.00",
      });
      calculateTotals(form.getFieldValue("items"));
    }
  };

  const vendorModal = (
    <Modal
      title={null}
      open={isVendorModalOpen}
      onCancel={() => {
        setIsVendorModalOpen(false);
        vendorForm.resetFields();
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
            setIsVendorModalOpen(false);
            vendorForm.resetFields();
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
              Create New Vendor
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Add a new vendor to the system
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={vendorForm}
        layout="vertical"
        onFinish={handleCreateVendor}
        requiredMark={false}
        style={{
          padding: "24px",
        }}
      >
        <Form.Item
          name="name"
          label="Vendor Name"
          rules={[{ required: true, message: "Please enter vendor name" }]}
        >
          <Input
            prefix={<FiUser style={{ color: "#1890ff" }} />}
            placeholder="Enter vendor name"
            size="large"
            style={{ borderRadius: "8px" }}
          />
        </Form.Item>

        <Form.Item
          name="contact"
          label={
            <span
              style={{
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Phone Number <span style={{ color: "#ff4d4f" }}>*</span>
            </span>
          }
          style={{ marginTop: '12px' }}
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
            <Form.Item name="phoneCode" noStyle initialValue="+91">
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
                placeholder="Enter phone number"
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
              setIsVendorModalOpen(false);
              vendorForm.resetFields();
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
            Create Vendor
          </Button>
        </div>
      </Form>
    </Modal>
  );

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
              Create New Bill
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create bill
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
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <Form.Item
            name="vendor_id"
            label={
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Vendor <span style={{ color: "#ff4d4f" }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select vendor" }]}
          >
            <Select
              placeholder="Select Vendor"
              showSearch
              optionFilterProp="children"
              size="large"
              loading={vendorsLoading}
              style={{
                width: "100%",
                borderRadius: "8px",
              }}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      type="primary"
                      icon={<FiPlus />}
                      onClick={() => setIsVendorModalOpen(true)}
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
                      Add Vendor
                    </Button>
                  </div>
                </>
              )}
            >
              {vendorsData?.data?.map((vendor) => (
                <Option key={vendor.id} value={vendor.id}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "4px 0",
                    }}
                  >
                    <FiUser style={{ color: "#1890ff" }} />
                    <span>{vendor.name}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="billDate"
            style={{
              height: "100%",
            }}
            label={
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Bill Date <span style={{ color: "#ff4d4f" }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select bill date" }]}
          >
            <DatePicker
              format="DD-MM-YYYY"
              size="large"
              style={{
                width: "100%",
                borderRadius: "10px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e6e8eb",
                height: "48px",
                padding: "8px 16px",
              }}
              suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
            />
          </Form.Item>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <Form.Item
            name="currency"
            label={
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Currency <span style={{ color: "#ff4d4f" }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select currency" }]}
            style={{ marginTop: '12px' }}
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
            name="status"
            label={
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Status 
              </span>
            }
            rules={[{ required: true, message: "Please select status" }]}
            style={{ marginTop: '12px' }}
          >
            <Select
              placeholder="Select Status"
              size="large"
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "10px",
              }}
            >
              <Option value="unpaid">Unpaid</Option>
              {/* <Option value="partially_paid">Partially Paid</Option> */}
              <Option value="paid">Paid</Option>
            </Select>
          </Form.Item>
        </div>
 
        <Form.Item name="discription" label="Description" style={{ marginTop: '12px' }}>
          <Input.TextArea />
        </Form.Item>

        <div className="table-style-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
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
                  if (!checked) {
                    const items = form.getFieldValue("items") || [];
                    items.forEach((item) => {
                      item.tax = 0;
                      item.taxId = undefined;
                    });
                    form.setFieldsValue({ items });
                  }
                  calculateTotals(form.getFieldValue("items"));
                }}
                size="small"
              />
            </div>
          </div>

          <Form.List name="items" style={{ marginTop: "20px" }}>
            {(fields, { add, remove }) => (
              <>
                <table className="billing-items-table">
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
                    {fields.map((field, index) => (
                      <React.Fragment key={field.key}>
                        <tr>
                          <td>
                            <Form.Item
                              {...field}
                              name={[field.name, "item_name"]}
                              style={{ marginTop: "-8px" }}
                            >
                              <Select
                                showSearch
                                placeholder="Select Product"
                                optionFilterProp="children"
                                loading={productsLoading}
                                style={{ width: "100%" }}
                                onChange={(value) => {
                                  const selectedProduct =
                                    productsData?.data?.find(
                                      (product) => product.id === value
                                    );
                                  if (selectedProduct) {
                                    // Get the product's currency from currencies list
                                    const productCurrency =
                                      currenciesData?.find(
                                        (c) => c.id === selectedProduct.currency
                                      );
                                    if (productCurrency) {
                                      setSelectedCurrency(
                                        productCurrency.currencyIcon
                                      );
                                      setSelectedCurrencyId(productCurrency.id);
                                      setIsCurrencyDisabled(true);
                                      form.setFieldsValue({
                                        currency: productCurrency.id,
                                      });
                                    }

                                    // Update only this item's details
                                    const items = form.getFieldValue("items");
                                    const updatedItems = [...items];
                                    updatedItems[index] = {
                                      ...updatedItems[index],
                                      product_id: selectedProduct.id,
                                      id: selectedProduct.id,
                                      item_name: selectedProduct.name,
                                      unit_price: selectedProduct.selling_price,
                                      hsn_sac: selectedProduct.hsn_sac,
                                      tax: selectedProduct.tax,
                                      taxId: selectedProduct.taxId,
                                      currency: selectedProduct.currency,
                                      currencyIcon:
                                        productCurrency?.currencyIcon,
                                    };
                                    form.setFieldsValue({
                                      items: updatedItems,
                                    });
                                    calculateTotals(updatedItems);
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
                                      <div>
                                        <span style={{ fontWeight: 400 }}>
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
                              {...field}
                              name={[field.name, "quantity"]}
                              initialValue={1}
                            >
                              <InputNumber
                                min={1}
                                className="quantity-input"
                                onChange={() =>
                                  calculateTotals(form.getFieldValue("items"))
                                }
                                style={{
                                  width: "100%",
                                }}
                              />
                            </Form.Item>
                          </td>
                          <td>
                            <Form.Item
                              {...field}
                              name={[field.name, "unit_price"]}
                            >
                              <InputNumber
                                className="price-input"
                                formatter={(value) =>
                                  `${selectedCurrency} ${value}`
                                }
                                parser={(value) =>
                                  value.replace(selectedCurrency, "").trim()
                                }
                                onChange={() =>
                                  calculateTotals(form.getFieldValue("items"))
                                }
                                style={{
                                  width: "100%",
                                }}
                              />
                            </Form.Item>
                          </td>
                          <td>
                            <Form.Item
                              {...field}
                              name={[field.name, "hsn_sac"]}
                            >
                              <Input
                                placeholder="HSN/SAC"
                                className="item-input"
                                style={{
                                  width: "100%",
                                  height: "48px",
                                }}
                              />
                            </Form.Item>
                          </td>
                          <td>
                            <Form.Item
                              {...field}
                              name={[field.name, "discount"]}
                              style={{ marginTop: "-8px" }}
                            >
                              <Space>
                                <Form.Item
                                  {...field}
                                  name={[field.name, "discount_type"]}
                                  style={{ margin: 0 }}
                                >
                                  <Select
                                    size="large"
                                    style={{
                                      width: "120px",
                                      borderRadius: "8px",
                                      height: "40px",
                                    }}
                                    defaultValue="percentage"
                                    onChange={() =>
                                      calculateTotals(
                                        form.getFieldValue("items")
                                      )
                                    }
                                  >
                                    <Option value="percentage">
                                      Percentage
                                    </Option>
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
                                    {...field}
                                    name={[field.name, "discount"]}
                                    style={{ marginTop: "-8px", height: "48px" }}
                                  >
                                    <InputNumber
                                      className="item-discount-input"
                                      placeholder={
                                        form.getFieldValue("items")?.[index]
                                          ?.discount_type === "fixed"
                                          ? "Amount"
                                          : "%"
                                      }
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
                                        const items =
                                          form.getFieldValue("items");
                                        if (items?.[index]) {
                                          items[index].discount = value || 0;
                                          form.setFieldsValue({ items });
                                          calculateTotals(items);
                                        }
                                      }}
                                      onChange={(value) => {
                                        const items =
                                          form.getFieldValue("items");
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
                            <Form.Item {...field} name={[field.name, "taxId"]} style={{marginTop:"-14px"}}>
                              <Select
                                placeholder="Select Tax"
                                loading={taxesLoading}
                                disabled={!isTaxEnabled}
                                allowClear
                                style={{
                                  width: "100%",
                                }}
                                onChange={(value, option) => {
                                  const items =
                                    form.getFieldValue("items") || [];
                                  items[index].tax = option?.taxRate;
                                  form.setFieldsValue({ items });
                                  calculateTotals(items);
                                }}
                              >
                                {taxesData?.data?.map((tax) => (
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
                            <div className="amount-fieldss" style={{marginTop:"-5px"}}>
                              <span className="currency-symbolss">
                                {selectedCurrency}
                              </span>
                              <span className="amount-valuess">
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
                                className="delete-btn"
                                icon={<FiTrash2 style={{ color: "#ff4d4f" }} />}
                                onClick={() => {
                                  remove(field.name);
                                  calculateTotals(form.getFieldValue("items"));
                                }}
                              />
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <Text style={{ marginTop: "10px" }}>Sub Total</Text>
              <Form.Item name="sub_total" style={{}}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: "120px",
                    borderRadius: "8px",
                    height: "40px",
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
                marginBottom: "12px",
              }}
            >
              <Text style={{ marginTop: "10px" }}>Item Discount</Text>
              <Form.Item name="item_discount_value" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: "120px",
                    borderRadius: "8px",
                    height: "40px",
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
                marginBottom: "12px",
              }}
            >
              <Text style={{ marginTop: "10px" }}>Item Tax</Text>
              <Form.Item name="item_tax_amount" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: "120px",
                    borderRadius: "8px",
                    height: "40px",
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
                marginBottom: "12px",
              }}
            >
              <Text style={{ marginTop: "10px" }}>Overall Discount</Text>
              <Space>
                <Form.Item name="discount_type" style={{ marginTop: "-8px" }}>
                  <Select
                    size="large"
                    style={{
                      width: "120px",
                      borderRadius: "8px",
                      height: "40px",
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
                <Form.Item name="discount" style={{ margin: 0 }}>
                  <InputNumber
                    size="large"
                    style={{
                      width: "100px",
                      borderRadius: "8px",
                      height: "40px",
                    }}
                    placeholder={
                      form.getFieldValue("discount_type") === "fixed"
                        ? "Amount"
                        : "%"
                    }
                    formatter={(value) => {
                      if (!value && value !== 0) return "";
                      return value.toString().replace(/[^\d.]/g, "");
                    }}
                    parser={(value) => {
                      const parsed = value?.replace(/[^\d.]/g, "");
                      return parsed || "0";
                    }}
                    onStep={(value) => {
                      form.setFieldsValue({ discount: value || 0 });
                      calculateTotals(form.getFieldValue("items"));
                    }}
                    onChange={(value) => {
                      form.setFieldsValue({ discount: value || 0 });
                      calculateTotals(form.getFieldValue("items"));
                    }}
                    onKeyUp={() => {
                      calculateTotals(form.getFieldValue("items"));
                    }}
                  />
                </Form.Item>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.discount_type !== currentValues.discount_type
                  }
                >
                  {({ getFieldValue }) => (
                    <Text style={{ marginLeft: "4px" }}>
                      {getFieldValue("discount_type") === "fixed"
                        ? selectedCurrency
                        : "%"}
                    </Text>
                  )}
                </Form.Item>
              </Space>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <Text style={{ marginTop: "10px" }}>Overall Tax</Text>
              <Form.Item name="overall_tax" style={{ margin: 0 }}>
                <Select
                  placeholder="Select Tax"
                  loading={taxesLoading}
                  allowClear
                  style={{
                    width: "200px",
                    borderRadius: "8px",
                  }}
                  onChange={handleOverallTaxChange}
                >
                  {taxesData?.data?.map((tax) => (
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
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <Text style={{ marginTop: "10px" }}>Overall Tax Amount</Text>
              <Form.Item name="overall_tax_amount" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: "120px",
                    borderRadius: "8px",
                    height: "40px",
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
            <Divider style={{ margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text style={{ marginTop: "10px" }}>Total Amount</Text>
              <Form.Item name="total_amount" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: "120px",
                    borderRadius: "8px",
                    height: "40px",
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
            Create Bill
          </Button>
        </div>
      </Form>

      {vendorModal}
    </Modal>
  );
};

export default CreateBilling;
