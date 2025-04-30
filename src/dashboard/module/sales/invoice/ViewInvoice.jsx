import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  Typography,
  Button,
  Table,
  Row,
  Col,
  Card,
  Divider,
  Image,
  Space,
  message,
  Tag,
  Dropdown,
  Spin,
} from "antd";
import {
  FiX,
  FiDownload,
  FiPrinter,
  FiMail,
  FiShare2,
  FiCopy,
  FiEye,
  FiFileText,
  FiPhone,
  FiGlobe,
  FiCreditCard,
} from "react-icons/fi";
import { PiBuildingsFill } from "react-icons/pi";
import dayjs from "dayjs";
import styled from "styled-components";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useGetCustomersQuery } from "../customer/services/custApi";
import { useGetContactsQuery } from "../../crm/contact/services/contactApi";
import { useGetCompanyAccountsQuery } from "../../crm/companyacoount/services/companyAccountApi";
import { useGetCreditNotesQuery } from "../creditnotes/services/creditNoteApi";
import { useGetAllSettingsQuery } from "../../../../superadmin/module/settings/general/services/settingApi";
import { QRCodeSVG } from "qrcode.react";
import "./invoice.scss";
import { useSendInvoiceEmailMutation } from "./services/invoiceApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
// import { sendInvoiceEmail } from './services/invoiceApi';

const { Text } = Typography;

const ViewInvoice = ({ open, onCancel, invoice, onDownload }) => {
  const [billingData, setBillingData] = useState(null);
  const [creditNoteAmount, setCreditNoteAmount] = useState(0);
  const printRef = useRef();

  const loggedInUser = useSelector(selectCurrentUser);
  const id = loggedInUser?.id;
  const { data: customersData } = useGetCustomersQuery();
  const { data: contactsData } = useGetContactsQuery();
  const { data: companyAccountsData } = useGetCompanyAccountsQuery();
  const { data: creditNotesData } = useGetCreditNotesQuery();

  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    // refetch: refetchSettings,
  } = useGetAllSettingsQuery(id);

  console.log("invoice", invoice);

  const [sendInvoiceEmail] = useSendInvoiceEmailMutation();
  // State for company information
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyName, setCompanyName] = useState("Grewox CRM");
  const [companyEmail, setCompanyEmail] = useState("contact@grewox.com");
  const [companyWebsite, setCompanyWebsite] = useState("www.grewox.com");
  const [merchantUpiId, setMerchantUpiId] = useState("");

  // Get company settings from general settings
  useEffect(() => {
    if (
      settingsData?.success &&
      settingsData?.data &&
      settingsData.data.length > 0
    ) {
      const settings = settingsData.data[0];

      // Set company logo if available
      if (settings.companylogo) {
        setCompanyLogo(settings.companylogo);
      }

      // Set company name if available
      if (settings.companyName) {
        setCompanyName(settings.companyName);
      }

      // Set merchant name as email if available
      if (settings.merchant_name) {
        setCompanyEmail(settings.merchant_name);
      }

      // Set merchant UPI ID if available
      if (settings.merchant_upi_id) {
        setMerchantUpiId(settings.merchant_upi_id);
        setCompanyWebsite(settings.merchant_upi_id);
      }
    }
  }, [settingsData]);

  useEffect(() => {
    if (invoice?.customer) {
      const data = customersData?.data?.find((c) => c.id === invoice.customer);
      if (data) {
        console.log("Customer data found:", data); // Add this for debugging
        setBillingData({
          name: data.name,
          email: data.email,
          contact: data.contact,
          tax_number: data.tax_number,
          customerNumber: data.customerNumber,
          billing_address: data.billing_address,
          shipping_address: data.shipping_address,
        });
      } else {
        setBillingData(null);
      }
    }
  }, [invoice, customersData]);

  // Calculate total credit note amount for current invoice
  useEffect(() => {
    if (creditNotesData?.data && invoice?.id) {
      // Filter credit notes for current invoice
      const currentInvoiceCreditNotes = creditNotesData.data.filter(
        (note) => note.invoice === invoice.id
      );

      // Calculate total amount of filtered credit notes
      const totalAmount = currentInvoiceCreditNotes.reduce((sum, note) => {
        return sum + Number(note.amount || 0);
      }, 0);

      setCreditNoteAmount(totalAmount);
    } else {
      setCreditNoteAmount(0);
    }
  }, [creditNotesData, invoice]);

  const renderBillingDetails = () => {
    if (!billingData) {
      return "Loading details...";
    }

    return (
      <>
        {`Name: ${billingData.name}`}
        <br />
        {/* {billingData.email && `Email: ${billingData.email}`}<br /> */}
        {billingData.contact && `Phone: ${billingData.contact}`}
        <br />
        {/* {billingData?.address && (
          <>
            Address:<br />
            {typeof billingData.address === 'string' ? 
              billingData.address : 
              tryParseAddress(billingData.address)
            }
          </>
        )} */}
      </>
    );
  };

  const tryParseAddress = (address) => {
    try {
      if (typeof address === "string") {
        const parsed = JSON.parse(address);
        return (
          <>
            {parsed.street && `${parsed.street},`}
            <br />
            {parsed.city && `${parsed.city},`} {parsed.state}
            <br />
            {parsed.country} {parsed.postal_code}
          </>
        );
      }
      return address;
    } catch (error) {
      return address;
    }
  };

  // Update getPaymentUrl function
  const getPaymentUrl = () => {
    if (!invoice) return "";

    // If there's a UPI ID, create a UPI payment URL
    if (merchantUpiId) {
      const amount = Number(invoice?.amount || 0);
      const tr = invoice?.salesInvoiceNumber || "";
      const pn = companyName || "Merchant";

      // Create UPI URL with parameters
      return `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(
        pn
      )}&am=${amount}&tr=${tr}&tn=Invoice%20Payment`;
    }

    // Fallback to invoice link if no UPI ID
    return `${window.location.origin}/invoice/${invoice.salesInvoiceNumber}`;
  };

  const handleDownload = async () => {
    try {
      const element = document.getElementById("invoice-content");
      if (!element) return;

      message.loading({ content: "Generating PDF...", key: "download" });

      // Add necessary styles before generating PDF
      const styleContent = `
        .bill-card.invoice-container {
          background: white;
          width: 100%;
        }
        .bill-header {
          margin-bottom: 30px;
        }
        .company-info {
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }
        .company-logo {
          max-height: 60px;
          width: auto;
          object-fit: contain;
        }
        .company-details {
          flex: 1;
        }
        .company-details h3 {
          margin: 0 0 5px 0;
          font-size: 24px;
          color: #333;
        }
        .company-details p {
          margin: 0;
          color: #666;
        }
        .bill-details {
          margin: 30px 0;
        }
        .bill-section {
          display: flex;
          justify-content: space-between;
          gap: 40px;
        }
        .bill-to, .bill-info {
          flex: 1;
        }
        .bill-to h4, .bill-info h4 {
          margin: 0 0 15px 0;
          color: #333;
        }
        .vendor-info h5 {
          margin: 0 0 10px 0;
          font-weight: normal;
        }
        .info-row {
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .items-table th {
          background: #f8f9fa;
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        .text-right {
          text-align: right;
        }
        .total-row {
          font-weight: bold;
          background: #f8f9fa;
        }
        .payment-section {
          display: flex;
          gap: 40px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .qr-code {
          text-align: center;
        }
        .qr-info {
          margin-top: 10px;
        }
        .payment-info {
          flex: 1;
        }
        .bank-details {
          margin-top: 15px;
        }
        .bill-notes {
          margin-top: 30px;
        }
        .powered-by {
          margin-top: 20px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          min-width: 100px;
        }
        .status-paid {
          background-color: #e6f4ea;
          color: #1e8e3e;
        }
        .status-unpaid {
          background-color: #fce8e6;
          color: #d93025;
        }
        .status-partial {
          background-color: #f3e8fd;
          color: #8430ce;
        }
        .status-gray {
          background-color: #f1f3f4;
          color: #5f6368;
        }
      `;

      // Add style element to the DOM
      const style = document.createElement("style");
      style.textContent = styleContent;
      element.appendChild(style);

      // Generate canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("invoice-content");
          // Add the same styles to cloned element
          const clonedStyle = document.createElement("style");
          clonedStyle.textContent = styleContent;
          clonedElement.appendChild(clonedStyle);

          // Ensure images are visible
          const clonedImages = clonedElement.getElementsByTagName("img");
          Array.from(clonedImages).forEach((img) => {
            img.style.display = "block";
            img.crossOrigin = "anonymous";
          });
        },
      });

      // Remove the temporary style element
      element.removeChild(style);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${invoice?.salesInvoiceNumber || "download"}.pdf`);

      message.success({
        content: "Invoice downloaded successfully!",
        key: "download",
      });
    } catch (error) {
      console.error("Error downloading invoice:", error);
      message.error({ content: "Failed to download invoice", key: "download" });
    }
  };

  const handlePrint = () => {
    const content = document.getElementById("invoice-content");
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice?.salesInvoiceNumber}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: 'Segoe UI', sans-serif;
              background: white;
            }
            .invoice-content {
              padding: 40px;
              background: white;
            }
          </style>
        </head>
        <body>
          <div class="invoice-content">
            ${content.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleSendInvoice = async () => {
    try {
      const category = invoice.category || "customer";

      let customerData = null;
      customerData = customersData?.data?.find(
        (c) => c.id === invoice.customer
      );

      if (!customerData) {
        if (category === "contact") {
          customerData = contactsData?.data?.find(
            (c) => c.id === invoice.customer
          );
        } else if (category === "company_account") {
          customerData = companyAccountsData?.data?.find(
            (c) => c.id === invoice.customer
          );
        }
      }

      if (!customerData) {
        message.error(
          "Customer data not found. Please make sure the customer exists."
        );
        return;
      }

      if (!customerData.email) {
        message.error(
          "Please add email address for the customer before sending invoice"
        );
        return;
      }

      message.loading({ content: "Sending invoice...", key: "sendInvoice" });

      const element = document.getElementById("invoice-content");
      if (!element) {
        message.error("Could not find invoice content. Please try again.");
        return;
      }

      // Get the HTML content with styles
      const htmlContent = `
        <html>
          <head>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: 'Segoe UI', sans-serif;
                background: white;
              }
              .invoice-container {
                width: 100%;
                background: white;
                padding: 20px;
              }
              .company-logo {
                max-height: 60px;
                width: auto;
              }
              .company-info {
                margin-bottom: 30px;
              }
              .bill-details {
                margin: 20px 0;
              }
              .bill-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              .bill-to, .bill-info {
                flex: 1;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #eaeaea;
              }
              th {
                background: #f0f4fa;
              }
              .text-right {
                text-align: right;
              }
              .total-row {
                font-weight: bold;
                background: #f8fafc;
              }
              .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 6px;
                font-size: 12px;
              }
              .status-paid { color: #059669; background: #d1fae5; }
              .status-unpaid { color: #dc2626; background: #fee2e2; }
              .status-partial { color: #7c3aed; background: #ede9fe; }
              .qr-section {
                text-align: center;
                margin-top: 30px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 12px;
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              ${element.innerHTML}
            </div>
          </body>
        </html>
      `;

      const customer = {
        name:
          customerData.name ||
          customerData.company_name ||
          `${customerData.first_name || ""} ${
            customerData.last_name || ""
          }`.trim(),
        email: customerData.email,
        contact:
          customerData.contact || customerData.phone || customerData.mobile,
        address: customerData.billing_address || customerData.address,
      };

      // Clean up the invoice data
      const cleanInvoice = {
        ...invoice,
        currency: "INR",
        items:
          invoice.items?.map((item) => ({
            ...item,
            unit_price: Number(item.unit_price || item.rate || 0),
            quantity: Number(item.quantity || 0),
            amount: Number(item.amount || 0),
          })) || [],
        total: Number(invoice.total || 0),
        tax: Number(invoice.tax || 0),
        discount: Number(invoice.discount || 0),
        subtotal: Number(invoice.subtotal || 0),
      };

      const payload = {
        invoice: cleanInvoice,
        customer: customer,
        htmlContent: htmlContent,
      };

      await sendInvoiceEmail({
        id: invoice.id,
        data: payload,
      });

      message.success({
        content: "Invoice sent successfully!",
        key: "sendInvoice",
      });
    } catch (error) {
      console.error("Error sending invoice:", error);
      message.error({
        content:
          error?.response?.data?.message ||
          "Failed to send invoice. Please try again.",
        key: "sendInvoice",
      });
    }
  };

  const shareItems = {
    items: [
      {
        key: "email",
        icon: <FiMail />,
        label: "Send to Customer",
        onClick: handleSendInvoice,
      },
      {
        key: "copy",
        icon: <FiCopy />,
        label: "Copy Invoice Link",
        onClick: () => {
          const invoiceUrl = `${window.location.origin}/invoice/${invoice?.salesInvoiceNumber}`;
          navigator.clipboard
            .writeText(invoiceUrl)
            .then(() => message.success("Invoice link copied to clipboard!"))
            .catch(() => message.error("Failed to copy invoice link"));
        },
      },
    ],
  };

  const getColor = (status) => {
    const normalizedStatus = status?.toLowerCase() || "";

    if (normalizedStatus === "paid") return "status-paid";
    if (normalizedStatus === "unpaid") return "status-unpaid";
    if (
      normalizedStatus === "partially_paid" ||
      normalizedStatus === "partially paid"
    )
      return "status-partial";
    return "status-gray";
  };

  // Update the maskAccountNumber function to handle both string and number types
  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return "XXXX XXXX XXXX";

    // Convert to string if it's a number
    const accountStr = accountNumber.toString();
    const last4Digits = accountStr.slice(-4);
    return `XXXX XXXX XXXX ${last4Digits}`;
  };

  // Function to mask IFSC code
  const maskIFSC = (ifsc) => {
    if (!ifsc) return "XXXX0000000";
    const firstFour = ifsc.slice(0, 4);
    return `${firstFour}0000XXX`;
  };

  if (!invoice) return null;

  return (
    <>
      <Modal
        title={null}
        open={open}
        onCancel={onCancel}
        footer={null}
        width={1000}
        destroyOnClose={true}
        centered
        closeIcon={null}
        className="pro-modal custom-modal invoice-modal"
        maskClosable={false}
        style={{
          "--antd-arrow-background-color": "#ffffff",
        }}
        styles={{
          body: {
            padding: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.45)",
          },
          content: {
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          },
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
            icon={<FiX />}
            onClick={onCancel}
            style={{
              color: "#ffffff",
              position: "absolute",
              right: "24px",
              top: "24px",
            }}
          />
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
                View Invoice
              </h2>
              <Text
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Invoice #{invoice?.salesInvoiceNumber}
              </Text>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          <Spin spinning={isLoadingSettings}>
            <div className="view-billing-container">
              <div className="view-billing-content">
                <div
                  className="bill-card invoice-container"
                  id="invoice-content"
                >
                  <div className="invoice-header">
                    <div className="company-info">
                      <div className="company-left">
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '20px',
                          background: '#f0f7ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #e6f4ff'
                        }}>
                          <PiBuildingsFill style={{
                            width: '80px',
                            height: '80px',
                            color: '#1f2937'
                          }} />
                        </div>
                        <div>
                          <div className="company-name">
                            {loggedInUser?.username || "Company Name"}
                          </div>
                          <div className="company-address">
                            {loggedInUser?.address}
                          </div>
                        </div>
                      </div>
                      <div className="company-right">
                        <div>
                          <FiPhone
                            style={{
                              marginRight: "8px",
                              display: "inline",
                              color: "#1F2937",
                            }}
                          />
                          {loggedInUser?.phone || "N/A"}
                        </div>
                        <div>
                          <FiMail
                            style={{
                              marginRight: "8px",
                              display: "inline",
                              color: "#1F2937",
                            }}
                          />
                          {loggedInUser?.email || "N/A"}
                        </div>
                        <div>
                          <FiGlobe
                            style={{
                              marginRight: "8px",
                              display: "inline",
                              color: "#1F2937",
                            }}
                          />
                          {loggedInUser?.website || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="invoice-title">
                      <div className="title-text">TAX INVOICE</div>
                      <div className="gstin-text">
                        GSTIN:{" "}
                        <span style={{ fontWeight: 900 }}>
                          {loggedInUser?.gstIn || "29ABCDE1234F1Z5"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="invoice-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Invoice No</span>
                        <span className="detail-value">
                          {invoice?.salesInvoiceNumber}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Issue Date</span>
                        <span className="detail-value">
                          {invoice?.issueDate
                            ? dayjs(invoice.issueDate).format("DD/MM/YYYY")
                            : "-"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Due Date</span>
                        <span className="detail-value">
                          {invoice?.dueDate
                            ? dayjs(invoice.dueDate).format("DD/MM/YYYY")
                            : "-"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Customer No</span>
                        <span className="detail-value">
                          {billingData?.customerNumber || "1"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="customer-details">
                    <div className="customer-header">
                      <span>Customer Details</span>
                    </div>
                    <div className="customer-grid">
                      <div className="info-group">
                        <div className="info-row">
                          <span className="label">Name</span>
                          <span className="value">
                            {billingData?.name || "-"}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="label">Contact</span>
                          <span className="value">
                            {billingData?.contact || "-"}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="label">GSTIN</span>
                          <span className="value">
                            {billingData?.tax_number || "-"}
                          </span>
                        </div>
                      </div>
                      <div className="info-group">
                        <div className="info-row">
                          <span className="label">Address</span>
                          <span className="value address-value">
                            {(() => {
                              try {
                                if (billingData?.billing_address) {
                                  const addr = JSON.parse(
                                    billingData.billing_address
                                  );
                                  return addr.street ? (
                                    <>
                                      {addr.street},<br />
                                      {addr.city} {addr.postal_code},<br />
                                      {addr.state}
                                    </>
                                  ) : (
                                    "-"
                                  );
                                }
                              } catch (e) {}
                              return billingData?.billing_address || "-";
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bill-items" style={{ margin: "16px" }}>
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th style={{ fontWeight: 700 }}>Item</th>
                          <th style={{ fontWeight: 700 }}>HSN/SAC</th>
                          <th style={{ fontWeight: 700 }}>Qty</th>
                          <th style={{ fontWeight: 700 }}>Rate</th>
                          <th style={{ fontWeight: 700 }}>Tax %</th>
                          <th style={{ fontWeight: 700 }}>Tax Amount</th>
                          <th style={{ fontWeight: 700 }}>Discount</th>
                          <th style={{ fontWeight: 700 }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(invoice.items) &&
                          invoice.items.map((item, index) => {
                            const quantity = Number(item.quantity) || 0;
                            const rate =
                              Number(item.unit_price || item.rate) || 0;
                            const taxRate = Number(item.tax_rate) || 0;
                            const taxAmount = Number(item.tax_amount) || 0;
                            const discount = item.discount
                              ? `${item.discount}${
                                  item.discount_type === "percentage"
                                    ? "%"
                                    : "₹"
                                }`
                              : "-";
                            const amount = Number(item.amount) || 0;

                            return (
                              <tr key={index}>
                                <td>{item.name || item.description || "-"}</td>
                                <td>{item.hsn_sac || "-"}</td>
                                <td>{quantity}</td>
                                <td>
                                  ₹
                                  {rate.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                                <td>{taxRate}%</td>
                                <td>
                                  ₹
                                  {taxAmount.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                                <td>{discount}</td>
                                <td>
                                  ₹
                                  {amount.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>

                    <div className="totals-section">
                      <div className="total-row">
                        <div className="total-label">Discount</div>
                        <div className="total-value">
                          ₹
                          {Number(invoice?.discount || 0).toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 }
                          )}
                        </div>
                      </div>
                      <div className="total-row">
                        <div className="total-label">Total Amount</div>
                        <div className="total-value">
                          ₹
                          {Number(invoice?.total || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div className="total-row">
                        <div className="total-label">Credit Note</div>
                        <div className="total-value credit-note">
                          -₹
                          {Number(creditNoteAmount || 0).toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 }
                          )}
                        </div>
                      </div>
                      <div className="total-row">
                        <div className="total-label">Final Amount</div>
                        <div className="total-value">
                          ₹
                          {Number(invoice?.amount || 0).toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bill-footer">
                    <div
                      className="payment-section"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        className="qr-code"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <QRCodeSVG
                            value={getPaymentUrl()}
                            size={200}
                            level="H"
                            includeMargin={true}
                            padding={0}
                          />
                          <div
                            style={{ textAlign: "center", marginTop: "12px" }}
                          >
                            <p
                              style={{
                                margin: "4px 0",
                                fontSize: "16px",
                                fontWeight: "700",
                                color: "#6B7280",
                              }}
                            >
                              Scan to Pay
                            </p>
                            <p
                              style={{
                                margin: "4px 0",
                                fontWeight: "600",
                                fontSize: "16px",
                                color: "#111827",
                              }}
                            >
                              ₹
                              {Number(invoice?.amount || 0).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className="bank-details"
                        style={{
                          flex: 1,
                          paddingLeft: "24px",
                          backgroundColor: "#f8f9fa",
                          padding: "20px",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          position: "relative",
                        }}
                      >
                        {invoice?.payment_status === "paid" && (
                          <div className="paid-stamp">
                            <div className="paid-icon">✓</div>
                            <div className="paid-text">PAID</div>
                          </div>
                        )}
                        <h4
                          style={{
                            marginBottom: "16px",
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#1f2937",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <FiCreditCard style={{ fontSize: "18px" }} /> Bank
                          Details
                        </h4>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            gap: "12px 24px",
                            fontSize: "14px",
                          }}
                        >
                          <span style={{ color: "#6b7280", fontWeight: 500 }}>
                            Bank:
                          </span>
                          <span style={{ color: "#111827", fontWeight: 500 }}>
                            {loggedInUser?.bankname || "N/A"}
                          </span>

                          <span style={{ color: "#6b7280", fontWeight: 500 }}>
                            Account Type:
                          </span>
                          <span style={{ color: "#111827", fontWeight: 500 }}>
                            {loggedInUser?.accounttype || "N/A"}
                          </span>

                          <span style={{ color: "#6b7280", fontWeight: 500 }}>
                            Account No:
                          </span>
                          <span
                            style={{
                              color: "#111827",
                              fontWeight: 500,
                              fontFamily: "monospace",
                            }}
                          >
                            {loggedInUser?.accountnumber
                              ? maskAccountNumber(loggedInUser.accountnumber)
                              : "N/A"}
                          </span>

                          <span style={{ color: "#6b7280", fontWeight: 500 }}>
                            IFSC:
                          </span>
                          <span
                            style={{
                              color: "#111827",
                              fontWeight: 500,
                              fontFamily: "monospace",
                            }}
                          >
                            {loggedInUser?.ifsc || "N/A"}
                          </span>

                          <span style={{ color: "#6b7280", fontWeight: 500 }}>
                            Branch:
                          </span>
                          <span style={{ color: "#111827", fontWeight: 500 }}>
                            {loggedInUser?.banklocation || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="powered-by"
                      style={{
                        margin: "12px",
                        textAlign: "center",
                        color: "#9CA3AF",
                        fontSize: "12px",
                        lineHeight: "1.5",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Powered by{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: "14px",
                          color: "#1890ff",
                        }}
                      >
                        Grewox CRM
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Divider style={{ margin: "24px 0" }} />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <Button
                icon={<FiPrinter />}
                onClick={handlePrint}
                size="large"
                style={{
                  padding: "8px 24px",
                  height: "44px",
                  borderRadius: "10px",
                  border: "1px solid #e6e8eb",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                Print
              </Button>
              <Dropdown
                menu={shareItems}
                trigger={["click"]}
                placement="topRight"
              >
                <Button
                  icon={<FiShare2 />}
                  size="large"
                  style={{
                    padding: "8px 24px",
                    height: "44px",
                    borderRadius: "10px",
                    border: "1px solid #e6e8eb",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  Share
                </Button>
              </Dropdown>
              <Button
                type="primary"
                icon={<FiDownload />}
                onClick={handleDownload}
                size="large"
                style={{
                  padding: "8px 24px",
                  height: "44px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                  border: "none",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                Download
              </Button>
            </div>
          </Spin>
        </div>
      </Modal>

      <style jsx global>{`
        .invoice-modal {
          .ant-modal-content {
            padding: 0;
            border-radius: 0;
            overflow: hidden;
          }

          .view-billing-container {
            background: #ffffff;
            margin-bottom: 0;
            padding-bottom: 0;
          }

          .view-billing-content {
            margin-bottom: 0;
            padding-bottom: 0;
          }

          .bill-card {
            margin-bottom: 0;
            padding-bottom: 0;
          }

          .company-logo {
            max-height: 80px;
            width: auto;
            object-fit: contain;
          }

          .company-info {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid #f0f0f0;
          }

          .company-details {
            h3 {
              margin: 0 0 8px 0;
              font-size: 24px;
              font-weight: 600;
              color: #1f2937;
            }

            p {
              margin: 0;
              color: #6b7280;
              font-size: 14px;
            }
          }

          .bill-section {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 32px;
            margin-bottom: 32px;
          }

          .bill-to,
          .bill-info {
            h4 {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 16px;
            }
          }

          .vendor-info {
            h5 {
              font-size: 14px;
              font-weight: 500;
              color: #4b5563;
              margin-bottom: 8px;
            }

            p {
              margin: 4px 0;
              color: #6b7280;
              font-size: 14px;
            }
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;

            .label {
              color: #6b7280;
            }

            .value {
              color: #1f2937;
              font-weight: 500;
            }
          }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 0;
          }

          .items-table th,
          .items-table td {
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
          }

          .items-table th {
            background: #f9fafb;
            font-weight: 500;
            color: #374151;
          }

          .items-table td {
            color: #1f2937;
          }

          .items-table th:last-child,
          .items-table td:last-child {
            text-align: right;
          }

          .totals-section {
            border-top: none;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            border-top: none;
            font-size: 13px;
          }

          .total-label {
            color: #6b7280;
          }

          .total-value {
            font-weight: 500;
            color: #111827;
          }

          .credit-note {
            color: #dc2626;
          }

          .payment-section {
            background: #f9fafb;
            border-radius: 0;
            padding: 20px;
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 24px;
            border: 1px solid #f0f0f0;
            margin-bottom: 10px;
          }

          .qr-code {
            text-align: center;

            svg {
              padding: 16px;
              background: white;
              border-radius: 0;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .qr-info {
              margin-top: 12px;

              p {
                margin: 4px 0;
                color: #4b5563;
                font-size: 14px;

                &.amount {
                  font-weight: 600;
                  color: #1f2937;
                }
              }
            }
          }

          .payment-info {
            h4 {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 16px;
            }

            p {
              margin: 8px 0;
              color: #6b7280;
              font-size: 14px;
            }

            .bank-details {
              margin-top: 16px;

              p {
                margin: 8px 0;

                strong {
                  color: #4b5563;
                  font-weight: 500;
                }
              }
            }
          }

          .bill-notes {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #f0f0f0;

            h4 {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 12px;
            }

            p {
              color: #6b7280;
              font-size: 14px;
              margin: 8px 0;
            }

            .powered-by {
              margin: 12px 0 0 0;
              padding: 8px;
              text-align: center;
              color: #9ca3af;
              font-size: 12px;
              line-height: 1.5;
              letter-spacing: 0.5px;
              border-top: 1px solid #f0f0f0;
            }
          }

          .status-badge {
            padding: 6px 12px;
            border-radius: 0;
            font-size: 13px;
            font-weight: 500;

            &.status-paid {
              background-color: #dcfce7;
              color: #15803d;
              border: none;
            }

            &.status-unpaid {
              background-color: #fee2e2;
              color: #dc2626;
              border: none;
            }

            &.status-partial {
              background-color: #f3e8ff;
              color: #7e22ce;
              border: none;
            }

            &.status-gray {
              background-color: #f3f4f6;
              color: #4b5563;
              border: none;
            }
          }

          // Update modal header buttons to remove border radius
          .modal-header {
            .ant-btn {
              border-radius: 0;
            }
          }

          // Update action buttons at bottom to remove border radius
          .ant-btn {
            border-radius: 0;
          }

          .company-header {
            background: #f5f9ff;
            color: #1b2434;
            padding: 12px;
            margin-bottom: 8px;
          }

          .company-info-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            padding-bottom: 12px;
            margin-bottom: 8px;
            border-bottom: 1px solid rgba(27, 36, 52, 0.15);
          }

          .company-main-info {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            flex: 1;
            max-width: 70%;

            .company-name-logo {
              flex-shrink: 0;

              .company-logo {
                height: 40px;
                width: 40px;
                object-fit: contain;
                background: white;
                padding: 0;
                border-radius: 4px;
              }

              .company-logo-placeholder {
                height: 40px;
                width: 40px;
                background: white;
                color: #1b2434;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: 600;
                border-radius: 4px;
              }
            }

            .company-details {
              padding-top: 2px;

              h2 {
                color: #1b2434;
                font-size: 20px;
                font-weight: 600;
                margin: 0 0 2px 0;
                line-height: 1.2;
              }

              .company-address {
                color: #1b2434;
                font-size: 13px;
                line-height: 1.2;
              }
            }
          }

          .company-contact-details {
            text-align: right;
            max-width: 40%;

            .contact-info {
              .contact-item {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 4px;
                margin: 4px 0;
                color: #333333;
                font-size: 13px;
                line-height: 1.5;

                .contact-icon {
                  color: #2563eb;
                  font-size: 14px;
                }

                .contact-label {
                  color: #2563eb;
                  font-weight: 600;
                }

                .contact-value {
                  color: #1b2434;
                }
              }
            }
          }

          .company-footer {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;

            .gst-info {
              width: 100%;
              text-align: center;
              font-size: 15px;
              letter-spacing: 0.5px;

              .gst-label {
                color: rgba(255, 255, 255, 0.7);
                margin-right: 8px;
              }

              .gst-number {
                color: white;
                font-weight: 500;
                letter-spacing: 1px;
              }
            }
          }

          .bill-details {
            margin: 0;
            background: #fff;
          }

          .document-header {
            padding: 8px 12px;
            margin-bottom: 4px;
            border-bottom: 1px solid #e5e7eb;
            background: transparent;
          }

          .title-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .doc-title {
            font-size: 16px;
            font-weight: 600;
            margin: 0;
            line-height: 1.2;
          }

          .gstin-info {
            font-size: 13px;
            color: #2563eb;
            font-weight: 500;
          }

          .invoice-details-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            padding: 8px 12px;
            background: #fff;
          }

          .invoice-detail-item {
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .invoice-detail-label {
            color: #2563eb;
            font-weight: 500;
            font-size: 14px;
          }

          .invoice-detail-value {
            color: #1f2937;
            font-weight: 600;
            font-size: 14px;
          }

          .invoice-detail-separator {
            color: #2563eb;
            opacity: 0.5;
            margin: 0 1px;
          }

          .section-header {
            padding: 8px 16px;
            background: #f8fafc;
            font-weight: 500;
            color: #1f2937;
            font-size: 12px;
            border-bottom: 1px solid #f0f0f0;
          }

          .details-content {
            padding: 8px 0;
          }

          .detail-row {
            display: flex;
            padding: 4px 16px;
            align-items: flex-start;
            font-size: 12px;

            &:hover {
              background: #f8fafc;
            }
          }

          .detail-label {
            width: 100px;
            color: #2563eb;
            font-weight: 500;
            font-size: 11px;
            padding-right: 12px;
          }

          .detail-value {
            flex: 1;
            color: #1f2937;
            font-size: 12px;
            line-height: 1.4;
          }

          .items-table {
            font-size: 12px;

            th {
              padding: 8px;
              font-size: 11px;
              font-weight: 00;
            }

            td {
              padding: 6px 8px;
              font-size: 12px;
            }
          }

          // Update the customer section to be more compact
          .customer-section {
            padding: 12px 16px;
            background: #fff;
            border-radius: 4px;
          }

          .customer-row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            font-size: 14px;
            line-height: 1.5;
          }

          .customer-label {
            color: #6b7280;
            font-weight: 500;
            width: 60px;
          }

          .customer-value {
            color: #111827;
            font-weight: 500;
            margin-left: 12px;
          }

          .customer-separator {
            color: #d1d5db;
            margin: 0 8px;
          }

          .divider {
            color: #d1d5db;
            margin: 0 12px;
          }

          // Make modal more compact
          .invoice-modal {
            .ant-modal {
              width: 30% !important;
              min-width: 350px;
            }

            .ant-modal-content {
              padding: 0;
            }

            .view-billing-container {
              padding: 0;
            }

            .bill-card {
              padding: 0;
            }
          }

          .invoice-header {
            background: #f0f7ff;
            padding: 24px;
            border-bottom: 1px solid #e5e7eb;
          }

          .company-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
          }

          .company-left {
            display: flex;
            gap: 16px;
            align-items: center;
          }

          .company-logo {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            background: white;
            padding: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }

          .company-name {
            font-size: 32px;
            font-weight: 900;
            color: #1f2937;
            margin-bottom: 4px;
            text-transform: uppercase;
          }

          .company-address {
            color: #6b7280;
            font-size: 14px;
          }

          .company-right {
            text-align: right;
            font-size: 14px;
            color: #1f2937;
          }

          .invoice-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
          }

          .title-text {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
          }

          .gstin-text {
            color: #1f2937;
            font-size: 18px;
            font-weight: 700;
            margin-top: 10px;
          }

          .gstin-text span {
            font-weight: 900;
            font-size: 20px;
            color: #1f2937;
          }

          .customer-details {
            background: #fff;
            border-bottom: 1px solid #e5e7eb;
          }

          .details-content {
            padding: 0;
          }

          .customer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }

          .customer-info {
            max-width: 400px;
          }

          .info-row {
            display: flex;
            align-items: flex-start;
            margin-bottom: 8px;
            font-size: 14px;
          }

          .info-label {
            width: 80px;
            color: #6b7280;
            font-weight: 500;
          }

          .info-value {
            flex: 1;
            color: #1f2937;
            padding-left: 16px;
          }

          .address-info {
            padding-left: 16px;
            border-left: 1px solid #e5e7eb;
          }

          .address-title {
            color: #6b7280;
            font-weight: 500;
            font-size: 14px;
            margin-bottom: 8px;
          }

          .address-value {
            color: #1f2937;
            font-size: 14px;
            line-height: 1.5;
          }

          .address-value > div {
            margin-bottom: 4px;
          }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }

          .items-table th,
          .items-table td {
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            text-align: left;
          }

          .items-table th {
            background: #f9fafb;
            font-weight: 500;
            color: #374151;
          }

          .items-table td {
            color: #1f2937;
          }

          .items-table tbody tr:hover {
            background: #f9fafb;
          }

          .items-table tfoot tr {
            background: #fff;
          }

          .items-table tfoot td {
            font-weight: 500;
          }

          .items-table td:last-child,
          .items-table th:last-child {
            text-align: right;
          }

          .total-row td {
            font-weight: 600;
            color: #1f2937;
            background: #f9fafb;
          }

          .credit-note-row td {
            color: #1f2937;
          }

          .credit-amount {
            color: #dc2626 !important;
          }

          .customer-header {
            background: #f9fafb;
            padding: 8px 24px;
            font-size: 14px;
            font-weight: 700;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
          }

          .customer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            padding: 16px 24px;
            gap: 24px;
          }

          .info-group {
            display: flex;
            flex-direction: column;
          }

          .info-row {
            display: flex;
            align-items: flex-start;
            font-size: 13px;
            line-height: 1.4;
          }

          .label {
            width: 60px;
            color: #6b7280;
            font-weight: 500;
          }

          .value {
            flex: 1;
            color: #111827;
            padding-left: 12px;
          }

          .address-value {
            line-height: 1.5;
          }

          .invoice-details {
            padding: 12px 24px;
            background: #fff;
            border-bottom: 1px solid #e5e7eb;
          }

          .details-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }

          .detail-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .detail-label {
            font-size: 13px;
            color: #6b7280;
            font-weight: 500;
          }

          .detail-value {
            font-size: 13px;
            color: #111827;
            font-weight: 600;
          }

          .summary-section {
            border-top: 1px solid #e5e7eb;
            margin-top: -1px;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 24px;
            font-size: 13px;
            border-bottom: 1px solid #e5e7eb;
          }

          .summary-row span:first-child {
            color: #6b7280;
          }

          .summary-row span:last-child {
            font-weight: 500;
            color: #111827;
          }

          .summary-row.total {
            background: #f9fafb;
          }

          .summary-row.total span {
            font-weight: 600;
            color: #111827;
          }

          .summary-row.credit-note span:last-child {
            color: #dc2626;
          }

          .summary-row.final {
            background: #f9fafb;
          }

          .summary-row.final span {
            font-weight: 600;
            color: #111827;
          }

          .items-table {
            margin-bottom: 0;
            border-bottom: none;
          }

          .bank-details {
            position: relative;
            overflow: hidden;
          }

          .paid-stamp {
            position: absolute;
            top: 0;
            right: 0;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 8px 16px;
            border-bottom-left-radius: 16px;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            z-index: 1;
          }

          .paid-icon {
            color: white;
            font-size: 16px;
            font-weight: bold;
            line-height: 1;
          }

          .paid-text {
            color: white;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
        }
      `}</style>
    </>
  );
};

export default ViewInvoice;
