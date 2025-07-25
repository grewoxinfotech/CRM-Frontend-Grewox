import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  DatePicker,
  Row,
  Col,
  Divider,
  InputNumber,
  Select,
  message,
} from "antd";
import { FiFileText, FiX, FiCalendar, FiDollarSign } from "react-icons/fi";
import dayjs from "dayjs";
import "./debitnote.scss";
import { useCreateDebitNoteMutation } from "./services/debitnoteApi";
import { useGetBillingsQuery } from "../billing/services/billingApi";
import { useSelector } from "react-redux";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateDebitNote = ({ open, onCancel, onSubmit }) => {
  const getCompanyId = (state) => {
    const user = state.auth.user;
    return user?.companyId || user?.company_id || user?.id;
  };

  const companyId = useSelector(getCompanyId);

  const [form] = Form.useForm();
  const [createDebitNote] = useCreateDebitNoteMutation();
  const {
    data: billsDataa,
    isLoading: billsLoading,
    refetch: refetchBills,
  } = useGetBillingsQuery({
    page: 1,
    pageSize: -1,
    search: '',
    company_id: companyId
  });

  const billsData = billsDataa?.message;

  const { data: currenciesData } = useGetAllCurrenciesQuery();

  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);

 

  const handleBillSelect = (value) => {
    const selectedBill = billsData?.data?.find(
      (bill) => bill.id === value || bill._id === value
    );

    if (selectedBill) {
      const billAmount = selectedBill.amount || selectedBill.total || 0;
      const remainingAmount = billAmount - (selectedBill.debitNoteAmount || 0);

      // Enhanced validation for bill amount
      if (remainingAmount <= 0) {
        message.error(
          "Cannot create debit note for bill with no remaining amount"
        );
        form.resetFields(["bill", "amount", "currency", "currency_icon"]);
        return;
      }

      // Parse items to get currency icon
      let currencyIcon = "";
      try {
        const items = JSON.parse(selectedBill.items);
        if (items && items.length > 0) {
          currencyIcon = items[0].currencyIcon || "";
        }
      } catch (e) {
        console.error("Error parsing items:", e);
      }

      // Find currency details from the selected bill
      const currencyDetails = currenciesData?.find(
        (curr) => curr.id === selectedBill.currency
      );
      if (currencyDetails) {
        setSelectedCurrency(currencyDetails.currencyIcon);
        setSelectedCurrencyId(currencyDetails.id?.toString());
      }

      form.setFieldsValue({
        amount: remainingAmount,
        max_amount: remainingAmount,
        currency: selectedBill.currency,
        currency_icon: currencyIcon || currencyDetails?.currencyIcon,
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Check if amount is 0 or less
      if (!values.amount || values.amount <= 0) {
        message.error("Debit note amount must be greater than zero");
        return;
      }
      
      // Check for decimal values in amount field
      if (values.amount && values.amount.toString().includes('.')) {
        message.error("Only enter whole numbers. Decimal values are not accepted.");
        setLoading(false);
        return;
      }

      const formattedData = {
        bill: values.bill,
        date: values.date?.format("YYYY-MM-DD"),
        amount: values.amount,
        description: values.description || "",
        currency: values.currency,
      };

      await createDebitNote(formattedData).unwrap();
      message.success("Debit note created successfully");

      // Refetch bills data after creating debit note
      await refetchBills();

      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error("Failed to create debit note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
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
              Create New Debit Note
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create debit note
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
        {/* Hidden fields to store currency and currency icon */}
        <Form.Item name="currency" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="currency_icon" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="max_amount" hidden>
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name="bill"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiFileText
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Bill Number <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select bill number" }]}
            >
              <Select
                placeholder="Select bill number"
                size="large"
                loading={billsLoading}
                showSearch
                optionFilterProp="children"
                onChange={handleBillSelect}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {billsData?.data
                  ?.filter(
                    (bill) =>
                      // Filter out paid bills
                      bill.status !== "paid" &&
                      // Filter out bills with zero or invalid amount
                      (bill.amount > 0 || bill.total > 0)
                  )
                  .map((bill) => {
                    const billAmount = bill.amount || bill.total || 0;
                    const remainingAmount =
                      billAmount - (bill.debitNoteAmount || 0);

                    return (
                      <Option
                        key={bill.id || bill._id}
                        value={bill.id || bill._id}
                        disabled={remainingAmount <= 0}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{bill.billNumber || bill.bill_number}</span>
                          <span
                            style={{ color: "#1890ff", paddingLeft: "100px" }}
                          >
                            Remaining: {selectedCurrency}
                            {remainingAmount.toFixed(2)}
                          </span>
                        </div>
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12} className="date-picker-col">
            <Form.Item
              name="date"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCalendar
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select date" }]}
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
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12} style={{ marginTop: '12px' }}>
            <Form.Item
              name="amount"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiDollarSign
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Amount <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[
                { required: true, message: "Please enter amount" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || value <= 0) {
                      return Promise.reject(
                        new Error("Amount must be greater than zero")
                      );
                    }
                    
                    if (value && value.toString().includes('.')) {
                      return Promise.reject(
                        new Error("Only enter whole numbers. Decimal values are not accepted.")
                      );
                    }
                    
                    const maxAmount = getFieldValue("max_amount");
                    if (
                      !maxAmount ||
                      parseFloat(value) <= parseFloat(maxAmount)
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Amount cannot exceed bill amount")
                    );
                  },
                }),
              ]}
            >
              <InputNumber
                placeholder="Enter amount"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
                formatter={(value) => {
                  if (!value) return "";
                  const currencyIcon =
                    form.getFieldValue("currency_icon") || "";
                  return `${currencyIcon} ${value}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  );
                }}
                parser={(value) => {
                  if (!value) return "";
                  const currencyIcon =
                    form.getFieldValue("currency_icon") || "";
                  const parsedValue = value.replace(
                    new RegExp(`${currencyIcon}|,|\\s`, "g"),
                    ""
                  );
                  
                  if (parsedValue && parsedValue.toString().includes('.')) {
                    message.warning("Only enter whole numbers. Decimal values are not accepted.");
                    return parsedValue;
                  }
                  
                  return parsedValue;
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              <FiFileText style={{ marginRight: "8px", color: "#1890ff" }} />
              Description
            </span>
          }
          style={{ marginTop: '12px' }}
        >
          <TextArea
            placeholder="Enter description"
            rows={4}
            style={{
              borderRadius: "10px",
              backgroundColor: "#f8fafc",
            }}
          />
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
            onClick={() => {
              const amount = form.getFieldValue('amount');
              if (amount && amount.toString().includes('.')) {
                message.error("Only enter whole numbers. Decimal values are not accepted.");
                return;
              }
            }}
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
            Create Debit Note
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateDebitNote;
