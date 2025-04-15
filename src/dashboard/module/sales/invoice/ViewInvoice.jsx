import React, { useEffect, useState, useRef } from 'react';
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
  Dropdown
} from 'antd';
import { FiX, FiDownload, FiPrinter, FiMail, FiShare2, FiCopy, FiEye } from 'react-icons/fi';
import dayjs from 'dayjs';
import styled from 'styled-components';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useGetCustomersQuery } from '../customer/services/custApi';
import { useGetContactsQuery } from '../../crm/contact/services/contactApi';
import { useGetCompanyAccountsQuery } from '../../crm/companyacoount/services/companyAccountApi';
import { useGetCreditNotesQuery } from '../creditnotes/services/creditNoteApi';
import { useGetAllSettingsQuery } from '../../../../superadmin/module/settings/general/services/settingApi';
import { QRCodeSVG } from 'qrcode.react';
import './invoice.scss';


const ViewInvoice = ({ open, onCancel, invoice, onDownload }) => {
  const [billingData, setBillingData] = useState(null);
  const [creditNoteAmount, setCreditNoteAmount] = useState(0);
  const printRef = useRef();
  
  const { data: customersData } = useGetCustomersQuery();
  const { data: contactsData } = useGetContactsQuery();
  const { data: companyAccountsData } = useGetCompanyAccountsQuery();
  const { data: creditNotesData } = useGetCreditNotesQuery(invoice?.id, {
    skip: !invoice?.id
  });

  const { data: settingsData } = useGetAllSettingsQuery();
  
  // State for company information
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyName, setCompanyName] = useState('Grewox CRM');
  const [companyEmail, setCompanyEmail] = useState('contact@grewox.com');
  const [companyWebsite, setCompanyWebsite] = useState('www.grewox.com');

  // Get company settings from general settings
  useEffect(() => {
    if (settingsData?.success && settingsData?.data && settingsData.data.length > 0) {
      const settings = settingsData.data[0];
      
      // Set company logo if available
      if (settings.companylogo) {
        setCompanyLogo(settings.companylogo);
      }
      
      // Set company name if available - note the correct property name is companyName
      if (settings.companyName) {
        setCompanyName(settings.companyName);
      } 
      
      // Set company email if available
      if (settings.email) {
        setCompanyEmail(settings.email);
      }
      
      // Set company website if available
      if (settings.website) {
        setCompanyWebsite(settings.website);
      }
    } 
  }, [settingsData]);

  useEffect(() => {
    if (invoice?.customer && invoice?.category) {
      let data = null;

      switch (invoice.category) {
        case 'customer':
          data = customersData?.data?.find(c => c.id === invoice.customer);
          if (data) {
            setBillingData({
              name: data.name,
              email: data.email,
              contact: data.contact,
              address: data.billing_address
            });
          }
          break;

        case 'contact':
          data = contactsData?.data?.find(c => c.id === invoice.customer);
          if (data) {
            setBillingData({
              name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.contact_name,
              email: data.email,
              contact: data.phone || data.mobile,
              address: data.address
            });
          }
          break;

        case 'company_account':
          data = companyAccountsData?.data?.find(c => c.id === invoice.customer);
          if (data) {
            setBillingData({
              name: data.company_name || data.name || data.account_name,
              email: data.email,
              contact: data.phone || data.contact_number,
              address: data.address
            });
          }
          break;

        default:
          setBillingData(null);
      }
    }
  }, [invoice, customersData, contactsData, companyAccountsData]);

  useEffect(() => {
    if (creditNotesData?.data) {
      const totalAmount = creditNotesData.data.reduce((sum, note) => {
        return sum + Number(note.amount || 0);
      }, 0);
      setCreditNoteAmount(totalAmount);
    }
  }, [creditNotesData]);

  const renderBillingDetails = () => {
    if (!billingData) {
      return 'Loading details...';
    }

    return (
      <>
        {`Name: ${billingData.name}`}<br />
        {/* {billingData.email && `Email: ${billingData.email}`}<br /> */}
        {billingData.contact && `Phone: ${billingData.contact}`}<br />
        {/* {billingData.address && (
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
      if (typeof address === 'string') {
        const parsed = JSON.parse(address);
        return (
          <>
            {parsed.street && `${parsed.street},`}<br />
            {parsed.city && `${parsed.city},`} {parsed.state}<br />
            {parsed.country} {parsed.postal_code}
          </>
        );
      }
      return address;
    } catch (error) {
      return address;
    }
  };

  // Add getPaymentUrl function
  const getPaymentUrl = () => {
    if (!invoice) return '';
    return invoice.upiLink || `https://grewox.com/invoice/${invoice.salesInvoiceNumber}`;
  };

  const handleDownload = async () => {
    try {
      const element = document.getElementById('invoice-content');
      if (!element) return;

      message.loading({ content: 'Generating PDF...', key: 'download' });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${invoice?.salesInvoiceNumber || 'download'}.pdf`);

      message.success({ content: 'Invoice downloaded successfully!', key: 'download' });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      message.error({ content: 'Failed to download invoice', key: 'download' });
    }
  };

  const handlePrint = () => {
    const content = document.getElementById('invoice-content');
    const printWindow = window.open('', '_blank');
    
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

  const openInvoiceInNewWindow = () => {
    const content = document.getElementById('invoice-content');
    const newWindow = window.open('', '_blank');
    
    newWindow.document.write(`
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
              background: #f0f2f5;
            }
            .invoice-container {
              width: 210mm;
              min-height: 297mm;
              margin: 20px auto;
              background: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              padding: 30px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
            }
            .logo {
              height: 50px;
            }
            .company-info {
              text-align: right;
            }
            .company-info h2 {
              margin: 0;
              color: #0066ff;
            }
            .details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .details-column {
              width: 45%;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background: #f0f4fa;
              text-align: left;
              padding: 12px;
              border-bottom: 1px solid #eaeaea;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #eaeaea;
            }
            .text-right {
              text-align: right;
            }
            .status-tag {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 6px;
              font-size: 12px;
            }
            .status-paid { color: #059669; background: #d1fae5; }
            .status-unpaid { color: #dc2626; background: #fee2e2; }
            .status-partial { color: #7c3aed; background: #ede9fe; }
            .status-draft { color: #d97706; background: #fef3c7; }
            .status-pending { color: #2563eb; background: #dbeafe; }
            .qr-section {
              text-align: center;
              margin-top: 30px;
              padding: 20px;
              background: #f8fafc;
              border-radius: 12px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .qr-container {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .qr-box {
              background: white;
              padding: 12px;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .qr-text {
              margin-top: 12px;
              text-align: center;
            }
            .qr-text p {
              margin: 4px 0;
            }
            .scan-text {
              font-size: 13px;
              font-weight: 500;
              color: #4b5563;
            }
            .amount-text {
              font-size: 12px;
              color: #6b7280;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #777;
              font-size: 12px;
            }
            .credit-note {
              color: #dc2626;
            }
            @media print {
              body {
                background: white;
              }
              .invoice-container {
                box-shadow: none;
                margin: 0;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${content.innerHTML}
          </div>
          <script>
            // Add print button
            const printButton = document.createElement('div');
            printButton.style.position = 'fixed';
            printButton.style.top = '20px';
            printButton.style.right = '20px';
            printButton.style.padding = '10px 20px';
            printButton.style.background = '#1890ff';
            printButton.style.color = 'white';
            printButton.style.borderRadius = '6px';
            printButton.style.cursor = 'pointer';
            printButton.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            printButton.innerHTML = 'Print Invoice';
            printButton.onclick = () => window.print();
            document.body.appendChild(printButton);
          </script>
        </body>
      </html>
    `);

    newWindow.document.close();
  };

  const shareItems = {
    items: [
      {
        key: 'view',
        icon: <FiEye />,
        label: 'View Invoice',
        onClick: openInvoiceInNewWindow
      },
      {
        key: 'email',
        icon: <FiMail />,
        label: 'Share via Email',
        onClick: () => {
          const subject = `Invoice ${invoice?.salesInvoiceNumber} from Grewox CRM`;
          const body = `Please find the invoice details below:\n\nInvoice Number: ${invoice?.salesInvoiceNumber}\nAmount: ₹${(Number(invoice?.total || 0) - creditNoteAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}\nDue Date: ${dayjs(invoice?.dueDate).format('DD-MM-YYYY')}`;
          window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
      },
      {
        key: 'copy',
        icon: <FiCopy />,
        label: 'Copy Invoice Link',
        onClick: () => {
          const invoiceUrl = `${window.location.origin}/invoice/${invoice?.salesInvoiceNumber}`;
          navigator.clipboard.writeText(invoiceUrl)
            .then(() => message.success('Invoice link copied to clipboard!'))
            .catch(() => message.error('Failed to copy invoice link'));
        }
      }
    ]
  };

  if (!invoice) return null;

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={
        <Space key="actions">
          <Button 
            icon={<FiPrinter />} 
            onClick={handlePrint}
          >
            Print
          </Button>
          <Dropdown menu={shareItems} trigger={['click']} placement="topRight">
            <Button icon={<FiShare2 />}>Share</Button>
          </Dropdown>
          <Button 
            type="primary" 
            icon={<FiDownload />} 
            onClick={handleDownload}
          >
            Download
          </Button>
        </Space>
      }
      width={800}
      destroyOnClose={true}
      centered
      styles={{
        body: {
          marginTop: '15px',
          padding: '40px',
          height: '100%',
          width: '100%',
          fontFamily: "'Segoe UI', sans-serif"
        }
      }}
    >
      <div className="view-billing-container">
        <div className="view-billing-content">
          <div className="bill-card">
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
                  <h4>Invoice To:</h4>
                  <div className="vendor-info">
                    <h5>Name: <span>{billingData?.name || 'N/A'}</span></h5>
                    {/* <p>{billingData?.address || ''}</p> */}
                    {/* {billingData?.email && <p>Email: {billingData.email}</p>} */}
                    {billingData?.contact && <p>Contact: {billingData.contact}</p>}
                  </div>
                </div>
                <div className="bill-info">
                  <div className="info-row">
                    <span className="label">Invoice No:</span>
                    <span className="value">{invoice?.salesInvoiceNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Date:</span>
                    <span className="value">{invoice?.issueDate ? dayjs(invoice.issueDate).format('DD MMMM YYYY') : ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Due Date:</span>
                    <span className="value">{invoice?.dueDate ? dayjs(invoice.dueDate).format('DD MMMM YYYY') : ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`status-badge ${invoice?.payment_status?.toLowerCase()}`}>
                      {invoice?.payment_status}
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
                    <th>Qty</th>
                    <th>Rate</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(invoice.items) && invoice.items.map((item, index) => {
                    const quantity = Number(item.quantity) || 0;
                    const rate = Number(item.unit_price || item.rate) || 0;
                    const amount = quantity * rate;
                    
                    return (
                      <tr key={index}>
                        <td>{item.item_name || item.name || item.description}</td>
                        <td>{quantity}</td>
                        <td>₹{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="text-right">
                          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                  {Number(invoice?.tax) > 0 && (
                    <tr className="summary-row">
                      <td colSpan="3">GST</td>
                      <td className="text-right">
                        ₹{Number(invoice.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {Number(invoice?.discount) > 0 && (
                    <tr className="summary-row">
                      <td colSpan="3">Discount</td>
                      <td className="text-right">
                        ₹{Number(invoice.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  <tr className="total-row">
                    <td colSpan="3">Total Amount</td>
                    <td className="text-right total-amount">
                      ₹{Number(invoice?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                    <p className="amount">₹{Number(invoice?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
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
                <p>{invoice?.note || 'Thank you for your payment!'}</p>
                <p className="powered-by">Powered by {companyName} | {companyWebsite}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewInvoice;