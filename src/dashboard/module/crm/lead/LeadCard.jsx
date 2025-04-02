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
import { useGetAllCurrenciesQuery } from "../../settings/services/settingsApi";
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
  const { data: currencies = [] } = useGetAllCurrenciesQuery();

  const source = sourceData?.data?.find(s => s.id === lead.source);
  const category = categoryData?.data?.find(c => c.id === lead.category);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: isDragging ? undefined : 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
    position: isDragging ? 'relative' : 'static',
    touchAction: 'none',
    transformOrigin: '50% 50%',
    zIndex: isDragging ? 999999 : 'auto',
    pointerEvents: lead.is_converted ? 'none' : isDragging ? 'none' : undefined,
    isolation: isDragging ? 'isolate' : 'auto',
    transformStyle: 'preserve-3d',
    opacity: lead.is_converted ? 0.7 : 1,
    cursor: lead.is_converted ? 'default' : isDragging ? 'grabbing' : 'grab'
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
    const currencyDetails = currencies.find(c => c.id === currencyId || c.currencyCode === currencyId);
    if (!currencyDetails) return `${value}`;

    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace(/^/, currencyDetails.currencyIcon + ' ');
  };
  return (
    <div ref={setNodeRef} style={style} {...(lead.is_converted ? {} : { ...attributes, ...listeners })}>
      <Card
        className={`lead-card ${lead.is_converted ? 'converted' : ''}`}
        bordered={false}
        onClick={handleCardClick}
        style={{
          width: '100%',
          marginBottom: '8px',
          borderRadius: '4px',
          background: lead.is_converted ? '#f5f5f5' : '#ffffff',
          cursor: lead.is_converted ? 'default' : isDragging ? 'grabbing' : 'grab',
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
            marginBottom: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
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
            {lead.is_converted && (
              <Tag color="success" style={{ marginLeft: '8px' }}>
                Converted
              </Tag>
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

const LeadCard = ({ currencies, countries, sourcesData, statusesData, categoriesData }) => {
  const { data: leadsData, isLoading, error } = useGetLeadsQuery();
  const { data: stageQueryData } = useGetLeadStagesQuery();
  const [updateLead] = useUpdateLeadMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const savedStageOrder = useSelector(selectStageOrder);
  const [activeId, setActiveId] = useState(null);
  const [orderedStages, setOrderedStages] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState("95QsEzSA7EGnxrlRqnDShFw"); // Set default pipeline

  // Filter and order lead stages
  const stages = React.useMemo(() => {
    if (!stageQueryData) return [];
    const leadStages = stageQueryData.filter(stage =>
      stage.stageType === 'lead' &&
      stage.pipeline === selectedPipeline // Only show stages for selected pipeline
    );

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
  }, [stageQueryData, savedStageOrder, selectedPipeline]);

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

  const leads = leadsData?.data || [];

  const leadsByStage = React.useMemo(() => {
    return orderedStages.reduce((acc, stage) => {
      acc[stage.id] = leads.filter(lead => lead.leadStage === stage.id);
      return acc;
    }, {});
  }, [orderedStages, leads]);

  // Pipeline selection buttons
  const pipelines = [
    { id: "95QsEzSA7EGnxrlRqnDShFw", name: "Marketing" },
    { id: "cFaSfTBNfdMnnvSNxQmql0w", name: "Sales" }
  ];

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

      // Find the lead that's being dragged
      const draggedLead = leads.find(lead => lead.id === draggedId);

      // Check if the lead is converted
      if (draggedLead?.is_converted) {
        message.error("Cannot move a converted lead");
        return;
      }

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
    <div className="kanban-board-container">
      {/* Pipeline Selection */}
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        padding: '0 24px'
      }}>
        <Text strong style={{ fontSize: '14px', color: '#374151' }}>Pipeline:</Text>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          {pipelines.map(pipeline => (
            <Button
              key={pipeline.id}
              type={selectedPipeline === pipeline.id ? "primary" : "default"}
              onClick={() => setSelectedPipeline(pipeline.id)}
              style={{
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                height: '32px'
              }}
            >
              <FiTarget style={{ fontSize: '14px' }} />
              {pipeline.name}
            </Button>
          ))}
        </div>
      </div>

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
      </DndContext>
    </div>
  );
};

export default LeadCard;
