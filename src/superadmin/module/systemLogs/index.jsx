import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Select,
  DatePicker,
  Table,
  Drawer,
  Space,
  Tag,
  Modal,
  message,
  Row,
  Col,
  Breadcrumb,
  Tooltip,
  Dropdown,
} from "antd";
import {
  SearchOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClearOutlined,
  CopyOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  FiHome,
  FiDatabase,
  FiLock,
  FiGlobe,
  FiMessageSquare,
  FiCpu,
  FiDollarSign,
  FiHardDrive,
  FiServer,
  FiFileText,
  FiActivity,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiPlay,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

import {
  useGetLogsQuery,
  useGetLogStatsQuery,
  useResolveLogsMutation,
  useClearLogsMutation,
  useSimulateErrorMutation,
} from "../settings/services/systemLogApi";

import "./systemLogs.scss";
import PageHeader from "../../../components/PageHeader";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// Mapping categories to React icons and badge settings
const categoryConfigs = {
  database: { icon: <FiDatabase />, color: "blue", label: "Database" },
  auth: { icon: <FiLock />, color: "purple", label: "Auth" },
  api: { icon: <FiGlobe />, color: "cyan", label: "API" },
  whatsapp: { icon: <FiMessageSquare />, color: "green", label: "WhatsApp" },
  automation: { icon: <FiCpu />, color: "pink", label: "Automation" },
  ai: { icon: <FiCpu />, color: "cyan", label: "AI" },
  payment: { icon: <FiDollarSign />, color: "gold", label: "Payment" },
  storage: { icon: <FiHardDrive />, color: "rose", label: "Storage" },
  system: { icon: <FiServer />, color: "slate", label: "System" },
  other: { icon: <FiFileText />, color: "gray", label: "Other" },
};

const priorityConfigs = {
  critical: { color: "red", label: "Critical" },
  high: { color: "orange", label: "High" },
  medium: { color: "yellow", label: "Medium" },
  low: { color: "blue", label: "Low" },
};

const SystemLogs = () => {
  // Query Filters & Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(undefined);
  const [priority, setPriority] = useState(undefined);
  const [status, setStatus] = useState(undefined);
  const [dateRange, setDateRange] = useState(null);

  // Selection State
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [activeLog, setActiveLog] = useState(null); // Detail drawer target

  // API Hooks
  const queryParams = {
    page,
    limit: pageSize,
    search: search || undefined,
    category: category || undefined,
    priority: priority || undefined,
    status: status || undefined,
    startDate: dateRange ? dateRange[0].toISOString() : undefined,
    endDate: dateRange ? dateRange[1].toISOString() : undefined,
  };

  const { data: logsResponse, isLoading: isLogsLoading, refetch: refetchLogs } =
    useGetLogsQuery(queryParams);
  const { data: statsResponse, isLoading: isStatsLoading } =
    useGetLogStatsQuery();

  const [resolveLogs, { isLoading: isResolving }] = useResolveLogsMutation();
  const [clearLogs, { isLoading: isClearing }] = useClearLogsMutation();
  const [simulateError, { isLoading: isSimulating }] =
    useSimulateErrorMutation();

  // Handlers
  const handleResolve = async (ids) => {
    try {
      await resolveLogs({ ids }).unwrap();
      message.success(`Successfully resolved ${ids.length} error logs.`);
      setSelectedRowKeys([]);
      if (activeLog && ids.includes(activeLog.id)) {
        setActiveLog((prev) => ({ ...prev, status: "resolved" }));
      }
    } catch (error) {
      message.error(error?.data?.message || "Failed to resolve logs.");
    }
  };

  const handleClearLogs = (target) => {
    Modal.confirm({
      title: `Are you sure you want to clear ${target === "all" ? "ALL system logs" : "only RESOLVED system logs"}?`,
      content: "This action cannot be undone and will permanently delete them from the database.",
      okText: "Yes, Clear",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await clearLogs({ target }).unwrap();
          message.success(res?.message || "Logs cleared successfully.");
          setSelectedRowKeys([]);
        } catch (error) {
          message.error(error?.data?.message || "Failed to clear logs.");
        }
      },
    });
  };

  const handleSimulate = async (category, priority) => {
    try {
      const res = await simulateError({ category, priority }).unwrap();
      message.success(
        `Simulated mock [${category.toUpperCase()}] error with [${priority.toUpperCase()}] priority!`
      );
      refetchLogs();
    } catch (error) {
      message.error("Failed to run error simulation.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Stack trace copied to clipboard!");
  };

  // Simulator Dropdown Menu Items
  const simulatorItems = [
    {
      key: "critical-db",
      label: "Simulate Critical Database Timeout",
      icon: <FiDatabase style={{ color: "#ef4444" }} />,
      onClick: () => handleSimulate("database", "critical"),
    },
    {
      key: "high-auth",
      label: "Simulate High Auth Signature Failure",
      icon: <FiLock style={{ color: "#f97316" }} />,
      onClick: () => handleSimulate("auth", "high"),
    },
    {
      key: "critical-whatsapp",
      label: "Simulate Critical WhatsApp Rate Limit",
      icon: <FiMessageSquare style={{ color: "#ef4444" }} />,
      onClick: () => handleSimulate("whatsapp", "critical"),
    },
    {
      key: "high-payment",
      label: "Simulate High Razorpay Webhook Failure",
      icon: <FiDollarSign style={{ color: "#f97316" }} />,
      onClick: () => handleSimulate("payment", "high"),
    },
    {
      key: "medium-storage",
      label: "Simulate Medium S3 Storage Limit",
      icon: <FiHardDrive style={{ color: "#eab308" }} />,
      onClick: () => handleSimulate("storage", "medium"),
    },
    {
      key: "high-automation",
      label: "Simulate High Workflow Logic Crash",
      icon: <FiCpu style={{ color: "#f97316" }} />,
      onClick: () => handleSimulate("automation", "high"),
    },
    {
      key: "critical-ai",
      label: "Simulate Critical AI Assistant Timeout",
      icon: <FiCpu style={{ color: "#ef4444" }} />,
      onClick: () => handleSimulate("ai", "critical"),
    },
    {
      key: "low-system",
      label: "Simulate Low Settings Property Undefined",
      icon: <FiServer style={{ color: "#3b82f6" }} />,
      onClick: () => handleSimulate("system", "low"),
    },
  ];

  const logStats = statsResponse?.data?.kpis || { total: 0, active: 0, resolved: 0, critical: 0 };
  const priorityDistribution = statsResponse?.data?.priorityDistribution || {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  const categoryDistribution = statsResponse?.data?.categoryDistribution || {
    database: 0,
    auth: 0,
    api: 0,
    whatsapp: 0,
    automation: 0,
    ai: 0,
    payment: 0,
    storage: 0,
    system: 0,
    other: 0,
  };

  const logsList = logsResponse?.data?.logs || [];
  const logsTotal = logsResponse?.data?.total || 0;

  // Table Columns
  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status, record) => (
        <Tooltip title={status === "resolved" ? "Resolved" : "Mark as Resolved"}>
          <Button
            type="text"
            shape="circle"
            icon={
              status === "resolved" ? (
                <CheckCircleOutlined style={{ color: "#10b981", fontSize: "18px" }} />
              ) : (
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    border: "2px solid #ef4444",
                  }}
                />
              )
            }
            onClick={(e) => {
              e.stopPropagation();
              if (status !== "resolved") {
                handleResolve([record.id]);
              }
            }}
            disabled={status === "resolved" || isResolving}
          />
        </Tooltip>
      ),
    },
    {
      title: "Error Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      render: (text) => (
        <span style={{ fontWeight: 500, color: "#f1f5f9" }} title={text}>
          {text}
        </span>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 140,
      render: (cat) => {
        const config = categoryConfigs[cat] || categoryConfigs.other;
        return (
          <span className={`category-badge-premium ${cat}`}>
            {config.icon}
            {config.label}
          </span>
        );
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (prio) => {
        const config = priorityConfigs[prio] || { color: "gray", label: prio };
        return (
          <span className={`priority-badge-premium ${prio}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: "Logged Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => (
        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
          <FiClock style={{ marginRight: "6px", display: "inline" }} />
          {dayjs(date).format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          onClick={() => setActiveLog(record)}
          style={{ borderColor: "#38bdf8", color: "#38bdf8", borderRadius: "6px" }}
        >
          Inspect
        </Button>
      ),
    },
  ];

  const extraActions = (
    <Space size={12}>
      <Dropdown menu={{ items: simulatorItems }} placement="bottomRight">
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          loading={isSimulating}
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderColor: "#10b981",
            borderRadius: "8px",
            fontWeight: 600,
            height: "30px",
          }}
        >
          Mock Simulator
        </Button>
      </Dropdown>
      <Button
        icon={<SyncOutlined spin={isLogsLoading} />}
        onClick={() => {
          refetchLogs();
          message.info("Logs updated in real-time.");
        }}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          color: "#fff",
          borderRadius: "8px",
          height: "30px",
        }}
      />
    </Space>
  );

  return (
    <div className="system-logs-page" >
      <PageHeader
        title="Error Tracking & Logs"
        subtitle="Monitor database health, API gateway statistics, and trigger real-time simulated failures."
        breadcrumbItems={[
          {
            title: (
              <Link to="/superadmin">
                <FiHome style={{ marginRight: "4px" }} /> Home
              </Link>
            ),
          },
          { title: "Error Tracking & Logs" },
        ]}
        extraActions={extraActions}
      />

      {/* KPI Cards Grid */}
      <Row gutter={[20, 20]} className="system-stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-premium kpi-total">
            <div className="stat-icon-wrapper-premium total">
              <FiActivity />
            </div>
            <div className="stat-content">
              <div className="stat-title">Total Logs</div>
              <div className="stat-value">{logStats.total}</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-premium kpi-active">
            <div className="stat-icon-wrapper-premium active">
              <FiAlertTriangle />
            </div>
            <div className="stat-content">
              <div className="stat-title">Active Errors</div>
              <div className="stat-value" style={{ color: "#fb923c" }}>
                {logStats.active}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-premium kpi-critical">
            <div className="stat-icon-wrapper-premium critical">
              <FiAlertTriangle />
            </div>
            <div className="stat-content">
              <div className="stat-title">Critical (Active)</div>
              <div className="stat-value" style={{ color: "#f87171" }}>
                {logStats.critical}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-premium kpi-resolved">
            <div className="stat-icon-wrapper-premium resolved">
              <FiCheckCircle />
            </div>
            <div className="stat-content">
              <div className="stat-title">Resolved</div>
              <div className="stat-value" style={{ color: "#34d399" }}>
                {logStats.resolved}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Distribution Panels */}
      <Row gutter={[20, 20]} className="distribution-panel">
        <Col xs={24} lg={12}>
          <Card className="dist-card">
            <div className="dist-title">
              <FiAlertTriangle style={{ color: "#f87171" }} /> Priority Distribution
            </div>
            <div className="distribution-bar-container">
              {Object.keys(priorityDistribution).map((prio) => {
                const count = priorityDistribution[prio] || 0;
                const total = logStats.total || 1;
                const percentage = Math.round((count / total) * 100);
                const color =
                  prio === "critical"
                    ? "#ef4444"
                    : prio === "high"
                      ? "#f97316"
                      : prio === "medium"
                        ? "#eab308"
                        : "#3b82f6";
                return (
                  <div className="dist-item" key={prio}>
                    <div className="dist-label-row">
                      <span className="dist-name" style={{ textTransform: "capitalize" }}>
                        {prio}
                      </span>
                      <span>
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="progress-track-premium">
                      <div
                        className="progress-fill-premium"
                        style={{ width: `${percentage}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="dist-card">
            <div className="dist-title">
              <FiCpu style={{ color: "#38bdf8" }} /> Top Categories
            </div>
            <div className="distribution-bar-container">
              {Object.keys(categoryDistribution)
                .slice(0, 6) // Show top 6 categories for a clean grid layout
                .map((cat) => {
                  const count = categoryDistribution[cat] || 0;
                  const total = logStats.total || 1;
                  const percentage = Math.round((count / total) * 100);
                  const config = categoryConfigs[cat] || categoryConfigs.other;
                  const color =
                    cat === "database"
                      ? "#3b82f6"
                      : cat === "auth"
                        ? "#a855f7"
                        : cat === "whatsapp"
                          ? "#22c55e"
                          : cat === "ai"
                            ? "#06b6d4"
                            : cat === "automation"
                              ? "#ec4899"
                              : "#64748b";

                  return (
                    <div className="dist-item" key={cat}>
                      <div className="dist-label-row">
                        <span className="dist-name">
                          {config.icon}
                          {config.label}
                        </span>
                        <span>
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="progress-track-premium">
                        <div
                          className="progress-fill-premium"
                          style={{ width: `${percentage}%`, background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Log list grid */}
      <Card className="main-logs-card">
        {/* Filters Toolbar */}
        <div className="filter-toolbar-premium">
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Search error messages, traceback stack trace..."
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="search-input-premium"
          />

          <Select
            placeholder="Category"
            allowClear
            value={category}
            onChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
            className="filter-select-premium"
            popupClassName="select-popup-premium"
          >
            {Object.keys(categoryConfigs).map((cat) => (
              <Select.Option key={cat} value={cat}>
                {categoryConfigs[cat].label}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Priority"
            allowClear
            value={priority}
            onChange={(value) => {
              setPriority(value);
              setPage(1);
            }}
            className="filter-select-premium"
          >
            {Object.keys(priorityConfigs).map((prio) => (
              <Select.Option key={prio} value={prio}>
                {priorityConfigs[prio].label}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Status"
            allowClear
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            className="filter-select-premium"
          >
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="resolved">Resolved</Select.Option>
          </Select>

          <RangePicker
            onChange={(dates) => {
              setDateRange(dates);
              setPage(1);
            }}
            className="range-picker-premium"
          />

          <div className="action-buttons-premium">
            <Dropdown
              menu={{
                items: [
                  {
                    key: "clear-resolved",
                    label: "Clear Resolved Logs Only",
                    icon: <FiTrash2 />,
                    onClick: () => handleClearLogs("resolved"),
                  },
                  {
                    key: "clear-all",
                    label: "Clear ALL Logs (Dangerous)",
                    icon: <FiTrash2 style={{ color: "#ef4444" }} />,
                    onClick: () => handleClearLogs("all"),
                  },
                ],
              }}
              placement="bottomRight"
            >
              <Button
                danger
                type="primary"
                ghost
                icon={<ClearOutlined />}
                style={{ borderRadius: "10px", height: "40px" }}
              >
                Clear Logs
              </Button>
            </Dropdown>
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedRowKeys.length > 0 && (
          <div className="bulk-actions-toolbar">
            <div className="bulk-left">
              <CheckCircleOutlined />
              <span>{selectedRowKeys.length} items selected</span>
            </div>
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => handleResolve(selectedRowKeys)}
                loading={isResolving}
                style={{
                  background: "#3b82f6",
                  borderColor: "#3b82f6",
                  borderRadius: "6px",
                }}
              >
                Resolve Selected
              </Button>
              <Button
                type="text"
                size="small"
                onClick={() => setSelectedRowKeys([])}
                style={{ color: "#cbd5e1" }}
              >
                Cancel
              </Button>
            </Space>
          </div>
        )}

        {/* Logs Table Grid */}
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            getCheckboxProps: (record) => ({
              disabled: record.status === "resolved", // Cannot resolve resolved logs
            }),
          }}
          columns={columns}
          dataSource={logsList}
          rowKey={(record) => record.id || record.createdAt || Math.random()}
          loading={isLogsLoading}
          scroll={{ x: 1000 }}
          className="logs-table-premium"
          onRow={(record) => ({
            onClick: () => setActiveLog(record), // Click row to inspect
            style: { cursor: "pointer" },
          })}
          pagination={{
            current: page,
            pageSize,
            total: logsTotal,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
        />
      </Card>

      {/* Inspection Details Drawer */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiAlertTriangle style={{ color: "#ef4444" }} />
            <span>Inspection Log Analysis</span>
          </div>
        }
        placement="right"
        width={650}
        onClose={() => setActiveLog(null)}
        open={!!activeLog}
        className="drawer-system-logs"
      >
        {activeLog && (
          <div>
            {/* Header info */}
            <div className="drawer-detail-section">
              <div className="section-label">Log Identifier</div>
              <div className="section-content-value" style={{ fontFamily: "monospace", color: "#60a5fa" }}>
                {activeLog.id}
              </div>
            </div>

            <div className="drawer-detail-section">
              <div className="section-label">Status & Details</div>
              <div className="meta-grid">
                <div>
                  <Text style={{ color: "#94a3b8", fontSize: "12px" }}>Priority</Text>
                  <div>
                    <span className={`priority-badge-premium ${activeLog.priority}`}>
                      {activeLog.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <Text style={{ color: "#94a3b8", fontSize: "12px" }}>Category</Text>
                  <div>
                    <span className={`category-badge-premium ${activeLog.category}`}>
                      {(categoryConfigs[activeLog.category] || categoryConfigs.other).icon}
                      {activeLog.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="drawer-detail-section">
              <div className="section-label">Error Message</div>
              <div className="section-content-value" style={{ color: "#ef4444", fontWeight: 600 }}>
                {activeLog.message}
              </div>
            </div>

            {/* Traceback stack trace box */}
            {activeLog.stack && (
              <div className="drawer-detail-section">
                <div className="section-label" style={{ display: "flex", justify: "space-between" }}>
                  <span>Traceback Stack Trace</span>
                </div>
                <div className="stack-trace-container">
                  <div className="copy-btn" onClick={() => copyToClipboard(activeLog.stack)}>
                    <CopyOutlined /> Copy
                  </div>
                  <pre className="stack-trace-code">
                    <code>{activeLog.stack}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Metadata JSON viewer */}
            {activeLog.metadata && (
              <div className="drawer-detail-section">
                <div className="section-label">Request & Context Metadata</div>
                <pre className="json-meta-box">
                  <code>{JSON.stringify(activeLog.metadata, null, 2)}</code>
                </pre>
              </div>
            )}

            {/* Resolution Section */}
            <div className="drawer-detail-section">
              <div className="section-label">Resolution Status</div>
              {activeLog.status === "resolved" ? (
                <div>
                  <Tag color="success" style={{ padding: "4px 10px", borderRadius: "6px" }}>
                    RESOLVED
                  </Tag>
                  <div style={{ marginTop: "10px", fontSize: "13px", color: "#94a3b8" }}>
                    <p>
                      <strong>Resolved At:</strong>{" "}
                      {dayjs(activeLog.resolvedAt).format("YYYY-MM-DD HH:mm:ss")}
                    </p>
                    <p>
                      <strong>Resolved By:</strong> {activeLog.resolvedBy}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Tag color="error" style={{ padding: "4px 10px", borderRadius: "6px" }}>
                    ACTIVE
                  </Tag>
                  <div style={{ marginTop: "14px" }}>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleResolve([activeLog.id])}
                      loading={isResolving}
                      style={{
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        borderColor: "#10b981",
                        borderRadius: "8px",
                      }}
                    >
                      Resolve Error Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SystemLogs;
