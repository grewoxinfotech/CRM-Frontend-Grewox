import React from 'react';
import { Spin } from 'antd';
import { useGetVendorsQuery } from './services/billingApi';

// Add a helper function for safe number formatting
const formatNumber = (value) => {
  return Number(value || 0).toFixed(2);
};

const ViewBilling = ({ data }) => {
  // Fetch vendors data
  const { data: vendorsData } = useGetVendorsQuery();

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
    console.error('Error parsing items:', error);
    items = [];
  }

  const styles = {
    body: {
      fontFamily: "'Segoe UI', sans-serif",
    //   background: "#f7f9fc",
      padding: "20px",
      height: "80vh",
      width: "100%",
      marginTop: "10px",
    //   marginBottom: "auto",
    //   width: "100vw",
    //   overflow: "auto"
    },
    billBox: {
    //   maxWidth: "750px",
      width: "100%",
      height: "100%",
      margin: "auto",
      padding: "30px",
      background: "#ffffff",
      borderRadius: "10px",
      borderTop: "4px solid #0066ff",
      boxShadow: "0 0 14px rgba(0,0,0,0.06)"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    logo: {
      height: "45px"
    },
    companyName: {
      textAlign: "right",
      fontSize: "20px",
      color: "#0066ff"
    },
    companyNameSmall: {
      display: "block",
      fontSize: "13px",
      color: "#555"
    },
    billDetails: {
      marginTop: "25px",
      fontSize: "14px",
      display: "flex",
      justifyContent: "space-between"
    },
    billDetailsDiv: {
      width: "48%",
      lineHeight: "1.6"
    },
    billTable: {
      width: "100%",
      textAlign: "left",
      marginTop: "25px",
      borderCollapse: "collapse"
    },
    tableCell: {
      padding: "10px",
      borderBottom: "1px solid #e0e0e0"
    },
    tableHeader: {
      padding: "10px",
      borderBottom: "1px solid #e0e0e0",
      backgroundColor: "#f0f4fa",
      color: "#333"
    },
    totalSection: {
      textAlign: "right",
      marginTop: "10px",
      fontSize: "16px",
      fontWeight: "bold",
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: "10px"
    },
    totalAmount: {
        // fontSize: "24px",
        fontWeight: "bold",
        color: "#0066ff"
      },
    qrSection: {
      textAlign: "center",
      marginTop: "30px"
    },
    qrImage: {
      height: "90px"
    },
    footer: {
      textAlign: "center",
      fontSize: "12px",
      marginTop: "30px",
      color: "#777"
    },
    powered: {
      marginTop: "5px",
      fontSize: "11px",
      color: "#444"
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.billBox}>
        <div style={styles.header}>
          <img 
            src="https://grewox.com/assets/logo.png" 
            alt="Grewox Logo" 
            style={styles.logo} 
          />
          <div style={styles.companyName}>
            Grewox CRM
            <small style={styles.companyNameSmall}>www.grewox.com | contact@grewox.com</small>
          </div>
        </div>

        <div style={styles.billDetails}>
          <div style={styles.billDetailsDiv}>
            <strong>Bill To:</strong><br />
            <span style={{ fontWeight: '500', fontSize: '15px' }}>{vendorDetails?.name || 'N/A'}</span><br />
            <span style={{ color: '#666' }}>{formatVendorAddress()}</span>
            {vendorDetails?.email && (
              <>
                <br />
                <span style={{ color: '#666' }}>Email: {vendorDetails.email}</span>
              </>
            )}
            {vendorDetails?.contact && (
              <>
                <br />
                <span style={{ color: '#666' }}>Contact: {vendorDetails.contact}</span>
              </>
            )}
            {vendorDetails?.taxNumber && (
              <>
                <br />
                <span style={{ color: '#666' }}>Tax Number: {vendorDetails.taxNumber}</span>
              </>
            )}
          </div>
          <div style={styles.billDetailsDiv}>
            <strong>Bill No:</strong> {data?.billNumber}<br />
            <strong>Date:</strong> {data?.billDate ? new Date(data?.billDate).toLocaleDateString() : ''}<br />
            <strong>Status:</strong> <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: data?.status?.toLowerCase() === 'paid' ? '#e6f7e6' : '#fff3e6',
              color: data?.status?.toLowerCase() === 'paid' ? '#52c41a' : '#faad14'
            }}>{data?.status || data?.bill_status}</span>
          </div>
        </div>

        <table style={styles.billTable}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Description</th>
              <th style={styles.tableHeader}>HSN/SAC</th>
              <th style={styles.tableHeader}>Qty</th>
              <th style={styles.tableHeader}>Unit Price</th>
              <th style={{...styles.tableHeader, textAlign: 'right'}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(items) && items.map((item, index) => (
              <tr key={index}>
                <td style={styles.tableCell}>{item.itemName || item.name}</td>
                <td style={styles.tableCell}>{item.hsnSac}</td>
                <td style={styles.tableCell}>{item.quantity}</td>
                <td style={styles.tableCell}>₹{formatNumber(item.unitPrice || item.price)}</td>
                <td style={{...styles.tableCell, textAlign: 'right'}}>
                  ₹{formatNumber(item.amount || (item.quantity * (item.unitPrice || item.price)))}
                </td>
              </tr>
            ))}
            {Number(data?.discount) > 0 && (
              <tr>
                <td style={styles.tableCell} colSpan="4">Discount</td>
                <td style={{...styles.tableCell, textAlign: 'right'}}>
                  ₹{formatNumber(data.discount)}
                </td>
              </tr>
            )}
            {Number(data?.tax) > 0 && (
              <tr>
                <td style={styles.tableCell} colSpan="4">Tax</td>
                <td style={{...styles.tableCell, textAlign: 'right'}}>
                  ₹{formatNumber(data.tax)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={styles.totalSection}>
          Total Paid: 
          <span style={styles.totalAmount}>₹{formatNumber(data?.total)}</span>
        </div>

        <div style={styles.qrSection}>
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://grewox.com" 
            alt="QR Code"
            style={styles.qrImage}
          />
          <p style={{fontSize: "11px"}}>Scan to Know More / Download Bill</p>
        </div>

        <div style={styles.footer}>
          Thank you for your payment!<br />
          <div style={styles.powered}>Powered by Grewox CRM | www.grewox.com</div>
        </div>
      </div>
    </div>
  );
};

export default ViewBilling;
