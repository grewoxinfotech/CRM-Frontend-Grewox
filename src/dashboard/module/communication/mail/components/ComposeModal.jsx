import React from 'react';
import { Modal, Form, Input, Button, Select, Upload, Space, Checkbox, DatePicker, TimePicker, message, Divider, Tooltip, Row, Col } from 'antd';
import { FiFileText, FiPaperclip, FiClock, FiX, FiFile, FiSend, FiSave, FiTrash2, FiAlertCircle, FiUser, FiMail, FiType } from 'react-icons/fi';
import { emailTemplates } from '../templates/emailTemplates';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const ComposeModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  form,
  selectedTemplate,
  setSelectedTemplate,
  templateFields,
  setTemplateFields,
  attachments,
  setAttachments,
  isImportant,
  setIsImportant,
  handleSchedule
}) => {
  const handleTemplateSelect = (templateKey) => {
    const template = emailTemplates[templateKey];
    if (!template) return;

    setSelectedTemplate(template);
    setTemplateFields({});

    form.setFieldsValue({
      subject: template.subject,
      html: template.html,
      to: '',
      templateKey
    });
  };

  const handleFieldChange = (field, value) => {
    if (!selectedTemplate) return;

    // Format date and time values
    let formattedValue = value;
    if (value instanceof dayjs) {
      const fieldType = selectedTemplate.fields.find(f => f.name === field)?.type;
      if (fieldType === 'date') {
        formattedValue = value.format('YYYY-MM-DD');
      } else if (fieldType === 'time') {
        formattedValue = value.format('HH:mm');
      }
    }

    const newFields = { ...templateFields, [field]: formattedValue };
    setTemplateFields(newFields);

    let updatedSubject = selectedTemplate.subject;
    let updatedHtml = selectedTemplate.html;

    Object.entries(newFields).forEach(([key, val]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      updatedSubject = updatedSubject.replace(regex, val || `{{${key}}}`);
      updatedHtml = updatedHtml.replace(regex, val || `{{${key}}}`);
    });

    form.setFieldsValue({
      subject: updatedSubject,
      html: updatedHtml
    });
  };

  const handleAttachmentChange = ({ file, fileList }) => {
    // Validate file size (max 10MB)
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File must be smaller than 10MB!');
      return;
    }

    // Update file list with additional properties
    const updatedFileList = fileList.map(f => {
      if (f.uid === file.uid) {
        return {
          ...f,
          status: 'done',
          url: URL.createObjectURL(f.originFileObj), // Create URL for preview
        };
      }
      return f;
    });

    setAttachments(updatedFileList);
  };

  const renderFieldInput = (field) => {
    switch (field.type) {
      case 'date':
        return (
          <DatePicker
            style={{ width: '100%' }}
            onChange={(date) => handleFieldChange(field.name, date)}
            placeholder={`Select ${field.name.replace(/_/g, ' ')}`}
            className="custom-input"
          />
        );
      case 'time':
        return (
          <TimePicker
            style={{ width: '100%' }}
            format="HH:mm"
            onChange={(time) => handleFieldChange(field.name, time)}
            placeholder={`Select ${field.name.replace(/_/g, ' ')}`}
            className="custom-input"
          />
        );
      default:
        return (
          <Input
            value={templateFields[field.name]}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.name.replace(/_/g, ' ')}`}
            className="custom-input"
            prefix={<FiType className="input-icon" />}
          />
        );
    }
  };

  return (
    <Modal
      title={
        <div className="modal-header">
          <div className="header-icon">
            <FiMail />
          </div>
          <div className="header-content">
            <div className="header-title">Create New Message</div>
            <div className="header-subtitle">Fill in the information to send email</div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="colorful-modal"
      closable={true}
      closeIcon={<FiX />}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="modern-form"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              name="to"
              label="To"
              rules={[{ required: true, message: 'Please enter recipient email' }]}
            >
              <Input 
                placeholder="Enter recipient email address"
                prefix={<FiMail className="field-icon" />}
                className="colorful-input"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="subject"
              label="Subject"
              rules={[{ required: true, message: 'Please enter subject' }]}
            >
              <Input 
                placeholder="Enter email subject"
                prefix={<FiType className="field-icon" />}
                className="colorful-input"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="template"
              label="Email Template"
            >
              <Select
                placeholder="Select email template"
                onChange={handleTemplateSelect}
                allowClear
                suffixIcon={<FiFileText className="field-icon" />}
                className="colorful-select"
              >
                {Object.entries(emailTemplates).map(([key, template]) => (
                  <Option key={key} value={key}>
                    {template.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {selectedTemplate && (
            <Col span={24}>
              <div className="template-fields">
                <Row gutter={[16, 16]}>
                  {selectedTemplate.fields.map(field => (
                    <Col span={12} key={field.name}>
                      <Form.Item 
                        label={field.name.replace(/_/g, ' ').toUpperCase()}
                      >
                        {renderFieldInput(field)}
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>
          )}

          <Col span={24}>
            <Form.Item
              name="html"
              label="Message"
              rules={[{ required: true, message: 'Please enter message content' }]}
            >
              <TextArea
                placeholder="Write your message here..."
                autoSize={{ minRows: 8, maxRows: 12 }}
                className="colorful-textarea"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <div className="action-buttons">
              <Space size={12}>
                <Upload
                  multiple
                  fileList={attachments}
                  onChange={handleAttachmentChange}
                  beforeUpload={() => false}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  showUploadList={false}
                >
                  <Button icon={<FiPaperclip />} className="colorful-button attach">
                    Attach Files
                  </Button>
                </Upload>
                <Button onClick={handleSchedule} icon={<FiClock />} className="colorful-button schedule">
                  Schedule
                </Button>
                <Checkbox 
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="colorful-checkbox"
                >
                  Mark as Important
                </Checkbox>
              </Space>
            </div>
          </Col>

          {attachments.length > 0 && (
            <Col span={24}>
              <div className="attachments-list">
                {attachments.map(file => (
                  <div key={file.uid} className="attachment-item">
                    <div className="file-info">
                      <FiFile className="file-icon" />
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button
                      type="text"
                      icon={<FiX />}
                      onClick={() => {
                        setAttachments(prev => prev.filter(f => f.uid !== file.uid));
                        URL.revokeObjectURL(file.url);
                      }}
                      className="remove-btn"
                    />
                  </div>
                ))}
              </div>
            </Col>
          )}
        </Row>

        <div className="modal-footer">
          <Button onClick={onCancel} className="colorful-button cancel">Cancel</Button>
          <Button type="primary" htmlType="submit" className="colorful-button submit">
            Send Email
          </Button>
        </div>
      </Form>

      <style jsx>{`
        .modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 120px;
          // margin: -6px 0;
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
          margin: -25px -24px -24px -25px ;
          padding: 20px 24px;
          border-radius: 12px 12px 0 0;
          color: white;
        }

        .header-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }

        .header-content {
          display: flex;
          flex-direction: column;
        }

        .header-title {
          font-size: 18px;
          font-weight: 600;
          color: white;
        }

        .header-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 2px;
        }

        :global(.colorful-modal .ant-modal-content) {
          padding: 20px 24px 24px;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.12);
        }

        :global(.colorful-modal .ant-modal-close) {
          top: 20px;
          right: 20px;
          color: white;
        }

        :global(.colorful-modal .ant-form-item-label > label) {
          font-weight: 500;
          color: #4B5563;
          font-size: 14px;
          height: 24px;
        }

        :global(.colorful-modal .colorful-input) {
          border-radius: 10px;
          border-color: #E5E7EB;
          height: 42px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        :global(.colorful-modal .colorful-input:hover) {
          border-color: #6366F1;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);
        }

        :global(.colorful-modal .colorful-input:focus) {
          border-color: #6366F1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.16);
        }

        :global(.colorful-modal .colorful-select .ant-select-selector) {
          border-radius: 10px !important;
          height: 42px !important;
          align-items: center;
          border-color: #E5E7EB !important;
          transition: all 0.3s ease;
        }

        :global(.colorful-modal .colorful-select:hover .ant-select-selector) {
          border-color: #6366F1 !important;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);
        }

        :global(.colorful-modal .colorful-select.ant-select-focused .ant-select-selector) {
          border-color: #6366F1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.16) !important;
        }

        :global(.colorful-modal .colorful-textarea) {
          border-radius: 10px;
          border-color: #E5E7EB;
          font-size: 14px;
          padding: 12px;
          transition: all 0.3s ease;
        }

        :global(.colorful-modal .colorful-textarea:hover) {
          border-color: #6366F1;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);
        }

        :global(.colorful-modal .colorful-textarea:focus) {
          border-color: #6366F1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.16);
        }

        .field-icon {
          color: #096dd9;
          font-size: 16px;
        }

        .action-buttons {
          margin-top: -8px;
        }

        :global(.colorful-button) {
          height: 42px;
          border-radius: 10px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        :global(.colorful-button.attach) {
          background: #EEF2FF;
          border-color: #E0E7FF;
          color: #6366F1;
        }

        :global(.colorful-button.attach:hover) {
          background: #E0E7FF;
          border-color: #C7D2FE;
        }

        :global(.colorful-button.schedule) {
          background: #F0FDF4;
          border-color: #DCFCE7;
          color: #22C55E;
        }

        :global(.colorful-button.schedule:hover) {
          background: #DCFCE7;
          border-color: #BBF7D0;
        }

        :global(.colorful-button.submit) {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          border: none;
          color: white;
          padding: 0 28px;
        }

        :global(.colorful-button.submit:hover) {
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        :global(.colorful-button.cancel) {
          border-color: #E5E7EB;
          color: #6B7280;
        }

        :global(.colorful-button.cancel:hover) {
          background: #F9FAFB;
          border-color: #D1D5DB;
        }

        :global(.colorful-checkbox .ant-checkbox-inner) {
          border-radius: 6px;
          border-color: #E5E7EB;
          transition: all 0.3s ease;
        }

        :global(.colorful-checkbox:hover .ant-checkbox-inner) {
          border-color: #6366F1;
        }

        :global(.colorful-checkbox .ant-checkbox-checked .ant-checkbox-inner) {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          border-color: #6366F1;
        }

        .attachments-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .attachment-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .attachment-item:hover {
          background: #F3F4F6;
          border-color: #D1D5DB;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .file-icon {
          color: #6366F1;
          font-size: 18px;
        }

        .file-name {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .file-size {
          font-size: 13px;
          color: #6B7280;
        }

        .remove-btn {
          color: #6B7280;
          padding: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .remove-btn:hover {
          color: #EF4444;
          background: #FEE2E2;
        }

        .modal-footer {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #E5E7EB;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      `}</style>
    </Modal>
  );
};

export default ComposeModal;