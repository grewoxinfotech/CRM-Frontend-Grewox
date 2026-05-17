import React, { useState, useEffect } from "react";
import { Card, Typography, Switch, Form, Input, DatePicker, Button, message, Space, Tag, Table } from "antd";
import { useGetMaintenanceQuery, useGetMaintenanceHistoryQuery, useSaveMaintenanceMutation } from "../services/maintenanceApi";
import { FiSettings, FiClock, FiCheckCircle, FiActivity } from "react-icons/fi";
import dayjs from "dayjs";
import PageHeader from "../../../../components/PageHeader";
import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const MaintenanceSettings = () => {
  const [form] = Form.useForm();
  const { data: maintenanceData, refetch } = useGetMaintenanceQuery();
  const { data: historyData, refetch: refetchHistory } = useGetMaintenanceHistoryQuery();
  const [saveMaintenance, { isLoading }] = useSaveMaintenanceMutation();
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    if (maintenanceData?.data) {
      const { isOn, title, message: msg, startDate, endDate } = maintenanceData.data;
      setIsOn(isOn);
      form.setFieldsValue({
        title,
        message: msg,
        dateRange: startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : undefined,
      });
    }
  }, [maintenanceData, form]);

  const handleSave = async (values) => {
    try {
      const payload = {
        isOn,
        title: values.title,
        message: values.message,
        startDate: values.dateRange ? values.dateRange[0].toISOString() : null,
        endDate: values.dateRange ? values.dateRange[1].toISOString() : null,
        status: isOn ? "active" : (values.dateRange ? "scheduled" : "inactive")
      };

      await saveMaintenance(payload).unwrap();
      message.success("Maintenance settings saved successfully");
      refetch();
      refetchHistory();
    } catch (error) {
      console.error(error);
      message.error("Failed to save maintenance settings");
    }
  };

  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "error" : status === "scheduled" ? "warning" : "success"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (date ? dayjs(date).format("DD MMM YYYY, HH:mm") : "-"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => (date ? dayjs(date).format("DD MMM YYYY, HH:mm") : "-"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD MMM YYYY, HH:mm"),
    },
  ];

  return (
    <div className="standard-page-container">
      <PageHeader
        title="Maintenance Mode"
        subtitle="Manage platform maintenance schedules and messaging"
        breadcrumbItems={[
          { title: <Link to="/superadmin/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
          { title: "Settings" },
          { title: "Maintenance" },
        ]}
      />

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <Card style={{ flex: '1 1 400px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>Enable Maintenance Mode</Title>
              <Text type="secondary">Turn on to restrict access to the platform</Text>
            </div>
            <Switch
              checked={isOn}
              onChange={setIsOn}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              style={{ background: isOn ? '#ff4d4f' : undefined }}
            />
          </div>

          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item
              name="title"
              label="Maintenance Title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input placeholder="e.g., Scheduled Maintenance" />
            </Form.Item>

            <Form.Item
              name="message"
              label="Maintenance Message"
              rules={[{ required: true, message: "Please enter a message" }]}
              extra="This message will be shown to users when they try to access the platform."
            >
              <TextArea rows={4} placeholder="e.g., The platform is currently undergoing improvements..." />
            </Form.Item>

            <Form.Item
              name="dateRange"
              label="Schedule Time (Optional)"
              extra="If set, maintenance mode will automatically activate during this period."
            >
              <RangePicker showTime style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={isLoading} size="large" style={{ width: '100%' }}>
                Save Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card style={{ flex: '2 1 600px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Title level={4} style={{ marginBottom: '24px' }}><FiActivity style={{ marginRight: '8px' }} />Maintenance History</Title>
          <Table
            dataSource={historyData?.data || []}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceSettings;
