import React from 'react';
import { Modal, Form, Input, Button, Select, Upload, Space, Checkbox } from 'antd';
import { FiFileText, FiPaperclip, FiClock, FiX } from 'react-icons/fi';
import { emailTemplates } from '../templates/emailTemplates';

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

    const newFields = { ...templateFields, [field]: value };
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

  const handleAttachmentChange = ({ fileList }) => {
    setAttachments(fileList);
  };

  return (
    <Modal
      title={
        <div className="compose-header">
          <FiFileText className="header-icon" />
          <span>{selectedTemplate ? `Compose: ${selectedTemplate.name}` : 'New Message'}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      className="compose-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="compose-form"
      >
        <div className="compose-toolbar">
          <Space>
            <Select
              placeholder="Select email template"
              onChange={handleTemplateSelect}
              allowClear
              style={{ width: '200px' }}
              value={selectedTemplate?.name}
            >
              {Object.entries(emailTemplates).map(([key, template]) => (
                <Option key={key} value={key}>
                  {template.name}
                </Option>
              ))}
            </Select>
            <Upload
              multiple
              fileList={attachments}
              onChange={handleAttachmentChange}
              beforeUpload={() => false}
              showUploadList={false}
            >
              <Button icon={<FiPaperclip />}>
                Attach
              </Button>
            </Upload>
            <Button onClick={handleSchedule} icon={<FiClock />}>
              Schedule
            </Button>
            <Checkbox 
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
            >
              Mark as Important
            </Checkbox>
          </Space>
        </div>

        {selectedTemplate && (
          <div className="template-fields">
            {selectedTemplate.fields.map(field => (
              <Form.Item key={field} label={field.replace(/_/g, ' ').toUpperCase()}>
                <Input
                  value={templateFields[field]}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                />
              </Form.Item>
            ))}
          </div>
        )}

        <Form.Item
          name="to"
          rules={[{ required: true, message: 'Please enter recipient email' }]}
        >
          <Input placeholder="To:" />
        </Form.Item>

        <Form.Item
          name="subject"
          rules={[{ required: true, message: 'Please enter subject' }]}
        >
          <Input placeholder="Subject" />
        </Form.Item>

        <Form.Item
          name="html"
          rules={[{ required: true, message: 'Please enter email content' }]}
        >
          <TextArea
            placeholder="Write your message here..."
            autoSize={{ minRows: 10 }}
          />
        </Form.Item>

        {attachments.length > 0 && (
          <div className="attachments-preview">
            {attachments.map(file => (
              <div key={file.uid} className="attachment-item">
                <span>{file.name}</span>
                <Button
                  type="text"
                  icon={<FiX />}
                  onClick={() => setAttachments(prev => prev.filter(f => f.uid !== file.uid))}
                />
              </div>
            ))}
          </div>
        )}

        <Form.Item className="form-actions">
          <Space>
            <Button type="primary" htmlType="submit">
              Send
            </Button>
            <Button onClick={onCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ComposeModal;