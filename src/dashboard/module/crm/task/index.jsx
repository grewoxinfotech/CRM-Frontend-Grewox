import React, { useState } from "react";
import {
  Card,
  message,
  Modal,
  DatePicker,
  Tabs,
  Badge,
  Drawer,
  Form,
  Select,
  Button,
} from "antd";
import { FiFilter } from "react-icons/fi";

const { Option } = Select;
import {
  FiPlus,
  FiDownload,
  FiHome,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import TaskList from "./TaskList";
import CreateTask from "./CreateTask";
import EditTask from "./EditTask";
import "./task.scss";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import { useGetAllTasksQuery, useDeleteTaskMutation } from "./services/taskApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetUsersQuery } from "../../../module/user-management/users/services/userApi";
import { useGetRolesQuery } from "../../hrm/role/services/roleApi";
import PageHeader from "../../../../components/PageHeader";

const Task = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({ dateRange: [], status: undefined, priority: undefined, assignee: undefined });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const user = useSelector(selectCurrentUser);
  const id = user?.id;

  const { data: rolesData } = useGetRolesQuery(undefined, {
    skip: !user || user.roleName === 'super-admin' || user.roleName === 'client'
  });

  const userRoleData = rolesData?.message?.data?.find(role => role.id === user?.role_id);
  const userPermissions = React.useMemo(() => {
    if (!userRoleData?.permissions) return null;
    try {
      return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
    } catch (e) {
      return null;
    }
  }, [userRoleData]);

  const hasPermission = React.useCallback((action) => {
    if (!user) return false;
    if (user.roleName === 'super-admin' || user.roleName === 'client') return true;
    if (!userPermissions) return false;
    const taskPerms = userPermissions['dashboards-task'];
    if (!taskPerms || taskPerms.length === 0) return false;
    const allowed = taskPerms[0]?.permissions || [];
    return allowed.includes(action);
  }, [user, userPermissions]);

  const [deleteTask] = useDeleteTaskMutation();

  const { data: tasksResponse = { data: [], pagination: {} }, isLoading: tasksLoading, refetch } = useGetAllTasksQuery({
    id, 
    page: 1, 
    pageSize: 1000, 
    search: searchText,
  });

  const allTasks = tasksResponse.data || [];

  const filteredTasks = allTasks.filter(task => {
    const dueDate = moment(task.dueDate).startOf('day');
    const today = moment().startOf('day');

    let matchesTab = true;
    if (activeTab === 'today') {
      matchesTab = dueDate.isSame(today, 'day');
    } else if (activeTab === 'upcoming') {
      matchesTab = dueDate.isAfter(today, 'day');
    } else if (activeTab === 'overdue') {
      matchesTab = dueDate.isBefore(today, 'day') && task.status !== 'completed';
    }

    let matchesDateRange = true;
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const start = moment(filters.dateRange[0].valueOf ? filters.dateRange[0].valueOf() : filters.dateRange[0]).startOf('day');
      const end = moment(filters.dateRange[1].valueOf ? filters.dateRange[1].valueOf() : filters.dateRange[1]).endOf('day');
      matchesDateRange = dueDate.isBetween(start, end, 'day', '[]');
    }

    if (!matchesTab || !matchesDateRange) return false;

    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    
    if (filters.assignee) {
        let assignedIds = [];
        try {
            let parsed = task.assigned_to;
            if (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed);
                    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                } catch(e) { parsed = []; }
            }
            assignedIds = parsed?.assignedusers || parsed?.assigned_to || (Array.isArray(parsed) ? parsed : []);
        } catch(e) { assignedIds = []; }
        if (!assignedIds.includes(filters.assignee)) return false;
    }

    return true;
  });

  const { data: usersData = [] } = useGetUsersQuery();
  const users = usersData?.data || [];

  const handleExport = async (type) => {
    message.info(`Exporting as ${type.toUpperCase()}...`);
  };

  return (
    <div className="task-page standard-page-container">
      <PageHeader
        title="Tasks"
        count={tasksResponse?.pagination?.total || 0}
        subtitle="Manage all tasks in the organization"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: "Tasks" },
        ]}
        searchText={searchText}
        onSearch={setSearchText}
        searchPlaceholder="Search tasks..."
        onAdd={hasPermission('create') ? () => { setSelectedTask(null); setIsCreateModalOpen(true); } : undefined}
        addText="Create Task"
        isSearchVisible={isSearchVisible}
        onSearchVisibleChange={setIsSearchVisible}
        exportMenu={{
          items: [
            { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
            { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
            { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
          ]
        }}
        extraActions={null}
      />

      <Card className="standard-content-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: '16px' }}
          tabBarExtraContent={
            <Button
              icon={<FiFilter />}
              onClick={() => setIsFilterDrawerOpen(true)}
              style={{ borderRadius: '8px', height: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
              type={Object.keys(filters).some(k => filters[k] && (!Array.isArray(filters[k]) || filters[k].length > 0)) ? "primary" : "default"}
            >
              Filter {Object.keys(filters).filter(k => filters[k] && (!Array.isArray(filters[k]) || filters[k].length > 0)).length > 0 && `(${Object.keys(filters).filter(k => filters[k] && (!Array.isArray(filters[k]) || filters[k].length > 0)).length})`}
            </Button>
          }
          items={[
            {
              key: 'all',
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>All</span>
                  <Badge count={allTasks.length} style={{ backgroundColor: '#d9d9d9' }} />
                </div>
              ),
            },
            {
              key: 'today',
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Today</span>
                  <Badge count={allTasks.filter(t => moment(t.dueDate).isSame(moment(), 'day')).length} style={{ backgroundColor: '#1890ff' }} />
                </div>
              ),
            },
            {
              key: 'upcoming',
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Upcoming</span>
                  <Badge count={allTasks.filter(t => moment(t.dueDate).isAfter(moment(), 'day')).length} style={{ backgroundColor: '#52c41a' }} />
                </div>
              ),
            },
            {
              key: 'overdue',
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Overdue</span>
                  <Badge count={allTasks.filter(t => moment(t.dueDate).isBefore(moment(), 'day') && t.status !== 'completed').length} style={{ backgroundColor: '#ff4d4f' }} />
                </div>
              ),
            },
          ]}
        />
        <TaskList
          loading={tasksLoading}
          tasks={filteredTasks}
          onEdit={(record) => { setSelectedTask(record); setIsEditModalOpen(true); }}
          onDelete={(id) => {
            Modal.confirm({
                title: 'Delete Task',
                content: 'Are you sure?',
                onOk: async () => {
                    await deleteTask(id).unwrap();
                    message.success('Deleted successfully');
                }
            });
          }}
          onView={(record) => console.log("View task:", record)}
          searchText={searchText}
          filters={filters}
          users={users}
          pagination={{ ...tasksResponse.pagination, total: filteredTasks.length }}
          onPaginationChange={(page, pageSize) => setPagination({ page, pageSize })}
          hasPermission={hasPermission}
        />
      </Card>

      <CreateTask
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSubmit={() => { setIsCreateModalOpen(false); refetch(); }}
        relatedId={id}
        users={users}
      />

      <EditTask
        open={isEditModalOpen}
        onCancel={() => { setIsEditModalOpen(false); setSelectedTask(null); }}
        onSubmit={() => { setIsEditModalOpen(false); refetch(); }}
        initialValues={selectedTask}
        relatedId={id}
        users={users}
      />

      <Drawer
        title="Advanced Filters"
        placement="right"
        onClose={() => setIsFilterDrawerOpen(false)}
        open={isFilterDrawerOpen}
        extra={
          <Button onClick={() => setFilters({ dateRange: [], status: undefined, priority: undefined, assignee: undefined })}>Clear All</Button>
        }
      >
        <Form layout="vertical">
          <Form.Item label="Date Range">
            <DatePicker.RangePicker
              value={filters.dateRange?.length ? filters.dateRange : null}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates || [] }))}
              style={{ width: '100%' }}
              format="DD MMM YYYY"
            />
          </Form.Item>
          <Form.Item label="Status">
            <Select
              allowClear
              placeholder="Select Status"
              value={filters.status}
              onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
            >
              <Option value="not_started">Not Started</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="testing">Testing</Option>
              <Option value="awaiting_feedback">Awaiting Feedback</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Priority">
            <Select
              allowClear
              placeholder="Select Priority"
              value={filters.priority}
              onChange={(val) => setFilters(prev => ({ ...prev, priority: val }))}
            >
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="urgent">Urgent</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Assignee">
            <Select
              allowClear
              placeholder="Select Assignee"
              value={filters.assignee}
              onChange={(val) => setFilters(prev => ({ ...prev, assignee: val }))}
            >
              {users?.map(u => <Option key={u.id} value={u.id}>{`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Task;
