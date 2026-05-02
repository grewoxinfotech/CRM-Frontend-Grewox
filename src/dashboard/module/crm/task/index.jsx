import React, { useState } from "react";
import {
  Card,
  message,
  Modal,
  DatePicker,
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

  const user = useSelector(selectCurrentUser);
  const id = user?.id;
  const [deleteTask] = useDeleteTaskMutation();

  const { data: tasksResponse = { data: [], pagination: {} }, isLoading: tasksLoading, refetch } = useGetAllTasksQuery({
    id, page: pagination.page, pageSize: pagination.pageSize, search: searchText,
    ...(filters.status && { status: filters.status }),
    ...(filters.priority && { priority: filters.priority }),
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
        addText="Add Task"
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
          />
        }
      />

      <Card className="standard-content-card">
        <TaskList
          loading={tasksLoading}
          tasks={tasksResponse.data || []}
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
          pagination={tasksResponse.pagination}
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
