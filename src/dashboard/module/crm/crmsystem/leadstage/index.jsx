import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiLayers, FiMoreVertical } from "react-icons/fi";
import AddLeadStageModal from "./AddLeadStageModal";
import EditLeadStageModal from "./EditLeadStageModal";
import {
  useGetLeadStagesQuery,
  useDeleteLeadStageMutation,
  useUpdateLeadStageMutation,
} from "./services/leadStageApi";
import { useGetPipelinesQuery } from "../pipeline/services/pipelineApi";
import "./leadstage.scss";
import { Button, Modal, message, Table, Tooltip, Dropdown, Typography, Tag, Tabs } from "antd";
import { useGetLeadsQuery } from "../../lead/services/LeadApi";

const { Text } = Typography;

const LeadStages = ({ isModalOpen, setIsModalOpen, hasPermission }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  const { data: stagesData = [], isLoading } = useGetLeadStagesQuery();
  const { data: pipelines = [] } = useGetPipelinesQuery();

  const [deleteLeadStage] = useDeleteLeadStageMutation();

  const { data: leadsResponse } = useGetLeadsQuery({
    page: 1,
    pageSize: -1,
    search: ''
  });

  const leadsData = leadsResponse?.data || [];
  const leadStages = stagesData?.filter(stage => stage?.stageType === "lead") || [];

  const getPipelineName = (pipelineId) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    return pipeline?.pipeline_name || 'N/A';
  };

  const isStageInUse = (stageId) => {
    return leadsData.some(lead => lead.leadStage === stageId);
  };

  const handleEdit = (stage) => {
    setSelectedStage(stage);
    setIsEditModalOpen(true);
  };

  const handleDelete = (stage) => {
    Modal.confirm({
      title: 'Delete Lead Stage',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          const response = await deleteLeadStage({ id: stage.id, newDefaultId: null }).unwrap();
          if (response.success) message.success('Deleted successfully');
        } catch (error) {
          message.error('Failed to delete');
        }
      },
    });
  };

  const getDropdownItems = (record) => {
    const items = [];
    if (!hasPermission || hasPermission('update')) {
      items.push({ key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => handleEdit(record) });
    }
    if (!hasPermission || hasPermission('delete')) {
      items.push({ key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => handleDelete(record) });
    }
    return items;
  };

  const columns = [
    {
      title: 'Stage Details',
      key: 'stage',
      width: 250,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: record.color || '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}
          >
            <FiLayers />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ color: '#1e293b' }}>{record.stageName}</Text>
            {record.isDefault && <Tag color="blue" style={{ fontSize: '10px', height: '18px', padding: '0 4px', width: 'fit-content' }}>Default</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: 'Pipeline',
      dataIndex: 'pipeline',
      key: 'pipeline',
      width: 150,
      render: (id) => <Tag color="purple" style={{ borderRadius: '4px', border: 'none' }}>{getPipelineName(id)}</Tag>
    },
    {
      title: 'Usage Status',
      key: 'usage',
      width: 120,
      render: (_, record) => (
        isStageInUse(record.id) ? 
        <Tag color="success" style={{ borderRadius: '4px', border: 'none' }}>Active</Tag> : 
        <Tag style={{ borderRadius: '4px', border: 'none' }}>Unused</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => {
        const items = getDropdownItems(record);
        if (items.length === 0) return null;
        return (
          <Dropdown
            menu={{ items }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
          </Dropdown>
        );
      },
    },
  ];

  const items = pipelines.map(pipeline => ({
    key: pipeline.id,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px' }}>
        <FiLayers size={14} />
        <span style={{ fontWeight: '500' }}>{pipeline.pipeline_name}</span>
        <Tag 
          style={{ 
            margin: 0, 
            borderRadius: '10px', 
            fontSize: '11px',
            backgroundColor: 'rgba(24, 144, 255, 0.1)',
            color: '#1890ff',
            border: 'none'
          }}
        >
          {leadStages.filter(s => s.pipeline === pipeline.id).length}
        </Tag>
      </div>
    ),
    children: (
      <Table
        columns={columns}
        dataSource={leadStages.filter(s => s.pipeline === pipeline.id)}
        rowKey="id"
        size="small"
        loading={isLoading}
        className="compact-table stage-table"
        pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} stages`
        }}
        scroll={{ x: 'max-content' }}
      />
    )
  }));

  return (
    <div className="lead-stages-wrapper">
      <div className="pipeline-tabs-container">
        {pipelines.length > 0 ? (
          <Tabs
            defaultActiveKey={pipelines[0]?.id}
            items={items}
            className="custom-pipeline-tabs"
            type="line"
            animated={{ inkBar: true, tabPane: true }}
          />
        ) : (
          <div className="no-pipelines-placeholder">
             <Text type="secondary">No pipelines found. Please create a pipeline first.</Text>
          </div>
        )}
      </div>

      <AddLeadStageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditLeadStageModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStage(null);
        }}
        stage={selectedStage}
      />
    </div>
  );
};

export default LeadStages;
