import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Row, Col, Card, Avatar, Typography, Tag, Space, Tabs, Statistic, Button, Breadcrumb, Table, Tooltip } from "antd";
import { FiUser, FiTarget, FiCheckSquare, FiMail, FiPhone, FiArrowLeft, FiGrid, FiAward, FiCalendar, FiHome, FiMapPin, FiBriefcase, FiEdit2, FiFileText } from "react-icons/fi";
import { useGetEmployeesQuery, useUpdateEmployeeMutation } from "../services/employeeApi.js";
import { useGetLeadsQuery } from "../../../crm/lead/services/LeadApi.js";
import { useGetAllTasksQuery } from "../../../crm/task/services/taskApi.js";
import PageHeader from "../../../../../components/PageHeader";
import EditEmployee from "../EditEmployee";
import moment from "moment";
import "./EmployeeOverview.scss";

const { Title, Text } = Typography;

const EmployeeOverview = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("leads");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const { data: employeesData } = useGetEmployeesQuery();
  const employee = employeesData?.data?.find(emp => emp.id === employeeId);

  const { data: leadsData, isLoading: leadsLoading } = useGetLeadsQuery({
    page: 1,
    pageSize: -1,
    memberId: employeeId
  }, { skip: !employeeId });

  const { data: tasksData, isLoading: tasksLoading } = useGetAllTasksQuery({
    id: employee?.client_id,
    pageSize: -1,
    memberId: employeeId
  }, { skip: !employee?.client_id || !employeeId });

  const assignedLeads = leadsData?.data || [];
  const assignedTasks = tasksData?.data || [];

  const leadColumns = [
    {
      title: "Lead Title",
      dataIndex: "leadTitle",
      key: "leadTitle",
      render: (text) => <Text strong style={{ color: '#1e293b' }}>{text}</Text>,
    },
    {
      title: "Value",
      dataIndex: "leadValue",
      key: "leadValue",
      render: (val, record) => {
        const currency = (record.currency && record.currency.length < 15) ? record.currency : 'INR';
        return (
          <Text style={{ color: '#059669', fontWeight: '600' }}>
            {currency} {val?.toLocaleString() || 0}
          </Text>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Tag color="blue" style={{ borderRadius: '6px', border: 'none', padding: '2px 10px' }}>
          {record.LeadStatus?.name?.toUpperCase() || (status && status.length < 20 ? status.toUpperCase() : 'NEW LEAD')}
        </Tag>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (source, record) => (
        <Tag color="cyan" style={{ borderRadius: '6px', border: 'none', padding: '2px 10px' }}>
          {record.LeadSource?.name?.toUpperCase() || (source && source.length < 20 ? source.toUpperCase() : 'MANUAL')}
        </Tag>
      ),
    },
    {
        title: "Interest",
        dataIndex: "interest_level",
        key: "interest",
        render: (level) => {
          const colors = { high: 'error', medium: 'warning', low: 'success' };
          return <Tag color={colors[level] || 'default'} style={{ borderRadius: '6px', border: 'none' }}>{level?.toUpperCase()}</Tag>;
        }
    },
    {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date) => moment(date).format("DD MMM YYYY")
    }
  ];

  const taskColumns = [
    {
      title: "Task Name",
      dataIndex: "taskName",
      key: "taskName",
      render: (text) => <Text strong style={{ color: '#1e293b' }}>{text}</Text>,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => {
        const colors = { high: '#ef4444', medium: '#3b82f6', low: '#10b981' };
        return <Tag color={colors[priority]} style={{ color: 'white', border: 'none', borderRadius: '6px' }}>{priority?.toUpperCase()}</Tag>;
      }
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => (
        <Space>
            <FiCalendar style={{ color: '#64748b' }} />
            <Text>{date ? moment(date).format("DD MMM YYYY") : "N/A"}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === 'completed' ? 'success' : 'processing'} style={{ borderRadius: '6px', border: 'none' }}>
          {status?.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date) => moment(date).format("DD MMM YYYY")
    }
  ];

  return (
    <div className="project-page">
      <PageHeader
        title={employee?.name || "Employee Details"}
        subtitle={`Viewing details for ${employee?.designation_name || 'Employee'}`}
        breadcrumbItems={[
          {
            title: (
              <Link to="/dashboard">
                <FiHome style={{ marginRight: "4px" }} />
                Home
              </Link>
            ),
          },
          {
            title: <Link to="/dashboard/hrm/employee">Employees</Link>,
          },
          { title: "Overview" },
        ]}
        extraActions={
            <Button 
              type="primary" 
              icon={<FiEdit2 />} 
              className="edit-btn"
              onClick={() => setIsEditModalVisible(true)}
            >
              Edit Profile
            </Button>
        }
      />

      <div className="page-contentt">
        <div className="content-main">
            <Card className="tabs-content-card">
              <Tabs 
                defaultActiveKey="overview"
                className="project-tabs"
                type="card"
                size="large"
                animated={{ inkBar: true, tabPane: true }}
                items={[
                  {
                    key: "overview",
                    label: (
                      <span className="tab-label">
                        <FiFileText /> Overview
                      </span>
                    ),
                    children: (
                      <div className="overview-content">
                        <Card className="info-card profile-info-card" style={{ marginBottom: '24px', boxShadow: 'none', border: '1px solid #f1f5f9' }}>
                          <div className="profile-header-section">
                            <div className="profile-main-info">
                              <div className="avatar-wrapper">
                                <Avatar size={80} icon={<FiUser />} className="employee-avatar" />
                              </div>
                              <div className="text-info">
                                <div className="title-row">
                                    <h2 className="employee-name">{employee?.name}</h2>
                                    <Tag color="blue" className="role-tag">{employee?.designation_name}</Tag>
                                </div>
                                <div className="meta-details">
                                    <Space split={<span className="separator">•</span>}>
                                        <span className="detail-item"><FiBriefcase /> {employee?.department}</span>
                                        <span className="detail-item"><FiGrid /> ID: {employee?.employeeId || 'N/A'}</span>
                                    </Space>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="profile-stats-grid">
                            <div className="stat-box">
                              <div className="icon-circle email"><FiMail /></div>
                              <div className="stat-data">
                                <span className="label">Email Address</span>
                                <a href={`mailto:${employee?.email}`} className="value">{employee?.email || '-'}</a>
                              </div>
                            </div>
                            <div className="stat-box">
                              <div className="icon-circle phone"><FiPhone /></div>
                              <div className="stat-data">
                                <span className="label">Phone Number</span>
                                <a href={`tel:${employee?.phone}`} className="value">{employee?.phone || '-'}</a>
                              </div>
                            </div>
                            <div className="stat-box">
                              <div className="icon-circle location"><FiMapPin /></div>
                              <div className="stat-data">
                                <span className="label">Department</span>
                                <span className="value">{employee?.department || '-'}</span>
                              </div>
                            </div>
                          </div>
                        </Card>

                        <Row gutter={[24, 24]}>
                            <Col xs={24} lg={16}>
                                <Card title={`Assigned Leads (${assignedLeads.length})`} className="inner-table-card">
                                    <Table
                                        columns={leadColumns}
                                        dataSource={assignedLeads}
                                        loading={leadsLoading}
                                        rowKey="id"
                                        pagination={{ pageSize: 5 }}
                                        className="premium-table pointer-rows"
                                        onRow={(record) => ({
                                            onClick: () => navigate(`/dashboard/crm/leads/${record.id}`),
                                        })}
                                    />
                                </Card>
                                <Card title={`Assigned Tasks (${assignedTasks.length})`} className="inner-table-card" style={{ marginTop: '24px' }}>
                                    <Table
                                        columns={taskColumns}
                                        dataSource={assignedTasks}
                                        loading={tasksLoading}
                                        rowKey="id"
                                        pagination={{ pageSize: 5 }}
                                        className="premium-table pointer-rows"
                                        onRow={(record) => ({
                                            onClick: () => navigate(`/dashboard/crm/tasks`),
                                        })}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} lg={8}>
                                <Space direction="vertical" style={{ width: '100%' }} size="large">
                                    <Card title="Quick Metrics" className="side-metric-card">
                                        <div className="metric-item">
                                            <div className="icon-circle leads">
                                                <FiTarget />
                                            </div>
                                            <div className="metric-info">
                                                <span className="metric-label">Active Leads</span>
                                                <span className="metric-value">{assignedLeads.filter(l => l.status !== 'closed').length}</span>
                                            </div>
                                        </div>
                                        <div className="divider" />
                                        <div className="metric-item">
                                            <div className="icon-circle tasks">
                                                <FiCheckSquare />
                                            </div>
                                            <div className="metric-info">
                                                <span className="metric-label">Pending Tasks</span>
                                                <span className="metric-value">{assignedTasks.filter(t => t.status !== 'completed').length}</span>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card title="Account Info" className="side-metric-card">
                                        <div className="info-list">
                                            <div className="info-row">
                                                <span className="label">Status</span>
                                                <Tag color={employee?.status === 'active' ? 'success' : 'error'}>
                                                    {employee?.status?.toUpperCase()}
                                                </Tag>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Username</span>
                                                <span className="value">{employee?.username}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Joining Date</span>
                                                <span className="value">{employee?.joiningDate ? moment(employee.joiningDate).format("DD MMM YYYY") : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Space>
                            </Col>
                        </Row>
                      </div>
                    ),
                  },
                  {
                    key: "leads",
                    label: (
                      <span className="tab-label">
                        <FiTarget /> All Leads
                        <Tag className="count-tag">{assignedLeads.length}</Tag>
                      </span>
                    ),
                    children: (
                      <Table
                        columns={leadColumns}
                        dataSource={assignedLeads}
                        loading={leadsLoading}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        className="premium-table pointer-rows"
                        onRow={(record) => ({
                            onClick: () => navigate(`/dashboard/crm/leads/${record.id}`),
                        })}
                      />
                    ),
                  },
                  {
                    key: "tasks",
                    label: (
                      <span className="tab-label">
                        <FiCheckSquare /> All Tasks
                        <Tag className="count-tag">{assignedTasks.length}</Tag>
                      </span>
                    ),
                    children: (
                      <Table
                        columns={taskColumns}
                        dataSource={assignedTasks}
                        loading={tasksLoading}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        className="premium-table pointer-rows"
                        onRow={(record) => ({
                            onClick: () => navigate(`/dashboard/crm/tasks`),
                        })}
                      />
                    ),
                  },
                ]}
              />
            </Card>
        </div>
      </div>

      <EditEmployee
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        initialValues={employee}
        onSuccess={() => {
          setIsEditModalVisible(false);
          // refetch is handled by the query's tags if configured, 
          // or we can manually refetch if needed.
        }}
      />
    </div>
  );
};

export default EmployeeOverview;
