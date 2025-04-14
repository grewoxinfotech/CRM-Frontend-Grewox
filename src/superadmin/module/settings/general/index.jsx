import React, { useState } from 'react';
import { Form, Input, Button, Upload, Typography, Card, Space, Row, Col, Modal, message } from 'antd';
import { 
  UploadOutlined, 
  HomeOutlined, 
  SaveOutlined,
  CloudUploadOutlined,
  GlobalOutlined,
  BuildOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './general.scss';

const { Title } = Typography;

const GeneralSettings = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [termsContent, setTermsContent] = useState('');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [savedData, setSavedData] = useState(null);

  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  const uploadProps = {
    beforeUpload: (file) => {
      return false;
    },
  };

  const showPreview = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        termsContent,
      };
      setSavedData(formData);
      setIsViewMode(true);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        termsContent,
      };
      setSavedData(data);
      setIsViewMode(true);
      message.success('Settings saved successfully!');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleEdit = () => {
    editForm.setFieldsValue(savedData);
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  const handleEditSave = async () => {
    try {
      const values = await editForm.validateFields();
      setSavedData({ ...savedData, ...values });
      setIsEditModalVisible(false);
      message.success('Settings updated successfully!');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete these settings?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk() {
        setSavedData(null);
        setIsViewMode(false);
        form.resetFields();
        setTermsContent('');
        message.success('Settings deleted successfully!');
      },
    });
  };

  const EditModal = () => (
    <Modal
      title="Edit General Settings"
      visible={isEditModalVisible}
      onCancel={handleEditCancel}
      width={800}
      footer={[
        <Button key="back" onClick={handleEditCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleEditSave}>
          Save Changes
        </Button>,
      ]}
    >
      <Form
        form={editForm}
        layout="vertical"
        initialValues={savedData}
      >
        <Card className="edit-card" title="Company Information">
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <Form.Item
                label="Company Name"
                name="companyName"
                rules={[{ required: true, message: 'Please enter company name' }]}
              >
                <Input placeholder="Enter company name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Site Title"
                name="siteTitle"
                rules={[{ required: true, message: 'Please enter site title' }]}
              >
                <Input placeholder="Enter site title" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card className="edit-card" title="Brand Assets" style={{ marginTop: '20px' }}>
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <Form.Item
                label="Company Logo"
                name="logo"
              >
                <Upload.Dragger {...uploadProps} className="upload-area">
                  <div className="upload-content">
                    <CloudUploadOutlined className="upload-icon" />
                    <p className="upload-title">Upload Logo</p>
                    <p className="upload-hint">PNG, JPG up to 2MB</p>
                  </div>
                </Upload.Dragger>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Favicon"
                name="favicon"
              >
                <Upload.Dragger {...uploadProps} className="upload-area">
                  <div className="upload-content">
                    <CloudUploadOutlined className="upload-icon" />
                    <p className="upload-title">Upload Favicon</p>
                    <p className="upload-hint">ICO, PNG up to 1MB</p>
                  </div>
                </Upload.Dragger>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card className="edit-card" title="Terms & Conditions" style={{ marginTop: '20px' }}>
          <Form.Item
            name="termsContent"
            // label="Terms & Conditions"
            className="terms-form-item"
          >
            <Input.TextArea
              rows={5}
              placeholder="Enter your terms and conditions here..."
              className="terms-textarea"
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
            />
          </Form.Item>
        </Card>
      </Form>
    </Modal>
  );

  const ViewPage = () => (
    <div className="view-page">
      <div className="view-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Current Settings</h1>
            <p>View your general settings configuration</p>
          </div>
          <div className="header-actions">
            <Button 
              icon={<EditOutlined />} 
              onClick={handleEdit}
              className="edit-button"
            >
              Edit
            </Button>
            <Button 
              icon={<DeleteOutlined />} 
              onClick={handleDelete}
              danger
              className="delete-button"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="view-content">
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="Company Information" className="view-card">
              <Row gutter={[24, 24]}>
                <Col span={24} lg={8}>
                  <div className="view-item">
                    <h4 style={{ marginBottom: '10px' }}>Company Logo</h4>
                    {savedData?.logo?.fileList?.[0] ? (
                      <img 
                        src={URL.createObjectURL(savedData.logo.fileList[0].originFileObj)} 
                        alt="Company Logo" 
                        className="view-image"
                      />
                    ) : (
                      <div className="no-image">No logo uploaded</div>
                    )}
                  </div>
                </Col>
                <Col span={24} lg={16}>
                  <div className="view-item">
                    <h4 style={{ marginBottom: '10px' }}>Terms & Conditions</h4>
                    <div className="terms-content">
                      {savedData?.termsContent?.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );

  return (
    <div className="settings-page">
      {isViewMode ? (
        <ViewPage />
      ) : (
        <>
          <div className="nav-container">
            <div className="nav-breadcrumb">
              <Link to="/" className="nav-link">
                <HomeOutlined /> Home
              </Link>
              <span className="separator">/</span>
              <Link to="/settings" className="nav-link">Settings</Link>
              <span className="separator">/</span>
              <span className="current">General</span>
            </div>
          </div>

          <div className="header-section">
            <div className="header-content">
              <div className="header-info">
                <h1>General Settings</h1>
                <p>Manage your organization's general configuration and branding</p>
              </div>
            </div>
          </div>

          <div className="main-content">
            <div className="content-grid">
              {/* Company Info Card */}
              <Card className="settings-card company-info">
                <div className="card-header">
                  <BuildOutlined className="section-icon" />
                  <Title level={5}>Company Information</Title>
                </div>
                <Form
                  form={form}
                  layout="vertical"
                  className="settings-form"
                >
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Company Name"
                        name="companyName"
                        rules={[{ required: true, message: 'Please enter company name' }]}
                      >
                        <Input placeholder="Enter your company name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Site Title"
                        name="siteTitle"
                        rules={[{ required: true, message: 'Please enter site title' }]}
                      >
                        <Input placeholder="Enter your site title" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>

              {/* Brand Assets Card */}
              <Card className="settings-card brand-assets">
                <div className="card-header">
                  <GlobalOutlined className="section-icon" />
                  <Title level={5}>Brand Assets</Title>
                </div>
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <div className="upload-section">
                      <h4>Company Logo</h4>
                      <Upload.Dragger {...uploadProps} className="upload-area">
                        <div className="upload-content">
                          <CloudUploadOutlined className="upload-icon" />
                          <p className="upload-title">Upload Logo</p>
                          <p className="upload-hint">PNG, JPG up to 2MB</p>
                        </div>
                      </Upload.Dragger>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="upload-section">
                      <h4>Favicon</h4>
                      <Upload.Dragger {...uploadProps} className="upload-area">
                        <div className="upload-content">
                          <CloudUploadOutlined className="upload-icon" />
                          <p className="upload-title">Upload Favicon</p>
                          <p className="upload-hint">ICO, PNG up to 1MB</p>
                        </div>
                      </Upload.Dragger>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Terms Card */}
              <Card className="settings-card terms-section">
                <div className="card-header">
                  <UploadOutlined className="section-icon" />
                  <Title level={5}>Terms & Conditions</Title>
                </div>
                <div className="editor-container">
                  <Form.Item
                    name="termsContent"
                    // label="Terms & Conditions"
                    className="terms-form-item"
                  >
                    <Input.TextArea
                      rows={5}
                      placeholder="Enter your terms and conditions here..."
                      className="terms-textarea"
                      onChange={(e) => {
                        setTermsContent(e.target.value);
                        form.setFieldsValue({ termsContent: e.target.value });
                      }}
                    />
                  </Form.Item>
                </div>
              </Card>

              {/* Save Button Section */}
              <div className="save-button-section">
                <Button 
                  type="primary"
                  icon={<SaveOutlined />}
                  className="save-button"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      {isEditModalVisible && (
        <EditModal />
      )}
    </div>
  );
};

export default GeneralSettings;
