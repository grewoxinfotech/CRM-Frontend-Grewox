import React, { useState } from "react";
import { Card, Tag, Button, Tooltip, Avatar, Dropdown, Typography, Progress } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
  FiTrendingUp,
  FiTarget,
  FiZap
} from "react-icons/fi";
import CreateDeal from "../deal/CreateDeal";
import { useGetLeadsQuery } from './services/LeadApi';

const { Text } = Typography;

const LeadCard = ({ onEdit, onDelete, onView }) => {
  const { data: leadsData, isLoading, error } = useGetLeadsQuery();
  const leadData = leadsData?.data || [];
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const getDropdownItems = (lead) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => onView(lead),
      },
      {
        key: "convert",
        icon: <FiDollarSign />,
        label: "Convert to Deal",
        onClick: () => {
          setSelectedLead(lead);
          setShowCreateDeal(true);
        },
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: () => onEdit(lead),
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: () => onDelete(lead),
        danger: true,
      },
    ],
  });

  // Get stage percentage for progress bar
  const getStagePercentage = (stage) => {
    const stages = {
      "new": 16,
      "contacted": 32,
      "qualified": 48,
      "proposal": 64,
      "negotiation": 82,
      "closed": 100
    };
    return stages[stage] || 0;
  };

  // Get stage color
  const getStageColor = (stage) => {
    const colors = {
      "new": "#1890ff",
      "contacted": "#52c41a",
      "qualified": "#722ed1",
      "proposal": "#faad14",
      "negotiation": "#eb2f96",
      "closed": "#52c41a"
    };
    return colors[stage] || "#1890ff";
  };

  // Get interest level color and icon
  const getInterestLevel = (level) => {
    const levels = {
      "high": {
        color: "#52c41a",
        bg: "rgba(82, 196, 26, 0.1)",
        border: "#b7eb8f",
        text: "High Interest",
        icon: <FiZap />
      },
      "medium": {
        color: "#faad14",
        bg: "rgba(250, 173, 20, 0.1)",
        border: "#ffd591",
        text: "Medium Interest",
        icon: <FiTarget />
      },
      "low": {
        color: "#ff4d4f",
        bg: "rgba(255, 77, 79, 0.1)",
        border: "#ffa39e",
        text: "Low Interest",
        icon: <FiTrendingUp />
      }
    };
    return levels[level] || levels.medium;
  };

  // Format currency
  const formatCurrency = (value, currency = "INR") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) return <div>Loading leads...</div>;
  if (error) return <div>Error loading leads: {error.message}</div>;
  if (!leadData || leadData.length === 0) return <div>No leads found</div>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
      {leadData.map(lead => (
        <Card
          key={lead.id}
          className="lead-card"
          bordered={false}
          style={{
            width: '320px',
            borderRadius: '0',
            background: '#ffffff',
            boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            borderTop: `4px solid ${getStageColor(lead?.leadStage)}`
          }}
          hoverable
        >
          <div className="card-content">
            {/* Header Section */}
            <div className="card-header">
              <div className="title-section">
                <Tooltip title={lead?.leadTitle}>
                  <Text strong className="lead-title">
                    {lead?.leadTitle}
                  </Text>
                </Tooltip>

                <div className="tags-wrapper">
                  <Tag
                    color={getStageColor(lead?.leadStage)}
                    className="stage-tag"
                  >
                    {lead?.leadStage?.charAt(0).toUpperCase() + lead?.leadStage?.slice(1) || 'New'}
                  </Tag>

                  <Tag className="interest-tag" style={{
                    backgroundColor: getInterestLevel(lead.interest_level).bg,
                    color: getInterestLevel(lead.interest_level).color,
                  }}>
                    <div className="dot-indicator" />
                    {getInterestLevel(lead.interest_level).text}
                  </Tag>
                </div>
              </div>

              <Dropdown
                menu={getDropdownItems(lead)}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<FiMoreVertical />}
                  className="action-button"
                />
              </Dropdown>
            </div>

            {/* Key Metrics Section */}
            <div className="metrics-grid">
              <div className="metric-item">
                <Text className="metric-label">Lead Value</Text>
                <Text strong className="metric-value value-text">
                  {formatCurrency(lead?.leadValue, lead?.currency)}
                </Text>
              </div>
              <div className="divider" />
              <div className="metric-item">
                <Text className="metric-label">Source</Text>
                <Text strong className="metric-value">
                  {lead?.source}
                </Text>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <CreateDeal
        open={showCreateDeal}
        onCancel={() => setShowCreateDeal(false)}
        leadData={selectedLead}
      />

      <style jsx global>{`
        .lead-card {
          --card-padding: 24px;
          --primary-color: #1890ff;
          --success-color: #52c41a;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          
          will-change: transform, box-shadow;
          transform: translateZ(0);

          &:hover {
            transform: translateY(-6px);
            box-shadow: 
              0 12px 24px rgba(0, 0, 0, 0.1),
              0 4px 8px rgba(24, 144, 255, 0.08);

            .metric-card {
              transform: translateY(-2px);
              background: #ffffff;
              border-color: var(--primary-color);

              &.value-card {
                box-shadow: 0 4px 12px rgba(24, 144, 255, 0.08);
              }

              &.source-card {
                box-shadow: 0 4px 12px rgba(17, 24, 39, 0.06);
              }
            }

            .lead-title {
              color: var(--primary-color);
            }

            .stage-tag, .interest-tag {
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
            }
          }

          .ant-card-body {
            padding: 0;
          }

          .card-content {
            padding: var(--card-padding);
            position: relative;
            z-index: 2;
            background: #ffffff;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
          }

          .title-section {
            flex: 1;
          }

          .lead-title {
            font-size: 18px;
            color: var(--text-primary);
            display: block;
            margin-bottom: 12px;
            line-height: 1.4;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            display: -webkit-box;
            transition: color 0.3s ease;
          }

          .tags-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .stage-tag,
          .interest-tag {
            margin: 0;
            border-radius: 0;
            padding: 4px 12px;
            font-size: 12px;
            font-weight: 600;
            border: none;
            transition: all 0.3s ease;

            svg {
              margin-right: 4px;
              animation: pulse 2s infinite;
            }
          }

          .action-button {
            border: none;
            box-shadow: none;
            color: var(--text-secondary);
            height: 32px;
            width: 32px;
            border-radius: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            transition: all 0.3s ease;
            background: transparent;

            &:hover {
              background: rgba(0, 0, 0, 0.04);
              transform: rotate(90deg);
              color: var(--primary-color);
            }
          }

          .metrics-grid {
            display: flex;
            align-items: center;
            margin-top: 20px;
            position: relative;
          }

          .metric-item {
            flex: 1;
            padding: 0 16px;
            position: relative;

            &:first-child {
              padding-left: 0;
            }

            &:last-child {
              padding-right: 0;
            }
          }

          .divider {
            width: 1px;
            height: 32px;
            background: linear-gradient(
              to bottom,
              transparent,
              rgba(0, 0, 0, 0.12),
              transparent
            );
            margin: 0 4px;
          }

          .metric-label {
            font-size: 12px;
            color: var(--text-secondary);
            display: block;
            margin-bottom: 4px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .metric-value {
            font-size: 15px;
            color: var(--text-primary);
            display: block;
            font-weight: 500;

            &.value-text {
              font-size: 20px;
              background: linear-gradient(45deg, var(--success-color), #36cfc9);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              font-weight: 600;
            }
          }

          .interest-tag {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0;
            border-radius: 0;
            padding: 4px 12px;
            font-size: 12px;
            font-weight: 600;
            border: none;
            transition: all 0.3s ease;

            .dot-indicator {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: currentColor;
              box-shadow: 0 0 8px currentColor;
              animation: pulse 2s infinite;
            }
          }

          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
};

export default LeadCard;
