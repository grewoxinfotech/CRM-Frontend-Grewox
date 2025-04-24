import React, { useEffect, useState } from 'react';
import { Spin, Button, Space, message } from 'antd';
import { useGetVendorsQuery } from './services/billingApi';
import { useGetAllSettingsQuery } from '../../../../superadmin/module/settings/general/services/settingApi';
import { QRCodeSVG } from 'qrcode.react';
import { FiDownload, FiPrinter, FiMail, FiShare2 } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './billing.scss';

// Add a helper function for safe number formatting
const formatNumber = (value) => {
  return Number(value || 0).toFixed(2);
};

const ViewBilling = ({ data }) => {
  // Fetch vendors data
  const { data: vendorsData } = useGetVendorsQuery();
  const { data: settingsData, isLoading: isSettingsLoading } = useGetAllSettingsQuery();

  
  // State for company information
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyName, setCompanyName] = useState('Grewox CRM');
  const [companyEmail, setCompanyEmail] = useState('contact@grewox.com');
  const [companyWebsite, setCompanyWebsite] = useState('www.grewox.com');
  const [merchantUpiId, setMerchantUpiId] = useState('');

  // Get company settings from general settings
  useEffect(() => {
    if (settingsData?.success && settingsData?.data && settingsData.data.length > 0) {
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

  if (!data) {
    return <div>No billing data found</div>;
  }

  // Find vendor details using vendor ID
  const vendorDetails = vendorsData?.data?.find(vendor => vendor.id === data.vendor) || {};

  // Format vendor address
  const formatVendorAddress = () => {
    if (!vendorDetails) return '';
    const addressParts = [
      vendorDetails.address,
    ].filter(Boolean);
    return addressParts.join(', ');
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
    if (!data) return '';
    
    // If there's a UPI ID, create a UPI payment URL
    if (merchantUpiId) {
      const amount = Number(data?.total || 0);
      const tr = data?.billNumber || '';
      const pn = companyName || 'Merchant';
      
      // Create UPI URL with parameters
      return `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(pn)}&am=${amount}&tr=${tr}&tn=Bill%20Payment`;
    }
    
    // Fallback to bill link if no UPI ID
    return data.upiLink || `https://grewox.com/bill/${data.billNumber}`;
  };

  const handleDownload = async () => {
    try {
      const element = document.getElementById('billing-content');
      if (!element) return;

      message.loading({ content: 'Generating PDF...', key: 'download' });

      // Add necessary styles before generating PDF
      const styleContent = `
        .bill-card {
          padding: 40px;
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
          margin-top: 30px;
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
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
        }
        .status-badge.partially_paid {
          background: #ede9fe;
          color: #7c3aed;
        }
      `;

      // Create a temporary style element
      const style = document.createElement('style');
      style.textContent = styleContent;
      element.appendChild(style);

      // Wait for all images to load
      const images = element.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => {
            if (img.classList.contains('company-logo')) {
              img.src = 'https://grewox.com/assets/logo.png';
              resolve();
            } else {
              reject();
            }
          };
        });
      }));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('billing-content');
          // Add the same styles to cloned element
          const clonedStyle = document.createElement('style');
          clonedStyle.textContent = styleContent;
          clonedElement.appendChild(clonedStyle);
          
          // Ensure images are visible
          const clonedImages = clonedElement.getElementsByTagName('img');
          Array.from(clonedImages).forEach(img => {
            img.style.display = 'block';
            img.crossOrigin = 'anonymous';
          });
        }
      });

      // Remove the temporary style element
      element.removeChild(style);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bill-${data?.billNumber || 'download'}.pdf`);

      message.success({ content: 'Bill downloaded successfully!', key: 'download' });
    } catch (error) {
      console.error('Error downloading bill:', error);
      message.error({ content: 'Failed to download bill', key: 'download' });
    }
  };

  return (
    <div className="view-billing-container">
     

      <div className="view-billing-content">
        <div className="bill-card" id="billing-content">
          <div className="bill-header">
            <div className="company-info">
              {companyLogo ? (
                <img 
                  src={companyLogo} 
                  alt={`${companyName} Logo`} 
                  className="company-logo"
                />
              ) : (
                <img 
                  src="https://grewox.com/assets/logo.png" 
                  alt="Grewox Logo" 
                  className="company-logo"
                />
              )}
              <div className="company-details">
                <h3>{companyName}</h3>
                <p>{companyWebsite} | {companyEmail}</p>
              </div>
            </div>

          </div>

          <div className="bill-details">
            <div className="bill-section">
              <div className="bill-to">
                <h4>Bill To:</h4>
                <div className="vendor-info">
                  <h5>{vendorDetails?.name || 'N/A'}</h5>
                  <p>{formatVendorAddress()}</p>
                  {vendorDetails?.email && <p>Email: {vendorDetails.email}</p>}
                  {vendorDetails?.contact && <p>Contact: {vendorDetails.contact}</p>}
                  {vendorDetails?.taxNumber && <p>Tax Number: {vendorDetails.taxNumber}</p>}
                </div>
              </div>
              <div className="bill-info">
                <div className="info-row">
                  <span className="label">Bill No:</span>
                  <span className="value">{data?.billNumber}</span>
                </div>
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">{data?.billDate ? new Date(data?.billDate).toLocaleDateString() : ''}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className={`status-badge ${data?.status?.toLowerCase() || data?.bill_status?.toLowerCase()}`}>
                    {data?.status || data?.bill_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bill-items">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>HSN/SAC</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(items) && items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.itemName || item.name}</td>
                    <td>{item.hsnSac}</td>
                    <td>{item.quantity}</td>
                    <td>₹{formatNumber(item.unitPrice || item.price)}</td>
                    <td className="text-right">
                      ₹{formatNumber(item.amount || (item.quantity * (item.unitPrice || item.price)))}
                    </td>
                  </tr>
                ))}
                {Number(data?.discount) > 0 && (
                  <tr className="summary-row">
                    <td colSpan="4">Discount</td>
                    <td className="text-right">
                      ₹{formatNumber(data.discount)}
                    </td>
                  </tr>
                )}
                {Number(data?.tax) > 0 && (
                  <tr className="summary-row">
                    <td colSpan="4">Tax</td>
                    <td className="text-right">
                      ₹{formatNumber(data.tax)}
                    </td>
                  </tr>
                )}
                <tr className="total-row">
                  <td colSpan="4">Total Amount</td>
                  <td className="text-right total-amount">
                    ₹{formatNumber(data?.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bill-footer">
            <div className="payment-section">
              <div className="qr-code">
                <QRCodeSVG
                  value={getPaymentUrl()}
                  size={120}
                  level="H"
                  includeMargin={true}
                />
                <div className="qr-info">
                  <p>Scan to Pay</p>
                  <p className="amount">₹{formatNumber(data?.total)}</p>
                </div>
              </div>
              <div className="payment-info">
                <h4>Payment Information</h4>
                <p>Thank you for your business!</p>
                <p>Please make payment to the following account:</p>
                <div className="bank-details">
                  <p><strong>Bank:</strong> Example Bank</p>
                  <p><strong>Account:</strong> 1234567890</p>
                  <p><strong>IFSC:</strong> EXAMPLE123</p>
                </div>
              </div>
            </div>
            <div className="bill-notes">
              <h4>Notes</h4>
              <p>{ 'Thank you for your payment!'}</p>
              <p>Computer Generated E-signature</p>
              <p className="powered-by">Powered by {companyName} | {companyWebsite}</p>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <Space>
            <Button 
              type="primary" 
              icon={<FiDownload />} 
              onClick={handleDownload}
            >
              Download
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default ViewBilling;
