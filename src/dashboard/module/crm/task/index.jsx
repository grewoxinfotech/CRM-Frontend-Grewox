import React, { useState } from "react";
import {
  Card,
  message,
  Modal,
  DatePicker,
  Tabs,
  Badge,
} from "antd";
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
import PageHeader from "../../../../components/PageHeader";

const Task = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({ dateRange: [], status: undefined, priority: undefined });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const user = useSelector(selectCurrentUser);
  const id = user?.id;
  const [deleteTask] = useDeleteTaskMutation();

  const { data: tasksResponse = { data: [], pagination: {} }, isLoading: tasksLoading, refetch } = useGetAllTasksQuery({
    id, 
    page: 1, // Fetch first page for now, or use a larger pageSize if needed
    pageSize: 1000, // Fetch more for frontend filtering to make tabs work globally
    search: searchText,
    ...(filters.status && { status: filters.status }),
    ...(filters.priority && { priority: filters.priority }),
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

    return matchesTab && matchesDateRange;
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
        onAdd={() => { setSelectedTask(null); setIsCreateModalOpen(true); }}
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
        extraActions={
          <DatePicker.RangePicker 
            onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates || [] }))}
            style={{ borderRadius: '8px', height: '30px' }}
            format="DD MMM YYYY"
          />
        }
      />

      <Card className="standard-content-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: '16px' }}
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
    </div>
  );
};

export default Task;
