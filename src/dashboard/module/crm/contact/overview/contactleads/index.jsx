import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  Input,
  Dropdown,
  Menu,
  Space,
  Breadcrumb,
  Tooltip,
  Row,
  Col,
  Select,
  message,
  Form,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiDownload,
  FiGrid,
  FiList,
  FiHome,
} from "react-icons/fi";
import "../../../lead/Lead.scss";
import CreateLead from "../../../lead/CreateLead";
import LeadCard from "../../../lead/LeadCard";
import LeadList from "../../../lead/LeadList";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import EditLead from "../../../lead/EditLead";
import {
  useDeleteLeadMutation,
  useGetLeadsQuery,
} from "../../../lead/services/LeadApi";
import { useGetPipelinesQuery } from "../../../crmsystem/pipeline/services/pipelineApi";
import { useGetLeadStagesQuery } from "../../../crmsystem/leadstage/services/leadStageApi";
import {
  useGetAllCountriesQuery,
  useGetAllCurrenciesQuery,
} from "../../../../settings/services/settingsApi";
import {
  useGetCategoriesQuery,
  useGetSourcesQuery,
  useGetStatusesQuery,
} from "../../../crmsystem/souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../../auth/services/authSlice";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

const ContactLeadsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [searchText, setSearchText] = useState("");
  const loggedInUser = useSelector(selectCurrentUser);
  const [deleteLead, { isLoading: isDeleteLoading }] = useDeleteLeadMutation();
  const { data: leadss, isLoading } = useGetLeadsQuery();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: currencies = [] } = useGetAllCurrenciesQuery();
  const { data: countries = [] } = useGetAllCountriesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
  const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);
  const { data: stagesData } = useGetLeadStagesQuery();
  const [initialFormData, setInitialFormData] = useState(null);

  const idd = useParams();
  const id = idd.contactId;

  const leads = leadss?.data?.filter((lead) => lead.contact_id === id) || [];

  // Handle automatic form opening
  useEffect(() => {
    if (location.state?.openCreateForm) {
      // Only set the inquiry_id from the submission
      const formData = {
        inquiry_id: location.state.formSubmissionId,
      };

      // Get the first available currency if not provided
      if (currencies?.length > 0) {
        const inrCurrency = currencies.find((c) => c.currencyCode === "INR");
        formData.currency = inrCurrency?.id || currencies[0].id;
      }

      setInitialFormData(formData);
      setIsModalOpen(true);

      // Clear the state
      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location.state, navigate, currencies]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredLeads = React.useMemo(() => {
    if (!leads) return [];

    return leads.filter((lead) => {
      const searchLower = searchText.toLowerCase();
      return (
        lead.leadTitle?.toLowerCase().includes(searchLower) ||
        lead.company_name?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.toLowerCase().includes(searchLower)
      );
    });
  }, [leads, searchText]);

  const handleLeadClick = (lead) => {
    navigate(`/dashboard/crm/lead/${lead.id}`);
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setSelectedLead(null);
  };

  const handleDelete = (lead) => {
    Modal.confirm({
      title: "Delete Lead",
      content:
        "Are you sure you want to delete this lead? This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          await deleteLead(lead.id).unwrap();
          message.success("Lead deleted successfully");
        } catch (error) {
          console.error("Delete Error:", error);
          message.error(error?.data?.message || "Failed to delete lead");
        }
      },
    });
  };

  const handleView = (lead) => {
    setSelectedLead(lead);
  };

  // Add debug log for initialFormData changes

  return (
    <div className="lead-page">
      {/* <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Lead</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="header-left">
          <Title level={2}>Leads</Title>
          <p className="subtitle">Manage all leads in the system</p>
        </div>
        <Row justify="center" className="header-actions-wrapper">
          <Col xs={24} sm={24} md={20} lg={16} xl={14}>
            <div className="header-actions">
              <Input
                prefix={
                  <FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />
                }
                placeholder="Search leads"
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                className="search-input"
              />
              <div className="action-buttons">
                <Button.Group className="view-toggle">
                  <Button
                    type={viewMode === "table" ? "primary" : "default"}
                    icon={<FiList size={16} />}
                    onClick={() => setViewMode("table")}
                  />
                  <Button
                    type={viewMode === "card" ? "primary" : "default"}
                    icon={<FiGrid size={16} />}
                    onClick={() => setViewMode("card")}
                  />
                </Button.Group>
                <Dropdown overlay={exportMenu} trigger={["click"]}>
                  <Button className="export-button">
                    <FiDownload size={16} />
                    <span>Export</span>
                    <FiChevronDown size={14} />
                  </Button>
                </Dropdown>
                <Button
                  type="primary"
                  icon={<FiPlus size={16} />}
                  onClick={handleCreate}
                  className="add-button"
                >
                  Add Lead
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div> */}

      <Card className="lead-content">
        {viewMode === "table" ? (
          <LeadList
            leads={{ data: filteredLeads }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onLeadClick={handleLeadClick}
          />
        ) : (
          <LeadCard
            leads={{ data: filteredLeads }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            categoriesData={categoriesData}
            sourcesData={sourcesData}
            statusesData={statusesData}
            currencies={currencies}
            countries={countries}
            pipelines={pipelines}
            onView={handleView}
            onLeadClick={handleLeadClick}
          />
        )}
      </Card>

      <EditLead
        open={isEditModalOpen}
        pipelines={pipelines}
        currencies={currencies}
        countries={countries}
        sourcesData={sourcesData}
        statusesData={statusesData}
        categoriesData={categoriesData}
        onCancel={handleEditCancel}
        initialValues={selectedLead}
        key={selectedLead?.id}
      />
    </div>
  );
};

export default ContactLeadsList;

// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   Avatar,
//   Dropdown,
//   Button,
//   message,
//   Tag,
//   Typography,
//   Space,
//   Input,
//   Tooltip,
// } from "antd";
// import {
//   FiEdit2,
//   FiTrash2,
//   FiEye,
//   FiMoreVertical,
//   FiZap,
//   FiTarget,
//   FiTrendingUp,
//   FiLink,
//   FiInfo,
//   FiCheck,
//   FiBarChart2,
//   FiBriefcase,
//   FiUser,
// } from "react-icons/fi";
// import {
//   useDeleteLeadMutation,
//   useGetLeadQuery,
//   useGetLeadsQuery,
// } from "../../../lead/services/LeadApi";
// import {
//   useGetSourcesQuery,
//   useGetStatusesQuery,
// } from "../../../crmsystem/souce/services/SourceApi";
// import { useGetLeadStagesQuery } from "../../../crmsystem/leadstage/services/leadStageApi";
// import { useGetAllCurrenciesQuery } from "../../../../../module/settings/services/settingsApi";
// import { useGetCompanyAccountsQuery } from "../../../companyacoount/services/companyAccountApi";
// import { useGetContactsQuery } from "../../../contact/services/contactApi";
// import { useSelector } from "react-redux";
// import { selectCurrentUser } from "../../../../../../auth/services/authSlice";
// import { useNavigate, useLocation, useParams } from "react-router-dom";
// import { formatCurrency } from "../../../../../utils/currencyUtils";

// const { Text } = Typography;
// const { Search } = Input;

// const adjustColor = (color, amount) => {
//   return (
//     "#" +
//     color
//       .replace(/^#/, "")
//       .replace(/../g, (color) =>
//         (
//           "0" +
//           Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
//         ).substr(-2)
//       )
//   );
// };

// const CompanyLeadsList = ({ onCreateLead }) => {
//   const idd = useParams();
//   const id = idd.accountId;

//   const [deleteLead] = useDeleteLeadMutation();
//   const loggedInUser = useSelector(selectCurrentUser);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);

//   // Fetch all required data
//   const { data: stagesData } = useGetLeadStagesQuery();
//   const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
//   const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
//   const { data: currencies = [] } = useGetAllCurrenciesQuery();
//   const { data: companyAccountsResponse } = useGetCompanyAccountsQuery();
//   const { data: contactsResponse } = useGetContactsQuery();
//   const { data: leadss, isLoading } = useGetLeadsQuery();

//   // Filter leads based on company_id matching with id
//   const leads = leadss?.data?.filter((lead) => lead.company_id === id) || [];

//   // const lead = leadss.data;

//   // const leads = lead.filter((lead) => lead.company_id === id);

//   // Filter and prepare data
//   const stages =
//     stagesData?.filter((stage) => stage.stageType === "lead") || [];
//   const sources = sourcesData?.data || [];
//   const statuses = statusesData?.data || [];
//   const contacts = contactsResponse?.data || [];

//   // Handle automatic form opening
//   useEffect(() => {
//     if (location.state?.openCreateForm) {
//       onCreateLead?.(location.state.initialFormData);
//       navigate(location.pathname, {
//         replace: true,
//         state: {},
//       });
//     }
//   }, [location.state, onCreateLead, navigate]);

//   const handleLeadClick = (lead) => {
//     navigate(`/dashboard/crm/lead/${lead.id}`);
//   };

//   const handleEdit = (lead) => {
//     setSelectedLead(lead);
//     setIsEditModalOpen(true);
//   };

//   const handleDelete = async (record) => {
//     try {
//       await deleteLead(record.id).unwrap();
//       message.success("Lead deleted successfully");
//     } catch (error) {
//       message.error(
//         "Failed to delete lead: " + (error.data?.message || "Unknown error")
//       );
//     }
//   };

//   const getContactName = (record) => {
//     // First check direct contact
//     if (record.contact_id) {
//       const contact = contacts.find((c) => c.id === record.contact_id);
//       if (contact) {
//         return {
//           name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim(),
//           contact: contact,
//         };
//       }
//     }

//     // If no direct contact, check for related contacts
//     const relatedContact = contacts.find((c) => c.related_id === record.id);
//     if (relatedContact) {
//       return {
//         name: `${relatedContact.first_name || ""} ${
//           relatedContact.last_name || ""
//         }`.trim(),
//         contact: relatedContact,
//       };
//     }

//     return {
//       name: "No Contact",
//       contact: null,
//     };
//   };

//   const getCompanyName = (record) => {
//     if (record.company_id) {
//       const company = companyAccountsResponse?.data?.find(
//         (c) => c.id === record.company_id
//       );
//       return company?.company_name || "Unknown Company";
//     }
//     return null;
//   };

//   const getRandomColor = (text) => {
//     const colors = [
//       "#1890ff",
//       "#52c41a",
//       "#722ed1",
//       "#eb2f96",
//       "#fa8c16",
//       "#13c2c2",
//       "#2f54eb",
//     ];
//     let hash = 0;
//     for (let i = 0; i < text.length; i++) {
//       hash = text.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     return colors[Math.abs(hash) % colors.length];
//   };

//   const getCompanyTooltip = (record) => {
//     const company = companyAccountsResponse?.data?.find(
//       (c) => c.id === record.company_id
//     );
//     if (!company) return null;

//     return (
//       <div style={{ padding: "8px" }}>
//         <div style={{ marginBottom: "4px", fontWeight: "500" }}>
//           {company.company_name}
//         </div>
//         {company.company_site && (
//           <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
//             {company.company_site}
//           </div>
//         )}
//       </div>
//     );
//   };

//   const getContactTooltip = (record) => {
//     const contact = contacts.find((c) => c.id === record.contact_id);
//     if (!contact) return null;

//     return (
//       <div style={{ padding: "8px" }}>
//         <div style={{ marginBottom: "4px", fontWeight: "500" }}>
//           {`${contact.first_name || ""} ${contact.last_name || ""}`.trim()}
//         </div>
//         {contact.email && (
//           <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
//             {contact.email}
//           </div>
//         )}
//         {contact.phone && (
//           <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
//             {contact.phone}
//           </div>
//         )}
//       </div>
//     );
//   };

//   const getDropdownItems = (record) => {
//     const shouldShowEditDelete = record.is_converted === false;
//     return {
//       items: [
//         {
//           key: "view",
//           icon: <FiEye style={{ color: "#1890ff" }} />,
//           label: (
//             <Text style={{ color: "#1890ff", fontWeight: "500" }}>
//               Overview
//             </Text>
//           ),
//           onClick: () => handleLeadClick(record),
//         },
//         shouldShowEditDelete && {
//           key: "edit",
//           icon: <FiEdit2 style={{ color: "#52c41a" }} />,
//           label: (
//             <Text style={{ color: "#52c41a", fontWeight: "500" }}>
//               Edit Lead
//             </Text>
//           ),
//           onClick: () => handleEdit(record),
//         },
//         shouldShowEditDelete && {
//           key: "delete",
//           icon: <FiTrash2 style={{ color: "#ff4d4f" }} />,
//           label: (
//             <Text style={{ color: "#ff4d4f", fontWeight: "500" }}>
//               Delete Lead
//             </Text>
//           ),
//           onClick: () => handleDelete(record),
//           danger: true,
//         },
//       ].filter(Boolean),
//     };
//   };

//   const columns = [
//     {
//       title: "Lead Title",
//       dataIndex: "leadTitle",
//       key: "leadTitle",
//       filterDropdown: ({
//         setSelectedKeys,
//         selectedKeys,
//         confirm,
//         clearFilters,
//       }) => (
//         <div style={{ padding: 8 }}>
//           <Input
//             placeholder="Search lead title"
//             value={selectedKeys[0]}
//             onChange={(e) =>
//               setSelectedKeys(e.target.value ? [e.target.value] : [])
//             }
//             onPressEnter={() => confirm()}
//             style={{ width: 188, marginBottom: 8, display: "block" }}
//           />
//           <Space>
//             <Button
//               type="primary"
//               onClick={() => confirm()}
//               size="small"
//               style={{ width: 90 }}
//             >
//               Filter
//             </Button>
//             <Button
//               onClick={() => clearFilters()}
//               size="small"
//               style={{ width: 90 }}
//             >
//               Reset
//             </Button>
//           </Space>
//         </div>
//       ),
//       onFilter: (value, record) => {
//         const companyName = getCompanyName(record) || "";
//         const contactName = getContactName(record).name;
//         return (
//           record.leadTitle.toLowerCase().includes(value.toLowerCase()) ||
//           companyName.toLowerCase().includes(value.toLowerCase()) ||
//           contactName.toLowerCase().includes(value.toLowerCase())
//         );
//       },
//       render: (text, record) => {
//         const companyName = getCompanyName(record);
//         const { name: contactName, contact } = getContactName(record);
//         const avatarColor = getRandomColor(text);

//         return (
//           <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//             <Avatar
//               style={{
//                 backgroundColor: record.is_converted ? "#52c41a" : avatarColor,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               {text[0].toUpperCase()}
//             </Avatar>
//             <div>
//               <div
//                 style={{ display: "flex", alignItems: "center", gap: "8px" }}
//               >
//                 <Text strong style={{ fontSize: "14px" }}>
//                   {text}
//                 </Text>
//                 {record.is_converted && (
//                   <FiCheck style={{ color: "#52c41a", fontSize: "16px" }} />
//                 )}
//               </div>
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "8px",
//                   color: "#6B7280",
//                   fontSize: "12px",
//                 }}
//               >
//                 {companyName && (
//                   <Tooltip title={getCompanyTooltip(record)} placement="bottom">
//                     <span
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "4px",
//                         padding: "2px 8px",
//                         background: "rgba(24, 144, 255, 0.1)",
//                         borderRadius: "4px",
//                         cursor: "pointer",
//                         transition: "all 0.3s ease",
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.background =
//                           "rgba(24, 144, 255, 0.2)";
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.background =
//                           "rgba(24, 144, 255, 0.1)";
//                       }}
//                     >
//                       <FiBriefcase
//                         style={{ fontSize: "12px", color: "#1890ff" }}
//                       />
//                       {companyName}
//                     </span>
//                   </Tooltip>
//                 )}
//                 {companyName && contact && (
//                   <span
//                     style={{
//                       width: "4px",
//                       height: "4px",
//                       backgroundColor: "#D1D5DB",
//                       borderRadius: "50%",
//                     }}
//                   />
//                 )}
//                 {contact ? (
//                   <Tooltip title={getContactTooltip(record)} placement="bottom">
//                     <span
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "4px",
//                         padding: "2px 8px",
//                         background: "rgba(82, 196, 26, 0.1)",
//                         borderRadius: "4px",
//                         cursor: "pointer",
//                         transition: "all 0.3s ease",
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.background =
//                           "rgba(82, 196, 26, 0.2)";
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.background =
//                           "rgba(82, 196, 26, 0.1)";
//                       }}
//                     >
//                       <FiUser style={{ fontSize: "12px", color: "#52c41a" }} />
//                       {contactName}
//                     </span>
//                   </Tooltip>
//                 ) : (
//                   !companyName && (
//                     <span
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "4px",
//                         padding: "2px 8px",
//                         background: "rgba(107, 114, 128, 0.1)",
//                         borderRadius: "4px",
//                       }}
//                     >
//                       <FiUser style={{ fontSize: "12px" }} />
//                       No Contact
//                     </span>
//                   )
//                 )}
//               </div>
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       title: "Source",
//       dataIndex: "source",
//       key: "source",
//       filters: sources.map((source) => ({
//         text: source.name,
//         value: source.id,
//       })),
//       onFilter: (value, record) => record.source === value,
//       render: (sourceId) => {
//         const source = sources.find((s) => s.id === sourceId) || {};
//         return (
//           <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//             <FiLink style={{ color: source.color || "#1890ff" }} />
//             <Text
//               style={{ color: source.color || "#1890ff", fontWeight: "500" }}
//             >
//               {source.name || "Unknown"}
//             </Text>
//           </div>
//         );
//       },
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//       filters: statuses.map((status) => ({
//         text: status.name,
//         value: status.id,
//       })),
//       onFilter: (value, record) => record.status === value,
//       render: (statusId) => {
//         const status = statuses.find((s) => s.id === statusId) || {};
//         return (
//           <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//             <FiInfo style={{ color: status.color || "#1890ff" }} />
//             <Text
//               style={{ color: status.color || "#1890ff", fontWeight: "500" }}
//             >
//               {status.name || "Unknown"}
//             </Text>
//           </div>
//         );
//       },
//     },
//     {
//       title: "Interest Level",
//       dataIndex: "interest_level",
//       key: "interest_level",
//       filters: [
//         { text: "High Interest", value: "high" },
//         { text: "Medium Interest", value: "medium" },
//         { text: "Low Interest", value: "low" },
//       ],
//       onFilter: (value, record) => record.interest_level === value,
//       render: (level) => {
//         const interestStyle = {
//           high: {
//             color: "#52c41a",
//             bg: "rgba(82, 196, 26, 0.1)",
//             icon: <FiZap style={{ marginRight: "4px" }} />,
//             text: "High Interest",
//           },
//           medium: {
//             color: "#faad14",
//             bg: "rgba(250, 173, 20, 0.1)",
//             icon: <FiTarget style={{ marginRight: "4px" }} />,
//             text: "Medium Interest",
//           },
//           low: {
//             color: "#ff4d4f",
//             bg: "rgba(255, 77, 79, 0.1)",
//             icon: <FiTrendingUp style={{ marginRight: "4px" }} />,
//             text: "Low Interest",
//           },
//         }[level] || {
//           color: "#1890ff",
//           bg: "rgba(24, 144, 255, 0.1)",
//           icon: <FiTarget style={{ marginRight: "4px" }} />,
//           text: "Unknown",
//         };

//         return (
//           <Tag
//             style={{
//               width: "fit-content",
//               color: interestStyle.color,
//               backgroundColor: interestStyle.bg,
//               border: "none",
//               borderRadius: "4px",
//               padding: "4px 12px",
//               display: "flex",
//               alignItems: "center",
//               fontSize: "13px",
//               fontWeight: "500",
//             }}
//           >
//             {interestStyle.icon}
//             {interestStyle.text}
//           </Tag>
//         );
//       },
//     },
//     {
//       title: "Lead Value",
//       dataIndex: "leadValue",
//       key: "leadValue",
//       sorter: (a, b) => (a.leadValue || 0) - (b.leadValue || 0),
//       render: (value, record) => {
//         return (
//           <Text strong style={{ fontSize: "14px", color: "#52c41a" }}>
//             {formatCurrency(value || 0, record.currency, currencies)}
//           </Text>
//         );
//       },
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       width: 80,
//       align: "center",
//       render: (_, record) => (
//         <div onClick={(e) => e.stopPropagation()}>
//           <Dropdown
//             menu={getDropdownItems(record)}
//             trigger={["click"]}
//             placement="bottomRight"
//           >
//             <Button
//               type="text"
//               icon={<FiMoreVertical style={{ fontSize: "16px" }} />}
//               className="action-btn"
//               onClick={(e) => e.stopPropagation()}
//             />
//           </Dropdown>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <>
//       <Table
//         columns={columns}
//         dataSource={leads}
//         rowKey="id"
//         pagination={{
//           pageSize: 10,
//           showSizeChanger: true,
//           showTotal: (total) => `Total ${total} leads`,
//         }}
//         className="colorful-table"
//         onRow={(record) => ({
//           onClick: () => handleLeadClick(record),
//           style: { cursor: "pointer" },
//         })}
//       />
//       <style jsx global>{`
//         .colorful-table {
//           .ant-table {
//             border-radius: 8px;
//             overflow: hidden;

//             .ant-table-thead > tr > th {
//               background: #fafafa !important;
//               color: #1f2937;
//               font-weight: 600;
//               border-bottom: 1px solid #f0f0f0;
//               padding: 16px;

//               &::before {
//                 display: none;
//               }
//             }

//             .ant-table-tbody > tr {
//               &:hover > td {
//                 background: rgba(24, 144, 255, 0.04) !important;
//               }

//               > td {
//                 padding: 16px;
//                 transition: all 0.3s ease;
//               }

//               &:nth-child(even) {
//                 background-color: #fafafa;

//                 &:hover > td {
//                   background: rgba(24, 144, 255, 0.04) !important;
//                 }
//               }
//             }
//           }

//           .ant-table-filter-trigger {
//             color: #8c8c8c;
//             &:hover {
//               color: #1890ff;
//             }
//             &.active {
//               color: #1890ff;
//             }
//           }

//           .ant-table-filter-dropdown {
//             padding: 8px;
//             border-radius: 8px;
//             box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);

//             .ant-dropdown-menu {
//               max-height: 300px;
//               overflow-y: auto;
//               padding: 4px;
//               border-radius: 6px;
//             }

//             .ant-input {
//               border-radius: 4px;
//               &:hover,
//               &:focus {
//                 border-color: #1890ff;
//               }
//             }

//             .ant-btn {
//               border-radius: 4px;
//               &:not(:last-child) {
//                 margin-right: 8px;
//               }
//             }

//             .ant-dropdown-menu-item {
//               padding: 8px 12px;
//               margin: 2px 0;
//               border-radius: 4px;
//               font-size: 13px;

//               &:hover {
//                 background: rgba(24, 144, 255, 0.1);
//               }

//               &.ant-dropdown-menu-item-selected {
//                 color: #1890ff;
//                 font-weight: 500;
//                 background: rgba(24, 144, 255, 0.1);
//               }
//             }
//           }

//           .ant-table-pagination {
//             margin: 16px !important;

//             .ant-pagination-item-active {
//               border-color: #1890ff;
//               background: #1890ff;

//               a {
//                 color: white;
//               }
//             }
//           }
//         }

//         .action-btn {
//           width: 32px;
//           height: 32px;
//           padding: 0;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border-radius: 6px;
//           color: #6b7280;
//           transition: all 0.3s;

//           &:hover {
//             color: #1890ff;
//             background: rgba(24, 144, 255, 0.1);
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// export default CompanyLeadsList;
