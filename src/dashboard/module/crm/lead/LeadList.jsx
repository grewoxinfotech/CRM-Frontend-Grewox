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
  FiArrowRight
} from "react-icons/fi";
import { useDeleteLeadMutation } from "./services/LeadApi";
import { useGetSourcesQuery, useGetStatusesQuery } from '../crmsystem/souce/services/SourceApi';
import { useGetLeadStagesQuery } from '../crmsystem/leadstage/services/leadStageApi';
import { useGetAllCurrenciesQuery } from '../../../module/settings/services/settingsApi';
import { useSelector } from "react-redux";
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const adjustColor = (color, amount) => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
};

const LeadList = ({ leads, onEdit, onView, onLeadClick }) => {
  const [deleteLead] = useDeleteLeadMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = React.useState('all');
  // Fetch all required data
  const { data: stagesData } = useGetLeadStagesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
  const { data: currencies = [] } = useGetAllCurrenciesQuery();

  // Filter and prepare data
  const stages = stagesData?.filter(stage => stage.stageType === "lead") || [];
  const sources = sourcesData?.data || [];
  const statuses = statusesData?.data || [];

  const filteredLeads = React.useMemo(() => {
    if (!leads?.data) return [];

    switch (filterStatus) {
      case 'active':
        return leads.data.filter(lead => !lead.is_converted);
      case 'converted':
        return leads.data.filter(lead => lead.is_converted);
      default:
        return leads.data;
    }
  }, [leads?.data, filterStatus]);

  const handleDelete = async (record) => {
    try {
      await deleteLead(record.id).unwrap();
      message.success("Lead deleted successfully");
    } catch (error) {
      message.error(
        "Failed to delete lead: " + (error.data?.message || "Unknown error")
      );
    }
  };


  // Get stage data
  const getStageData = (stageId) => {
    const stage = stages.find(s => s.id === stageId) || {};
    return {
      name: stage.stageName || "Unknown",
      color: stage.color || "#1890ff"
    };
  };

  // Get source data
  const getSourceData = (sourceId) => {
    const source = sources.find(s => s.id === sourceId) || {};
    return {
      name: source.name || "Unknown",
      color: source.color || "#1890ff"
    };
  };

  // Get interest level style
  const getInterestLevel = (level) => {
    const levels = {
      "high": {
        color: "#52c41a",
        bg: "rgba(82, 196, 26, 0.1)",
        border: "#b7eb8f",
        text: "High Interest",
        icon: <FiZap style={{ marginRight: '4px' }} />
      },
      "medium": {
        color: "#faad14",
        bg: "rgba(250, 173, 20, 0.1)",
        border: "#ffd591",
        text: "Medium Interest",
        icon: <FiTarget style={{ marginRight: '4px' }} />
      },
      "low": {
        color: "#ff4d4f",
        bg: "rgba(255, 77, 79, 0.1)",
        border: "#ffa39e",
        text: "Low Interest",
        icon: <FiTrendingUp style={{ marginRight: '4px' }} />
      }
    };
    return levels[level] || levels.medium;
  };

  // Format currency
  const formatCurrency = (value, currencyId) => {
    const currencyDetails = currencies?.find(c => c.id === currencyId || c.currencyCode === currencyId);
    if (!currencyDetails) return `${value}`;

    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace(/^/, currencyDetails.currencyIcon + ' ');
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
        onClick: () => onLeadClick(record),
      },
      ...(!record.is_converted ? [
        {
          key: "edit",
          icon: <FiEdit2 style={{ color: '#52c41a' }} />,
          label: (
            <Text style={{ color: '#52c41a', fontWeight: '500' }}>
              Edit Lead
            </Text>
          ),
          onClick: () => onEdit(record),
        },
        {
          key: "delete",
          icon: <FiTrash2 style={{ color: '#ff4d4f' }} />,
          label: (
            <Text style={{ color: '#ff4d4f', fontWeight: '500' }}>
              Delete Lead
            </Text>
          ),
          onClick: () => handleDelete(record),
          danger: true,
        }
      ] : [])
    ],
  });

  const columns = [
    {
      title: "Lead Title",
      dataIndex: "leadTitle",
      key: "leadTitle",
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar style={{
            backgroundColor: record.is_converted ? '#52c41a' : '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {text[0].toUpperCase()}
          </Avatar>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text strong style={{ fontSize: '14px' }}>
                {text}
              </Text>
              {record.is_converted && (
                <FiCheck style={{ color: '#52c41a', fontSize: '16px' }} />
              )}
            </div>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              {record.company_name}
            </Text>
          </div>
        </div>
      ),
      width: '30%',
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (sourceId) => {
        const source = getSourceData(sourceId);
        const className = `source-${source.name.toLowerCase().replace(/\s+/g, '')}`;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiLink size={14} className={className} />
            <Text className={className} style={{ fontSize: '13px', fontWeight: '500' }}>
              {source.name}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (statusId) => {
        const status = statuses.find(s => s.id === statusId) || {};
        const statusName = status.name || "Unknown";
        const className = `status-${statusName.toLowerCase().replace(/\s+/g, '')}`;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiInfo size={14} className={className} />
            <Text className={className} style={{ fontSize: '13px', fontWeight: '500' }}>
              {statusName}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Lead Stage",
      dataIndex: "leadStage",
      key: "leadStage",
      render: (stageId) => {
        const stage = getStageData(stageId);
        return (
          <Tag
            style={{
              textTransform: 'capitalize',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: '500',
              color: 'white',
              background: `linear-gradient(135deg, ${stage.color} 0%, ${adjustColor(stage.color, -20)} 100%)`
            }}
          >
            {stage.name}
          </Tag>
        );
      },
    },
    {
      title: "Interest Level",
      dataIndex: "interest_level",
      key: "interest_level",
      render: (level) => {
        const interestStyle = getInterestLevel(level);
        return (
          <Tag style={{
            color: interestStyle.color,
            backgroundColor: interestStyle.bg,
            border: `1px solid ${interestStyle.border}`,
            borderRadius: '4px',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: '500',
            width: 'fit-content'
          }}>
            {interestStyle.icon}
            {interestStyle.text}
          </Tag>
        );
      },
    },
    {
      title: "Lead Value",
      key: "leadValue",
      render: (record) => (
        <Text strong style={{
          fontSize: '14px',
          color: '#52c41a'
        }}>
          {formatCurrency(record.leadValue || 0, record.currency)}
        </Text>
      ),
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
            { id: 'all', name: 'All Leads', count: leads?.data?.length || 0 },
            { id: 'active', name: 'Active', count: leads?.data?.filter(lead => !lead.is_converted).length || 0 },
            { id: 'converted', name: 'Converted', count: leads?.data?.filter(lead => lead.is_converted).length || 0 }
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
        dataSource={filteredLeads}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} leads`,
        }}
        className="colorful-table"
        onRow={(record) => ({
          onClick: () => onLeadClick(record),
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

        .ant-dropdown {
          .ant-dropdown-menu {
            padding: 4px !important;
            border-radius: 8px !important;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;
            
            .ant-dropdown-menu-item {
              padding: 8px 12px !important;
              border-radius: 6px !important;
              margin: 2px 0 !important;
              transition: all 0.3s ease !important;
              
              &:hover {
                background: rgba(24, 144, 255, 0.04) !important;

                &[data-menu-id*="view"] {
                  background: rgba(24, 144, 255, 0.08) !important;
                }

                &[data-menu-id*="edit"] {
                  background: rgba(82, 196, 26, 0.08) !important;
                }
              }
              
              &-danger {
                &:hover {
                  background: rgba(255, 77, 79, 0.08) !important;
                }
              }
            }
          }
        }

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

        // Status colors
        .status-review { color: #1890ff !important; }
        .status-completed { color: #52c41a !important; }
        .status-rejected { color: #ff4d4f !important; }
        .status-pending { color: #faad14 !important; }
        .status-unknown { color: #8c8c8c !important; }

        // Source colors
        .source-social { color: #1890ff !important; }
        .source-partner { color: #52c41a !important; }
        .source-referral { color: #722ed1 !important; }
        .source-website { color: #13c2c2 !important; }
        .source-event { color: #fa8c16 !important; }

        // Lead stage colors
        .stage-new { background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important; }
        .stage-qualified { background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%) !important; }
        .stage-negotiation { background: linear-gradient(135deg, #722ed1 0%, #531dab 100%) !important; }
        .stage-won { background: linear-gradient(135deg, #13c2c2 0%, #08979c 100%) !important; }
        .stage-active { background: linear-gradient(135deg, #fa8c16 0%, #d46b08 100%) !important; }
      `}</style>
    </>
  );
};

export default LeadList;
