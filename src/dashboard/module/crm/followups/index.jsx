import React, { useState } from "react";
import {
  Card,
  message,
  Modal,
  Tag,
  Typography,
  Table,
  Dropdown,
  Button,
  Select,
  Avatar,
  Tooltip,
  DatePicker,
  Tabs,
  Badge,
  Drawer,
  Form,
  Space,
  Segmented,
} from "antd";
import {
  FiDownload,
  FiHome,
  FiPhoneCall,
  FiUsers,
  FiCheckSquare,
  FiClock,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiX,
  FiFilter,
  FiList,
  FiColumns,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { 
  useGetGlobalFollowupsQuery,
  useDeleteFollowupMutation,
  useDeleteFollowupCallMutation,
  useDeleteFollowupMeetingMutation,
  useDeleteFollowupTaskMutation,
  useUpdateFollowupCallMutation,
  useUpdateFollowupMeetingMutation,
  useUpdateFollowupTaskMutation
} from "../lead/services/LeadApi";
import EditFollowupCall from "../lead/overview/followup/call/EditfollowupCall";
import EditFollowupMeeting from "../lead/overview/followup/metting/EditfollowupMeeting";
import EditFollowupTask from "../lead/overview/followup/task/EditFollowupTask";
import CreateFollowupCall from "../lead/overview/followup/call/CreatefollowupCall";
import CreateFollowupMeeting from "../lead/overview/followup/metting/CreatefollowupMeeting";
import CreateFollowupTask from "../lead/overview/followup/task/CreatefollowupTask";
import { useGetLeadsQuery } from "../lead/services/LeadApi";
import { useGetDealsQuery } from "../deal/services/DealApi";
import { useGetUsersQuery } from "../../user-management/users/services/userApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import PageHeader from "../../../../components/PageHeader";
import moment from "moment";

const { Option } = Select;

const RecordSearchSelector = ({ onSelect }) => {
  const { data: leadsResponse, isLoading: leadsLoading } = useGetLeadsQuery({ pageSize: 1000 });
  const { data: dealsResponse, isLoading: dealsLoading } = useGetDealsQuery({ pageSize: 1000 });
  
  const leads = leadsResponse?.data || [];
  const deals = dealsResponse?.data || [];

  const combinedOptions = [
    ...leads.map(lead => ({
      value: lead.id,
      label: lead.leadTitle || `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || lead.email || "Untitled Lead",
      type: 'Lead',
      color: 'cyan'
    })),
    ...deals.map(deal => ({
      value: deal.id,
      label: deal.title || deal.dealTitle || deal.deal_title || deal.deal_name || deal.lead?.leadTitle || "Untitled Deal",
      type: 'Deal',
      color: 'magenta'
    }))
  ];

  return (
    <Select
      showSearch
      style={{ width: "100%" }}
      placeholder="Search for a Lead or Deal..."
      optionFilterProp="label"
      loading={leadsLoading || dealsLoading}
      onChange={(value, option) => onSelect(value, option.type)}
      size="large"
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
    >
      {combinedOptions.map(opt => (
        <Option key={`${opt.type}-${opt.value}`} value={opt.value} label={opt.label} type={opt.type}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{opt.label}</span>
            <Tag color={opt.color} style={{ fontSize: '10px' }}>{opt.type}</Tag>
          </div>
        </Option>
      ))}
    </Select>
  );
};

const { Text } = Typography;

const Followups = () => {
  const [searchText, setSearchText] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isEditCallOpen, setIsEditCallOpen] = useState(false);
  const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  
  const [updateCall] = useUpdateFollowupCallMutation();
  const [updateMeeting] = useUpdateFollowupMeetingMutation();
  const [updateTask] = useUpdateFollowupTaskMutation();

  const handleStatusChange = async (id, type, newStatus) => {
    const item = followups.find(f => f.id === id && f.type === type);
    if (!item) return;

    try {
      if (type === 'call') {
        let call_status = 'not_started';
        if (newStatus === 'completed') call_status = 'completed';
        else if (newStatus === 'in_progress') call_status = 'in_progress';
        
        const allowedKeys = [
          'subject', 'section', 'call_start_date', 'call_duration', 
          'call_start_time', 'call_end_time', 'call_reminder', 
          'assigned_to', 'call_notes', 'call_type', 'call_status', 'priority'
        ];
        const payload = {};
        allowedKeys.forEach(k => {
          if (item.rawData[k] !== undefined) payload[k] = item.rawData[k];
        });
        if (typeof payload.assigned_to === 'string') {
          try {
            payload.assigned_to = JSON.parse(payload.assigned_to);
          } catch(e) {}
        }
        payload.call_status = call_status;

        await updateCall({ id, data: payload }).unwrap();
      } else if (type === 'meeting') {
        let meeting_status = 'scheduled';
        if (newStatus === 'completed') meeting_status = 'completed';
        else if (newStatus === 'in_progress') meeting_status = 'in_progress';
        
        const allowedKeys = [
          'title', 'meeting_type', 'section', 'venue', 'location', 
          'meeting_link', 'from_date', 'from_time', 'to_date', 'to_time', 
          'meeting_status', 'assigned_to', 'reminder', 'repeat', 
          'participants_reminder', 'priority'
        ];
        const payload = {};
        allowedKeys.forEach(k => {
          if (item.rawData[k] !== undefined) payload[k] = item.rawData[k];
        });
        if (typeof payload.assigned_to === 'string') {
          try {
            payload.assigned_to = JSON.parse(payload.assigned_to);
          } catch(e) {}
        }
        if (typeof payload.reminder === 'string') {
          try {
            payload.reminder = JSON.parse(payload.reminder);
          } catch(e) {}
        }
        if (typeof payload.repeat === 'string') {
          try {
            payload.repeat = JSON.parse(payload.repeat);
          } catch(e) {}
        }
        payload.meeting_status = meeting_status;

        await updateMeeting({ id, data: payload }).unwrap();
      } else if (type === 'task') {
        let status = 'not_started';
        if (newStatus === 'completed') status = 'completed';
        else if (newStatus === 'in_progress') status = 'in_progress';
        
        const allowedKeys = [
          'subject', 'section', 'due_date', 'priority', 'task_reporter', 
          'assigned_to', 'status', 'reminder', 'repeat', 'description'
        ];
        const payload = {};
        allowedKeys.forEach(k => {
          if (item.rawData[k] !== undefined) payload[k] = item.rawData[k];
        });
        if (typeof payload.assigned_to === 'string') {
          try {
            payload.assigned_to = JSON.parse(payload.assigned_to);
          } catch(e) {}
        }
        if (typeof payload.reminder === 'string') {
          try {
            payload.reminder = JSON.parse(payload.reminder);
          } catch(e) {}
        }
        if (typeof payload.repeat === 'string') {
          try {
            payload.repeat = JSON.parse(payload.repeat);
          } catch(e) {}
        }
        payload.status = status;

        await updateTask({ id, data: payload }).unwrap();
      }
      message.success(`Status updated successfully`);
      refetch();
    } catch (err) {
      console.error(err);
      message.error("Failed to update status");
    }
  };
  
  const { data: usersResponse } = useGetUsersQuery();
  const users = usersResponse?.data || [];
  
  const { data: followupsResponse, isLoading, refetch } = useGetGlobalFollowupsQuery();
  
  const [deleteGeneric] = useDeleteFollowupMutation();
  const [deleteCall] = useDeleteFollowupCallMutation();
  const [deleteMeeting] = useDeleteFollowupMeetingMutation();
  const [deleteTask] = useDeleteFollowupTaskMutation();

  const handleEdit = (record) => {
    setSelectedRecord(record);
    if (record.type === 'call') setIsEditCallOpen(true);
    else if (record.type === 'meeting') setIsEditMeetingOpen(true);
    else if (record.type === 'task') setIsEditTaskOpen(true);
    else message.info("Generic edit not implemented yet");
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: 'Delete Followup',
      content: `Are you sure you want to delete this ${record.type}?`,
      onOk: async () => {
        try {
          if (record.type === 'call') await deleteCall(record.id).unwrap();
          else if (record.type === 'meeting') await deleteMeeting(record.id).unwrap();
          else if (record.type === 'task') await deleteTask(record.id).unwrap();
          else await deleteGeneric(record.id).unwrap();
          
          message.success('Deleted successfully');
          refetch();
        } catch (error) {
          message.error('Failed to delete');
        }
      }
    });
  };

  const followups = followupsResponse?.data || [];


  const getRelativeDate = (date, status) => {
    const mDate = moment(date);
    const today = moment().startOf('day');
    
    if (mDate.isSame(today, 'day')) {
      return <Tag color="blue" style={{ borderRadius: '12px' }}>TODAY</Tag>;
    }
    if (mDate.isSame(today.clone().add(1, 'day'), 'day')) {
      return <Tag color="cyan" style={{ borderRadius: '12px' }}>TOMORROW</Tag>;
    }
    if (mDate.isBefore(today, 'day') && status !== 'completed') {
      return <Tag color="error" style={{ borderRadius: '12px' }}>OVERDUE</Tag>;
    }
    return null;
  };

  const columns = [
    {
      title: "Source",
      key: "source",
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag color={record.relatedType === 'Lead' ? 'cyan' : 'magenta'} style={{ fontSize: '10px' }}>
            {record.relatedType?.toUpperCase()}
          </Tag>
          <Link to={`/dashboard/crm/${record.relatedType?.toLowerCase()}s/${record.relatedId}`}>
            <Text strong style={{ whiteSpace: 'nowrap' }}>{record.relatedName}</Text>
          </Link>
        </div>
      ),
    },
    {
      title: "Interaction Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = "blue";
        let icon = <FiPhoneCall style={{ marginRight: '4px' }} />;
        if (type === 'meeting') { color = "purple"; icon = <FiUsers style={{ marginRight: '4px' }} />; }
        if (type === 'task') { color = "orange"; icon = <FiCheckSquare style={{ marginRight: '4px' }} />; }
        return <Tag color={color} icon={icon}>{type?.toUpperCase()}</Tag>;
      }
    },
    {
      title: "Title",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Priority",
      dataIndex: ["rawData", "priority"],
      key: "priority",
      render: (priority) => {
        const p = priority?.toLowerCase();
        let color = "default";
        if (p === 'highest') color = "volcano";
        else if (p === 'high') color = "orange";
        else if (p === 'medium') color = "blue";
        else if (p === 'low') color = "green";
        
        return (
          <Tag color={color} style={{ fontSize: '10px', borderRadius: '4px' }}>
            {priority?.toUpperCase() || "MEDIUM"}
          </Tag>
        );
      }
    },
    {
      title: "Schedule",
      dataIndex: "date",
      key: "date",
      render: (date, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text strong>{moment(date).format('DD MMM YYYY')}</Text>
            {getRelativeDate(date, record.status)}
          </div>
          <Text type="secondary" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiClock size={12} /> {record.time || "N/A"}
          </Text>
        </div>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        let isOverdue = false;
        if (status !== 'completed' && record.date) {
            const timeString = record.time || '23:59:59';
            // Parse the combined date and time
            const itemDateTime = moment(`${record.date} ${timeString}`);
            if (itemDateTime.isValid() && itemDateTime.isBefore(moment())) {
                isOverdue = true;
            }
        }

        if (isOverdue) {
            return <Tag color="error">OVERDUE</Tag>;
        }

        return (
            <Tag color={status === 'completed' ? 'success' : 'processing'}>
            {status?.replace(/_/g, ' ').toUpperCase()}
            </Tag>
        );
      }
    },
    {
      title: "Assignee",
      key: "assignee",
      render: (_, record) => {
        let assignedIds = [];
        try {
          if (record.rawData?.assigned_to) {
            const parsed = typeof record.rawData.assigned_to === 'string' 
              ? JSON.parse(record.rawData.assigned_to) 
              : record.rawData.assigned_to;
            assignedIds = parsed?.assigned_to || [];
          }
        } catch (e) {
          console.error("Error parsing assigned_to", e);
        }

        if (assignedIds.length === 0) return <Text type="secondary">Unassigned</Text>;

        return (
          <Avatar.Group
            maxCount={3}
            maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf', cursor: 'pointer' }}
          >
            {assignedIds.map(id => {
              const u = users.find(user => String(user.id) === String(id));
              const name = u?.username || "Unknown";
              const initials = name.charAt(0).toUpperCase();
              
              return (
                <Tooltip title={name} key={id}>
                  <Avatar 
                    src={u?.profilePic}
                    style={{ backgroundColor: u?.profilePic ? 'transparent' : '#1890ff' }}
                  >
                    {!u?.profilePic && initials}
                  </Avatar>
                </Tooltip>
              );
            })}
          </Avatar.Group>
        );
      }
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Edit',
                icon: <FiEdit2 />,
                onClick: () => handleEdit(record)
              },
              {
                key: 'delete',
                label: 'Delete',
                icon: <FiTrash2 />,
                danger: true,
                onClick: () => handleDelete(record)
              }
            ]
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<FiMoreVertical />} />
        </Dropdown>
      )
    }
  ];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [selectedRecordType, setSelectedRecordType] = useState('Lead');
  const [isCreateCallOpen, setIsCreateCallOpen] = useState(false);
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const handleAddFollowup = () => {
    setIsAddModalOpen(true);
  };

  const handleSelectRecordForAdd = (recordId, interactionType) => {
    setSelectedRecordId(recordId);
    setIsAddModalOpen(false);
    if (interactionType === 'call') setIsCreateCallOpen(true);
    else if (interactionType === 'meeting') setIsCreateMeetingOpen(true);
    else if (interactionType === 'task') setIsCreateTaskOpen(true);
  };

  const filteredData = followups.filter(f => {
    const itemDate = moment(f.date).startOf('day');
    const today = moment().startOf('day');
    
    // 1. Search Filter
    const matchesSearch = 
      !searchText || 
      f.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      f.relatedName?.toLowerCase().includes(searchText.toLowerCase());
    
    // 2. Date Range Filter
    let matchesDateRange = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      // Ensure we handle both Moment and Dayjs objects correctly
      const start = moment(dateRange[0].valueOf ? dateRange[0].valueOf() : dateRange[0]).startOf('day');
      const end = moment(dateRange[1].valueOf ? dateRange[1].valueOf() : dateRange[1]).endOf('day');
      matchesDateRange = itemDate.isBetween(start, end, 'day', '[]');
    }

    // 3. Tab Filter
    let matchesTab = true;
    if (activeTab === 'today') {
      matchesTab = itemDate.isSame(today, 'day');
    } else if (activeTab === 'upcoming') {
      matchesTab = itemDate.isAfter(today, 'day');
    } else if (activeTab === 'overdue') {
      matchesTab = itemDate.isBefore(today, 'day') && f.status !== 'completed';
    }
    
    if (!matchesSearch || !matchesDateRange || !matchesTab) return false;

    // 4. Advanced Filters
    if (advancedFilters.type && f.type !== advancedFilters.type) return false;
    if (advancedFilters.status && f.status !== advancedFilters.status) return false;
    if (advancedFilters.priority && f.rawData?.priority !== advancedFilters.priority) return false;
    if (advancedFilters.assignee) {
        let assignedIds = [];
        try {
          if (f.rawData?.assigned_to) {
            const parsed = typeof f.rawData.assigned_to === 'string' 
              ? JSON.parse(f.rawData.assigned_to) 
              : f.rawData.assigned_to;
            assignedIds = parsed?.assigned_to || [];
          }
        } catch (e) {
          console.error("Error parsing assigned_to", e);
        }
        if (!assignedIds.includes(advancedFilters.assignee) && !assignedIds.includes(String(advancedFilters.assignee))) return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort by newest created first globally for all tabs
    const timeA = moment(a.rawData?.createdAt || a.date).valueOf();
    const timeB = moment(b.rawData?.createdAt || b.date).valueOf();
    return timeB - timeA;
  });

  return (
    <div className="followup-page standard-page-container">
      {/* Edit Modals */}
      {isEditCallOpen && (
        <EditFollowupCall
          open={isEditCallOpen}
          onCancel={() => setIsEditCallOpen(false)}
          callId={selectedRecord?.id}
          callData={selectedRecord?.rawData}
          onSubmit={() => { refetch(); setIsEditCallOpen(false); }}
        />
      )}
      {isEditMeetingOpen && (
        <EditFollowupMeeting
          open={isEditMeetingOpen}
          onCancel={() => setIsEditMeetingOpen(false)}
          meetingId={selectedRecord?.id}
          meetingData={selectedRecord?.rawData}
          onSubmit={() => { refetch(); setIsEditMeetingOpen(false); }}
        />
      )}
      {isEditTaskOpen && (
        <EditFollowupTask
          open={isEditTaskOpen}
          onCancel={() => setIsEditTaskOpen(false)}
          taskId={selectedRecord?.id}
          taskData={selectedRecord?.rawData}
          onSubmit={() => { refetch(); setIsEditTaskOpen(false); }}
        />
      )}

      {/* Create Modals */}
      {isCreateCallOpen && (
        <CreateFollowupCall
          open={isCreateCallOpen}
          onCancel={() => setIsCreateCallOpen(false)}
          leadId={selectedRecordId}
          type={selectedRecordType}
          onSubmit={() => { refetch(); setIsCreateCallOpen(false); }}
        />
      )}
      {isCreateMeetingOpen && (
        <CreateFollowupMeeting
          open={isCreateMeetingOpen}
          onCancel={() => setIsCreateMeetingOpen(false)}
          leadId={selectedRecordId}
          type={selectedRecordType}
          onSubmit={() => { refetch(); setIsCreateMeetingOpen(false); }}
        />
      )}
      {isCreateTaskOpen && (
        <CreateFollowupTask
          open={isCreateTaskOpen}
          onCancel={() => setIsCreateTaskOpen(false)}
          leadId={selectedRecordId}
          type={selectedRecordType}
          onSubmit={() => { refetch(); setIsCreateTaskOpen(false); }}
        />
      )}

      {/* Global Add Selection Modal */}
      <Modal
        title={null}
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={550}
        centered
        className="pro-modal custom-modal"
        styles={{ body: { padding: 0, borderRadius: '12px', overflow: 'hidden' } }}
      >
        <div className="modal-header" style={{
          background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
          padding: '24px',
          color: '#ffffff',
          position: 'relative'
        }}>
          <Button
            type="text"
            onClick={() => setIsAddModalOpen(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px'
            }}
          >
            <FiX />
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiPhoneCall style={{ fontSize: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>Add New Follow-up</h2>
              <Text style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)' }}>Quickly schedule a new interaction</Text>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Text strong style={{ fontSize: '14px', color: '#1f2937', display: 'block', marginBottom: '8px' }}>
              Select Lead or Deal <span style={{ color: '#ff4d4f' }}>*</span>
            </Text>
            <RecordSearchSelector 
              onSelect={(id, type) => {
                setSelectedRecordId(id);
                setSelectedRecordType(type);
              }} 
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Text strong style={{ fontSize: '14px', color: '#1f2937', display: 'block', marginBottom: '12px' }}>
              Interaction Type <span style={{ color: '#ff4d4f' }}>*</span>
            </Text>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { type: 'call', label: 'Call', icon: <FiPhoneCall />, color: '#1677ff' },
                { type: 'meeting', label: 'Meeting', icon: <FiUsers />, color: '#722ed1' },
                { type: 'task', label: 'Task', icon: <FiCheckSquare />, color: '#fa8c16' }
              ].map((item) => (
                <Button
                  key={item.type}
                  onClick={() => handleSelectRecordForAdd(selectedRecordId, item.type)}
                  disabled={!selectedRecordId}
                  style={{
                    flex: 1,
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '10px',
                    border: '1px solid #e6e8eb',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedRecordId) {
                      e.currentTarget.style.borderColor = item.color;
                      e.currentTarget.style.color = item.color;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e6e8eb';
                    e.currentTarget.style.color = 'inherit';
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <Button 
              onClick={() => setIsAddModalOpen(false)}
              style={{ borderRadius: '8px', padding: '0 24px' }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <PageHeader
        title="Follow-ups"
        count={filteredData.length}
        subtitle="Manage all lead follow-ups, calls and meetings"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: "Follow-ups" },
        ]}
        searchText={searchText}
        onSearch={setSearchText}
        searchPlaceholder="Search follow-ups..."
        onAdd={handleAddFollowup}
        addText="Add Follow-up"
        isSearchVisible={isSearchVisible}
        onSearchVisibleChange={setIsSearchVisible}
        extraActions={null}
      />

      <Card className="standard-content-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="followup-tabs"
          style={{ marginBottom: '16px' }}
          tabBarExtraContent={
            <Space size="middle">
              <Select
                allowClear
                placeholder="Interaction Type"
                value={advancedFilters.type}
                onChange={(val) => setAdvancedFilters(prev => ({ ...prev, type: val }))}
                style={{ width: '160px' }}
              >
                <Option value="call">Call</Option>
                <Option value="meeting">Meeting</Option>
                <Option value="task">Task</Option>
              </Select>
              <Segmented
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { label: 'List', value: 'list', icon: <FiList /> },
                  { label: 'Kanban', value: 'kanban', icon: <FiColumns /> }
                ]}
                style={{ borderRadius: '8px' }}
              />
              <Button
                icon={<FiFilter />}
                onClick={() => setIsFilterDrawerOpen(true)}
                style={{ borderRadius: '8px', height: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
                type={Object.keys(advancedFilters).some(k => advancedFilters[k]) ? "primary" : "default"}
              >
                Filter {Object.keys(advancedFilters).filter(k => advancedFilters[k]).length > 0 && `(${Object.keys(advancedFilters).filter(k => advancedFilters[k]).length})`}
              </Button>
            </Space>
          }
          items={[
            {
              key: 'all',
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>All</span>
                  <Badge count={followups.length} style={{ backgroundColor: '#d9d9d9' }} />
                </div>
              ),
            },
            {
              key: 'today',
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Today</span>
                  <Badge count={followups.filter(i => moment(i.date).isSame(moment(), 'day')).length} style={{ backgroundColor: '#1890ff' }} />
                </div>
              ),
            },
            {
              key: 'upcoming',
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Upcoming</span>
                  <Badge count={followups.filter(i => moment(i.date).isAfter(moment(), 'day')).length} style={{ backgroundColor: '#52c41a' }} />
                </div>
              ),
            },
            {
              key: 'overdue',
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Overdue</span>
                  <Badge count={followups.filter(i => moment(i.date).isBefore(moment(), 'day') && i.status !== 'completed').length} style={{ backgroundColor: '#ff4d4f' }} />
                </div>
              ),
            },
          ]}
        />
        {viewMode === 'list' ? (
          <Table
            loading={isLoading}
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            size="small"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} items`,
            }}
          />
        ) : (
          <KanbanBoard
            data={filteredData}
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </Card>
      <Drawer
        title="Advanced Filters"
        placement="right"
        onClose={() => setIsFilterDrawerOpen(false)}
        open={isFilterDrawerOpen}
        extra={
          <Button onClick={() => { setDateRange(null); setAdvancedFilters({}); }}>Clear All</Button>
        }
      >
        <Form layout="vertical">
          <Form.Item label="Date Range">
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              style={{ width: '100%' }}
              format="DD MMM YYYY"
            />
          </Form.Item>
          <Form.Item label="Interaction Type">
            <Select
              allowClear
              placeholder="Select Type"
              value={advancedFilters.type}
              onChange={(val) => setAdvancedFilters(prev => ({ ...prev, type: val }))}
            >
              <Option value="call">Call</Option>
              <Option value="meeting">Meeting</Option>
              <Option value="task">Task</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Status">
            <Select
              allowClear
              placeholder="Select Status"
              value={advancedFilters.status}
              onChange={(val) => setAdvancedFilters(prev => ({ ...prev, status: val }))}
            >
              <Option value="pending">Pending</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Priority">
            <Select
              allowClear
              placeholder="Select Priority"
              value={advancedFilters.priority}
              onChange={(val) => setAdvancedFilters(prev => ({ ...prev, priority: val }))}
            >
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="highest">Highest</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Assignee">
            <Select
              allowClear
              placeholder="Select Assignee"
              value={advancedFilters.assignee}
              onChange={(val) => setAdvancedFilters(prev => ({ ...prev, assignee: val }))}
            >
              {users?.map(u => <Option key={u.id} value={u.id}>{`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

const KanbanCard = ({ item, users, onEdit, onDelete, onStatusChange }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ id: item.id, type: item.type }));
  };

  let assignedIds = [];
  try {
    if (item.rawData?.assigned_to) {
      const parsed = typeof item.rawData.assigned_to === 'string' 
        ? JSON.parse(item.rawData.assigned_to) 
        : item.rawData.assigned_to;
      assignedIds = parsed?.assigned_to || [];
    }
  } catch (e) {
    console.error("Error parsing assigned_to", e);
  }

  // Type-specific icon & color
  let typeColor = "blue";
  let typeIcon = <FiPhoneCall style={{ marginRight: '4px' }} />;
  if (item.type === 'meeting') { typeColor = "purple"; typeIcon = <FiUsers style={{ marginRight: '4px' }} />; }
  if (item.type === 'task') { typeColor = "orange"; typeIcon = <FiCheckSquare style={{ marginRight: '4px' }} />; }

  // Priority color
  const p = item.rawData?.priority?.toLowerCase() || 'medium';
  let pColor = "default";
  if (p === 'highest') pColor = "volcano";
  else if (p === 'high') pColor = "orange";
  else if (p === 'medium') pColor = "blue";
  else if (p === 'low') pColor = "green";

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={handleDragStart}
    >
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Tag color={item.relatedType === 'Lead' ? 'cyan' : 'magenta'} style={{ fontSize: '9px', margin: 0, padding: '0 4px', borderRadius: '4px' }}>
            {item.relatedType?.toUpperCase()}
          </Tag>
          <Link to={`/dashboard/crm/${item.relatedType?.toLowerCase()}s/${item.relatedId}`}>
            <Text strong style={{ fontSize: '12px', color: '#1f2937' }}>{item.relatedName}</Text>
          </Link>
        </div>
        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: 'Edit', icon: <FiEdit2 />, onClick: () => onEdit(item) },
              { key: 'delete', label: 'Delete', icon: <FiTrash2 />, danger: true, onClick: () => onDelete(item) }
            ]
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" size="small" icon={<FiMoreVertical />} style={{ height: '20px', width: '20px', padding: 0 }} />
        </Dropdown>
      </div>

      {/* Title */}
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: '4px' }}>
        {item.name}
      </div>

      {/* Badges / Meta */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Tag color={typeColor} icon={typeIcon} style={{ fontSize: '10px', margin: 0, borderRadius: '4px' }}>
          {item.type?.toUpperCase()}
        </Tag>
        <Tag color={pColor} style={{ fontSize: '9px', margin: 0, borderRadius: '4px' }}>
          {p.toUpperCase()}
        </Tag>
      </div>

      {/* Date & Time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
        <FiClock size={12} />
        <span>{moment(item.date).format('DD MMM YYYY')} {item.time ? `at ${item.time}` : ''}</span>
      </div>

      {/* Footer (Assignees & Actions) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
        {/* Assignees */}
        <div>
          {assignedIds.length === 0 ? (
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Unassigned</span>
          ) : (
            <Avatar.Group maxCount={3} size="small" maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf', fontSize: '10px' }}>
              {assignedIds.map(id => {
                const u = users.find(user => String(user.id) === String(id));
                const name = u?.username || "Unknown";
                const initials = name.charAt(0).toUpperCase();
                return (
                  <Tooltip title={name} key={id}>
                    <Avatar src={u?.profilePic} style={{ backgroundColor: u?.profilePic ? 'transparent' : '#1890ff' }}>
                      {!u?.profilePic && initials}
                    </Avatar>
                  </Tooltip>
                );
              })}
            </Avatar.Group>
          )}
        </div>

        {/* Quick Transition Select */}
        <Select
          size="small"
          value={item.status === 'in_progress' ? 'in_progress' : item.status === 'completed' ? 'completed' : 'pending'}
          onChange={(val) => onStatusChange(item.id, item.type, val)}
          style={{ width: '100px', fontSize: '11px' }}
          bordered={false}
          dropdownStyle={{ fontSize: '11px' }}
        >
          <Option value="pending" style={{ fontSize: '11px' }}>Pending</Option>
          <Option value="in_progress" style={{ fontSize: '11px' }}>In Progress</Option>
          <Option value="completed" style={{ fontSize: '11px' }}>Completed</Option>
        </Select>
      </div>
    </div>
  );
};

const KanbanBoard = ({ data, users, onEdit, onDelete, onStatusChange }) => {
  const columns = [
    {
      id: 'pending',
      title: 'Pending / Scheduled',
      color: '#1890ff',
      bgColor: '#e6f7ff',
      borderColor: '#91d5ff',
      items: data.filter(i => i.status !== 'in_progress' && i.status !== 'completed')
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      color: '#fa8c16',
      bgColor: '#fff7e6',
      borderColor: '#ffd591',
      items: data.filter(i => i.status === 'in_progress')
    },
    {
      id: 'completed',
      title: 'Completed',
      color: '#52c41a',
      bgColor: '#f6ffed',
      borderColor: '#b7eb8f',
      items: data.filter(i => i.status === 'completed')
    }
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("text/plain");
    if (!raw) return;
    try {
      const { id, type } = JSON.parse(raw);
      onStatusChange(id, type, columnId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', minHeight: '500px' }}>
      {/* Styles Injection */}
      <style>{`
        .kanban-column {
          flex: 1;
          min-width: 300px;
          max-width: 400px;
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s ease;
        }
        .kanban-column.drag-over {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        .kanban-card {
          background: white;
          border-radius: 10px;
          padding: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
          cursor: grab;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .kanban-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border-color: #cbd5e1;
        }
        .kanban-card:active {
          cursor: grabbing;
        }
      `}</style>

      {columns.map(col => {
        const [isOver, setIsOver] = React.useState(false);

        return (
          <div
            key={col.id}
            className={`kanban-column ${isOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={() => setIsOver(true)}
            onDragLeave={() => setIsOver(false)}
            onDrop={(e) => {
              setIsOver(false);
              handleDrop(e, col.id);
            }}
          >
            {/* Column Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: col.color
                }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{col.title}</h3>
              </div>
              <Badge
                count={col.items.length}
                style={{
                  backgroundColor: col.bgColor,
                  color: col.color,
                  border: `1px solid ${col.borderColor}`,
                  boxShadow: 'none',
                  fontWeight: '600'
                }}
              />
            </div>

            {/* Column Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', maxHeight: '600px', padding: '2px' }}>
              {col.items.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', height: '100px', border: '2px dashed #e2e8f0', borderRadius: '10px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Drag items here</Text>
                </div>
              ) : (
                col.items.map(item => (
                  <KanbanCard
                    key={item.id}
                    item={item}
                    users={users}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Followups;
