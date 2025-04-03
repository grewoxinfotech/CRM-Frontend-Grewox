import React from "react";
import { Table, Avatar, Dropdown, Button, message, Tag, Typography, Space, Tooltip } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiZap,
  FiTarget,
  FiTrendingUp,
  FiLink,
  FiInfo,
  FiCheck,
  FiArrowRight,
  FiDollarSign,
  FiBriefcase
} from "react-icons/fi";
import { useGetDealsQuery, useDeleteDealMutation } from "./services/dealApi";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useGetLabelsQuery, useGetSourcesQuery } from "../crmsystem/souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const DealList = ({ onEdit, onView, onDealClick }) => {
  const loggedInUser = useSelector(selectCurrentUser);
  const { data, isLoading, error } = useGetDealsQuery();
  const [deleteDeal, { isLoading: isDeleting }] = useDeleteDealMutation();
  const { data: dealStages = [] } = useGetLeadStagesQuery();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: labelsData } = useGetLabelsQuery(loggedInUser?.id);
  const [filterStatus, setFilterStatus] = React.useState('all');

  const sources = sourcesData?.data || [];
  const labels = labelsData?.data || [];
  const deals = Array.isArray(data) ? data : [];

  const filteredDeals = React.useMemo(() => {
    switch (filterStatus) {
      case 'active':
        return deals.filter(deal => deal.status?.toLowerCase() === 'active');
      case 'won':
        return deals.filter(deal => deal.status?.toLowerCase() === 'won');
      case 'lost':
        return deals.filter(deal => deal.status?.toLowerCase() === 'lost');
      default:
        return deals;
    }
  }, [deals, filterStatus]);

  const handleDelete = async (record) => {
    try {
      await deleteDeal(record.id).unwrap();
      message.success("Deal deleted successfully");
    } catch (error) {
      message.error("Failed to delete deal: " + (error.data?.message || "Unknown error"));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: { bg: '#dbeafe', color: '#1e40af' },
      won: { bg: '#dcfce7', color: '#15803d' },
      lost: { bg: '#fee2e2', color: '#b91c1c' },
      pending: { bg: '#fef3c7', color: '#92400e' }
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  const formatCurrency = (value, currency = 'USD') => {
    if (!value) return '0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye style={{ color: '#1890ff' }} />,
        label: (
          <Text style={{ color: '#1890ff', fontWeight: '500' }}>
            Overview
          </Text>
        ),
        onClick: () => onDealClick(record),
      },
      {
        key: "edit",
        icon: <FiEdit2 style={{ color: '#52c41a' }} />,
        label: (
          <Text style={{ color: '#52c41a', fontWeight: '500' }}>
            Edit Deal
          </Text>
        ),
        onClick: () => onEdit(record),
      },
      {
        key: "delete",
        icon: <FiTrash2 style={{ color: '#ff4d4f' }} />,
        label: (
          <Text style={{ color: '#ff4d4f', fontWeight: '500' }}>
            Delete Deal
          </Text>
        ),
        onClick: () => handleDelete(record),
      }
    ],
  });

  const columns = [
    {
      title: "Deal Name",
      dataIndex: "dealName",
      key: "dealName",
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar style={{
            backgroundColor: record.status?.toLowerCase() === 'won' ? '#52c41a' : '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {text?.[0]?.toUpperCase() || 'D'}
          </Avatar>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text strong style={{ fontSize: '14px' }}>
                {text || 'Untitled Deal'}
              </Text>
              {record.status?.toLowerCase() === 'won' && (
                <FiCheck style={{ color: '#52c41a', fontSize: '16px' }} />
              )}
            </div>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              {record.company_name || ''}
            </Text>
          </div>
        </div>
      ),
      width: '25%',
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (sourceId) => {
        const source = sources.find(s => s.id === sourceId) || {};
        const className = `source-${source.name?.toLowerCase().replace(/\s+/g, '')}`;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiLink style={{
              fontSize: '14px',
              color: source.color || '#64748b'
            }} />
            <Text style={{
              fontSize: '13px',
              fontWeight: '500',
              color: source.color || '#64748b'
            }}>
              {source.name || 'Unknown Source'}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      render: (stageId) => {
        const stage = dealStages.find(s => s.id === stageId);
        return (
          <Tag style={{
            textTransform: 'capitalize',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '500',
            color: 'white',
            background: stage?.color || '#1890ff'
          }}>
            {stage?.stageName || 'Unknown Stage'}
          </Tag>
        );
      },
    },
    {
      title: "Value",
      key: "value",
      render: (_, record) => (
        <Text strong style={{
          fontSize: '14px',
          color: '#52c41a'
        }}>
          {formatCurrency(record.value || 0, record.currency)}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusColors = getStatusColor(status);
        return (
          <Tag style={{
            margin: 0,
            padding: '2px 8px',
            fontSize: '11px',
            borderRadius: '12px',
            background: statusColors.bg,
            color: statusColors.color,
            border: 'none'
          }}>
            {status || "Pending"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <div onClick={e => e.stopPropagation()}>
          <Dropdown
            menu={getDropdownItems(record)}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<FiMoreVertical style={{ fontSize: '16px' }} />}
              className="action-btn"
              onClick={e => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <>
      <div style={{
        marginBottom: '8px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '0 12px'
      }}>
        <Text strong style={{ fontSize: '13px', color: '#374151' }}>View:</Text>
        <div style={{
          display: 'flex',
          gap: '6px'
        }}>
          {[
            { id: 'all', name: 'All Deals', count: deals.length },
            { id: 'active', name: 'Active', count: deals.filter(deal => deal.status?.toLowerCase() === 'active').length },
            { id: 'won', name: 'Won', count: deals.filter(deal => deal.status?.toLowerCase() === 'won').length },
            { id: 'lost', name: 'Lost', count: deals.filter(deal => deal.status?.toLowerCase() === 'lost').length }
          ].map(filter => (
            <Button
              key={filter.id}
              type={filterStatus === filter.id ? "primary" : "default"}
              onClick={() => setFilterStatus(filter.id)}
              style={{
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                height: '28px',
                fontSize: '12px'
              }}
            >
              <FiTarget style={{ fontSize: '12px' }} />
              {filter.name} ({filter.count})
            </Button>
          ))}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredDeals}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} deals`,
        }}
        className="colorful-table"
        onRow={(record) => ({
          onClick: () => onDealClick(record),
          style: { cursor: 'pointer' }
        })}
      />

      <style jsx global>{`
        .colorful-table {
          .ant-table {
            border-radius: 8px;
            overflow: hidden;

            .ant-table-thead > tr > th {
              background: #fafafa !important;
              color: #1f2937;
              font-weight: 600;
              border-bottom: 1px solid #f0f0f0;
              padding: 16px;

              &::before {
                display: none;
              }
            }

            .ant-table-tbody > tr {
              &:hover > td {
                background: rgba(24, 144, 255, 0.04) !important;
              }

              > td {
                padding: 16px;
                transition: all 0.3s ease;
              }

              &:nth-child(even) {
                background-color: #fafafa;
                
                &:hover > td {
                  background: rgba(24, 144, 255, 0.04) !important;
                }
              }
            }
          }

          .ant-table-pagination {
            margin: 16px !important;

            .ant-pagination-item-active {
              border-color: #1890ff;
              background: #1890ff;
              
              a {
                color: white;
              }
            }
          }
        }

        // Source colors
        .source-social { color: #1890ff !important; }
        .source-partner { color: #52c41a !important; }
        .source-referral { color: #722ed1 !important; }
        .source-website { color: #13c2c2 !important; }
        .source-event { color: #fa8c16 !important; }

        .action-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          color: #6B7280;
          transition: all 0.3s;
          
          &:hover {
            color: #1890ff;
            background: rgba(24, 144, 255, 0.1);
          }
        }
      `}</style>
    </>
  );
};

export default DealList;
