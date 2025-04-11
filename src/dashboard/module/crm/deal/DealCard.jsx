import React, { useState, useEffect } from "react";
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
  FiPhone,
  FiMenu,
  FiFlag,
  FiDatabase,
  FiTag,
  FiLock,
  FiMove,
  FiPlus
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useGetDealsQuery, useUpdateDealMutation, useDeleteDealMutation, useUpdateDealStageMutation } from "./services/dealApi";
import { useGetLeadStagesQuery, useUpdateLeadStageMutation } from "../crmsystem/leadstage/services/leadStageApi";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useGetLabelsQuery, useGetSourcesQuery, useGetCategoriesQuery, useGetStatusesQuery } from "../crmsystem/souce/services/SourceApi";
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
  DragOverlay
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { useGetAllCurrenciesQuery } from "../../settings/services/settingsApi";
import { createPortal } from 'react-dom';

const { Text } = Typography;

// Currency formatting helper function
const formatCurrency = (value, currencyCode) => {
  if (!value) return '0';

  try {
    const numericValue = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numericValue);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${value} ${currencyCode || 'USD'}`;
  }
};

// Add interest level helper
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

const DraggableCard = ({ deal, stage, onEdit, onDelete, onView, onDealClick, isOverlay }) => {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: deal.id,
    data: { type: 'card', deal, originalStageId: stage?.id }
  });

  // Fetch necessary data (Status, Source, Category, Labels)
  const clientId = deal?.client_id || useSelector(selectCurrentUser)?.client_id;
  const { data: statusesData } = useGetStatusesQuery(clientId, { skip: !clientId });
  const { data: labelsData } = useGetLabelsQuery(clientId, { skip: !clientId });
  const { data: sourceData } = useGetSourcesQuery(clientId, { skip: !clientId });
  const { data: categoryData } = useGetCategoriesQuery(clientId, { skip: !clientId });

  const status = statusesData?.data?.find(s => s.id === deal.status);
  const source = sourceData?.data?.find(s => s.id === deal.source);
  const category = categoryData?.data?.find(c => c.id === deal.category);
  const interestStyle = getInterestLevel(deal.interest_level);

  // Assuming deal.labelIds is an array of label IDs
  const dealLabels = React.useMemo(() => {
    if (!labelsData?.data || !deal.labelIds) return [];
    return labelsData.data.filter(label => deal.labelIds.includes(label.id));
  }, [labelsData, deal.labelIds]);

  // Combined styles for the wrapper div
  const wrapperStyle = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition || 'transform 0.2s ease, box-shadow 0.2s ease',
    zIndex: isDragging ? 1200 : 1,
    position: 'relative',
    marginBottom: '8px',
    cursor: deal.is_converted ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
    opacity: deal.is_converted ? 0.85 : 1,
  };

  const getDropdownItems = (deal) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: (e) => { e.stopPropagation(); onDealClick(deal); },
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: (e) => { e.stopPropagation(); onEdit(deal); },
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: (e) => { e.stopPropagation(); onDelete(deal); },
        danger: true,
      },
    ],
  });

  const onDropdownClick = (e) => e.stopPropagation();
  const handleCardClick = (e) => {
    e.stopPropagation();
    if (isDragging || isOverlay) return;
    navigate(`/dashboard/crm/deals/${deal.id}`);
  };

  // Determine display status (like LeadCard's Converted/Active)
  const dealDisplayStatus = deal.is_converted ? { text: 'Converted', color: '#15803d', bg: '#dcfce7' } : { text: 'Active', color: '#1e40af', bg: '#dbeafe' };

  // Card component itself
  const cardContent = (
    <Card
      bordered={false}
      style={{
        width: '100%',
        borderRadius: '8px',
        background: deal.is_converted ? '#f8fafc' : '#ffffff',
        boxShadow: isDragging
          ? '0 12px 24px rgba(0, 0, 0, 0.12)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Interest Level Top Indicator */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: '100%', height: '3px',
        background: interestStyle.color, opacity: 0.9
      }} />

      {/* Dropdown Button - Positioned absolutely */}
       <Dropdown menu={getDropdownItems(deal)} trigger={["click"]} placement="bottomRight">
         <Button
           type="text"
           icon={<FiMoreVertical />}
           style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, color: '#6b7280' }}
           onClick={onDropdownClick}
         />
       </Dropdown>

      {/* Card Content - Structure mirroring LeadCard */}
      <div style={{ padding: '12px 14px 12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Top Row: Status & Interest */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '-4px', marginTop: '4px' }}>
          {/* Active/Converted Status */}
          <div style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '12px', display: 'inline-flex',
            alignItems: 'center', gap: '4px', background: dealDisplayStatus.bg, color: dealDisplayStatus.color,
            fontWeight: '500', lineHeight: '14px'
          }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor' }} />
            {dealDisplayStatus.text}
          </div>
          {/* Interest Level Badge */}
          {deal.interest_level && (
            <div style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex',
              alignItems: 'center', gap: '4px', background: interestStyle.color, color: '#ffffff',
              fontWeight: '500', lineHeight: '14px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              {interestStyle.text}
            </div>
          )}
        </div>

        {/* Title, Company, Value Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Tooltip title={deal?.dealTitle} placement="topLeft">
              <Text strong className="deal-title" style={{
                fontSize: '14px', lineHeight: '1.4', display: 'block', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1f2937'
              }}>
                {deal?.dealTitle || 'Untitled Deal'}
              </Text>
            </Tooltip>
            {deal.company_name && (
              <Tooltip title={`Company: ${deal.company_name}`}>
                <Text className="company-name" style={{
                  fontSize: '12px', color: '#64748b', display: 'block', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px'
                }}>
                  {deal.company_name}
                </Text>
              </Tooltip>
            )}
             {/* Contact Name (Add if you have firstName/lastName on the deal object) */}
             <Text className="contact-name" style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>
               {`${deal.firstName || ''} ${deal.lastName || ''}`.trim() || 'No Contact'}
             </Text>
          </div>
          {/* Value Tag */}
          <div style={{
            display: 'flex', alignItems: 'center', background: '#f0fdf4', padding: '2px 8px',
            borderRadius: '4px', border: '1px solid #dcfce7', height: '20px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a', whiteSpace: 'nowrap' }}>
              {formatCurrency(deal.value, deal.currency)}
            </span>
          </div>
        </div>

        {/* Bottom Info Section (Tags) - Mirroring LeadCard */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc',
          margin: '0 -14px -12px -16px', padding: '8px 16px', borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Status Tag (using deal.status) */}
            {status && (
              <Tooltip title={`Status: ${status.name}`}>
                <Tag icon={<FiFlag style={{ fontSize: '10px' }} />} style={{
                  margin: 0, padding: '2px 8px', fontSize: '11px', borderRadius: '4px', background: '#f1f5f9',
                  color: '#475569', border: '1px solid #e2e8f0', lineHeight: '16px', display: 'inline-flex',
                  alignItems: 'center', gap: '4px', cursor: 'default'
                }}>
                  {status.name}
                </Tag>
              </Tooltip>
            )}
            {/* Source Tag (using deal.source) */}
            {source && (
              <Tooltip title={`Source: ${source.name}`}>
                <Tag icon={<FiDatabase style={{ fontSize: '10px' }} />} style={{
                  margin: 0, padding: '2px 8px', fontSize: '11px', borderRadius: '4px', background: '#eff6ff',
                  color: '#3b82f6', border: '1px solid #bfdbfe', lineHeight: '16px', display: 'inline-flex',
                  alignItems: 'center', gap: '4px', cursor: 'default'
                }}>
                  {source.name}
                </Tag>
              </Tooltip>
            )}
            {/* Category Tag (using deal.category) */}
            {category && (
              <Tooltip title={`Category: ${category.name}`}>
                <Tag icon={<FiTag style={{ fontSize: '10px' }} />} style={{
                  margin: 0, padding: '2px 8px', fontSize: '11px', borderRadius: '4px', background: '#ecfeff',
                  color: '#0891b2', border: '1px solid #bae6fd', lineHeight: '16px', display: 'inline-flex',
                  alignItems: 'center', gap: '4px', maxWidth: '120px', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'default'
                }}>
                  {category.name}
                </Tag>
              </Tooltip>
            )}
            {/* Label Tags (using deal.labelIds) */}
            {dealLabels && dealLabels.map(label => (
              <Tooltip key={label.id} title={`Label: ${label.name}`}>
                <Tag style={{
                  margin: 0, padding: '2px 8px', fontSize: '11px', borderRadius: '4px',
                  backgroundColor: label.color + '1A', color: label.color, borderColor: label.color + '33',
                  lineHeight: '16px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                  cursor: 'default'
                }}>
                  {label.name}
                </Tag>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );

  // Drag Overlay Rendering (No changes needed here if already correct)
  if (isDragging && isOverlay) {
    return createPortal(
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 999999, width: '350px', /* ... other overlay styles */ }}>
        {cardContent}
      </div>,
      document.body
    );
  }

  // Render the actual draggable card wrapper
  // Apply listeners/attributes to the wrapper div for SortableContext
  return (
    <div
      ref={setNodeRef}
      style={wrapperStyle}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
    >
      {cardContent}
    </div>
  );
};

const DroppableStage = ({ stage, children, deals }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: 'column', stage: stage }
  });
  const dealIds = React.useMemo(() => deals?.map(d => d.id) || [], [deals]);

  return (
    <div
      ref={setNodeRef}
      className="kanban-column-content-wrapper"
      data-is-over={isOver}
    >
      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
      <div className="kanban-column-content">
        {children}
      </div>
      </SortableContext>
    </div>
  );
};

const SortableColumn = ({ stage, dealsInStage, children, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column-${stage.id}`,
    data: {
      type: 'column',
      stage: {
        id: stage.id,
        stageName: stage.stageName,
        stageType: 'deal',
        pipeline: stage.pipeline || "cFaSfTBNfdMnnvSNxQmql0w" // Add pipeline ID here
      }
    }
  });

  // Use classes for styling primarily
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 0.2s ease',
    // Height is handled by flex layout + parent
  };

  return (
    <div ref={setNodeRef} style={style} className={`kanban-column ${isDragging ? 'is-dragging' : ''}`}>
      <div className="column-header-draggable" {...listeners} {...attributes}>
         <div className="header-left-content">
            <Tag className="index-tag">{index + 1}</Tag>
            <FiMenu className="drag-handle-icon" />
            <Text strong className="stage-title">{stage.stageName}</Text>
         </div>
         <div className="header-right-content">
            <Tag className="value-sum-tag">
            {formatCurrency(dealsInStage.reduce((sum, deal) => sum + (parseFloat(deal.value) || 0), 0), dealsInStage[0]?.currency)}
            </Tag>
            <Tag className="count-tag">{dealsInStage.length}</Tag>
        </div>
      </div>
      {children}
    </div>
  );
};

