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
  Modal,
  Select,
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
import moment from "moment";
import { formatCurrency } from "../../../utils/currencyUtils";
import { useGetRolesQuery } from "../../hrm/role/services/roleApi";

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

const getRandomColor = (name) => {
  const colors = [
    "#1890ff", "#2f54eb", "#722ed1", "#eb2f96",
    "#fa8c16", "#faad14", "#a0d911", "#52c41a",
    "#13c2c2", "#fa541c"
  ];
  let hash = 0;
  for (let i = 0; i < name?.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const LeadList = ({
  leads,
  onEdit,
  onView,
  onLeadClick,
  onDelete,
  loading,
  pagination,
  onTableChange,
  users = [],
}) => {
  const [deleteLead] = useDeleteLeadMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch role and permissions
  const { data: rolesData } = useGetRolesQuery(undefined, {
    skip: !loggedInUser || loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client'
  });

  const userRoleData = rolesData?.message?.data?.find(role => role.id === loggedInUser?.role_id);
  const userPermissions = React.useMemo(() => {
    if (!userRoleData?.permissions) return null;
    try {
      return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
    } catch (e) {
      return null;
    }
  }, [userRoleData]);

  const hasPermission = (action) => {
    if (!loggedInUser) return false;
    if (loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client') return true;
    if (!userPermissions) return false;
    const leadPerms = userPermissions['dashboards-lead'];
    if (!leadPerms || leadPerms.length === 0) return false;
    const allowed = leadPerms[0]?.permissions || [];
    return allowed.includes(action);
  };

  // Fetch all required data
  const { data: stagesData } = useGetLeadStagesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.client_id || loggedInUser?.id);
  const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
  const { data: currencies = [] } = useGetAllCurrenciesQuery();
  const { data: companyAccountsResponse } = useGetCompanyAccountsQuery();
  const { data: contactsResponse } = useGetContactsQuery();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  console.log(leads);

  // Filter and prepare data
  const stages =
    stagesData?.filter((stage) => stage.stageType === "lead") || [];
  const sources = sourcesData?.data || [];
  const statuses = statusesData?.data || [];
  const contacts = contactsResponse?.data || [];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        name: `${relatedContact.first_name || ""} ${relatedContact.last_name || ""
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
    return record.Company?.company_name || null;
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

  const getSourceColor = (sourceName) => {
    if (!sourceName) return "#1890ff";
    const sourceColors = {
      "Referral": "#722ed1",
      "Website": "#13c2c2",
      "Cold Call": "#fa8c16",
      "Facebook": "#1890ff",
      "Instagram": "#eb2f96",
      "LinkedIn": "#0077b5",
      "Email": "#52c41a",
      "Direct": "#2f54eb"
    };
    return sourceColors[sourceName] || getRandomColor(sourceName);
  };

  const getCompanyTooltip = (record) => {
    const company = record.Company;
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
    const contact = record.Contact;
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
          onClick: (e) => {
            e.domEvent.stopPropagation();
            onLeadClick(record);
          },
        },
        shouldShowEditDelete && hasPermission('update') && {
          key: "edit",
          icon: <FiEdit2 style={{ color: "#52c41a" }} />,
          label: (
            <Text style={{ color: "#52c41a", fontWeight: "500" }}>
              Edit Lead
            </Text>
          ),
          onClick: (e) => {
            e.domEvent.stopPropagation();
            onEdit(record);
          },
        },
        shouldShowEditDelete && hasPermission('delete') && {
          key: "delete",
          icon: <FiTrash2 style={{ color: "#ff4d4f" }} />,
          label: (
            <Text style={{ color: "#ff4d4f", fontWeight: "500" }}>
              Delete Lead
            </Text>
          ),
          onClick: (e) => {
            e.domEvent.stopPropagation();
            onDelete(record);
          },
          danger: true,
        },
      ].filter(Boolean),
    };
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 110,
      render: (date) => {
        const leadDate = moment(date);
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'days').startOf('day');
        const thisWeek = moment().subtract(7, 'days').startOf('day');

        let colors = {
          bg: "#fff1f0",
          text: "#cf1322",
          border: "#ffa39e"
        };

        if (leadDate.isSame(today, 'day')) {
          // Today - Green
          colors = { bg: "#f6ffed", text: "#389e0d", border: "#b7eb8f" };
        } else if (leadDate.isSame(yesterday, 'day')) {
          // Yesterday - Blue
          colors = { bg: "#e6f7ff", text: "#096dd9", border: "#91d5ff" };
        } else if (leadDate.isAfter(thisWeek)) {
          // This Week - Orange
          colors = { bg: "#fff7e6", text: "#d46b08", border: "#ffd591" };
        }

        return (
          <Tag
            style={{
              borderRadius: "6px",
              padding: "2px 10px",
              fontSize: "12px",
              fontWeight: "600",
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              margin: 0,
              textTransform: 'uppercase'
            }}
          >
            {leadDate.isSame(today, 'day') ? "Today" :
              leadDate.isSame(yesterday, 'day') ? "Yesterday" :
                leadDate.format("DD MMM YYYY")}
          </Tag>
        );
      }
    },
    {
      title: "Lead Name",
      dataIndex: "leadTitle",
      key: "leadTitle",
      width: 170,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search lead name"
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
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
            </div>
          </div>
        );
      },
    },
    {
      title: "Company",
      dataIndex: ["Company", "company_name"],
      key: "company",
      width: 150,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search company"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>Filter</Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>Reset</Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => {
        const companyName = getCompanyName(record) || "";
        return companyName.toLowerCase().includes(value.toLowerCase());
      },
      render: (name, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiBriefcase style={{ color: "#1890ff" }} />
          <Text strong>{name || "N/A"}</Text>
        </div>
      )
    },
    {
      title: "Phone",
      dataIndex: ["Contact", "phone"],
      key: "phone",
      width: 100,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search phone"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>Filter</Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>Reset</Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => {
        const phone = record.Contact?.phone || "";
        return phone.toLowerCase().includes(value.toLowerCase());
      },
      render: (phone) => (phone && !phone.startsWith("META_")) ? phone : "N/A"
    },
    {
      title: "Lead Source",
      dataIndex: "LeadSource",
      key: "lead_source",
      width: 150,
      filters: sources.map((source) => ({
        text: source.name,
        value: source.id,
      })),
      onFilter: (value, record) => record.source === value,
      render: (leadSource, record) => {
        // Resolve source ID from either record.source directly (for optimistic UI) or the leadSource object
        const sourceId = typeof leadSource === 'string' ? leadSource : (leadSource?.id || record.source);
        
        // Find the full source object from the globally fetched `sources` array
        const resolvedSource = sources.find((s) => s.id === sourceId) || (typeof leadSource === 'object' ? leadSource : null);
        
        // Get the name, or fallback to the ID string if truly unknown
        let sourceName = resolvedSource?.name || sourceId;

        // Auto-correct if the API mistakenly saved the ID as the name (the exact bug for newly created clients)
        if (sourceName && sourceName === sourceId) {
            const possibleMatch = sources.find(s => s.id === sourceName);
            if (possibleMatch) sourceName = possibleMatch.name;
        }

        const color = getSourceColor(sourceName);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FiLink style={{ color: color }} />
            <Text style={{ color: color, fontWeight: "500" }}>
              {sourceName !== sourceId && sourceName ? sourceName : "Unknown"}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
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
      width: 150,
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
      width: 120,
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
      title: "Lead Owner",
      dataIndex: "Creator",
      key: "owner",
      width: 120,
      filters: users?.map((user) => ({
        text: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Unknown",
        value: user.id,
      })) || [],
      onFilter: (value, record) => record.Creator?.id === value,
      render: (creator) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Text>{creator ? `${creator.firstName || ""} ${creator.lastName || ""}` : "Unknown"}</Text>
        </div>
      )
    },
    {
      title: 'Assignee',
      dataIndex: 'lead_members',
      key: 'assignee',
      width: 150,
      filters: users?.map((user) => ({
        text: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Unknown",
        value: user.id,
      })) || [],
      onFilter: (value, record) => {
        let assignedIds = [];
        try {
          let parsed = record.lead_members;
          if (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
              if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            } catch (e) { parsed = []; }
          }
          assignedIds = parsed?.lead_members || parsed?.assignedusers || (Array.isArray(parsed) ? parsed : []);
        } catch (e) { assignedIds = []; }
        return assignedIds.includes(value);
      },
      render: (lead_members) => {
        let assignedIds = [];
        try {
          let parsed = lead_members;
          // Robust parsing to handle potential double-encoding
          if (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
              if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            } catch (e) { parsed = []; }
          }
          assignedIds = parsed?.lead_members || parsed?.assignedusers || (Array.isArray(parsed) ? parsed : []);
        } catch (e) { assignedIds = []; }

        const assignedUsers = Array.isArray(assignedIds)
          ? assignedIds.map(id => users?.find(u => u.id === id)).filter(Boolean)
          : [];

        if (assignedIds.length > 0 && assignedUsers.length === 0) {
          console.warn("Assignee Mapping Failed:", { assignedIds, availableUserIds: users?.map(u => u.id) });
        }

        return (
          <Avatar.Group maxCount={3} size="small">
            {assignedUsers.map(user => (
              <Tooltip key={user.id} title={user.username || `${user.firstName} ${user.lastName}`}>
                <Avatar
                  src={user.profilePic}
                  style={{ backgroundColor: getRandomColor(user.username || user.id) }}
                >
                  {user.username?.charAt(0).toUpperCase() || user.firstName?.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
            {assignedUsers.length === 0 && <Text type="secondary" style={{ fontSize: '12px' }}>Unassigned</Text>}
          </Avatar.Group>
        );
      }
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

  // Update pagination configuration to use server response
  const paginationConfig = {
    total: leads?.pagination?.total || 0,
    current: leads?.pagination?.current || 1,
    pageSize: leads?.pagination?.pageSize || 10,
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} items`,
    pageSizeOptions: isMobile ? ["5", "10", "15", "20", "25"] : ["10", "20", "50", "100"],
    locale: {
      items_per_page: isMobile ? "" : "/ page",
    },
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    Modal.confirm({
      title: 'Delete Selected Leads',
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected leads?`,
      centered: true,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await Promise.all(selectedRowKeys.map(id => deleteLead(id).unwrap()));
          message.success(`${selectedRowKeys.length} leads deleted successfully`);
          setSelectedRowKeys([]);
        } catch (error) {
          message.error('Failed to delete selected leads');
        }
      },
    });
  };

  return (
    <div className="lead-list-container">
      {selectedRowKeys.length > 0 && (
        <div className="bulk-actions lead-bulk-actions">
          <Space>
            <Button
              className="lead-bulk-delete-btn"
              icon={<FiTrash2 size={16} style={{ marginRight: 8 }} />}
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedRowKeys.length})
            </Button>
          </Space>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={leads?.data || []}
        rowKey="id"
        size="small"
        pagination={paginationConfig}
        scroll={{ x: 'max-content', y: 'calc(100vh - 220px)' }}
        className="compact-table"
        loading={loading}
        onChange={onTableChange}
        onRow={(record) => ({
          onClick: () => onLeadClick(record),
          style: { cursor: "pointer" },
        })}
        rowSelection={hasPermission('delete') ? {
          type: 'checkbox',
          selectedRowKeys,
          onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
        } : undefined}
      />
    </div>
  );
};

export default LeadList;
