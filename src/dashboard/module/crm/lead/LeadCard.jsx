import React, { useState, useEffect } from "react";
import { Card, Tag, Button, Tooltip, Avatar, Dropdown, Typography, Progress, Empty, message } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
  FiTrendingUp,
  FiTarget,
  FiZap,
  FiMenu
} from "react-icons/fi";
import CreateDeal from "../deal/CreateDeal";
import { useGetLeadsQuery, useUpdateLeadMutation } from './services/LeadApi';
import { useGetLeadStagesQuery } from '../crmsystem/leadstage/services/leadStageApi';
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { setStageOrder, selectStageOrder } from '../crmsystem/leadstage/services/leadStageSlice';
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
  horizontalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";
import { useNavigate } from "react-router-dom";
import { CSS } from '@dnd-kit/utilities';
import { useGetSourcesQuery, useGetCategoriesQuery } from '../crmsystem/souce/services/SourceApi';
const { Text } = Typography;

const DraggableCard = ({ lead, stage, onLeadClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: {
      type: 'card',
      lead
    }
  });

  const { data: sourceData } = useGetSourcesQuery(lead.client_id);
  const { data: categoryData } = useGetCategoriesQuery(lead.client_id);

  const source = sourceData?.data?.find(s => s.id === lead.source);
  const category = categoryData?.data?.find(c => c.id === lead.category);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: isDragging ? undefined : 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
    position: isDragging ? 'relative' : 'static',
    touchAction: 'none',
    transformOrigin: '50% 50%',
    zIndex: isDragging ? 999999 : 'auto',
    pointerEvents: isDragging ? 'none' : undefined,
    isolation: isDragging ? 'isolate' : 'auto',
    transformStyle: 'preserve-3d'
  };

  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/dashboard/crm/lead/${lead.id}`);
  };

  const getInterestLevel = (level) => {
    const levels = {
      "high": {
        color: "#ffffff",
        bg: "#52c41a",
        text: "High"
      },
      "medium": {
        color: "#ffffff",
        bg: "#faad14",
        text: "Med"
      },
      "low": {
        color: "#ffffff",
        bg: "#ff4d4f",
        text: "Low"
      }
    };
    return levels[level] || levels.medium;
  };

  const formatCurrency = (value, currencyId) => {
    const currencyDetails = currencies.find(c => c.id === currencyId);
    if (!currencyDetails) return `${value}`;
    
    return new Intl.NumberFormat('en-US', {
<<<<<<< Updated upstream
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
=======
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace(/^/, currencyDetails.currencyIcon + ' ');
>>>>>>> Stashed changes
  };

  const getDropdownItems = (lead) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => onLeadClick(lead),
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
        onClick: () => onLeadClick(lead),
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: () => onLeadClick(lead),
        danger: true,
      },
    ],
  });

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className="lead-card"
        bordered={false}
        onClick={handleCardClick}
        style={{
          width: '100%',
          marginBottom: '8px',
          borderRadius: '4px',
          background: '#ffffff',
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative',
          overflow: 'hidden',
          borderLeft: `3px solid ${stage.color || '#1890ff'}`,
          boxShadow: isDragging
            ? '0 16px 32px -8px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.08)'
            : '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: isDragging
            ? undefined
            : 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isDragging ? 'scale(1.05)' : 'scale(1)',
          opacity: isDragging ? 1 : undefined,
          willChange: 'transform, box-shadow',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="card-content" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Title Section at Top */}
          <div className="title-section" style={{
            width: '100%',
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: '8px',
            marginBottom: '4px'
          }}>
            <Tooltip title={lead?.leadTitle}>
              <Text strong className="lead-title" style={{
                fontSize: '14px',
                lineHeight: '1.4',
                margin: 0,
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#1f2937'
              }}>
                {lead?.leadTitle}
              </Text>
            </Tooltip>
            {lead?.company_name && (
              <Text className="company-name" style={{
                fontSize: '12px',
                color: '#6b7280',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: '2px'
              }}>
                {lead.company_name}
              </Text>
            )}
          </div>

          {/* Price and Interest Level */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="metric-value" style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#52c41a',
              lineHeight: '1.2',
              whiteSpace: 'nowrap'
            }}>
              {formatCurrency(lead.leadValue, lead.currency)}
            </span>
            <Tag
              className={`interest-level ${lead.interest_level}`}
              style={{
                backgroundColor: getInterestLevel(lead.interest_level).bg,
                color: getInterestLevel(lead.interest_level).color,
                margin: 0,
                padding: '2px 8px',
                fontSize: '12px',
                lineHeight: '18px',
                height: '20px',
                borderRadius: '4px',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
            >
              {getInterestLevel(lead.interest_level).text}
            </Tag>
          </div>

          {/* Source and Category at Bottom */}
          <div className="meta-info" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '11px',
            width: '100%',
            marginTop: '4px',
            paddingTop: '8px',
            borderTop: '1px solid #f0f0f0'
          }}>
            {source && (
              <div className="source" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}>
                <span className="label" style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', minWidth: '50px' }}>Source:</span>
                <span style={{
                  color: '#1890ff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  fontSize: '13px'
                }}>{source.name}</span>
              </div>
            )}
            {category && (
              <div className="category" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}>
                <span className="label" style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', minWidth: '50px' }}>Category:</span>
                <span style={{
                  color: '#1890ff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  fontSize: '13px'
                }}>{category.name}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

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
    </div>
  );
};

const DroppableColumn = ({ stage, leads, isColumnDragging }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column-content ${isColumnDragging ? 'column-dragging' : ''}`}
      style={{
        transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '8px',
        minHeight: '50px',
        backgroundColor: isOver ? '#e6f7ff' : 'transparent',
        border: isOver ? '2px dashed #1890ff' : '2px dashed transparent',
        borderRadius: '4px',
        transform: isOver ? 'scale(1.01)' : 'scale(1)',
        willChange: 'transform, background-color, border',
        position: 'relative',
        zIndex: 1,
        transformStyle: 'preserve-3d'
      }}
    >
      <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
        {leads.length > 0 ? (
          leads.map((lead) => (
            <DraggableCard
              key={lead.id}
              lead={lead}
              stage={stage}
            />
          ))
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No leads"
          />
        )}
      </SortableContext>
    </div>
  );
};

