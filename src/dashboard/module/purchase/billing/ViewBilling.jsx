import React, { useEffect, useState } from "react";
import {
  Spin,
  Button,
  Space,
  message,
  Modal,
  Typography,
  Divider,
  Dropdown,
} from "antd";
import { useGetVendorsQuery } from "./services/billingApi";
import { useGetAllSettingsQuery } from "../../../../superadmin/module/settings/general/services/settingApi";
import { useGetDebitNotesQuery } from "../debitnote/services/debitnoteApi";
import { QRCodeSVG } from "qrcode.react";
import {
  FiDownload,
  FiMail,
  FiShare2,
  FiX,
  FiFileText,
  FiPhone,
  FiGlobe,
  FiCreditCard,
  FiCopy,
} from "react-icons/fi";
import { PiBuildingsFill } from "react-icons/pi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import "./billing.scss";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetAllTaxesQuery } from "../../settings/tax/services/taxApi";

const { Text } = Typography;

// Add a helper function for safe number formatting
const formatNumber = (value) => {
  return Number(value || 0).toFixed(2);
};

const ViewBilling = ({ data, isOpen, onClose }) => {
  // Get logged in user data
  const loggedInUser = useSelector(selectCurrentUser);

  // Fetch vendors data
  const { data: vendorsData } = useGetVendorsQuery();
  const { data: settingsData, isLoading: isSettingsLoading } =
    useGetAllSettingsQuery();
  const { data: debitNotesData } = useGetDebitNotesQuery();

  // State for company information
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [merchantUpiId, setMerchantUpiId] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyGSTIN, setCompanyGSTIN] = useState("");

  // State for bank details
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const { data: taxesData, isLoading: taxesLoading } = useGetAllTaxesQuery();

  // State for debit note amount
  const [debitNoteAmount, setDebitNoteAmount] = useState(0);



  // Share menu items
  const shareItems = {
    items: [
      {
        key: "email",
        icon: <FiMail />,
        label: "Share via Email",
        onClick: () => handleShareViaEmail(),
      },
      {
        key: "copy",
        icon: <FiCopy />,
        label: "Copy Link",
        onClick: () => handleCopyLink(),
      },
    ],
  };

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return "XXXX XXXX XXXX";

    // Convert to string if it's a number
    const accountStr = accountNumber.toString();
    const last4Digits = accountStr.slice(-4);
    return `XXXX XXXX XXXX ${last4Digits}`;
  };

  // Set company information from logged in user
  useEffect(() => {
    if (loggedInUser) {
      setCompanyName(loggedInUser.username || "Raiser CRM");
      setCompanyEmail(loggedInUser.email || "");
      setCompanyWebsite(loggedInUser.website || "");
      setCompanyAddress(loggedInUser.address || "");
      setCompanyPhone(loggedInUser.phone || "");
      setCompanyGSTIN(loggedInUser.gstIn || "");
      setCompanyLogo(loggedInUser.profilePic || null);

      // Set bank details from loggedInUser
      setBankName(loggedInUser.bank_name || "");
      setAccountType(loggedInUser.account_type || "");
      setAccountNumber(loggedInUser.account_number || "");
      setIfscCode(loggedInUser.ifsc_code || "");
      setBankBranch(loggedInUser.bank_branch || "");
    }
  }, [loggedInUser]);

  // Get UPI ID from settings if available
  useEffect(() => {
    if (
      settingsData?.success &&
      settingsData?.data &&
      settingsData.data.length > 0
    ) {
      const settings = settingsData.data[0];
      if (settings.merchant_upi_id) {
        setMerchantUpiId(settings.merchant_upi_id);
      }
    }
  }, [settingsData]);

  // Calculate total debit note amount for current bill
  useEffect(() => {
    if (debitNotesData?.data && data?.id) {
      // Filter debit notes for current bill
      const currentBillDebitNotes = debitNotesData.data.filter(
        (note) => note.bill === data.id || note.bill === data._id
      );

      // Calculate total amount of filtered debit notes
      const totalAmount = currentBillDebitNotes.reduce((sum, note) => {
        return sum + Number(note.amount || 0);
      }, 0);

      setDebitNoteAmount(totalAmount);
    } else {
      setDebitNoteAmount(0);
    }
  }, [debitNotesData, data]);

  if (!data) {
    return null;  // Return nothing if no data
  }

  // Find vendor details using vendor ID
  const vendorDetails =
    vendorsData?.data?.find((vendor) => vendor.id === data.vendor) || {};

  // Format vendor address
  const formatVendorAddress = () => {
    if (!vendorDetails) return "";
    const addressParts = [vendorDetails.address].filter(Boolean);
    return addressParts.join(", ");
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

  // Parse items safely
  let items = [];
  try {
    items = data?.items ? JSON.parse(data.items) : [];
  } catch (error) {
    items = [];
  }

  // Get payment URL for QR code
  const getPaymentUrl = () => {
    if (!data) return "";

    // If there's a UPI ID, create a UPI payment URL
    if (merchantUpiId) {
      const amount = Number(data?.amount || 0);
      const tr = data?.billNumber || "";
      const pn = companyName || "Merchant";

      // Create UPI URL with parameters
      return `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(
        pn
      )}&am=${amount}&tr=${tr}&tn=Bill%20Payment`;
    }

    // Fallback to bill link if no UPI ID
    return data.upiLink || `https://Raiser.com/bill/${data.billNumber}`;
  };

  // Handle share via email
  const handleShareViaEmail = () => {
    const subject = `Bill #${data?.billNumber || ""}`;
    const body = `Please find the bill details for ${companyName}.\n\nAmount: ₹${Number(
      data?.amount || 0
    ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  // Handle copy link
  const handleCopyLink = () => {
    const billUrl = `${window.location.origin}/bill/${data?.billNumber}`;
    navigator.clipboard
      .writeText(billUrl)
      .then(() => {
        message.success("Bill link copied to clipboard");
      })
      .catch(() => {
        message.error("Failed to copy bill link");
      });
  };

  const handleDownload = async () => {
    try {
      const element = document.getElementById("billing-content");
      if (!element) return;

      message.loading({ content: "Generating PDF...", key: "download" });

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

      // Create a temporary style element
      const style = document.createElement("style");
      style.textContent = styleContent;
      element.appendChild(style);

      // Wait for all images to load
      const images = element.getElementsByTagName("img");
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => {
              if (img.classList.contains("company-logo")) {
                img.src = "https://grewox.com/assets/logo.png";
                resolve();
              } else {
                reject();
              }
            };
          });
        })
      );

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("billing-content");
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
      pdf.save(`Bill-${data?.billNumber || "download"}.pdf`);

      message.success({
        content: "Bill downloaded successfully!",
        key: "download",
      });
    } catch (error) {
      console.error("Error downloading bill:", error);
      message.error({ content: "Failed to download bill", key: "download" });
    }
  };
  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="pro-modal custom-modal billing-modal"
      maskClosable={false}
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
          onClick={onClose}
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
              View Bill
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              {data?.billNumber}
            </Text>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px" }}>
        <Spin spinning={isSettingsLoading}>
          <div className="view-billing-container">
            <div className="view-billing-content">
              <div className="bill-card billing-container" id="billing-content">
                <div className="billing-header">
                  <div className="company-info">
                    <div className="company-left">
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "20px",
                          background: "#f0f7ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid #e6f4ff",
                        }}
                      >
                        <PiBuildingsFill
                          style={{
                            width: "80px",
                            height: "80px",
                            color: "#1f2937",
                          }}
                        />
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

                  <div className="billing-title">
                    <div className="title-text">TAX BILL</div>
                    <div className="gstin-text">
                      GSTIN:{" "}
                      <span style={{ fontWeight: 900 }}>
                        {loggedInUser?.gstIn || "29ABCDE1234F1Z5"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="billing-details">
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Bill No</span>
                      <span className="detail-value">{data?.billNumber}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Bill Date</span>
                      <span className="detail-value">
                        {data?.billDate
                          ? dayjs(data.billDate).format("DD/MM/YYYY")
                          : "-"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Vendor No</span>
                      <span className="detail-value">
                        {vendorDetails?.id
                          ? `#VEN${String(
                            vendorsData?.data?.length || 1
                          ).padStart(1, "0")}`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="vendor-details">
                  <div className="vendor-header">
                    <span>Vendor Details</span>
                  </div>
                  <div className="vendor-grid">
                    <div className="info-group">
                      <div className="info-row">
                        <span className="label">Name</span>
                        <span className="value">
                          {vendorDetails?.name || "-"}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="label">Contact</span>
                        <span className="value">
                          {vendorDetails?.contact || "-"}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="label">GSTIN</span>
                        <span className="value">
                          {vendorDetails?.taxNumber || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="info-group">
                      <div className="info-row">
                        <span className="label">Address</span>
                        <span className="value address-value">
                          {formatVendorAddress() || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bill-items" style={{ margin: "20px" }}>
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
                      {data?.items && Array.isArray(data.items) ? (
                        data.items.map((item, index) => {
                          const quantity = Number(item.quantity) || 0;
                          const rate = Number(item.unitPrice) || 0;
                          const taxData = taxesData?.data?.find(
                            (tax) => tax.id === item.tax
                          );
                          const taxPercent = taxData ? Number(taxData.gstPercentage) : 0;
                          const taxAmount = Number(item.taxAmount) || 0;
                          const discount = item.discount_type === "percentage" 
                            ? `${item.discount}% (₹${Number(item.discountAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })})`
                            : item.discountAmount 
                              ? `₹${Number(item.discountAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                              : "-";
                          const amount = Number(item.amount) || 0;

                          return (
                            <tr key={index}>
                              <td>{item.itemName || "-"}</td>
                              <td>{item.hsnSac || "-"}</td>
                              <td>{quantity}</td>
                              <td>
                                {item.currencyIcon || "₹"}
                                {rate.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td>
                                {taxData
                                  ? `${taxData.gstName} (${taxData.gstPercentage}%)`
                                  : "None (0%)"}
                              </td>
                              <td>
                                {item.currencyIcon || "₹"}
                                {taxAmount.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td>{discount}</td>
                              <td>
                                {item.currencyIcon || "₹"}
                                {amount.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="totals-section">
                    <div className="total-row">
                      <div className="total-label">Sub Total</div>
                      <div className="total-value">
                        {data?.currencyIcon || "₹"}
                        {Number(data?.subTotal || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <div className="total-row">
                      <div className="total-label">Tax</div>
                      <div className="total-value">
                        {data?.currencyIcon || "₹"}
                        {Number(data?.tax || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <div className="total-row">
                      <div className="total-label">Discount</div>
                      <div className="total-value">
                        {data?.overallDiscountType === "percentage" ? (
                          <span>
                            {data?.overallDiscount || 0}% ({data?.currencyIcon || "₹"}
                            {Number(data?.overallDiscountAmount || 0).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                            )
                          </span>
                        ) : (
                          <span>
                            {data?.currencyIcon || "₹"}
                            {Number(data?.discount || 0).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="total-row">
                      <div className="total-label">Total Amount</div>
                      <div className="total-value">
                        {data?.currencyIcon || "₹"}
                        {Number(data?.total || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    {debitNoteAmount > 0 && (
                      <div className="total-row debit-note-row">
                        <div className="total-label">Debit Note</div>
                        <div className="total-value debit-note">
                          -{data?.currencyIcon || "₹"}
                          {Number(debitNoteAmount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    )}
                    <div className="total-row final-amount">
                      <div className="total-label">Final Amount</div>
                      <div className="total-value">
                        {data?.currencyIcon || "₹"}
                        {Number(
                          data?.total - debitNoteAmount || 0
                        ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bill-footer">
                  <div
                    className="payment-section"
                    style={{ display: "flex", justifyContent: "space-between" }}
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
                          style={{ padding: "0px" }}
                        />
                        <div className="qr-info">
                          <p className="scan-text">Scan to Pay</p>
                          <p className="amount-text">
                            ₹
                            {Number(data?.amount || 0).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
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
                      {data?.status === "paid" && (
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
                      Raiser CRM
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
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
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

      <style jsx global>{`
        .billing-modal {
          .ant-modal-content {
            padding: 0;
            border-radius: 8px;
            overflow: hidden;
          }

          .view-billing-container {
            background: #ffffff;
          }

          .billing-header {
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

            div {
              margin-bottom: 4px;
            }
          }

          .billing-title {
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
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;

            span {
              font-weight: 900;
              font-size: 20px;
            }
          }

          .billing-details {
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

          .vendor-details {
            background: #fff;
            border-bottom: 1px solid #e5e7eb;
          }

          .vendor-header {
            background: #f9fafb;
            padding: 8px 24px;
            font-size: 14px;
            font-weight: 700;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
          }

          .vendor-grid {
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
            margin-bottom: 8px;
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

          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;

            th,
            td {
              padding: 8px 12px;
              border: 1px solid #e5e7eb;
              text-align: left;
            }

            th {
              background: #f9fafb;
              font-weight: 600;
              color: #374151;
              font-size: 13px;
            }

            td {
              font-size: 13px;
              color: #1f2937;
            }

            tr:hover td {
              background: #f9fafb;
            }
          }

          .totals-section {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;

            &:last-child {
              border-bottom: none;
            }
          }

          .total-label {
            color: #6b7280;
            font-weight: 500;
          }

          .total-value {
            font-weight: 600;
            color: #111827;

            &.debit-note {
              color: #dc2626;
            }
          }

          .final-amount {
            background-color: #f9fafb;

            .total-label,
            .total-value {
              font-weight: 700;
              color: #111827;
            }
          }

          .payment-section {
            background: #f9fafb;
            padding: 20px;
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 24px;
            border: 1px solid #e5e7eb;
            margin: 16px 0;
          }

          .qr-code {
            text-align: center;

            svg {
              padding: 16px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
          }

          .qr-info {
            margin-top: 12px;
            text-align: center;
          }

          .scan-text {
            font-size: 16px;
            font-weight: 700;
            color: #6b7280;
            margin: 4px 0;
          }

          .amount-text {
            font-weight: 600;
            font-size: 16px;
            color: #111827;
            margin: 4px 0;
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

          .powered-by {
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            margin-top: 16px;

            span {
              font-weight: bold;
              font-size: 14px;
              color: #1890ff;
            }
          }

          .action-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }

          .action-button {
            padding: 8px 24px;
            height: 44px;
            border-radius: 10px;
            border: 1px solid #e6e8eb;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;

            &.primary {
              background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
              border: none;
              color: white;
            }
          }
        }
      `}</style>
    </Modal>
  );
};

export default ViewBilling;
