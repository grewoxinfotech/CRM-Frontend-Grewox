import React from "react";
import { Modal, Tabs, Table, Tag, Space, Typography, Card, Row, Col, Statistic } from "antd";
import { FiTarget, FiCheckSquare, FiUser, FiClock, FiAlertCircle } from "react-icons/fi";
import { useGetLeadsQuery } from "../../crm/lead/services/LeadApi";
import { useGetAllTasksQuery } from "../../crm/task/services/taskApi";
import moment from "moment";

const { Text, Title } = Typography;

const EmployeeOverviewModal = ({ visible, onCancel, employee }) => {
  const { data: leadsData, isLoading: leadsLoading } = useGetLeadsQuery({
    page: 1,
    pageSize: -1,
  });

  const { data: tasksData, isLoading: tasksLoading } = useGetAllTasksQuery(employee?.client_id);

  // Filter leads where this employee is a member
  const assignedLeads = leadsData?.data?.filter(lead => {
    const members = lead.lead_members?.lead_members || [];
    return members.includes(employee?.id);
  }) || [];

  // Filter tasks where this employee is assigned
  const assignedTasks = tasksData?.data?.filter(task => {
    const assignedUsers = task.assignTo?.assignedusers || [];
    return assignedUsers.includes(employee?.id);
  }) || [];

  const leadColumns = [
    {
      title: "Lead Title",
      dataIndex: "leadTitle",
      key: "leadTitle",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Value",
      dataIndex: "leadValue",
      key: "leadValue",
      render: (val, record) => `${record.currency || 'INR'} ${val || 0}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color="blue" style={{ borderRadius: '4px' }}>{status || 'active'}</Tag>
      ),
    },
    {
      title: "Interest",
      dataIndex: "interest_level",
      key: "interest",
      render: (level) => {
        const colors = { high: 'red', medium: 'orange', low: 'green' };
        return <Tag color={colors[level] || 'blue'}>{level?.toUpperCase()}</Tag>;
      }
    }
  ];

  const taskColumns = [
    {
      title: "Task Name",
      dataIndex: "taskName",
      key: "taskName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => {
        const colors = { high: 'red', medium: 'blue', low: 'green' };
        return <Tag color={colors[priority]}>{priority?.toUpperCase()}</Tag>;
      }
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => date ? moment(date).format("DD MMM YYYY") : "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === 'completed' ? 'success' : 'processing'}>
          {status?.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    }
  ];

  const items = [
    {
      key: "leads",
      label: (
        <span>
          <FiTarget style={{ marginRight: 8 }} />
          Assigned Leads ({assignedLeads.length})
        </span>
      ),
      children: (
        <Table
          columns={leadColumns}
          dataSource={assignedLeads}
          loading={leadsLoading}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5 }}
        />
      ),
    },
    {
      key: "tasks",
      label: (
        <span>
          <FiCheckSquare style={{ marginRight: 8 }} />
          Assigned Tasks ({assignedTasks.length})
        </span>
      ),
      children: (
        <Table
          columns={taskColumns}
          dataSource={assignedTasks}
          loading={tasksLoading}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5 }}
        />
      ),
    },
  ];

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
        padding: '24px',
        color: 'white',
        borderRadius: '8px 8px 0 0'
      }}>
        <Space size="large" align="center">
          <div style={{
            width: 60,
            height: 60,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30
          }}>
            <FiUser />
          </div>
          <div>
            <Title level={4} style={{ color: 'white', margin: 0 }}>{employee?.name}</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
              {employee?.designation_name} | {employee?.department}
            </Text>
          </div>
        </Space>
      </div>

      <div style={{ padding: '24px' }}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card bordered={false} className="stats-mini-card" style={{ background: '#f0f7ff' }}>
              <Statistic
                title="Assigned Leads"
                value={assignedLeads.length}
                prefix={<FiTarget style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card bordered={false} className="stats-mini-card" style={{ background: '#f6ffed' }}>
              <Statistic
                title="Assigned Tasks"
                value={assignedTasks.length}
                prefix={<FiCheckSquare style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="leads" items={items} />
      </div>
    </Modal>
  );
};

export default EmployeeOverviewModal;