<<<<<<< Updated upstream
const SortableColumn = ({ stage, leads, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({
    id: `column-${stage.id}`,
    data: {
      type: 'column',
      stage
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging
      ? undefined
      : 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 'auto',
    opacity: isDragging ? 0.95 : 1,
    touchAction: 'none',
    transformOrigin: '50% 50%',
    willChange: 'transform',
    position: 'relative'
  };

  return (
    <div ref={setNodeRef} style={style} className={`kanban-column ${isDragging ? 'is-dragging' : ''}`}>
      <div
        className="kanban-column-header"
        {...attributes}
        {...listeners}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          padding: '8px 12px',
          backgroundColor: isDragging ? '#fafafa' : 'transparent',
          borderRadius: '4px',
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
          willChange: 'transform, background-color',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div className="drag-handle">
          <FiMenu size={16} />
        </div>
        <Text strong>{stage.stageName}</Text>
        <Tag>{leads?.length || 0}</Tag>
      </div>
      {children}
    </div>
  );
};

const LeadCard = () => {
=======
const LeadCard = ({currencies,countries,sourcesData,statusesData,categoriesData}) => {
>>>>>>> Stashed changes
  const { data: leadsData, isLoading, error } = useGetLeadsQuery();
  const { data: stageQueryData } = useGetLeadStagesQuery();
  const [updateLead] = useUpdateLeadMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const savedStageOrder = useSelector(selectStageOrder);
  const [activeId, setActiveId] = useState(null);
  const [orderedStages, setOrderedStages] = useState([]);

  // Filter and order lead stages
  const stages = React.useMemo(() => {
    if (!stageQueryData) return [];
    const leadStages = stageQueryData.filter(stage => stage.stageType === 'lead');

    if (savedStageOrder.length > 0) {
      // Sort stages based on saved order
      return leadStages.sort((a, b) => {
        const indexA = savedStageOrder.indexOf(a.id);
        const indexB = savedStageOrder.indexOf(b.id);
        // If stage is not in saved order, put it at the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }

    return leadStages;
  }, [stageQueryData, savedStageOrder]);

  // Initialize ordered stages when stagesData changes
  useEffect(() => {
    if (stages.length > 0) {
      setOrderedStages(stages);
      // If no saved order exists, initialize it
      if (savedStageOrder.length === 0) {
        dispatch(setStageOrder(stages.map(stage => stage.id)));
      }
    }
  }, [stages, dispatch, savedStageOrder.length]);

<<<<<<< Updated upstream
=======


  const stages = stagesData?.filter(stage => stage.stageType === 'lead') || [];
>>>>>>> Stashed changes
  const leads = leadsData?.data || [];

  const leadsByStage = React.useMemo(() => {
    return orderedStages.reduce((acc, stage) => {
      acc[stage.id] = leads.filter(lead => lead.leadStage === stage.id);
      return acc;
    }, {});
  }, [orderedStages, leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const isColumn = active.id.toString().startsWith('column-');
    const isCard = active.data?.current?.type === 'card';

    if (isColumn) {
      const oldIndex = orderedStages.findIndex(
        stage => `column-${stage.id}` === active.id
      );
      const newIndex = orderedStages.findIndex(
        stage => `column-${stage.id}` === over.id
      );

      if (oldIndex !== newIndex) {
        const newOrder = arrayMove(orderedStages, oldIndex, newIndex);
        setOrderedStages(newOrder);
        dispatch(setStageOrder(newOrder.map(stage => stage.id)));
      }
    } else if (isCard && over.id !== active.id) {
      const draggedId = active.id;
      const destinationId = over.id.toString().replace('column-', '');

      try {
        await updateLead({
          id: draggedId,
          data: {
            leadStage: destinationId,
            updated_by: loggedInUser?.username || ''
          }
        }).unwrap();

        message.success('Lead stage updated successfully');
      } catch (error) {
        message.error('Failed to update lead stage');
      }
    }
  };

  if (isLoading) return <div>Loading leads...</div>;
  if (error) return <div>Error loading leads: {error.message}</div>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board" style={{
        display: 'flex',
        gap: '24px',
        padding: '24px',
        overflowX: 'auto',
        minHeight: 'calc(100vh - 300px)',
        width: '100%',
        position: 'relative',
        isolation: 'isolate',
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}>
        <SortableContext
          items={orderedStages.map(stage => `column-${stage.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          {orderedStages.map((stage) => (
            <SortableColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.id] || []}
            >
              <DroppableColumn
                stage={stage}
                leads={leadsByStage[stage.id] || []}
                isColumnDragging={activeId === `column-${stage.id}`}
              />
            </SortableColumn>
          ))}
        </SortableContext>
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
          position: relative;
          isolation: isolate;
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .kanban-column {
          min-width: 320px;
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          flex: 1;
          transition: all 200ms ease;
          touch-action: none;
          position: relative;
          z-index: 1;
          transform-style: preserve-3d;
          
          &.is-dragging {
            background: #ffffff;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
            border: 2px dashed #1890ff40;
            cursor: grabbing;
            z-index: 2;
          }
        }

        .kanban-column-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding: 8px;
          cursor: grab;
          user-select: none;
          border-radius: 8px;
          transition: background-color 0.2s ease;
          touch-action: none;

          &:hover {
            background-color: rgba(0, 0, 0, 0.02);
          }

          &:active {
            cursor: grabbing;
          }

          .drag-handle {
            color: #8c8c8c;
            display: flex;
            align-items: center;
            padding: 4px;
            
            &:hover {
              color: #1890ff;
            }
          }
        }

        .ant-tag {
          background: #e6f4ff;
          color: #1890ff;
          border: none;
          border-radius: 12px;
          padding: 2px 12px;
          margin-left: auto;
        }

        .kanban-column-content {
          min-height: 100px;
          padding: 8px;
          background: #f8fafc;
          border-radius: 8px;
          transition: all 0.2s ease;
          
          &.column-dragging {
            background: #e6f7ff;
            border: 2px dashed #1890ff40;
          }
          
          &.dragging-over {
            background: #e6f7ff;
            transform: scale(1.02);
            box-shadow: 0 0 0 2px #1890ff33;
          }
        }

        .lead-card {
          margin-bottom: 16px;
          position: relative;
          z-index: auto;
          transform: translateZ(0);
          transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
          transform-style: preserve-3d;
          
          &:hover {
            transform: translateY(-2px);
            z-index: 2;
          }
          
          &.is-dragging {
            z-index: 999999 !important;
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
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
          position: relative;
          width: 100%;
          padding: 12px 0;
          border-top: 1px solid #f0f0f0;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric-label {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .metric-value {
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
          line-height: 1.4;
          width: 100%;
        }

        .value-text {
          font-size: 16px;
          font-weight: 600;
          color: var(--success-color);
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
          position: relative;
          z-index: 1;
          transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center center;
          
          &.is-dragging {
            cursor: grabbing;
            transform: scale(1.02);
            transition: none;
            opacity: 1;
            z-index: 999999 !important;
            position: relative;
            pointer-events: none;
            
            .lead-card {
              box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 
                         0 2px 6px rgba(0, 0, 0, 0.08);
            }
          }
        }

        .meta-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          margin-top: 4px;
        }

        .source, .category {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .label {
          color: #6b7280;
          font-weight: 500;
        }

        .lead-title {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .company-name {
          font-size: 13px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </DndContext>
  );
};

export default LeadCard;
