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
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { 
  useGetGlobalFollowupsQuery, 
  useDeleteFollowupMutation,
  useDeleteFollowupCallMutation,
  useDeleteFollowupMeetingMutation,
  useDeleteFollowupTaskMutation
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
      title: "Type",
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
      render: (status) => (
        <Tag color={status === 'completed' ? 'success' : 'processing'}>
          {status?.replace(/_/g, ' ').toUpperCase()}
        </Tag>
      )
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
    
    return matchesSearch && matchesDateRange && matchesTab;
  }).sort((a, b) => {
    // Sort by date: upcoming first, then today, then past
    return moment(a.date).valueOf() - moment(b.date).valueOf();
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
        extraActions={
          <DatePicker.RangePicker 
            onChange={(dates) => setDateRange(dates)}
            style={{ borderRadius: '8px', height: '30px' }}
            format="DD MMM YYYY"
          />
        }
      />

      <Card className="standard-content-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="followup-tabs"
          style={{ marginBottom: '16px' }}
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
      </Card>
    </div>
  );
};

export default Followups;