const DealCard = ({ onEdit, onDelete, onView, onDealClick }) => {
  const [updateDeal] = useUpdateDealMutation();
  const [updateDealStage] = useUpdateDealStageMutation();
  const [updateLeadStage] = useUpdateLeadStageMutation();
  const { data: dealsData, isLoading: isLoadingDeals, error: dealsError } = useGetDealsQuery();
  const { data: stageQueryData, isLoading: isLoadingStages } = useGetLeadStagesQuery();
  const currentUser = useSelector(selectCurrentUser);

  const [activeId, setActiveId] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [orderedStages, setOrderedStages] = useState([]);
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    if (dealsData) {
      if (Array.isArray(dealsData)) {
        setDeals(dealsData);
      } else if (dealsData.data && Array.isArray(dealsData.data)) {
        setDeals(dealsData.data);
      } else {
        setDeals([]);
      }
    }
  }, [dealsData]);

  useEffect(() => {
    if (stageQueryData) {
      const stages = Array.isArray(stageQueryData) 
        ? stageQueryData 
        : (stageQueryData.data || []);
      
      const dealStages = stages
        .filter(stage => stage.stageType === 'deal')
        .sort((a, b) => (a.position || 0) - (b.position || 0)); // Sort by position
      
      setOrderedStages(dealStages);
    }
  }, [stageQueryData]);

  const dealsByStage = React.useMemo(() => {
    return orderedStages.reduce((acc, stage) => {
      acc[stage.id] = deals.filter(deal => deal.stage === stage.id);
      return acc;
    }, {});
  }, [orderedStages, deals]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,  
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setActiveDragItemData(active.data.current);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveDragItemData(null);

    if (!over) {
        console.log("Dropped outside a target");
        return;
    }

    const activeId = active.id;
    const overId = over.id;

    // CASE 1: Stage Column Reordering
    if (active.data.current?.type === 'column' && over.data.current?.type === 'column' && activeId !== overId) {
        console.log("Reordering stage columns...");
        try {
            const oldIndex = orderedStages.findIndex(stage => `column-${stage.id}` === activeId);
            const newIndex = orderedStages.findIndex(stage => `column-${stage.id}` === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(orderedStages, oldIndex, newIndex);
                
                // Update all stage positions
                const updatePromises = newOrder.map(async (stage, index) => {
                    const updatePayload = {
                        id: stage.id,
                        stageName: stage.stageName,
                        position: index + 1,
                        stageType: "deal",
                          pipeline: stage.pipeline || "cFaSfTBNfdMnnvSNxQmql0w"
                    };

                    return updateLeadStage(updatePayload).unwrap();
                });

                // Wait for all updates to complete
                await Promise.all(updatePromises);

                // Update local state with new positions
                const updatedStages = newOrder.map((stage, index) => ({
                    ...stage,
                    position: index + 1
                }));
                
                setOrderedStages(updatedStages);
                message.success('Stage order updated successfully');
            }
        } catch (error) {
            console.error('Failed to update stage order:', error);
            message.error('Failed to update stage order');

            // Revert optimistic update
            if (stageQueryData) {
                const stages = Array.isArray(stageQueryData)
                    ? stageQueryData
                    : (stageQueryData.data || []);
                const dealStages = stages.filter(stage => stage.stageType === 'deal')
                    .sort((a, b) => (a.position || 0) - (b.position || 0)); // Sort by position
                setOrderedStages(dealStages);
            }
        }
        return;
    }

    // CASE 2: Deal Card Movement
    if (active.data.current?.type === 'card') {
        const draggedDeal = active.data.current?.deal;
        const originalStageId = draggedDeal?.stage;

        // Determine destination stage ID
        let destinationStageId = null;
        if (over.data.current?.type === 'column') {
            destinationStageId = over.id.toString().replace('column-', '');
        } else if (over.data.current?.type === 'card') {
            destinationStageId = over.data.current?.deal?.stage;
        }

        if (!destinationStageId) {
            console.error("Invalid destination stage");
            return;
        }

        // Find destination stage details
        const destinationStage = orderedStages.find(s => s.id === destinationStageId);
        if (!destinationStage) {
            console.error("Destination stage not found");
            return;
        }

        // Moving to a different stage
        if (originalStageId !== destinationStageId) {
            console.log(`Moving deal ${draggedDeal.id} to stage ${destinationStageId}`);

            try {
                // First, update the local state optimistically
                setDeals(prevDeals => 
                    prevDeals.map(deal => 
                        deal.id === draggedDeal.id 
                            ? { ...deal, stage: destinationStageId }
                            : deal
                    )
                );

                // Then make the API call with the correct payload structure
                await updateDeal({
                    id: draggedDeal.id,
                    stage: destinationStageId,  // Send stage ID directly
                    stageName: destinationStage.stageName,  // Include stage name
                    updated_by: currentUser?.username || ''
                }).unwrap();

                message.success(`Deal moved to ${destinationStage.stageName}`);
            } catch (error) {
                console.error('Failed to update deal stage:', error);
                // Revert the optimistic update
                setDeals(prevDeals => 
                    prevDeals.map(deal => 
                        deal.id === draggedDeal.id 
                            ? { ...deal, stage: originalStageId }
                            : deal
                    )
                );
                message.error('Failed to update deal stage');
            }
        }
        // Reordering within the same stage
        else if (activeId !== overId) {
            try {
                const stageDeals = deals.filter(d => d.stage === originalStageId);
                const oldIndex = stageDeals.findIndex(d => d.id === activeId);
                const newIndex = stageDeals.findIndex(d => d.id === overId);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const reorderedDeals = arrayMove(stageDeals, oldIndex, newIndex);
                    
                    // Update positions for all deals in the stage
                    for (let i = 0; i < reorderedDeals.length; i++) {
                        const deal = reorderedDeals[i];
                        await updateDeal({
                            id: deal.id,
                            stage: originalStageId,
                            stageName: destinationStage.stageName,
                            position: i + 1,
                            updated_by: currentUser?.username || ''
                        }).unwrap();
                    }

                    message.success('Deal order updated successfully');
                }
            } catch (error) {
                console.error('Failed to update deal order:', error);
                message.error('Failed to update deal order');
            }
        }
    }
  };

  if (isLoadingDeals || isLoadingStages) return <div>Loading...</div>;
  if (dealsError) return <div>Error loading deals: {dealsError.message}</div>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board-wrapper">
        <div className="kanban-board">
          <SortableContext
            items={orderedStages.map(stage => `column-${stage.id}`)}
            strategy={horizontalListSortingStrategy}
          >
            {orderedStages.map((stage, index) => {
              const stageDeals = dealsByStage[stage.id] || [];
              return (
                <SortableColumn
                  key={stage.id}
                  stage={stage}
                  dealsInStage={stageDeals}
                  index={index}
                >
                  <DroppableStage stage={stage} deals={stageDeals}>
                    {stageDeals.length > 0 ? (
                      stageDeals.map((deal) => (
                        <DraggableCard
                          key={deal.id}
                          deal={deal}
                          stage={stage}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onView={onView}
                          onDealClick={onDealClick}
                        />
                      ))
                    ) : (
                      <Empty className="empty-stage-placeholder" image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Deals" />
                    )}
                  </DroppableStage>
                </SortableColumn>
              );
            })}
          </SortableContext>

          <div className="add-stage-button-container">
             <Button type="dashed" icon={<FiPlus />} className="add-stage-button">
               Add Stage
             </Button>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId && activeDragItemData ? (
          activeDragItemData.type === 'column' ? (
             <div className="kanban-column is-overlay">
                <div className="column-header-draggable">
                    <div className="header-left-content">
                        <FiMenu className="drag-handle-icon" />
                        <Text strong className="stage-title">{activeDragItemData.stage?.stageName}</Text>
                    </div>
                </div>
             </div>
          ) : activeDragItemData.type === 'card' ? (
            <DraggableCard
               deal={activeDragItemData.deal}
               stage={orderedStages.find(s => s.id === activeDragItemData.deal.stage)}
               isOverlay={true}
            />
          ) : null
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DealCard;
