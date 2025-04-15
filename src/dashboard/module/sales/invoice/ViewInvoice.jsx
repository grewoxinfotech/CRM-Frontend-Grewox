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
import { QRCodeSVG } from 'qrcode.react';

const { Text, Title } = Typography;

// Styled components
const StyledCard = styled(Card)`
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  
  .ant-card-body {
    padding: 0;
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, #3f51b5, #5c6bc0);
  color: white;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Section = styled.div`
  padding: 30px;
  border-bottom: 1px solid #eee;
`;

const InfoSection = styled.div`
  h3 {
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: 600;
    color: #444;
  }
  
  p {
    margin: 0;
    line-height: 1.6;
    color: #666;
  }
`;

const QRSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
`;

const Footer = styled.div`
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: #888;
  background: #fafafa;
  
  .powered {
    margin-top: 5px;
    font-size: 12px;
    color: #777;
    
    span {
      font-weight: 600;
      color: #3f51b5;
    }
  }
`;

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

  const styles = {
    invoiceBox: {
      width: '100%',
      height: '100%',
      margin: 'auto',
      padding: 30,
      background: 'white',
      borderRadius: 12,
      boxShadow: '0 0 14px rgba(0,0,0,0.08)',
      borderTop: '5px solid #0066ff'
    },
    topHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      height: 50
    },
    companyInfo: {
      textAlign: 'right'
    },
    companyInfoTitle: {
      margin: 0,
      color: '#0066ff'
    },
    details: {
      margin: '30px 0 20px 0',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 14
    },
    detailsColumn: {
      width: '45%'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: 20
    },
    th: {
      borderBottom: '1px solid #eaeaea',
      padding: 10,
      textAlign: 'left',
      background: '#f0f4fa'
    },
    td: {
      borderBottom: '1px solid #eaeaea',
      padding: 10,
      textAlign: 'left'
    },
    tdRight: {
      borderBottom: '1px solid #eaeaea',
      padding: 10,
      textAlign: 'right'
    },
    totals: {
      textAlign: 'right',
      fontSize: 16,
      marginTop: 10
    },
    qrSection: {
      textAlign: 'center',
      marginTop: 30,
      padding: '20px',
      background: '#f8fafc',
      borderRadius: '12px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    footer: {
      textAlign: 'center',
      fontSize: 12,
      color: '#777',
      marginTop: 40
    },
    powered: {
      marginTop: 5,
      fontSize: 11,
      color: '#555'
    }
  };

  // Parse items if it's a string
  let invoiceItems = [];
  try {
    if (typeof invoice.items === 'string') {
      invoiceItems = JSON.parse(invoice.items);
    } else if (Array.isArray(invoice.items)) {
      invoiceItems = invoice.items;
    }
  } catch (error) {
    console.error('Error parsing invoice items:', error);
  }

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
          height: '100vh',
          width: '100%',
          fontFamily: "'Segoe UI', sans-serif"
        }
      }}
    >
      <div id="invoice-content" ref={printRef} style={{...styles.invoiceBox, margin: 0}}>
        <div style={styles.topHeader}>
          <img
            src="https://grewox.com/assets/logo.png"
            alt="Grewox Logo"
            style={styles.logo}
          />
          <div style={styles.companyInfo}>
            <h2 style={styles.companyInfoTitle}>Grewox CRM</h2>
            <p>www.grewox.com<br />contact@grewox.com</p>
          </div>
        </div>

        <div style={styles.details}>
          <div style={styles.detailsColumn}>
            <strong>Billed To:</strong><br />
            {renderBillingDetails()}
          </div>
          <div style={styles.detailsColumn}>
            <strong>Invoice Details:</strong><br />
            Invoice No: {invoice.salesInvoiceNumber}<br />
            Date: {dayjs(invoice.issueDate).format('DD-MM-YYYY')}<br />
            Due Date: {dayjs(invoice.dueDate).format('DD-MM-YYYY')}<br />
            Status: {invoice.payment_status && (
              <Tag
                style={{
                  textTransform: 'capitalize',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  color: invoice.payment_status === 'paid' ? '#059669' :
                         invoice.payment_status === 'unpaid' ? '#dc2626' :
                         invoice.payment_status === 'partial' ? '#7c3aed' :
                         invoice.payment_status === 'draft' ? '#d97706' :
                         invoice.payment_status === 'pending' ? '#2563eb' : '#374151',
                  backgroundColor: invoice.payment_status === 'paid' ? '#d1fae5' :
                                 invoice.payment_status === 'unpaid' ? '#fee2e2' :
                                 invoice.payment_status === 'partial' ? '#ede9fe' :
                                 invoice.payment_status === 'draft' ? '#fef3c7' :
                                 invoice.payment_status === 'pending' ? '#dbeafe' : '#f3f4f6'
                }}
              >
                {invoice.payment_status}
              </Tag>
            )}
          </div>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Description</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Qty</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Rate</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, index) => {
              const quantity = Number(item.quantity) || 0;
              const rate = Number(item.unit_price || item.rate) || 0;
              const amount = quantity * rate;
              
              return (
                <tr key={index}>
                  <td style={styles.td}>{item.item_name || item.name || item.description}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{quantity}</td>
                  <td style={styles.tdRight}>₹{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={styles.tdRight}>₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              );
            })}


            {/* <tr>
              <td colSpan="3" style={styles.tdRight}><strong>Subtotal</strong></td>
              <td style={styles.tdRight}>₹{Number(invoice.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr> */}

            {Number(invoice.tax) > 0 && (
              <tr>
                <td colSpan="3" style={styles.tdRight}>GST</td>
                <td style={styles.tdRight}>₹{Number(invoice.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            )} 

            {Number(invoice.discount) > 0 && (
              <tr>
                <td colSpan="3" style={styles.tdRight}>Discount</td>
                <td style={styles.tdRight}>₹{Number(invoice.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            )}

            <tr>
              <td colSpan="3" style={styles.tdRight}><strong>Total</strong></td>
              <td style={styles.tdRight}><strong>₹{Number(invoice.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            </tr>

            {creditNoteAmount > 0 && (
              <tr>
                <td colSpan="3" style={styles.tdRight}>
                  <span >Credit Note Amount</span>
                </td>
                <td style={styles.tdRight}>
                  <span style={{ color: '#dc2626' }}>
                    ₹{creditNoteAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </td>
              </tr>
            )}

            <tr style={{ backgroundColor: '#f8fafc' }}>
              <td colSpan="3" style={{ ...styles.tdRight, paddingTop: '16px', paddingBottom: '16px' }}>
                <strong style={{ fontSize: '16px' }}>Amount Due</strong>
              </td>
              <td style={{ ...styles.tdRight, paddingTop: '16px', paddingBottom: '16px' }}>
                <strong style={{ 
                  fontSize: '16px', 
                  color: creditNoteAmount > 0 ? '' : undefined 
                }}>
                  ₹{(Number(invoice.total || 0) - creditNoteAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={styles.qrSection}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              background: 'white', 
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <QRCodeSVG
                value={getPaymentUrl()}
                size={120}
                level="H"
                includeMargin={true}
              />
            </div>
            <div style={{ 
              marginTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <p style={{ 
                fontSize: '13px', 
                fontWeight: '500',
                color: '#4b5563',
                margin: 0
              }}>
                Scan to Pay
              </p>
              <p style={{ 
                fontSize: '12px',
                color: '#6b7280',
                margin: 0
              }}>
                Amount: ₹{(Number(invoice.total || 0) - creditNoteAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                {creditNoteAmount > 0 && (
                  <span style={{ display: 'block', color: '#dc2626', fontSize: '11px' }}>
                    {/* (Credit Note: -₹{creditNoteAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}) */}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          Thank you for doing business with us!<br />
          <div style={styles.powered}>Powered by Grewox CRM | www.grewox.com</div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewInvoice;