import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  DatePicker,
  InputNumber,
  message,
} from "antd";
import {
  FiDollarSign,
  FiX,
  FiCalendar,
  FiCreditCard,
  FiHash,
  FiFileText,
  FiMessageSquare,
} from "react-icons/fi";
import { useCreateDealPaymentMutation } from "./services/dealpaymentApi";
import { useGetAllCurrenciesQuery } from "../../../../settings/services/settingsApi";
import { useGetDealInvoicesQuery } from "../invoices/services/dealinvoiceApi";
import dayjs from "dayjs";

const { Text } = Typography;
const { Option } = Select;

const CreatePayment = ({ open, onCancel, dealId, currentUser }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [createPayment] = useCreateDealPaymentMutation();
  const { data: currencies = [] } = useGetAllCurrenciesQuery({
    page: 1,
    limit: 100
  });
  const { data: invoicesResponse = { data: [] } } = useGetDealInvoicesQuery(dealId);
  const invoicesData = invoicesResponse.data || [];

  const handleInvoiceChange = (value) => {
    const selectedInvoice = invoicesData.find(invoice => invoice.id === value);
    if (selectedInvoice) {
      form.setFieldsValue({
        amount: selectedInvoice.total,
        currency: selectedInvoice.currency
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await createPayment({
        id: dealId,
        data: {
          invoice: values.invoice,
          paidOn: values.paidOn?.format("YYYY-MM-DD"),
          amount: values.amount?.toString(),
          currency: values.currency,
          transactionId: values.transactionId,
          paymentMethod: values.paymentMethod,
          remark: values.remark,
          created_by: currentUser?.name || "Unknown User",
        },
      }).unwrap();
      
      message.success("Payment created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error(error?.data?.message || "Failed to create payment");
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
      width={600}
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
            <FiDollarSign style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Add New Payment
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Add payment details
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
        <Form.Item
          name="invoice"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              <FiFileText style={{ marginRight: "8px", color: "#1890ff" }} />
              Invoice
            </span>
          }
        >
          <Select
            placeholder="Select invoice"
            style={{ width: "100%" }}
            onChange={handleInvoiceChange}
          >
            {invoicesData.map((invoice) => (
              <Option key={invoice.id} value={invoice.id}>
                {invoice.invoiceNumber} - {invoice.customer} ({invoice.total})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="paidOn"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              <FiCalendar style={{ marginRight: "8px", color: "#1890ff" }} />
              Paid On
            </span>
          }
        >
          <DatePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          name="amount"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              <FiDollarSign style={{ marginRight: "8px", color: "#1890ff" }} />
              Amount
            </span>
          }
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Enter amount"
            formatter={(value) => {
              const selectedInvoice = form.getFieldValue('invoice');
              const invoice = invoicesData.find(inv => inv.id === selectedInvoice);
              const currencySymbol = invoice?.currency ? currencies.find(c => c.id === invoice.currency)?.currencyIcon || '₹' : '₹';
              return `${currencySymbol} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }}
            parser={(value) => value.replace(/[^\d.]/g, "")}
          />
        </Form.Item>

        <Form.Item
          name="currency"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              <FiDollarSign style={{ marginRight: "8px", color: "#1890ff" }} />
              Currency
            </span>
          }
        >
          <Select
            placeholder="Select currency"
            style={{ width: "100%" }}
            disabled
          >
            {currencies.map((currency) => (
              <Option key={currency.id} value={currency.id}>
                {currency.currencyIcon} - {currency.currencyName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="transactionId"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              <FiHash style={{ marginRight: "8px", color: "#1890ff" }} />
              Transaction ID
            </span>
          }
        >
          <Input
            placeholder="Enter transaction ID"
            style={{
              borderRadius: "8px",
              height: "40px",
              backgroundColor: "#f8fafc",
            }}
          />
        </Form.Item>

        <Form.Item
          name="paymentMethod"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              <FiCreditCard style={{ marginRight: "8px", color: "#1890ff" }} />
              Payment Method
            </span>
          }
        >
          <Select
            placeholder="Select payment method"
            style={{ width: "100%" }}
          >
            <Option value="cash">Cash</Option>
            <Option value="bank_transfer">Bank Transfer</Option>
            <Option value="credit_card">Credit Card</Option>
            <Option value="debit_card">Debit Card</Option>
            <Option value="upi">UPI</Option>
            <Option value="cheque">Cheque</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="remark"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              <FiMessageSquare style={{ marginRight: "8px", color: "#1890ff" }} />
              Remark
            </span>
          }
        >
          <Input.TextArea
            placeholder="Enter remarks"
            style={{
              borderRadius: "8px",
              backgroundColor: "#f8fafc",
            }}
            rows={4}
          />
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
            Create Payment
          </Button>
        </div>
      </Form> 
    </Modal>
  );
};

export default CreatePayment;
