import React, { useState, useEffect } from "react";
import { Card, Tag, Tooltip, Typography, Empty, message, Button, Modal, Dropdown } from "antd";
import {
  FiMenu,
  FiTarget,
  FiFlag,
  FiDatabase,
  FiTag,
  FiPlus,
  FiPhone,
  FiMail,
  FiBriefcase,
  FiMoreVertical,
  FiUser,
  FiEye,
  FiEdit2,
  FiTrash2
} from "react-icons/fi";
import { useGetLeadsQuery, useUpdateLeadMutation } from './services/LeadApi';
import { useGetLeadStagesQuery } from '../crmsystem/leadstage/services/leadStageApi';
import { useGetPipelinesQuery } from '../crmsystem/pipeline/services/pipelineApi';
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
  useSortable,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import { useNavigate } from "react-router-dom";
import { CSS } from '@dnd-kit/utilities';
import { useGetSourcesQuery, useGetCategoriesQuery, useGetStatusesQuery } from '../crmsystem/souce/services/SourceApi';
import { useGetAllCurrenciesQuery } from "../../settings/services/settingsApi";
import { createPortal } from 'react-dom';
import AddLeadStageModal from "../crmsystem/leadstage/AddLeadStageModal";
import moment from "moment";
import { formatCurrency } from '../../../utils/currencyUtils';
const { Text } = Typography;

// Add this function near the top with other helper functions
const getInterestLevel = (level) => {
  const levels = {
    "high": {
      color: "#52c41a",
      bg: "rgba(82, 196, 26, 0.1)",
      border: "#b7eb8f",
      text: "High Interest"
    },
    "medium": {
      color: "#faad14",
      bg: "rgba(250, 173, 20, 0.1)",
      border: "#ffd591",
      text: "Medium Interest"
    },
    "low": {
      color: "#ff4d4f",
      bg: "rgba(255, 77, 79, 0.1)",
      border: "#ffa39e",
      text: "Low Interest"
    }
  };
  return levels[level] || levels.medium;
};

