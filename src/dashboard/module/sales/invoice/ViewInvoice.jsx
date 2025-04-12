import React, { useEffect, useState } from 'react';
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
  message
} from 'antd';
import { FiX, FiDownload, FiPrinter, FiMail } from 'react-icons/fi';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { useGetCustomersQuery } from '../customer/services/custApi';

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

const ViewInvoice = ({ open, onCancel, invoice }) => {
  const [customerData, setCustomerData] = useState(null);
  const { data: customers, isLoading, error } = useGetCustomersQuery();

  useEffect(() => {
    if (customers?.data && invoice?.customer) {
      const customer = customers.data.find(c => c.id === invoice.customer);
      if (customer) {
        setCustomerData(customer);
      }
    }
  }, [customers, invoice]);

  if (!invoice) return null;

  // const renderBillingAddress = () => {
  //   if (!customerData?.billing_address) return null;
  //   try {
  //     const address = JSON.parse(customerData.billing_address);
  //     return (
  //       <>
  //         {address.street}<br />
  //         {address.city}, {address.state}<br />
  //         {address.country} - {address.postal_code}
  //       </>
  //     );
  //   } catch (error) {
  //     return null;
  //   }
  // };

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
      marginTop: 30
    },
    qrImage: {
      height: 90
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
      footer={null}
      width={800}
      destroyOnClose={true}
      centered
      styles={{
        body: {
          marginTop: '15px',
          padding: '40px',
          height: '90vh',
          width: '100%',
          fontFamily: "'Segoe UI', sans-serif"
        }
      }}
    >
      <div style={styles.invoiceBox}>
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
            {customerData ? (
              <>
                {customerData.name}<br />
                {customerData.email && `Email: ${customerData.email}`}<br />
                {customerData.contact && `Phone: ${customerData.contact}`}<br />
                {/* {renderBillingAddress()} */}
              </>
            ) : (
              'Loading customer details...'
            )}
          </div>
          <div style={styles.detailsColumn}>
            <strong>Invoice Details:</strong><br />
            Invoice No: {invoice.salesInvoiceNumber}<br />
            Date: {dayjs(invoice.issueDate).format('DD MMMM YYYY')}<br />
            Due Date: {dayjs(invoice.dueDate).format('DD MMMM YYYY')}
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
          </tbody>
        </table>

        <div style={styles.qrSection}>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://grewox.com/pay-now"
            alt="QR Code"
            style={styles.qrImage}
          />
          <p style={{ fontSize: 11 }}>Scan to Pay or View Online</p>
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