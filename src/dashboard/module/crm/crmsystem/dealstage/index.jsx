import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiLayers, FiMoreVertical } from "react-icons/fi";
import AddDealStageModal from "./AddDealStageModal";
import EditDealStageModal from "./EditDealStageModal";
import {
  useGetDealStagesQuery,
  useDeleteDealStageMutation,
} from "./services/dealStageApi";
import { useGetPipelinesQuery } from "../pipeline/services/pipelineApi";
import "./dealstage.scss";
import { Button, Modal, message, Table, Typography, Tag, Dropdown } from "antd";
import { useGetDealsQuery } from "../../deal/services/DealApi";

const { Text } = Typography;

const DealStages = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  const { data: stagesData = [], isLoading } = useGetDealStagesQuery();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: dealsResponse } = useGetDealsQuery({
    page: 1,
    pageSize: -1,
    search: ''
  });
  const [deleteDealStage] = useDeleteDealStageMutation();

  const dealsData = dealsResponse?.data || [];
  const dealStages = stagesData?.filter(stage => stage?.stageType === "deal") || [];

  const getPipelineName = (pipelineId) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    return pipeline?.pipeline_name || 'N/A';
  };

  const isStageInUse = (stageId) => {
    return dealsData.some(deal => deal.stage === stageId);
  };

  const handleEdit = (stage) => {
    setSelectedStage(stage);
    setIsEditModalOpen(true);
  };

  const handleDelete = (stage) => {
    Modal.confirm({
      title: 'Delete Deal Stage',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          const response = await deleteDealStage({ id: stage.id, newDefaultId: null }).unwrap();
          if (response.success) message.success('Deleted successfully');
        } catch (error) {
          message.error('Failed to delete');
        }
      },
    });
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
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => handleEdit(record) },
              { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => handleDelete(record) }
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
    <div className="deal-stages-wrapper">
      <Table
        columns={columns}
        dataSource={dealStages}
        rowKey="id"
        size="small"
        loading={isLoading}
        className="compact-table"
        pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} stages`
        }}
        scroll={{ x: 'max-content' }}
      />

      <AddDealStageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditDealStageModal
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

export default DealStages;
