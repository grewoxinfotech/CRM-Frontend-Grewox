import React, { useState } from "react";
import { Card, Tag, Button, Tooltip, Avatar, Dropdown, Typography, Progress, Empty, message } from "antd";
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
import { useGetLeadsQuery, useUpdateLeadMutation } from './services/LeadApi';
import { useGetLeadStagesQuery } from '../crmsystem/leadstage/services/leadStageApi';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const { Text } = Typography;

const LeadCard = ({ onEdit, onDelete, onView }) => {
  const { data: leadsData, isLoading, error } = useGetLeadsQuery();
  const { data: stagesData } = useGetLeadStagesQuery();
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [updateLead] = useUpdateLeadMutation();

  const stages = stagesData?.filter(stage => stage.stageType === 'lead') || [];
  const leads = leadsData?.data || [];

  // Group leads by stage
  const leadsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = leads.filter(lead => lead.leadStage === stage.id);
    return acc;
  }, {});

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

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    try {
      await updateLead({
        id: draggableId,
        data: { leadStage: destination.droppableId }
      }).unwrap();
      message.success('Lead stage updated successfully');
    } catch (error) {
      message.error('Failed to update lead stage');
      console.error('Update stage error:', error);
    }
  };

  if (isLoading) return <div>Loading leads...</div>;
  if (error) return <div>Error loading leads: {error.message}</div>;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {stages.map(stage => (
          <div key={stage.id} className="kanban-column">
            <div className="kanban-column-header">
              <Text strong>{stage.stageName}</Text>
              <Tag>{leadsByStage[stage.id]?.length || 0}</Tag>
            </div>
            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`kanban-column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                >
                  {leadsByStage[stage.id]?.length > 0 ? (
                    leadsByStage[stage.id].map((lead, index) => (
                      <Draggable
                        key={lead.id}
                        draggableId={lead.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`draggable-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                          >
                            <Card
                              className="lead-card"
                              bordered={false}
                              style={{
                                width: '100%',
                                marginBottom: '16px',
                                borderRadius: '8px',
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
                                      <Tag className="interest-tag" style={{
                                        backgroundColor: getInterestLevel(lead.interest_level).bg,
                                        color: getInterestLevel(lead.interest_level).color,
                                      }}>
                                        <div className="dot-indicator" />
                                        {getInterestLevel(lead.interest_level).text}
                                      </Tag>
                                    </div>
                                  </div>

                                  <Dropdown menu={getDropdownItems(lead)} trigger={["click"]}>
                                    <Button type="text" icon={<FiMoreVertical />} className="action-button" />
                                  </Dropdown>
                                </div>

                                {/* Metrics Section */}
                                <div className="metrics-grid">
                                  <div className="metric-item">
                                    <span className="metric-label">Company</span>
                                    <span className="metric-value">{lead.company_name}</span>
                                  </div>
                                  <div className="divider" />
                                  <div className="metric-item">
                                    <span className="metric-label">Value</span>
                                    <span className="metric-value value-text">
                                      {formatCurrency(lead.leadValue, lead.currency)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No leads"
                    />
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>

      {showCreateDeal && (
        <CreateDeal
          open={showCreateDeal}
          onCancel={() => {
            setShowCreateDeal(false);
            setSelectedLead(null);
          }}
          lead={selectedLead}
        />
      )}

      <style jsx global>{`
        .kanban-board {
          display: flex;
          gap: 24px;
          padding: 24px;
          overflow-x: auto;
          min-height: calc(100vh - 300px);
          width: 100%;
        }

        .kanban-column {
          min-width: 320px;
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          flex: 1;
        }

        .kanban-column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding: 0 8px;
        }

        .ant-tag {
          background: #e6f4ff;
          color: #1890ff;
          border: none;
          border-radius: 12px;
          padding: 2px 12px;
        }

        .kanban-column-content {
          min-height: 100px;
          padding: 8px;
          background: #f8fafc;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        .kanban-column-content.dragging-over {
          background: #e6f7ff;
        }

        .draggable-card {
          margin-bottom: 16px;
          transition: transform 0.2s ease;
        }

        .draggable-card.is-dragging {
          transform: rotate(3deg);
        }

        .lead-card {
          cursor: grab;
        }

        .lead-card:active {
          cursor: grabbing;
        }

        .lead-card {
          margin-bottom: 16px;
          --card-padding: 24px;
          --primary-color: #1890ff;
          --success-color: #52c41a;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          
          will-change: transform, box-shadow;
          transform: translateZ(0);
          transition: transform 0.2s ease, box-shadow 0.2s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.1);

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
    </DragDropContext>
  );
};

export default LeadCard;
