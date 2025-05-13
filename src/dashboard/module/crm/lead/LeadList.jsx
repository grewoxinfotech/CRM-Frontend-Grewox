import React, { useEffect, useState } from "react";
import {
  Table,
  Avatar,
  Dropdown,
  Button,
  message,
  Tag,
  Typography,
  Space,
  Input,
  Tooltip,
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
  FiBarChart2,
  FiBriefcase,
  FiUser,
} from "react-icons/fi";
import { useDeleteLeadMutation } from "./services/LeadApi";
import {
  useGetSourcesQuery,
  useGetStatusesQuery,
} from "../crmsystem/souce/services/SourceApi";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useGetAllCurrenciesQuery } from "../../../module/settings/services/settingsApi";
import { useGetCompanyAccountsQuery } from "../companyacoount/services/companyAccountApi";
import { useGetContactsQuery } from "../contact/services/contactApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { formatCurrency } from "../../../utils/currencyUtils";

const { Text } = Typography;
const { Search } = Input;

const adjustColor = (color, amount) => {
  return (
    "#" +
    color
      .replace(/^#/, "")
      .replace(/../g, (color) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substr(-2)
      )
  );
};

const LeadList = ({
  leads,
  onEdit,
  onView,
  onLeadClick,
  onDelete,
  onCreateLead,
}) => {
  const [deleteLead] = useDeleteLeadMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch all required data
  const { data: stagesData } = useGetLeadStagesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
  const { data: currencies = [] } = useGetAllCurrenciesQuery();
  const { data: companyAccountsResponse } = useGetCompanyAccountsQuery();
  const { data: contactsResponse } = useGetContactsQuery();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  console.log(leads);

  // Filter and prepare data
  const stages =
    stagesData?.filter((stage) => stage.stageType === "lead") || [];
  const sources = sourcesData?.data || [];
  const statuses = statusesData?.data || [];
  const contacts = contactsResponse?.data || [];

  // Handle automatic form opening
  useEffect(() => {
    if (location.state?.openCreateForm) {
      onCreateLead?.(location.state.initialFormData);
      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location.state, onCreateLead, navigate]);

  // const handleDelete = async (record) => {
  //   try {
  //     await deleteLead(record.id).unwrap();
  //     message.success("Lead deleted successfully");
  //   } catch (error) {
  //     message.error(
  //       "Failed to delete lead: " + (error.data?.message || "Unknown error")
  //     );
  //   }
  // };

  const getContactName = (record) => {
    // First check direct contact
    if (record.contact_id) {
      const contact = contacts.find((c) => c.id === record.contact_id);
      if (contact) {
        return {
          name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim(),
          contact: contact,
        };
      }
    }

    // If no direct contact, check for related contacts
    const relatedContact = contacts.find((c) => c.related_id === record.id);
    if (relatedContact) {
      return {
        name: `${relatedContact.first_name || ""} ${
          relatedContact.last_name || ""
        }`.trim(),
        contact: relatedContact,
      };
    }

    return {
      name: "No Contact",
      contact: null,
    };
  };

  const getCompanyName = (record) => {
    if (record.company_id) {
      const company = companyAccountsResponse?.data?.find(
        (c) => c.id === record.company_id
      );
      return company?.company_name || "Unknown Company";
    }
    return null;
  };

  const getRandomColor = (text) => {
    const colors = [
      "#1890ff",
      "#52c41a",
      "#722ed1",
      "#eb2f96",
      "#fa8c16",
      "#13c2c2",
      "#2f54eb",
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getCompanyTooltip = (record) => {
    const company = companyAccountsResponse?.data?.find(
      (c) => c.id === record.company_id
    );
    if (!company) return null;

    return (
      <div style={{ padding: "8px" }}>
        <div style={{ marginBottom: "4px", fontWeight: "500" }}>
          {company.company_name}
        </div>
        {company.company_site && (
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {company.company_site}
          </div>
        )}
      </div>
    );
  };

  const getContactTooltip = (record) => {
    const contact = contacts.find((c) => c.id === record.contact_id);
    if (!contact) return null;

    return (
      <div style={{ padding: "8px" }}>
        <div style={{ marginBottom: "4px", fontWeight: "500" }}>
          {`${contact.first_name || ""} ${contact.last_name || ""}`.trim()}
        </div>
        {contact.email && (
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {contact.email}
          </div>
        )}
        {contact.phone && (
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {contact.phone}
          </div>
        )}
      </div>
    );
  };

  const getDropdownItems = (record) => {
    const shouldShowEditDelete = record.is_converted === false;
    return {
      items: [
        {
          key: "view",
          icon: <FiEye style={{ color: "#1890ff" }} />,
          label: (
            <Text style={{ color: "#1890ff", fontWeight: "500" }}>
              Overview
            </Text>
          ),
          onClick: () => onLeadClick(record),
        },
        shouldShowEditDelete && {
          key: "edit",
          icon: <FiEdit2 style={{ color: "#52c41a" }} />,
          label: (
            <Text style={{ color: "#52c41a", fontWeight: "500" }}>
              Edit Lead
            </Text>
          ),
          onClick: () => onEdit(record),
        },
        shouldShowEditDelete && {
          key: "delete",
          icon: <FiTrash2 style={{ color: "#ff4d4f" }} />,
          label: (
            <Text style={{ color: "#ff4d4f", fontWeight: "500" }}>
              Delete Lead
            </Text>
          ),
          onClick: () => onDelete(record),
          danger: true,
        },
      ].filter(Boolean),
    };
  };

  const columns = [
    {
      title: "Lead Title",
      dataIndex: "leadTitle",
      key: "leadTitle",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search lead title"
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
      onFilter: (value, record) => {
        const companyName = getCompanyName(record) || "";
        const contactName = getContactName(record).name;
        return (
          record.leadTitle.toLowerCase().includes(value.toLowerCase()) ||
          companyName.toLowerCase().includes(value.toLowerCase()) ||
          contactName.toLowerCase().includes(value.toLowerCase())
        );
      },
      render: (text, record) => {
        const companyName = getCompanyName(record);
        const { name: contactName, contact } = getContactName(record);
        const avatarColor = getRandomColor(text);

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              style={{
                backgroundColor: record.is_converted ? "#52c41a" : avatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {text[0].toUpperCase()}
            </Avatar>
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Text strong style={{ fontSize: "14px" }}>
                  {text}
                </Text>
                {record.is_converted && (
                  <FiCheck style={{ color: "#52c41a", fontSize: "16px" }} />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#6B7280",
                  fontSize: "12px",
                }}
              >
                {companyName && (
                  <Tooltip title={getCompanyTooltip(record)} placement="bottom">
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        background: "rgba(24, 144, 255, 0.1)",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(24, 144, 255, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(24, 144, 255, 0.1)";
                      }}
                    >
                      <FiBriefcase
                        style={{ fontSize: "12px", color: "#1890ff" }}
                      />
                      {companyName}
                    </span>
                  </Tooltip>
                )}
                {companyName && contact && (
                  <span
                    style={{
                      width: "4px",
                      height: "4px",
                      backgroundColor: "#D1D5DB",
                      borderRadius: "50%",
                    }}
                  />
                )}
                {contact ? (
                  <Tooltip title={getContactTooltip(record)} placement="bottom">
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        background: "rgba(82, 196, 26, 0.1)",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(82, 196, 26, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(82, 196, 26, 0.1)";
                      }}
                    >
                      <FiUser style={{ fontSize: "12px", color: "#52c41a" }} />
                      {contactName}
                    </span>
                  </Tooltip>
                ) : (
                  !companyName && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        background: "rgba(107, 114, 128, 0.1)",
                        borderRadius: "4px",
                      }}
                    >
                      <FiUser style={{ fontSize: "12px" }} />
                      No Contact
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        );
      },
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
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FiLink style={{ color: source.color || "#1890ff" }} />
            <Text
              style={{ color: source.color || "#1890ff", fontWeight: "500" }}
            >
              {source.name || "Unknown"}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: statuses.map((status) => ({
        text: status.name,
        value: status.id,
      })),
      onFilter: (value, record) => record.status === value,
      render: (statusId) => {
        const status = statuses.find((s) => s.id === statusId) || {};
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FiInfo style={{ color: status.color || "#1890ff" }} />
            <Text
              style={{ color: status.color || "#1890ff", fontWeight: "500" }}
            >
              {status.name || "Unknown"}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Interest Level",
      dataIndex: "interest_level",
      key: "interest_level",
      filters: [
        { text: "High Interest", value: "high" },
        { text: "Medium Interest", value: "medium" },
        { text: "Low Interest", value: "low" },
      ],
      onFilter: (value, record) => record.interest_level === value,
      render: (level) => {
        const interestStyle = {
          high: {
            color: "#52c41a",
            bg: "rgba(82, 196, 26, 0.1)",
            icon: <FiZap style={{ marginRight: "4px" }} />,
            text: "High Interest",
          },
          medium: {
            color: "#faad14",
            bg: "rgba(250, 173, 20, 0.1)",
            icon: <FiTarget style={{ marginRight: "4px" }} />,
            text: "Medium Interest",
          },
          low: {
            color: "#ff4d4f",
            bg: "rgba(255, 77, 79, 0.1)",
            icon: <FiTrendingUp style={{ marginRight: "4px" }} />,
            text: "Low Interest",
          },
        }[level] || {
          color: "#1890ff",
          bg: "rgba(24, 144, 255, 0.1)",
          icon: <FiTarget style={{ marginRight: "4px" }} />,
          text: "Unknown",
        };

        return (
          <Tag
            style={{
              width: "fit-content",
              color: interestStyle.color,
              backgroundColor: interestStyle.bg,
              border: "none",
              borderRadius: "4px",
              padding: "4px 12px",
              display: "flex",
              alignItems: "center",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            {interestStyle.icon}
            {interestStyle.text}
          </Tag>
        );
      },
    },
    {
      title: "Lead Value",
      dataIndex: "leadValue",
      key: "leadValue",
      sorter: (a, b) => (a.leadValue || 0) - (b.leadValue || 0),
      render: (value, record) => {
        return (
          <Text strong style={{ fontSize: "14px", color: "#52c41a" }}>
            {formatCurrency(value || 0, record.currency, currencies)}
          </Text>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: "80",
      fixed: "right",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            menu={getDropdownItems(record)}
            trigger={["click"]}
            placement="bottomRight"
          
          >
            <Button
              type="text"
              icon={<FiMoreVertical style={{ fontSize: "16px" }} />}
              // className="action-btn"
              onClick={(e) => e.stopPropagation()}
              className="action-dropdown-button"
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  // const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Use only numbers for mobile/tablet, and AntD default for desktop
  const paginationConfig = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} items`,
    pageSizeOptions: isMobile ? ["5", "10", "15", "20", "25"] : ["10", "20", "50", "100"],
    locale: {
      items_per_page: isMobile ? "" : "/ page",
    },
    
  };

  return (
    <>
    <div className="lead-list-container"> 
      <Table
        columns={columns}
        dataSource={leads?.data || []}
        rowKey="id"
        pagination={paginationConfig}
        scroll={{ x: "max-content", y: "100%" }}
        // className="colorful-table"
        onRow={(record) => ({
          onClick: () => onLeadClick(record),
          style: { cursor: "pointer" },
        })}
      />
      </div>
      {/* <style jsx global>{`
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
      `}</style> */}
    </>
  );
};

export default LeadList;