const DraggableCard = ({ lead, stage, currencies = [], onLeadClick, onEdit, onDelete, onView }) => {
  // Dropdown menu items
  const getDropdownItems = (lead) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: (e) => { e.stopPropagation(); onView?.(lead); },
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: (e) => { e.stopPropagation(); onEdit?.(lead); },
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: (e) => { e.stopPropagation(); onDelete?.(lead); },
        danger: true,
      },
    ],
  });

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: {
      type: 'card',
      lead
    }
  });

  const handleCardClick = (e) => {
    if (isDragging) return;
    if (onLeadClick) {
      onLeadClick(lead);
    }
  };

  const { data: sourceData } = useGetSourcesQuery(lead.client_id);
  const { data: statusesData } = useGetStatusesQuery(lead.client_id);

  const source = sourceData?.data?.find(s => s.id === lead.source);
  const status = statusesData?.data?.find(s => s.id === lead.status);

  const getDateTag = (date) => {
    const leadDate = moment(date);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');
    const thisWeek = moment().subtract(7, 'days').startOf('day');

    let colors = { bg: "#fff1f0", text: "#cf1322", border: "#ffa39e" }; // Older - Red

    if (leadDate.isSame(today, 'day')) {
      colors = { bg: "#f6ffed", text: "#389e0d", border: "#b7eb8f" }; // Today - Green
    } else if (leadDate.isSame(yesterday, 'day')) {
      colors = { bg: "#e6f7ff", text: "#096dd9", border: "#91d5ff" }; // Yesterday - Blue
    } else if (leadDate.isAfter(thisWeek)) {
      colors = { bg: "#fff7e6", text: "#d46b08", border: "#ffd591" }; // This Week - Orange
    }

    return (
      <Tag style={{
        margin: 0,
        padding: '0 8px',
        fontSize: '10px',
        fontWeight: '700',
        borderRadius: '4px',
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        textTransform: 'uppercase',
        height: '18px',
        lineHeight: '16px'
      }}>
        {leadDate.isSame(today, 'day') ? "Today" : 
         leadDate.isSame(yesterday, 'day') ? "Yesterday" : 
         leadDate.format("DD MMM")}
      </Tag>
    );
  };

  const cardContent = (
    <Card
      className="lead-card"
      bordered={false}
      onClick={handleCardClick}
      style={{
        borderRadius: '8px',
        background: lead.is_converted ? '#f8fafc' : '#ffffff',
        cursor: lead.is_converted ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
        boxShadow: isDragging
          ? '0 12px 24px rgba(0, 0, 0, 0.12)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        zIndex: isDragging ? 1200 : 1,
        overflow: 'hidden',
        opacity: lead.is_converted ? 0.85 : 1,
        padding: '0'
      }}
    >
      {/* Interest Level Top Indicator */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: '100%', height: '3px',
        background: getInterestLevel(lead.interest_level).color, opacity: 0.9
      }} />


      {/* Card Content */}
      <div style={{ padding: '12px 14px 12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Top Row: Date & Interest */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '-4px', marginTop: '4px' }}>
          {getDateTag(lead.createdAt)}
          <div style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex',
            alignItems: 'center', gap: '4px', background: getInterestLevel(lead.interest_level).color, color: '#ffffff',
            fontWeight: '600', lineHeight: '14px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}>
            {getInterestLevel(lead.interest_level).text}
          </div>
        </div>

        {/* Lead Title & Value Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <Tooltip title={lead?.leadTitle}>
            <Text strong style={{
              fontSize: '13px',
              display: 'block',
              lineHeight: '1.2',
              color: '#1f2937',
              marginBottom: '2px',
              flex: 1
            }}>
              {lead?.leadTitle}
            </Text>
          </Tooltip>
          <div style={{
            display: 'flex', alignItems: 'center', background: '#f0fdf4', padding: '2px 8px',
            borderRadius: '4px', border: '1px solid #dcfce7', height: '20px', flexShrink: 0
          }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', whiteSpace: 'nowrap' }}>
              {formatCurrency(lead.leadValue, lead.currency, currencies)}
            </span>
          </div>
        </div>

        {/* Contact Info Section */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '4px',
          background: '#fcfcfc',
          padding: '8px 10px',
          borderRadius: '6px',
          border: '1px solid #f0f0f0'
        }}>
          {(lead?.Company?.company_name || lead?.company_name) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <FiBriefcase size={11} style={{ color: '#8c8c8c' }} />
              <Text strong style={{ fontSize: '11px', color: '#434343' }}>
                {lead?.Company?.company_name || lead?.company_name}
              </Text>
            </div>
          )}
          {(lead?.Contact?.phone || lead?.mobile) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiPhone size={11} style={{ color: '#8c8c8c' }} />
              <Text style={{ fontSize: '11px', color: '#595959', fontWeight: '500' }}>
                {lead?.Contact?.PhoneCode?.phoneCode ? `${lead.Contact.PhoneCode.phoneCode} ` : ''}
                {lead?.Contact?.phone || lead?.mobile}
              </Text>
            </div>
          )}
          {(lead?.Contact?.email || lead?.email) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMail size={11} style={{ color: '#8c8c8c' }} />
              <Tooltip title={lead?.Contact?.email || lead?.email}>
                <Text style={{ 
                  fontSize: '11px', 
                  color: '#595959',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {lead?.Contact?.email || lead?.email}
                </Text>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Bottom Area - Tags & Score */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc',
          margin: '0 -14px -12px -16px', padding: '8px 16px', borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {source && (
                <Tag style={{
                  margin: 0, padding: '0 6px', fontSize: '10px', borderRadius: '4px',
                  background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0'
                }}>
                  {source.name}
                </Tag>
              )}
            </div>
            {lead.lead_score > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  backgroundColor: lead.lead_score >= 80 ? '#52c41a' : lead.lead_score >= 50 ? '#1890ff' : '#ff4d4f',
                }} />
                <Text strong style={{ 
                  fontSize: "10px", 
                  color: lead.lead_score >= 80 ? '#52c41a' : lead.lead_score >= 50 ? '#1890ff' : '#ff4d4f' 
                }}>
                  Score: {lead.lead_score}
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const draggableProps = lead.is_converted ? {} : { ...attributes, ...listeners };

  if (isDragging) {
    return createPortal(
      <div
        ref={setNodeRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 999999,
          width: '350px',
          transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
          opacity: 0.95,
          pointerEvents: 'none',
          cursor: 'grabbing',
          transformOrigin: '0 0',
          willChange: 'transform',
          transition: 'none'
        }}
        {...draggableProps}
      >
        {cardContent}
      </div>,
      document.body
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'relative',
        transform: 'translate3d(0, 0, 0)',
        touchAction: 'none',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
      {...draggableProps}
    >
      {cardContent}
    </div>
  );
};


const SortableColumn = ({ stage, leads, children, index }) => {
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

  const { data: currencies = [] } = useGetAllCurrenciesQuery();

  // Calculate total value by currency
  const totalsByCurrency = React.useMemo(() => {
    return leads.reduce((acc, lead) => {
      const value = parseFloat(lead.leadValue) || 0;
      const currencyId = lead.currency;
      
      if (!acc[currencyId]) {
        acc[currencyId] = 0;
      }
      acc[currencyId] += value;
      return acc;
    }, {});
  }, [leads]);

  const formattedTotals = React.useMemo(() => {
    return Object.entries(totalsByCurrency).map(([currencyId, total]) => {
      const currencyDetails = currencies?.find(c => c.id === currencyId);
      const currencySymbol = currencyDetails?.currencyIcon || '₹';
      return `${currencySymbol}${total.toLocaleString('en-IN')}`;
    });
  }, [totalsByCurrency, currencies]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
    zIndex: isDragging ? 999 : 1,
    position: 'relative',
    width: window.innerWidth < 480 ? '90vw' : '350px',
    minWidth: window.innerWidth < 480 ? '90vw' : '350px',
    height: '100%',
    willChange: 'transform'
  };

  return (
    <div ref={setNodeRef} style={style} className={`kanban-column ${isDragging ? 'is-dragging' : ''}`}>
      <div className="kanban-column-inner" style={{
        background: '#ffffff',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        boxShadow: isDragging
          ? '0 8px 16px rgba(0, 0, 0, 0.08)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        position: 'relative',
        zIndex: 1
      }}>
        <div
          className="column-header"
          {...attributes}
          {...listeners}
          style={{
            padding: '12px 14px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            background: '#f8fafc',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
             <div style={{
               background: '#f1f5f9',
               color: '#64748b',
               padding: '2px 6px',
               borderRadius: '4px',
               fontSize: '11px',
               fontWeight: '700'
             }}>
               {leads.length}
             </div>
             <Tooltip title={stage.stageName}>
               <Text strong style={{
                 fontSize: '13px',
                 margin: 0,
                 overflow: 'hidden',
                 textOverflow: 'ellipsis',
                 whiteSpace: 'nowrap',
                 color: '#334155'
               }}>{stage.stageName}</Text>
             </Tooltip>
          </div>

          {formattedTotals.length > 0 && (
            <div style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#16a34a',
              background: '#f0fdf4',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #dcfce7'
            }}>
              {formattedTotals[0]}
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

const DroppableColumn = ({ stage, leads, isColumnDragging, onEdit, onDelete, onView, onLeadClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: {
      type: 'stage',
      stage
    }
  });

  const { data: currencies = [] } = useGetAllCurrenciesQuery();

  return (
    <div
      ref={setNodeRef}
      className="kanban-column-content"
      style={{
        padding: '8px',
        height: 'calc(100vh - 240px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: isOver ? 'rgba(59, 130, 246, 0.05)' : '#f8fafc',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
        borderRadius: '0 0 8px 8px',
        width: '350px',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        willChange: 'background-color',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
        {leads.length > 0 ? (
          leads.map((lead) => (
            <DraggableCard
              key={lead.id}
              lead={lead}
              stage={stage}
              currencies={currencies}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onLeadClick={onLeadClick}
            />
          ))
        ) : (
          <div style={{
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed #cbd5e1',
            borderRadius: '8px',
            color: '#94a3b8',
            fontSize: '12px'
          }}>
            {isOver ? "Drop here" : "Empty Stage"}
          </div>
        )}
      </SortableContext>
    </div>
  );
};

const LeadCard = ({ leads, currencies, countries, sourcesData, statusesData, categoriesData, onLeadClick, onEdit, onDelete, onView }) => {
  const { data: stageQueryData, isLoading: isLoadingStages, error: errorStages, refetch: refetchStages } = useGetLeadStagesQuery();
  const { data: pipelinesData, isLoading: isLoadingPipelines } = useGetPipelinesQuery();
  const [updateLead] = useUpdateLeadMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const savedStageOrder = useSelector(selectStageOrder);
  const [activeId, setActiveId] = useState(null);
  const [orderedStages, setOrderedStages] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [isStageModalVisible, setIsStageModalVisible] = useState(false);
  
  // Ensure leads data is always an array
  const [leadsData, setLeads] = useState([]);
  const pipelines = pipelinesData || [];

  // Update leadsData when leads prop changes
  useEffect(() => {
    // Ensure we always have an array
    const newLeadsData = Array.isArray(leads?.data) ? leads.data : [];
    setLeads(newLeadsData);
  }, [leads]);

  // Initialize selected pipeline if not set
  useEffect(() => {
    if (!selectedPipeline && pipelines.length > 0) {
      setSelectedPipeline(pipelines[0]?.id);
    }
  }, [selectedPipeline, pipelines]);

  // Filter and order lead stages
  const stages = React.useMemo(() => {
    if (!stageQueryData) return [];
    const actualStages = Array.isArray(stageQueryData) ? stageQueryData : (stageQueryData.data || []);

    // Filter stages by type and pipeline
    const leadStages = actualStages.filter(stage =>
      stage.stageType === 'lead' &&
      stage.pipeline === selectedPipeline
    );

    // Sort stages based on saved order if available
    if (savedStageOrder.length > 0 && leadStages.length > 0) {
      const stageOrderMap = new Map(savedStageOrder.map((id, index) => [id, index]));
      return [...leadStages].sort((a, b) => {
        const indexA = stageOrderMap.has(a.id) ? stageOrderMap.get(a.id) : Infinity;
        const indexB = stageOrderMap.has(b.id) ? stageOrderMap.get(b.id) : Infinity;
        return indexA - indexB;
      });
    }

    return leadStages;
  }, [stageQueryData, savedStageOrder, selectedPipeline]);

  // Initialize ordered stages when stages derived from query data change
  useEffect(() => {
    if (stages.length > 0) {
      setOrderedStages(stages);
      if (savedStageOrder.length === 0) {
        dispatch(setStageOrder(stages.map(stage => stage.id)));
      }
    } else {
      setOrderedStages([]);
    }
  }, [stages, dispatch, savedStageOrder.length]);

  const dealsByStage = React.useMemo(() => {
    if (!Array.isArray(leadsData)) return {};
    
    return orderedStages.reduce((acc, stage) => {
      acc[stage.id] = leadsData.filter(lead => lead.leadStage === stage.id);
      return acc;
    }, {});
  }, [orderedStages, leadsData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
        distance: 3,
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
      let destinationId = over.id;

      // Get correct destination ID based on drop target type
      if (over.data?.current?.type === 'card') {
        // If dropped on another card, use its stage
        destinationId = over.data.current.lead.leadStage;
      } else if (over.data?.current?.type === 'stage') {
        // If dropped directly on a stage
        destinationId = over.id;
      } else if (typeof destinationId === 'string' && destinationId.startsWith('column-')) {
        // If dropped on column header
        destinationId = destinationId.replace('column-', '');
      }

      const draggedLead = active.data.current.lead;
      const originalStage = draggedLead.leadStage;


      if (draggedLead?.is_converted) {
        message.error("Cannot move a converted lead");
        return;
      }

      // Check if the destination is the same as the original stage
      if (originalStage === destinationId) {
        return;
      }

      try {
        // Optimistically update the UI
        const updatedLeads = leadsData.map(lead =>
          lead.id === draggedId
            ? { ...lead, leadStage: destinationId }
            : lead
        );
        
        // Update local state
        setLeads(prevState => ({
          ...prevState,
          data: updatedLeads
        }));

        // Make the API call
        await updateLead({
          id: draggedId,
          data: {
            leadStage: destinationId,
            updated_by: loggedInUser?.username || ''
          }
        }).unwrap();

        message.success('Lead stage updated successfully');
      } catch (error) {
        console.error("Error updating lead stage:", error);
        
        // Revert the optimistic update on error
        setLeads(prevState => ({
          ...prevState,
          data: leadsData
        }));
        
        message.error('Failed to update lead stage');
      }
    }
  };

  const showStageModal = () => {
    setIsStageModalVisible(true);
  };

  const handleStageModalClose = (didAddStage = false) => {
    setIsStageModalVisible(false);
    if (didAddStage) {
      console.log("Stage added, refetching stages...");
      refetchStages();
    }
  };

  if (isLoadingStages || isLoadingPipelines) return <div>Loading...</div>;
  if (errorStages) return <div>Error loading data. Please try again.</div>;

  return (
    <div className="lead-kanban" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        marginBottom: '8px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '0 12px',
        marginTop: '5px'
      }}>
        <Text strong style={{ fontSize: '13px', color: '#374151' }}>Pipeline:</Text>
        <div style={{
          display: 'flex',
          gap: '8px',
          flex: 1
        }}>
          {pipelines.map(pipeline => (
            <Button
              key={pipeline.id}
              type={selectedPipeline === pipeline.id ? "primary" : "default"}
              onClick={() => setSelectedPipeline(pipeline.id)}
              style={{
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                height: '32px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <FiTarget size={14} />
              {pipeline.pipeline_name}
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
        <div className="kanban-board-wrapper" style={{
          width: '100%',
          minHeight: 'calc(100vh - 240px)',
          overflow: 'auto',
          position: 'relative',
          isolation: 'isolate',
          perspective: 1000,
          transformStyle: 'preserve-3d'
        }}>
          <div className="kanban-board" style={{
            display: 'flex',
            gap: '16px',
            padding: '12px 24px 24px 12px',
            width: 'max-content',
            minWidth: '100%',
            height: 'fit-content',
            position: 'relative',
            transformStyle: 'preserve-3d',
            perspective: 1000,
            alignItems: 'flex-start'
          }}>
            <style jsx global>{`
              .kanban-board-wrapper {
                scrollbar-width: thin;
                scrollbar-color: #d1d5db transparent;
              }
              .kanban-board-wrapper::-webkit-scrollbar {
                width: 6px;
                height: 6px;
              }
              .kanban-board-wrapper::-webkit-scrollbar-track {
                background: transparent;
              }
              .kanban-board-wrapper::-webkit-scrollbar-thumb {
                background-color: #d1d5db;
                border-radius: 3px;
              }
              .kanban-board-wrapper::-webkit-scrollbar-thumb:hover {
                background-color: #9ca3af;
              }
              .kanban-column-content {
                height: calc(100vh - 240px) !important;
                overflow-y: auto !important;
                scrollbar-width: thin;
                scrollbar-color: #d1d5db transparent;
              }
              .kanban-column-content::-webkit-scrollbar {
                width: 4px;
              }
              .kanban-column-content::-webkit-scrollbar-track {
                background: transparent;
              }
              .kanban-column-content::-webkit-scrollbar-thumb {
                background-color: #d1d5db;
                border-radius: 2px;
              }
              .kanban-column-content::-webkit-scrollbar-thumb:hover {
                background-color: #9ca3af;
              }
              .kanban-column {
                height: fit-content;
                min-height: calc(100vh - 240px);
              }
              .ant-empty {
                margin: 0 !important;
              }
              .ant-empty-image {
                margin-bottom: 8px !important;
              }
              .kanban-column-content .ant-empty-description {
                margin-bottom: 0 !important;
              }
            `}</style>

            <SortableContext
              items={orderedStages.map(stage => `column-${stage.id}`)}
              strategy={horizontalListSortingStrategy}
            >
              {orderedStages.map((stage, index) => (
                <div key={stage.id}>
                  <SortableColumn
                    stage={stage}
                    leads={dealsByStage[stage.id] || []}
                    index={index}
                  >
                    <DroppableColumn
                      stage={stage}
                      leads={dealsByStage[stage.id] || []}
                      isColumnDragging={activeId === `column-${stage.id}`}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onView={onView}
                      onLeadClick={onLeadClick}
                    />
                  </SortableColumn>
                </div>
              ))}
            </SortableContext>
            <div style={{
              width: '320px',
              minWidth: '320px',
              height: 'auto',
            }}>
              <Button
                type="dashed"
                onClick={showStageModal}
                style={{
                  width: '100%',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#64748b',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                }}
                disabled={isLoadingStages}
              >
                <FiPlus size={16} />
                Add Stage
              </Button>
            </div>
          </div>
        </div>
      </DndContext>

      {/* Use AddLeadStageModal component directly */}
      {isStageModalVisible && (
        <AddLeadStageModal
          isOpen={isStageModalVisible}
          onClose={handleStageModalClose}
          pipelineId={selectedPipeline}
        />
      )}
    </div>
  );
};

export default LeadCard;                                                                                                                                                