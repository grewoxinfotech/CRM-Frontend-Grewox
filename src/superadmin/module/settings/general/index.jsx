import React, { useState } from 'react';
import { Form, Input, Button, Upload, Typography, Card, Space, Row, Col } from 'antd';
import { 
  UploadOutlined, 
  HomeOutlined, 
  SaveOutlined,
  CloudUploadOutlined,
  GlobalOutlined,
  BuildOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './general.scss';

const { Title } = Typography;

const GeneralSettings = () => {
  const [form] = Form.useForm();
  const [termsContent, setTermsContent] = useState('');

  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  const uploadProps = {
    beforeUpload: (file) => {
      return false;
    },
  };

  return (
    <div className="settings-page">
        
      {/* Navigation Bar */}
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

      {/* Page Header */}
      <div className="header-section">
        <div className="header-content">
          <div className="header-info">
            <h1>General Settings</h1>
            <p>Manage your organization's general configuration and branding</p>
          </div>
          <div className="header-actions">
            <Button 
              type="primary"
              icon={<SaveOutlined />}
              className="save-button"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
              <ReactQuill
                theme="snow"
                value={termsContent}
                onChange={setTermsContent}
                className="terms-editor"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
