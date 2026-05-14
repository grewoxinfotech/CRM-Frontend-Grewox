import React, { useState } from 'react';
import { 
  Card, Button, Input, Select, Switch, Space, Row, Col, 
  Typography, Divider, Modal, List, Empty, Tooltip, message,
  InputNumber, Rate, Checkbox, Radio, Upload, Tag, Segmented, Form
} from 'antd';

import { 
  FiPlus, FiTrash2, FiSettings, FiEye, FiSave, 
  FiType, FiHash, FiMail, FiPhone, FiChevronDown, 
  FiCheckSquare, FiCircle, FiUpload, FiStar, FiFlag,
  FiLayout, FiMinus, FiArrowLeft, FiTarget, FiDollarSign,
  FiLink, FiTag, FiTrendingUp, FiShoppingBag, FiFileText,
  FiUser, FiBriefcase, FiMapPin, FiArrowUp, FiArrowDown,
  FiHome, FiCalendar, FiX
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import PageHeader from '../../../../components/PageHeader';


import './FormBuilder.scss';

const { Title, Text } = Typography;
const { Option } = Select;

const FIELD_TYPES = [
  { type: 'text', label: 'Short Text', icon: <FiType /> },
  { type: 'textarea', label: 'Long Text', icon: <FiLayout /> },
  { type: 'number', label: 'Number', icon: <FiHash /> },
  { type: 'email', label: 'Email', icon: <FiMail /> },
  { type: 'phone', label: 'Phone', icon: <FiPhone /> },
  { type: 'select', label: 'Dropdown', icon: <FiChevronDown /> },
  { type: 'multiselect', label: 'Multi Select', icon: <FiCheckSquare /> },
  { type: 'radio', label: 'Radio Buttons', icon: <FiCircle /> },
  { type: 'checkbox', label: 'Checkboxes', icon: <FiCheckSquare /> },
  { type: 'file', label: 'File Upload', icon: <FiUpload /> },
  { type: 'rating', label: 'Rating', icon: <FiStar /> },
  { type: 'priority', label: 'Priority', icon: <FiFlag /> },
  { type: 'heading', label: 'Section Heading', icon: <FiType /> },
  { type: 'divider', label: 'Divider', icon: <FiMinus /> },
];

const SYSTEM_FIELDS = {
  lead: [
    { type: 'text', label: 'Lead Title', key: 'leadTitle', icon: <FiTarget /> },
    { type: 'text', label: 'First Name', key: 'firstName', icon: <FiUser /> },
    { type: 'text', label: 'Last Name', key: 'lastName', icon: <FiUser /> },
    { type: 'phone', label: 'Phone Number', key: 'telephone', icon: <FiPhone /> },
    { type: 'number', label: 'Lead Value', key: 'leadValue', icon: <FiDollarSign /> },
    { type: 'email', label: 'Email', key: 'email', icon: <FiMail /> },
    { type: 'select', label: 'Associated Contact', key: 'contact_id', icon: <FiUser /> },
    { type: 'select', label: 'Associated Company', key: 'company_id', icon: <FiBriefcase /> },
    { type: 'text', label: 'Location / Address', key: 'address', icon: <FiMapPin /> },
    { type: 'textarea', label: 'Note / Requirement', key: 'description', icon: <FiFileText /> },
    { type: 'select', label: 'Pipeline', key: 'pipeline', icon: <FiTrendingUp /> },
    { type: 'select', label: 'Stage', key: 'stage', icon: <FiLayout /> },
    { type: 'select', label: 'Source', key: 'source', icon: <FiLink /> },
    { type: 'select', label: 'Category', key: 'category', icon: <FiTag /> },
  ],

  deal: [
    { type: 'text', label: 'Deal Title', key: 'dealTitle', icon: <FiShoppingBag /> },
    { type: 'text', label: 'First Name', key: 'firstName', icon: <FiUser /> },
    { type: 'text', label: 'Last Name', key: 'lastName', icon: <FiUser /> },
    { type: 'phone', label: 'Phone Number', key: 'telephone', icon: <FiPhone /> },
    { type: 'email', label: 'Email', key: 'email', icon: <FiMail /> },
    { type: 'number', label: 'Deal Value', key: 'value', icon: <FiDollarSign /> },
    { type: 'select', label: 'Pipeline', key: 'pipeline', icon: <FiTrendingUp /> },
    { type: 'select', label: 'Stage', key: 'stage', icon: <FiLayout /> },
    { type: 'select', label: 'Source', key: 'source', icon: <FiLink /> },
    { type: 'select', label: 'Category', key: 'category', icon: <FiTag /> },
    { type: 'text', label: 'Expected Close Date', key: 'closedDate', icon: <FiCalendar /> },
    { type: 'select', label: 'Status', key: 'status', icon: <FiCheckSquare /> },
    { type: 'select', label: 'Associated Contact', key: 'contact_id', icon: <FiUser /> },
    { type: 'select', label: 'Associated Company', key: 'company_id', icon: <FiBriefcase /> },
    { type: 'textarea', label: 'Description', key: 'description', icon: <FiFileText /> },
  ],

  contact: [
    { type: 'text', label: 'First Name', key: 'first_name', icon: <FiUser /> },
    { type: 'text', label: 'Last Name', key: 'last_name', icon: <FiUser /> },
    { type: 'email', label: 'Email', key: 'email', icon: <FiMail /> },
    { type: 'phone', label: 'Phone', key: 'phone', icon: <FiPhone /> },
    { type: 'text', label: 'Company Name', key: 'company_name', icon: <FiBriefcase /> },
    { type: 'text', label: 'Website', key: 'website', icon: <FiLink /> },
    { type: 'textarea', label: 'Description', key: 'description', icon: <FiFileText /> },
    { type: 'text', label: 'Address', key: 'address', icon: <FiMapPin /> },
  ],

  task: [
    { type: 'text', label: 'Task Name', key: 'task_name', icon: <FiFileText /> },
    { type: 'textarea', label: 'Description', key: 'description', icon: <FiFileText /> },
    { type: 'select', label: 'Status', key: 'status', icon: <FiCheckSquare /> },
    { type: 'priority', label: 'Priority', key: 'priority', icon: <FiFlag /> },
  ]
};


const FormBuilder = ({ onSave, onBack, initialData = null }) => {

  const [formTitle, setFormTitle] = useState(initialData?.title || '');
  const [formDescription, setFormDescription] = useState(initialData?.description || '');
  const [moduleType, setModuleType] = useState(initialData?.module_type || 'lead');
  const [fields, setFields] = useState(() => {
    if (!initialData?.fields) return [];
    try {
      const parsedFields = typeof initialData.fields === 'string' ? JSON.parse(initialData.fields) : initialData.fields;
      // Sanitize fields to ensure options array exists for relevant types
      return parsedFields.map(f => ({
        ...f,
        options: f.options || (['select', 'multiselect', 'radio', 'checkbox'].includes(f.type) ? ['Option 1'] : [])
      }));
    } catch (e) {
      console.error("Failed to parse fields:", e);
      return [];
    }
  });

  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);

  // Auto-populate removed: Custom Forms start with a blank canvas so users can add whatever fields they want.

  const addField = (fieldData, isSystem = false) => {
    const type = typeof fieldData === 'string' ? fieldData : fieldData.type;
    const label = isSystem ? fieldData.label : `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`;
    const newField = {
      id: isSystem ? `sys_${fieldData.key}` : `field_${Date.now()}`,
      type,
      label,
      key: isSystem ? fieldData.key : null,
      is_system: isSystem,
      placeholder: `Enter ${label.toLowerCase()}`,
      required: isSystem,
      options: fieldData.options || (['select', 'multiselect', 'radio', 'checkbox'].includes(type) ? ['Option 1'] : []),
      validation: {},
      show_in_quick: isSystem && ['firstName', 'lastName', 'telephone', 'email', 'description'].includes(fieldData.key),
      show_in_full: true,
    };
    
    if (!newField.required && !newField.label.includes('(Optional)')) {
      newField.label += ' (Optional)';
    }


    
    // Prevent duplicate system fields
    if (isSystem && fields.some(f => f.key === fieldData.key)) {
      return message.warning(`${fieldData.label} is already in the form`);
    }
    
    setFields([...fields, newField]);
  };

  const removeField = (id) => {
    const field = fields.find(f => f.id === id);
    // Only restrict removing mandatory fields if this is a default form
    if (initialData?.form_type === 'default' && field && field.is_system && ['leadTitle', 'firstName', 'dealTitle', 'pipeline', 'stage', 'leadValue', 'value'].includes(field.key)) {
      return message.error(`${field.label} is a mandatory field and cannot be removed from a default form`);
    }
    setFields(fields.filter(f => f.id !== id));
  };



  const updateField = (id, updates) => {
    setFields(prevFields => prevFields.map(f => {
      if (f.id === id) {
        const newField = { ...f, ...updates };
        // Sync placeholder if label changed and placeholder was the default one
        if (updates.label && (f.placeholder === `Enter ${f.label.toLowerCase()}` || !f.placeholder)) {
          newField.placeholder = `Enter ${updates.label.toLowerCase()}`;
        }
        
        // Also update editingField state so the properties panel updates immediately
        if (editingField && editingField.id === id) {
          setEditingField(newField);
        }
        
        return newField;
      }
      return f;
    }));
  };


  const moveField = (index, direction) => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  };

  const handleSave = () => {
    if (!formTitle) return message.error('Please enter a form title');
    if (fields.length === 0) return message.error('Please add at least one field');
    
    onSave({
      title: formTitle,
      description: formDescription,
      module_type: moduleType,
      fields: fields
    });
  };

  return (
    <div className="form-builder-container">
      <PageHeader 
        title={initialData ? "Edit Custom Form" : "Create Custom Form"}
        subtitle={`Designing form for ${moduleType.toUpperCase()} module`}
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: 'CRM' },
          { title: <Link to="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Custom Forms</Link> },
          { title: initialData ? "Edit Form" : "New Form" }
        ]}
        extraActions={
          <Space>
            <Button icon={<FiEye />} onClick={() => setIsPreviewVisible(true)}>Preview</Button>
            <Button type="primary" icon={<FiSave />} onClick={handleSave}>Save Form</Button>
          </Space>
        }
      />

      <Row gutter={24}>
        {/* Left Panel: Field Library */}
        <Col span={6}>
          <div className="sidebar-scrollable">
            <Card title="System Fields" className="field-library-card mb-3" size="small">
              <Text type="secondary" style={{ marginBottom: 12, display: 'block', fontSize: '12px' }}>
                Standard {moduleType} fields
              </Text>
              <div className="field-type-grid">
                {(SYSTEM_FIELDS[moduleType] || []).map(sf => (
                  <div key={sf.key} className="field-type-item system-field" onClick={() => addField(sf, true)}>
                    <div className="field-icon">{sf.icon}</div>
                    <span className="field-label">{sf.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Custom Field Library" className="field-library-card" size="small">
              <Text type="secondary" style={{ marginBottom: 12, display: 'block', fontSize: '12px' }}>
                Add your own custom fields
              </Text>
              <div className="field-type-grid">
                {FIELD_TYPES.map(ft => (
                  <div key={ft.type} className="field-type-item" onClick={() => addField(ft.type)}>
                    <div className="field-icon">{ft.icon}</div>
                    <span className="field-label">{ft.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Col>


        {/* Center Panel: Form Canvas */}
        <Col span={10}>
          <Card className="form-canvas-card">
            <div className="form-settings mb-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <FiSettings style={{ fontSize: '18px' }} />
                </div>
                <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>Form Information</Text>
              </div>

              {!(initialData?.title === 'Default Lead Form' || initialData?.title === 'Default Deal Form') ? (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <Input 
                    size="large" 
                    placeholder="Form Title (e.g., Real Estate Lead Form)" 
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="form-title-input"
                    style={{ border: 'none', borderBottom: '2px solid #f1f5f9', borderRadius: 0, padding: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}
                  />
                  <Input.TextArea 
                    placeholder="Add a short description for this form..." 
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    rows={2}
                    style={{ border: 'none', marginTop: '12px', resize: 'none', background: 'transparent', padding: 0 }}
                  />
                </div>
              ) : (
                <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4} style={{ margin: 0, color: '#1e3a8a' }}>{formTitle}</Title>
                    <Tag color="processing" style={{ borderRadius: '6px', fontWeight: '500' }}>SYSTEM DEFAULT</Tag>
                  </div>
                  <Text type="secondary" style={{ marginTop: '8px', display: 'block', color: '#1e40af' }}>{formDescription}</Text>
                </div>
              )}
              
              {initialData?.form_type === 'default' && (
                <div className="mt-4 module-selection-container" style={{ 
                  background: '#f8fafc', 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <Text strong style={{ display: 'block', marginBottom: '12px', color: '#475569' }}>
                    Target Module
                  </Text>
                  <Segmented
                    block
                    size="large"
                    value={moduleType}
                    onChange={(value) => setModuleType(value)}
                    disabled={true}
                    options={[
                      {
                        label: (
                          <div style={{ padding: '4px' }}>
                            <FiTarget style={{ marginRight: 8, fontSize: '16px' }} />
                            <span>Lead Module</span>
                          </div>
                        ),
                        value: 'lead',
                      },
                      {
                        label: (
                          <div style={{ padding: '4px' }}>
                            <FiShoppingBag style={{ marginRight: 8, fontSize: '16px' }} />
                            <span>Deal Module</span>
                          </div>
                        ),
                        value: 'deal',
                      },
                    ]}
                  />
                  <Text type="secondary" style={{ display: 'block', marginTop: '8px', fontSize: '12px' }}>
                    Select which system module this form will be associated with.
                  </Text>
                </div>
              )}
            </div>


            <Divider />

            <div className="canvas-fields">
              {(fields || []).length === 0 ? (
                <Empty description="Drag fields here or click from library" />
              ) : (
                (fields || []).map((field, index) => (

                  <div 
                    key={field.id} 
                    className={`canvas-field-item ${editingField?.id === field.id ? 'active' : ''}`}
                    onClick={() => setEditingField(field)}
                  >
                    <div className="field-actions">
                      <Button 
                        size="small" 
                        icon={<FiArrowUp />} 
                        disabled={index === 0}
                        onClick={() => moveField(index, 'up')} 
                      />
                      <Button 
                        size="small" 
                        icon={<FiArrowDown />} 
                        disabled={index === fields.length - 1}
                        onClick={() => moveField(index, 'down')} 
                      />
                      <Button 
                        size="small" 
                        icon={<FiSettings />} 
                        onClick={() => setEditingField(field)} 
                      />
                      {!(field.is_system && ['leadTitle', 'firstName', 'dealTitle', 'pipeline', 'stage', 'leadValue', 'value'].includes(field.key)) && (
                        <Button 
                          size="small" 
                          danger 
                          icon={<FiTrash2 />} 
                          onClick={() => removeField(field.id)} 
                        />
                      )}
                    </div>
                    
                    <div className="field-content">
                      {field.type === 'heading' ? (
                        <Title level={5}>{field.label}</Title>
                      ) : field.type === 'divider' ? (
                        <Divider />
                      ) : (
                        <div className="field-preview">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Text strong>
                              {field.label.replace(/\s*\(Optional\)$/i, '')} 
                              {field.required ? <Text danger>*</Text> : <Text type="secondary" style={{ fontWeight: 'normal', fontSize: '12px' }}> (Optional)</Text>}
                            </Text>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {field.is_system && <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>SYSTEM</Tag>}
                              {moduleType === 'lead' && field.show_in_quick && <Tag color="cyan" style={{ fontSize: '10px', margin: 0 }}>QUICK</Tag>}
                              {field.show_in_full !== false && <Tag color="geekblue" style={{ fontSize: '10px', margin: 0 }}>FULL</Tag>}
                            </div>
                          </div>
                          <div className="mt-1">

                            {['text', 'email', 'phone', 'url'].includes(field.type) && <Input disabled placeholder={field.placeholder} />}
                            {field.type === 'textarea' && <Input.TextArea disabled rows={2} />}
                            {field.type === 'number' && <InputNumber style={{ width: '100%' }} disabled />}
                            {field.type === 'rating' && <Rate disabled />}
                            {field.type === 'select' && <Select style={{ width: '100%' }} disabled placeholder="Select option" />}
                            {field.type === 'file' && <div className="upload-placeholder"><FiUpload /> Click to upload</div>}
                            {field.type === 'priority' && (
                              <Radio.Group disabled>
                                <Radio value="low">Low</Radio>
                                <Radio value="medium">Medium</Radio>
                                <Radio value="high">High</Radio>
                              </Radio.Group>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>

        {/* Right Panel: Field Properties */}
        <Col span={8}>
          <Card title="Field Properties" className="field-properties-card">
            {editingField ? (
              <div className="properties-form">
                <div className="mb-3">
                  <Text strong>Field Label</Text>
                  <Input 
                    value={editingField.label} 
                    onChange={e => updateField(editingField.id, { label: e.target.value })} 
                  />
                </div>
                
                {!['heading', 'divider'].includes(editingField.type) && (
                  <>
                    <div className="mb-3">
                      <Text strong>Placeholder</Text>
                      <Input 
                        value={editingField.placeholder} 
                        onChange={e => updateField(editingField.id, { placeholder: e.target.value })} 
                      />
                    </div>
                    <div className="mb-3">
                      <Space>
                        <Switch 
                          checked={editingField.required} 
                          disabled={editingField.is_system && ['leadTitle', 'firstName', 'dealTitle', 'pipeline', 'stage', 'leadValue', 'value'].includes(editingField.key)}
                          onChange={val => {
                            updateField(editingField.id, { required: val });
                          }} 
                        />
                        <Text>Required Field</Text>
                      </Space>
                    </div>

                    <div className="mb-3">
                      <Divider style={{ margin: '12px 0' }} />
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>Form Visibility</Text>
                      <Space direction="vertical">
                        {moduleType === 'lead' && (
                          <Checkbox 
                            checked={editingField.show_in_quick} 
                            onChange={e => updateField(editingField.id, { show_in_quick: e.target.checked })}
                          >
                            Show in Quick Mode
                          </Checkbox>
                        )}
                        <Checkbox 
                          checked={moduleType === 'deal' ? true : editingField.show_in_full !== false} 
                          onChange={e => updateField(editingField.id, { show_in_full: e.target.checked })}
                          disabled={moduleType === 'deal'}
                        >
                          Show in Full Form
                        </Checkbox>
                      </Space>
                    </div>
                  </>
                )}

                {['select', 'multiselect', 'radio', 'checkbox'].includes(editingField.type) && (
                  <div className="mb-3">
                    <Text strong>Options</Text>
                    <List
                      dataSource={editingField.options || []}
                      renderItem={(opt, i) => (
                        <List.Item actions={[
                          <Button size="small" type="link" danger icon={<FiTrash2 />} onClick={() => {
                            const newOpts = [...editingField.options];
                            newOpts.splice(i, 1);
                            updateField(editingField.id, { options: newOpts });
                          }} />
                        ]}>
                          <Input 
                            value={opt} 
                            onChange={e => {
                              const newOpts = [...(editingField.options || [])];
                              newOpts[i] = e.target.value;
                              updateField(editingField.id, { options: newOpts });
                            }} 
                          />
                        </List.Item>
                      )}
                      footer={
                        <Button 
                          type="dashed" 
                          block 
                          icon={<FiPlus />} 
                          onClick={() => updateField(editingField.id, { options: [...(editingField.options || []), `Option ${(editingField.options?.length || 0) + 1}`] })}
                        >
                          Add Option
                        </Button>
                      }
                    />
                  </div>
                )}
                
                <Button block onClick={() => setEditingField(null)}>Close Settings</Button>
              </div>
            ) : (
              <Empty description="Select a field to edit its properties" />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={null}
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        footer={null}
        width={800}
        centered
        className="pro-modal custom-modal"
        styles={{
          body: {
            padding: 0,
            borderRadius: "12px",
            overflow: "hidden",
          },
        }}
        closeIcon={<FiX style={{ color: '#fff', fontSize: '20px' }} />}
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
              {moduleType === 'lead' ? (
                <FiTarget style={{ fontSize: "24px", color: "#ffffff" }} />
              ) : (
                <FiShoppingBag style={{ fontSize: "24px", color: "#ffffff" }} />
              )}
            </div>
            <div>
              <h2
                style={{
                  margin: "0",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                {formTitle || `Create ${moduleType === 'lead' ? 'Lead' : 'Deal'}`}
              </h2>
              <Text
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                {formDescription || `Fill in the information to create ${moduleType}`}
              </Text>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px", maxHeight: '70vh', overflowY: 'auto' }}>
          <Form layout="vertical">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
            }}>
              {(fields || []).map(field => {
                const isFullWidth = field.type === 'textarea' || field.type === 'heading' || field.type === 'divider' || field.grid_column === 'span 2';
                
                if (field.type === 'heading') {
                  return (
                    <div key={field.id} style={{ gridColumn: 'span 2', marginTop: '8px', marginBottom: '8px' }}>
                      <Title level={5} style={{ margin: 0, color: '#1e293b', borderLeft: '4px solid #1890ff', paddingLeft: '12px' }}>
                        {field.label}
                      </Title>
                    </div>
                  );
                }

                if (field.type === 'divider') {
                  return <Divider key={field.id} style={{ gridColumn: 'span 2', margin: '12px 0' }} />;
                }

                return (
                  <Form.Item
                    key={field.id}
                    label={<span style={{ fontWeight: '500', color: '#475569' }}>{field.label} {field.required && <span style={{ color: '#ff4d4f' }}>*</span>}</span>}
                    style={{ gridColumn: isFullWidth ? 'span 2' : 'span 1', marginBottom: '16px' }}
                  >
                    {field.type === 'text' && <Input placeholder={field.placeholder} style={{ height: '40px', borderRadius: '8px' }} />}
                    {field.type === 'number' && <InputNumber placeholder={field.placeholder} style={{ width: '100%', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center' }} />}
                    {field.type === 'email' && <Input type="email" placeholder={field.placeholder} style={{ height: '40px', borderRadius: '8px' }} />}
                    {field.type === 'phone' && <Input placeholder={field.placeholder} style={{ height: '40px', borderRadius: '8px' }} />}
                    {field.type === 'textarea' && <Input.TextArea placeholder={field.placeholder} rows={3} style={{ borderRadius: '8px' }} />}
                    {field.type === 'rating' && <Rate />}
                    {field.type === 'priority' && (
                      <Radio.Group optionType="button" buttonStyle="solid">
                        <Radio value="low">Low</Radio>
                        <Radio value="medium">Medium</Radio>
                        <Radio value="high">High</Radio>
                      </Radio.Group>
                    )}
                    {['select', 'multiselect'].includes(field.type) && (
                      <Select 
                        mode={field.type === 'multiselect' ? 'multiple' : 'default'} 
                        placeholder={field.placeholder}
                        style={{ width: '100%' }}
                        size="large"
                      >
                        {field.options?.map(o => <Option key={o} value={o}>{o}</Option>)}
                      </Select>
                    )}
                    {field.type === 'radio' && (
                      <Radio.Group>
                        {field.options?.map(o => <Radio key={o} value={o}>{o}</Radio>)}
                      </Radio.Group>
                    )}
                    {field.type === 'checkbox' && (
                      <Checkbox.Group options={field.options || []} />
                    )}
                    {field.type === 'file' && (
                      <div style={{ border: '1px dashed #cbd5e1', padding: '12px', borderRadius: '8px', background: '#f8fafc', textAlign: 'center' }}>
                        <FiUpload style={{ fontSize: '20px', color: '#64748b', marginBottom: '4px' }} />
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Click or drag file to upload</div>
                      </div>
                    )}
                  </Form.Item>
                );
              })}
            </div>
          </Form>

          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "24px",
            borderTop: "1px solid #f0f0f0",
            paddingTop: "24px",
            marginBottom: "12px"
          }}>
            <Button onClick={() => setIsPreviewVisible(false)} style={{ borderRadius: '8px', height: '40px' }}>
              Cancel
            </Button>
            <Button type="primary" style={{ borderRadius: '8px', height: '40px', background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', border: 'none' }}>
              Submit Preview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FormBuilder;
