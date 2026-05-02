import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiMoreVertical, FiLayers } from "react-icons/fi";
import AddPipelineModal from "./AddPipelineModal";
import EditPipelineModal from "./EditPipelineModal";
import {
  useGetPipelinesQuery,
  useDeletePipelineMutation,
} from "./services/pipelineApi";
import "./pipeline.scss";
import { Button, Table, Dropdown, message, Modal, Tag, Typography } from "antd";
import { useGetLeadsQuery } from "../../lead/services/LeadApi";
import { useGetDealsQuery } from "../../deal/services/DealApi";

const { Text } = Typography;

const Pipeline = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);

  const { data, isLoading } = useGetPipelinesQuery();
  const { data: leadsResponse } = useGetLeadsQuery({ page: 1, pageSize: 100 });
  const { data: dealsResponse } = useGetDealsQuery({ page: 1, pageSize: 100 });
  const [deletePipeline] = useDeletePipelineMutation();

  const leadsData = leadsResponse?.data || [];
  const dealsData = dealsResponse?.data || [];

  const pipelines = Array.isArray(data?.pipelines) ? data.pipelines : Array.isArray(data) ? data : [];

  const isPipelineInUse = (pipelineId) => {
    const usedInLeads = leadsData.some(lead => lead.pipeline === pipelineId);
    const usedInDeals = dealsData.some(deal => deal.pipeline === pipelineId);
    return usedInLeads || usedInDeals;
  };

  const handleEdit = (pipeline) => {
    setSelectedPipeline(pipeline);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Pipeline',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await deletePipeline(id).unwrap();
          message.success('Deleted successfully');
        } catch (error) {
          message.error('Failed to delete');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Pipeline Name',
      dataIndex: 'pipeline_name',
      key: 'pipeline_name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: '12px'
            }}
          >
            <FiLayers />
          </div>
          <Text strong style={{ color: '#1e293b' }}>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Usage Status',
      key: 'usage',
      width: 150,
      render: (_, record) => (
        isPipelineInUse(record.id) ? 
        <Tag color="success" style={{ borderRadius: '4px', border: 'none' }}>Active</Tag> : 
        <Tag style={{ borderRadius: '4px', border: 'none' }}>Unused</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => handleEdit(record) },
              { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => handleDelete(record.id) }
            ]
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="pipeline-wrapper">
      <Table
        columns={columns}
        dataSource={pipelines}
        rowKey="id"
        size="small"
        loading={isLoading}
        className="compact-table"
        pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} pipelines`
        }}
        scroll={{ x: 'max-content' }}
      />

      <AddPipelineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditPipelineModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPipeline(null);
        }}
        pipeline={selectedPipeline}
      />
    </div>
  );
};

export default Pipeline;
