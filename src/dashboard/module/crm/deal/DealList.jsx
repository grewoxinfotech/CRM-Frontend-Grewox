import React, { useState, useEffect } from "react";
import {
  Table,
  Avatar,
  Dropdown,
  Button,
  message,
  Tag,
  Typography,
  Space,
  Tooltip,
  Menu,
  Input,
  Select,
  DatePicker,
  Modal,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiZap,
  FiTarget,
  FiTrendingUp,
  FiLink,
  FiInfo,
  FiCheck,
  FiArrowRight,
  FiDollarSign,
  FiBriefcase,
  FiX,
  FiFilter,
  FiSearch,
  FiTag,
  FiLayers,
  FiStar,
  FiCalendar,
  FiUser,
} from "react-icons/fi";
import { useGetDealsQuery, useDeleteDealMutation } from "./services/DealApi";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import {
  useGetLabelsQuery,
  useGetSourcesQuery,
} from "../crmsystem/souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useNavigate } from "react-router-dom";
import { useGetAllCurrenciesQuery } from "../../../module/settings/services/settingsApi";
import { useGetContactsQuery } from "../contact/services/contactApi";
import { useGetCompanyAccountsQuery } from "../companyacoount/services/companyAccountApi";
import moment from "moment";
import dayjs from "dayjs";
import { formatCurrency } from "../../../utils/currencyUtils";

const { Text } = Typography;

