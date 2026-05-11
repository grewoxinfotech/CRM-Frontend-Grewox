
import React, { useState } from 'react';
import { Modal, Upload, Button, message, Space, Typography, List, Alert, Divider, Result } from 'antd';
import { FiUpload, FiFileText, FiCheckCircle, FiAlertCircle, FiDownload, FiX } from 'react-icons/fi';
import { useBulkImportLeadsMutation } from '../services/LeadApi';
import * as XLSX from 'xlsx';

const { Text, Title, Paragraph } = Typography;

const ImportLeadsModal = ({ open, onCancel }) => {
  const [fileList, setFileList] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [bulkImportLeads] = useBulkImportLeadsMutation();

  const handleDownloadTemplate = () => {
    const template = [
      {
        leadTitle: 'Sample Software Project',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '9876543210',
        phone_code: '91',
        leadValue: 50000,
        source: 'Google',
        category: 'Software',
        interest_level: 'high',
        status: 'active',
        lead_score: 85,
        assigned_to: 'admin, user1',
        pipeline: 'Sales Pipeline',
        description: 'Customer interested in mobile app'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'lead_import_template.xlsx');
  };

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.error('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0]);

    setImporting(true);
    setResult(null);

    try {
      const response = await bulkImportLeads(formData).unwrap();
      const importResult = response.data;
      
      if (importResult.summary.errors === 0) {
        message.success(`Successfully imported ${importResult.summary.success} leads!`);
        resetModal();
      } else {
        setResult({
          successCount: importResult.summary.success,
          duplicateCount: importResult.summary.duplicates_found,
          errors: importResult.errorDetails
        });
      }
    } catch (error) {
      message.error(error.data?.message || "Failed to import leads");
    } finally {
      setImporting(false);
    }
  };

  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                      file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        message.error(`${file.name} is not an excel file`);
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const resetModal = () => {
    setFileList([]);
    setResult(null);
    onCancel();
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={resetModal}
      footer={[
        <Button key="cancel" onClick={resetModal}>
          {result ? 'Close' : 'Cancel'}
        </Button>,
        !result && (
          <Button 
            key="import" 
            type="primary" 
            loading={importing} 
            onClick={handleImport}
            disabled={fileList.length === 0}
            style={{ 
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
              height: '38px',
              borderRadius: '8px'
            }}
          >
            Start Import
          </Button>
        )
      ]}
      width={600}
      styles={{
        body: {
          padding: 0,
          borderRadius: '8px',
          overflow: 'hidden',
        }
      }}
      closeIcon={null}
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
          onClick={resetModal}
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
          }}
        >
          <FiX style={{ fontSize: "20px" }} />
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
            <FiUpload style={{ fontSize: "24px", color: "#ffffff" }} />
          </div>
          <div>
            <h2
              style={{
                margin: "0",
                fontSize: "22px",
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              Bulk Import Leads
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Upload Excel file to import leads in bulk
            </Text>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {!result ? (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message="Instructions"
              description={
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li>Download the template to see the required format.</li>
                  <li>Phone number and Lead Title (or First Name) are mandatory.</li>
                  <li>Maximum 500 leads can be imported at once.</li>
                </ul>
              }
              type="info"
              showIcon
            />

          <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed #d9d9d9', borderRadius: '8px', background: '#fafafa' }}>
            <Upload.Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <FiFileText style={{ fontSize: '48px', color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">Click or drag Excel file to this area to upload</p>
              <p className="ant-upload-hint">Support for .xlsx and .xls files only</p>
            </Upload.Dragger>
          </div>

          <Button 
            icon={<FiDownload />} 
            onClick={handleDownloadTemplate}
            style={{ width: '100%' }}
          >
            Download Sample Template
          </Button>
        </Space>
      ) : (
        <div style={{ padding: '10px 0' }}>
          <Title level={4} style={{ textAlign: 'center', color: '#52c41a' }}>
            <FiCheckCircle style={{ marginRight: '8px' }} />
            Import Summary
          </Title>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px', 
            margin: '20px 0',
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Total Rows</Text>
              <Title level={3} style={{ margin: 0 }}>{result.summary.total}</Title>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ color: '#52c41a' }}>Successful</Text>
              <Title level={3} style={{ margin: 0, color: '#52c41a' }}>{result.summary.success}</Title>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ color: '#faad14' }}>Duplicates</Text>
              <Title level={3} style={{ margin: 0, color: '#faad14' }}>{result.summary.duplicates_found}</Title>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ color: '#ff4d4f' }}>Errors</Text>
              <Title level={3} style={{ margin: 0, color: '#ff4d4f' }}>{result.summary.errors}</Title>
            </div>
          </div>

          {result.errorDetails.length > 0 && (
            <>
              <Divider orientation="left">Error Details (First 20)</Divider>
              <List
                size="small"
                dataSource={result.errorDetails}
                renderItem={item => (
                  <List.Item>
                    <Text type="danger"><FiAlertCircle style={{ marginRight: '4px' }} /> Row {item.row}:</Text> {item.message}
                  </List.Item>
                )}
                style={{ maxHeight: '200px', overflowY: 'auto' }}
              />
            </>
          )}
        </div>
      )}
      </div>
    </Modal>
  );
};

export default ImportLeadsModal;
