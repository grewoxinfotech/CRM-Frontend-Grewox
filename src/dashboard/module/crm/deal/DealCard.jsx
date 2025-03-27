import React, { useState } from "react";
import { Card, Tag, Button, Tooltip, Avatar, Dropdown, Typography, Progress, Empty, message } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
  FiTarget,
  FiBriefcase,
  FiUser,
  FiMail,
  FiPhone
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useGetDealsQuery, useUpdateDealMutation, useDeleteDealMutation, useUpdateDealStageMutation } from "./services/DealApi";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useGetLabelsQuery, useGetSourcesQuery } from "../crmsystem/souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";
import { restrictToHorizontalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";

const { Text } = Typography;

const DraggableCard = ({ deal, stage, onEdit, onDelete, onView }) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${isDragging ? '2deg' : '0deg'})`,
    zIndex: isDragging ? 999 : undefined,
    transition: isDragging
      ? 'box-shadow 200ms ease, transform 50ms ease'
      : 'box-shadow 300ms ease, transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
    opacity: 1,
    scale: isDragging ? 1.02 : 1,
    boxShadow: isDragging
      ? '0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)'
      : '0 1px 3px rgba(0, 0, 0, 0.05)',
  } : undefined;

  const getDropdownItems = (deal) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => onView(deal),
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: () => onEdit(deal),
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: () => onDelete(deal),
        danger: true,
      },
    ],
  });

  const formatCurrency = (value, currency = "INR") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleCardClick = (e, deal) => {
    e.stopPropagation();
    navigate(`/dashboard/crm/deals/${deal.id}`);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className="deal-card"
        bordered={false}
        style={{
          width: '100%',
          marginBottom: '16px',
          borderRadius: '8px',
          background: '#ffffff',
          boxShadow: isDragging
            ? '0 8px 24px rgba(0, 0, 0, 0.15)'
            : '0 4px 24px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          borderTop: `4px solid ${stage.color || '#1890ff'}`
        }}
        hoverable
      >
        <div className="card-content">
          <div className="card-header">
            <div className="title-section">
              <Tooltip title={deal?.dealName}>
                <Text strong className="deal-title">
                  {deal?.dealName}
                </Text>
              </Tooltip>

              <div className="tags-wrapper">
                <Tag className="value-tag" style={{
                  backgroundColor: 'rgba(24, 144, 255, 0.1)',
                  color: '#1890ff',
                }}>
                  <div className="dot-indicator" />
                  {formatCurrency(deal.value, deal.currency)}
                </Tag>
              </div>
            </div>

            <Dropdown menu={getDropdownItems(deal)} trigger={["click"]}>
              <Button type="text" icon={<FiMoreVertical />} className="action-button" />
            </Dropdown>
          </div>

          <div className="metrics-grid">
            <div className="metric-item company-section">
              <span className="metric-label">Company:</span>
              <Tooltip title={deal.company_name}>
                <span className="metric-value truncate">{deal.company_name}</span>
              </Tooltip>
            </div>
            <div className="divider" />
            <div className="metric-item contact-section">
              <span className="metric-label">Contact:</span>
              <span className="metric-value contact-text">
                {`${deal.firstName || ''} ${deal.lastName || ''}`}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const DroppableStage = ({ stage, children }) => {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div ref={setNodeRef} className="kanban-column">
      <div className="kanban-column-header">
        <h3>{stage.stageName}</h3>
        <Tag>{stage.deals?.length || 0}</Tag>
      </div>
      <div className="kanban-column-content">
        {children}
      </div>
    </div>
  );
};

const DealCard = ({ onEdit, onDelete, onView }) => {
  const [updateDealStage] = useUpdateDealStageMutation();
  const { data: deals = [], isLoading } = useGetDealsQuery();
  const { data: stages = [] } = useGetLeadStagesQuery();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      try {
        await updateDealStage({
          id: active.id,
          stage: over.id
        }).unwrap();
        message.success('Deal stage updated successfully');
      } catch (error) {
        message.error('Failed to update deal stage');
      }
    }
  };

  // Filter stages to only show deal stages
  const dealStages = stages.filter(stage => stage.stageType === "deal");

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis, restrictToWindowEdges]}
    >
      <div className="kanban-board">
        {dealStages.map((stage) => (
          <DroppableStage key={stage.id} stage={stage}>
            {deals
              .filter((deal) => deal.stage === stage.id)
              .map((deal) => (
                <DraggableCard
                  key={deal.id}
                  deal={deal}
                  stage={stage}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              ))}
          </DroppableStage>
        ))}
      </div>
      <style jsx global>{`
        .kanban-board {
          display: flex;
          gap: 24px;
          padding: 24px;
          overflow-x: auto;
          min-height: calc(100vh - 300px);
          width: 100%;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        .kanban-column {
          min-width: 320px;
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          flex: 1;
          transition: transform 200ms ease, box-shadow 200ms ease;
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
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
          
          &.dragging-over {
            background: #e6f7ff;
            transform: scale(1.02);
            box-shadow: 0 0 0 2px #1890ff33;
          }
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
          transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
          backface-visibility: hidden;
          perspective: 1000px;
          transform-style: preserve-3d;
          transform-origin: center center;

          &:hover {
            transform: translateY(-2px) scale(1.005);
            box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.1);
            transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
          }
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
          position: absolute;
          top: 12px;
          right: 12px;

          &:hover {
            background: rgba(0, 0, 0, 0.04);
            transform: rotate(90deg);
            color: var(--primary-color);
          }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          position: relative;
          padding-right: 40px;
        }

        .title-section {
          flex: 1;
          width: 100%;
        }

        .card-content {
          padding: var(--card-padding);
          position: relative;
          z-index: 2;
          background: #ffffff;
        }

        .metrics-grid {
          display: flex;
          align-items: center;
          margin-top: 16px;
          position: relative;
          width: 100%;
          padding: 8px 0;
          border-top: 1px solid #f0f0f0;
        }

        .metric-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;

          &.company-section {
            flex: 1;
            min-width: 0;
            padding-right: 12px;
          }

          &.value-section {
            flex: 0 0 auto;
            padding-left: 12px;
            white-space: nowrap;
          }
        }

        .divider {
          width: 1px;
          height: 20px;
          background: #f0f0f0;
          flex: 0 0 auto;
        }

        .metric-label {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
          flex: 0 0 auto;
        }

        .metric-value {
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
          line-height: 1.4;

          &.truncate {
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
            flex: 1;
          }

          &.value-text {
            font-size: 15px;
            font-weight: 600;
            color: var(--success-color);
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

        .draggable-card {
          transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center center;
          
          &.is-dragging {
            cursor: grabbing;
            transform: scale(1.02) rotate(2deg);
            transition: all 50ms ease;
            opacity: 1;
            
            .lead-card {
              box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 
                         0 2px 6px rgba(0, 0, 0, 0.08);
            }
          }
        }
      `}</style>
    </DndContext>
  );
};

export default DealCard; 