const DealList = ({
  deals = [],
  onEdit,
  onView,
  onDelete,
  onDealClick,
  loading,
  pagination,
  onTableChange,
}) => {
  const loggedInUser = useSelector(selectCurrentUser);
  const [deleteDeal] = useDeleteDealMutation();
  const { data: dealStages = [] } = useGetLeadStagesQuery();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: labelsData } = useGetLabelsQuery(loggedInUser?.id);
  const { data: currencies = [] } = useGetAllCurrenciesQuery();
  const {
    data: contactsResponse,
    isLoading: isContactsLoading,
    error: contactsError,
  } = useGetContactsQuery();
  const {
    data: companyAccountsResponse = { data: [] },
    isLoading: isCompanyAccountsLoading,
  } = useGetCompanyAccountsQuery();

  const sources = sourcesData?.data || [];
  const labels = labelsData?.data || [];

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update pagination configuration to use server response
  const paginationConfig = {
    total: pagination?.total || 0,
    current: pagination?.current || 1,
    pageSize: pagination?.pageSize || 10,
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} items`,
    pageSizeOptions: isMobile ? ["5", "10", "15", "20", "25"] : ["10", "20", "50", "100"],
    locale: {
      items_per_page: isMobile ? "" : "/ page",
    },
  };

  const getStatusColor = (status, is_won) => {
    // First check is_won flag
    if (is_won === true) {
      return {
        bg: "#dcfce7",
        color: "#15803d",
        icon: <FiTarget />,
        text: "Won",
      };
    } else if (is_won === false) {
      return {
        bg: "#fee2e2",
        color: "#b91c1c",
        icon: <FiTarget />,
        text: "Lost",
      };
    }

    // Default to pending if is_won is null
    return {
      bg: "#dbeafe",
      color: "#1e40af",
      icon: <FiTarget />,
      text: "Pending",
    };
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "overview",
        icon: <FiEye style={{ color: "#1890ff" }} />,
        label: (
          <Text style={{ color: "#1890ff", fontWeight: "500" }}>Overview</Text>
        ),
        onClick: (e) => {
          e.stopPropagation();
          navigate(`/dashboard/crm/deals/${record.id}`);
        },
      },
      {
        key: "edit",
        icon: <FiEdit2 style={{ color: "#52c41a" }} />,
        label: (
          <Text style={{ color: "#52c41a", fontWeight: "500" }}>Edit Deal</Text>
        ),
        onClick: (e) => onEdit(record),
      },
      {
        key: "delete",
        icon: <FiTrash2 style={{ color: "#ff4d4f" }} />,
        label: (
          <Text style={{ color: "#ff4d4f", fontWeight: "500" }}>
            Delete Deal
          </Text>
        ),
        onClick: () => onDelete(record),
      },
    ],
  });

  const columns = [
    {
      title: "Deal Name",
      dataIndex: "dealTitle",
      key: "dealTitle",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search deal title"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Filter
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.dealTitle.toLowerCase().includes(value.toLowerCase()),
      render: (text, record) => {
        // Find company and contact details
        const company = companyAccountsResponse?.data?.find(
          (c) => c.id === record.company_id
        );
        const contact = contactsResponse?.data?.find(
          (c) => c.id === record.contact_id
        );

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              style={{
                backgroundColor:
                  record.status?.toLowerCase() === "won"
                    ? "#52c41a"
                    : "#1890ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {text?.[0]?.toUpperCase() || "D"}
            </Avatar>
            <div style={{ flex: 1 }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Text strong style={{ fontSize: "14px" }}>
                  {text || "Untitled Deal"}
                </Text>
                {record.status?.toLowerCase() === "won" && (
                  <FiCheck style={{ color: "#52c41a", fontSize: "16px" }} />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "4px",
                }}
              >
                {company && (
                  <Tag
                    icon={<FiBriefcase style={{ fontSize: "12px" }} />}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: "#e6f7ff",
                      color: "#1890ff",
                      border: "none",
                      fontSize: "12px",
                    }}
                  >
                    {company.company_name}
                  </Tag>
                )}
                {contact && (
                  <Tag
                    icon={<FiUser style={{ fontSize: "12px" }} />}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: "#f3f4f6",
                      color: "#4b5563",
                      border: "none",
                      fontSize: "12px",
                    }}
                  >
                    {`${contact.first_name} ${contact.last_name || ""}`}
                  </Tag>
                )}
              </div>
            </div>
          </div>
        );
      },
      // width: "30%",
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      filters: sources.map((source) => ({
        text: source.name,
        value: source.id,
      })),
      onFilter: (value, record) => record.source === value,
      render: (sourceId) => {
        const source = sources.find((s) => s.id === sourceId) || {};
        const className = `source-${source.name
          ?.toLowerCase()
          .replace(/\s+/g, "")}`;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FiLink
              style={{
                fontSize: "14px",
                color: source.color || "#64748b",
              }}
            />
            <Text
              style={{
                fontSize: "13px",
                fontWeight: "500",
                color: source.color || "#64748b",
              }}
            >
              {source.name || "Unknown Source"}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      filters: dealStages.map((stage) => ({
        text: stage.stageName,
        value: stage.id,
      })),
      onFilter: (value, record) => record.stage === value,
      render: (stageId) => {
        const stage = dealStages.find((s) => s.id === stageId);
        return (
          <Tag
            style={{
              textTransform: "capitalize",
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "500",
              color: "white",
              background: stage?.color || "#1890ff",
            }}
          >
            {stage?.stageName || "Unknown Stage"}
          </Tag>
        );
      },
    },
    {
      title: "Expected Date",
      dataIndex: "closedDate",
      key: "closedDate",
      width: "15%",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <DatePicker
            value={selectedKeys[0] ? dayjs(selectedKeys[0]) : null}
            onChange={(date) => {
              const dateStr = date ? date.format("YYYY-MM-DD") : null;
              setSelectedKeys(dateStr ? [dateStr] : []);
            }}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Filter
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => {
        if (!value || !record.closedDate) return false;
        return dayjs(record.closedDate).format("YYYY-MM-DD") === value;
      },
      filterIcon: (filtered) => (
        <FiCalendar style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      sorter: (a, b) => (a.value || 0) - (b.value || 0),
      render: (value, record) => (
        <Text strong style={{ fontSize: "14px", color: "#52c41a" }}>
          {formatCurrency(value || 0, record.currency, currencies)}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Won", value: true },
        { text: "Lost", value: false },
        { text: "Pending", value: null },
      ],
      onFilter: (value, record) => record.is_won === value,
      render: (status, record) => {
        const statusConfig = getStatusColor(status, record.is_won);
        return (
          <Tag
            style={{
              margin: 0,
              padding: "4px 11px",
              fontSize: "13px",
              borderRadius: "12px",
              background: statusConfig.bg,
              color: statusConfig.color,
              border: "none",
            }}
          >
            {statusConfig.text}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            menu={getDropdownItems(record)}
            trigger={["click"]}
            placement="bottomRight"
            arrow
          >
            <Button
              type="text"
              icon={<FiMoreVertical style={{ fontSize: "16px" }} />}
              className="action-btn"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) return;
    Modal.confirm({
      title: 'Delete Selected Deals',
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected deals?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await Promise.all(selectedRowKeys.map(id => deleteDeal(id).unwrap()));
          message.success(`${selectedRowKeys.length} deals deleted successfully`);
          setSelectedRowKeys([]);
        } catch (error) {
          message.error('Failed to delete selected deals');
        }
      },
    });
  };

  const BulkActions = () => (
    <div className="bulk-actions">
      {selectedRowKeys.length > 0 && (
        <Button
          className="delete-button"
          icon={<FiTrash2 size={16} style={{ marginRight: 8 }} />}
          onClick={handleBulkDelete}
        >
          Delete Selected ({selectedRowKeys.length})
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="deal-list-container">
        <BulkActions />
        <Table
          columns={columns}
          dataSource={deals}
          rowKey="id"
          pagination={paginationConfig}
          scroll={{ x: "max-content", y: "100%" }}
          loading={loading}
          onChange={onTableChange}
          onRow={(record) => ({
            onClick: () => onDealClick(record),
            style: { cursor: "pointer" },
          })}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
          }}
        />
      </div>

      <style jsx global>{`
        .deal-list-container {
          margin-right: 10px;
          .ant-table-pagination {
            display: flex !important;
            visibility: visible !important;
            .ant-pagination-options {
              display: flex !important;
              align-items: center;
              margin-bottom: 10px;
              .ant-select-selection-item {
                width: auto !important;
                min-width: 40px;
                height: 20px;
                max-width: 100%;
                overflow: visible !important;
                white-space: normal !important;
                text-align: center;
                font-size: 14px;
                font-weight: 400;
              }
            }
          }
        }

        @media (min-width: 768px) {
          .deal-list-container {
            .ant-table-pagination {
              .ant-pagination-options {
                .ant-select-selection-item {
                  width: 100%;
                  height: 32px;
                  color: inherit;
                }
              }
            }
          }
        }

        .colorful-table {
          .ant-table {
            border-radius: 8px;
            overflow: hidden;

            .ant-table-container {
              overflow: hidden;
              border-radius: 8px;
            }

            .ant-table-content {
              overflow: auto;

              &::-webkit-scrollbar {
                width: 8px;
                height: 8px;
                background-color: #f5f5f5;
              }

              &::-webkit-scrollbar-thumb {
                background: #1890ff;
                border-radius: 10px;
              }

              &::-webkit-scrollbar-track {
                background: #f5f5f5;
                border-radius: 10px;
              }
            }

            .ant-table-thead > tr > th {
              background: #fafafa !important;
              color: #1f2937;
              font-weight: 600;
              border-bottom: 1px solid #f0f0f0;
              padding: 16px;

              &::before {
                display: none;
              }
            }

            .ant-table-tbody > tr {
              &:hover > td {
                background: rgba(24, 144, 255, 0.04) !important;
              }

              > td {
                padding: 16px;
                transition: all 0.3s ease;
              }

              &:nth-child(even) {
                background-color: #fafafa;

                &:hover > td {
                  background: rgba(24, 144, 255, 0.04) !important;
                }
              }
            }
          }

          .ant-table-filter-trigger {
            color: #8c8c8c;
            &:hover {
              color: #1890ff;
            }
            &.active {
              color: #1890ff;
            }
          }

          .ant-table-filter-dropdown {
            padding: 8px;
            border-radius: 8px;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);

            .ant-dropdown-menu {
              max-height: 300px;
              overflow-y: auto;
              padding: 4px;
              border-radius: 6px;

              &::-webkit-scrollbar {
                width: 8px;
                height: 8px;
                background-color: #f5f5f5;
              }

              &::-webkit-scrollbar-thumb {
                background: #1890ff;
                border-radius: 10px;
              }

              &::-webkit-scrollbar-track {
                background: #f5f5f5;
                border-radius: 10px;
              }
            }

            .ant-input {
              border-radius: 4px;
              &:hover,
              &:focus {
                border-color: #1890ff;
              }
            }

            .ant-btn {
              border-radius: 4px;
              &:not(:last-child) {
                margin-right: 8px;
              }
            }

            .ant-dropdown-menu-item {
              padding: 8px 12px;
              margin: 2px 0;
              border-radius: 4px;
              font-size: 13px;

              &:hover {
                background: rgba(24, 144, 255, 0.1);
              }

              &.ant-dropdown-menu-item-selected {
                color: #1890ff;
                font-weight: 500;
                background: rgba(24, 144, 255, 0.1);
              }
            }
          }

          .ant-table-pagination {
            margin: 16px !important;

            .ant-pagination-item-active {
              border-color: #1890ff;
              background: #1890ff;

              a {
                color: white;
              }
            }
          }
        }

        @media (max-width: 768px) {
          .colorful-table {
            .ant-table {
              font-size: 14px;

              .ant-table-thead > tr > th {
                padding: 8px 12px;
                font-size: 14px;
                white-space: nowrap;
              }

              .ant-table-tbody > tr > td {
                padding: 8px 12px;
                font-size: 14px;
              }

              .ant-tag {
                font-size: 12px;
                padding: 2px 6px;
              }

              .ant-typography {
                font-size: 14px;
              }

              .ant-btn {
                font-size: 14px;
                padding: 4px 8px;
                height: 28px;
              }

              .ant-avatar {
                width: 24px;
                height: 24px;
                font-size: 12px;
              }
            }
          }
        }

        @media (max-width: 480px) {
          .colorful-table {
            .ant-table {
              font-size: 13px;

              .ant-table-thead > tr > th {
                padding: 6px 8px;
                font-size: 13px;
              }

              .ant-table-tbody > tr > td {
                padding: 6px 8px;
                font-size: 13px;
              }

              .ant-tag {
                font-size: 11px;
                padding: 1px 4px;
              }

              .ant-typography {
                font-size: 13px;
              }

              .ant-btn {
                font-size: 13px;
                padding: 3px 6px;
                height: 24px;
              }

              .ant-avatar {
                width: 20px;
                height: 20px;
                font-size: 11px;
              }
            }
          }
        }

        // Source colors
        .source-social {
          color: #1890ff !important;
        }
        .source-partner {
          color: #52c41a !important;
        }
        .source-referral {
          color: #722ed1 !important;
        }
        .source-website {
          color: #13c2c2 !important;
        }
        .source-event {
          color: #fa8c16 !important;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          color: #6b7280;
          transition: all 0.3s;

          &:hover {
            color: #1890ff;
            background: rgba(24, 144, 255, 0.1);
          }
        }

        .custom-filter-menu {
          width: 320px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);

          .filter-search-section {
            margin-bottom: 16px;

            .ant-input-affix-wrapper {
              border-radius: 6px;

              &:hover,
              &:focus {
                border-color: #1890ff;
              }
            }
          }

          .filter-section {
            margin-bottom: 16px;

            &:last-child {
              margin-bottom: 0;
            }

            .filter-section-title {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;
              color: #1f2937;
              font-weight: 500;

              .filter-icon {
                color: #6b7280;
              }
            }

            .filter-options {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;

              .ant-tag {
                margin: 0;
                padding: 4px 8px;
                cursor: pointer;
                user-select: none;
                border-radius: 4px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.3s;

                &:hover {
                  opacity: 0.8;
                }

                &.active {
                  color: #1890ff;
                  background: rgba(24, 144, 255, 0.1);
                  border-color: #1890ff;
                }
              }
            }
          }

          .filter-footer {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #f0f0f0;
            display: flex;
            justify-content: center;

            .ant-btn {
              color: #6b7280;

              &:hover {
                color: #1890ff;
              }
            }
          }
        }
      `}</style>
    </>
  );
};

export default DealList;
