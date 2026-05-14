import React, { useState } from 'react';
import { Card, Button, Table, Tag, Space, Typography, Empty, Modal, message, Switch, Tooltip, Dropdown } from 'antd';
import { FiPlus, FiEdit, FiTrash2, FiCopy, FiLayers, FiShare2, FiList, FiMoreVertical, FiHome } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

import FormBuilder from './FormBuilder';
import PageHeader from '../../../../components/PageHeader';
import './CustomForms.scss';
import { 
  useGetCustomFormsQuery, 
  useCreateCustomFormMutation, 
  useUpdateCustomFormMutation, 
  useDeleteCustomFormMutation 
} from '../generate-link/services/customFormApi';

const { Title, Text } = Typography;

const CustomForms = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('list');
  const [selectedForm, setSelectedForm] = useState(null);
  
  const { data: formsData, isLoading } = useGetCustomFormsQuery();
  const [createForm] = useCreateCustomFormMutation();
  const [updateForm] = useUpdateCustomFormMutation();
  const [deleteForm] = useDeleteCustomFormMutation();

  const forms = formsData?.data || [];

  const handleCreateNew = () => {
    setSelectedForm(null);
    setView('builder');
  };

  const handleEdit = (form) => {
    setSelectedForm(form);
    setView('builder');
  };

  const handleSaveForm = async (formData) => {
    try {
      if (selectedForm) {
        await updateForm({ id: selectedForm.id, ...formData }).unwrap();
        message.success('Form updated successfully');
      } else {
        await createForm(formData).unwrap();
        message.success('Form created successfully');
      }
      setView('list');
    } catch (error) {
      message.error('Failed to save form: ' + (error?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this form?',
      content: 'This action cannot be undone.',
      onOk: async () => {
        try {
          await deleteForm(id).unwrap();
          message.success('Form deleted successfully');
        } catch (error) {
          message.error('Failed to delete form');
        }
      }
    });
  };

  const handleShare = (form) => {
    const url = `${window.location.origin}/forms/${form.id}`;
    navigator.clipboard.writeText(url);
    message.success('Form link copied to clipboard!');
  };


  const columns = [

    {
      title: 'Form Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: '15px' }}>{text}</Text>
          <br />
          <Text type="secondary" size="small">{record.description}</Text>
        </div>
      )
    },
    {
      title: 'Module',
      dataIndex: 'module_type',
      key: 'module_type',
      render: (type) => <Tag color={type === 'lead' ? 'blue' : 'purple'}>{type.toUpperCase()}</Tag>
    },
    {
      title: 'Type',
      dataIndex: 'form_type',
      key: 'form_type',
      render: (type, record) => (
        <Space>
          {type === 'default' ? <Tag color="blue">DEFAULT</Tag> : <Tag color="green">CUSTOM</Tag>}
          {record.is_template && <Tag color="orange">TEMPLATE</Tag>}
        </Space>
      )
    },
    {
      title: 'Fields (Quick / Full)',
      key: 'field_counts',
      render: (_, record) => {
        let fields = [];
        try {
          fields = typeof record.fields === 'string' ? JSON.parse(record.fields) : record.fields;
        } catch (e) {
          fields = [];
        }
        
        if (!Array.isArray(fields)) fields = [];
        
        const quickCount = fields.filter(f => f.show_in_quick).length;
        const fullCount = fields.filter(f => f.show_in_full !== false).length;
        
        return (
          <Space>
            {record.module_type === 'lead' && (
              <Tooltip title="Fields shown in Quick Mode">
                <Tag color="cyan">Quick: {quickCount}</Tag>
              </Tooltip>
            )}
            <Tooltip title="Fields shown in Full Form">
              <Tag color="blue">Full: {fullCount}</Tag>
            </Tooltip>
          </Space>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space>
          <Switch 
            size="small" 
            checked={status === 'active'} 
            disabled={record.form_type === 'default'}
            onChange={async (checked) => {
              try {
                await updateForm({ id: record.id, status: checked ? 'active' : 'inactive' }).unwrap();
                message.success(`Form ${checked ? 'activated' : 'deactivated'}`);
              } catch (error) {
                message.error('Failed to update status: ' + (error?.data?.message || 'Unknown error'));
              }
            }} 
          />
          <Tag color={status === 'active' ? 'success' : 'default'}>{status.toUpperCase()}</Tag>
        </Space>
      )
    },

    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => {

        const isDefault = record.form_type === 'default';
        
        const actionMenuItems = [
          {
            key: 'edit',
            icon: <FiEdit style={{ color: "#52c41a" }} />,
            label: <Text style={{ color: "#52c41a", fontWeight: "500" }}>Edit Form</Text>,
            onClick: () => handleEdit(record)
          },
          ...(!isDefault && !record.is_template ? [{
            key: 'share',
            icon: <FiShare2 style={{ color: "#1890ff" }} />,
            label: <Text style={{ color: "#1890ff", fontWeight: "500" }}>Share Link</Text>,
            onClick: () => handleShare(record)
          }] : []),
          ...(!isDefault ? [{
            key: 'delete',
            icon: <FiTrash2 style={{ color: "#ff4d4f" }} />,
            label: <Text style={{ color: "#ff4d4f", fontWeight: "500" }}>Delete Form</Text>,
            danger: true,
            onClick: () => handleDelete(record.id)
          }] : [])
        ];


        return (
          <Space size="middle">
            {!isDefault && !record.is_template && (
              <Button 
                type="primary" 
                size="small"
                icon={<FiList />} 
                style={{ color: '#ffffff' }}
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/crm/custom-form/${record.id}/submissions`);
                }}
              >
                View Inquiries
              </Button>

            )}
            
            <div onClick={(e) => e.stopPropagation()}>
              <Dropdown 
                menu={{ items: actionMenuItems }} 
                trigger={['click']}
                placement="bottomRight"
              >
                <Button 
                  type="text" 
                  icon={<FiMoreVertical style={{ fontSize: "16px" }} />} 
                  className="action-dropdown-button" 
                  onClick={(e) => e.stopPropagation()}
                />
              </Dropdown>
            </div>

          </Space>
        );
      }




    }

  ];

  if (view === 'builder') {
    return <FormBuilder initialData={selectedForm} onBack={() => setView('list')} onSave={handleSaveForm} />;
  }

  return (
    <div className="custom-forms-page">
      <PageHeader 
        title="Custom Form Builder"
        subtitle="Create and manage dynamic forms for your business categories"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: 'CRM' },
          { title: 'Custom Forms' }
        ]}
        onAdd={handleCreateNew}
        addText="Create New Form"
        onSearch={() => {}} // Placeholder for search if needed
      />

      <Card className="list-card">
        <Table 
          loading={isLoading}
          dataSource={forms} 
          columns={columns} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="No custom forms created yet" /> }}
          onRow={(record) => ({
            onClick: () => handleEdit(record),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>
    </div>

  );
};

export default CustomForms;
