import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Dropdown,
  Menu,
  Space,
  Breadcrumb,
  Modal,
  message,
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
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../../deal/Deal.scss";
import CreateDeal from "../../../deal/CreateDeal";
import DealCard from "../../../deal/DealCard";
import DealList from "../../../deal/DealList";
import EditDeal from "../../../deal/EditDeal";
import { useGetPipelinesQuery } from "../../../crmsystem/pipeline/services/pipelineApi";
import { useGetLeadStagesQuery } from "../../../crmsystem/leadstage/services/leadStageApi";
import {
  useDeleteDealMutation,
  useGetDealsQuery,
} from "../../../deal/services/dealApi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

const { Title, Text } = Typography;

const CompanyDealList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Fetch pipelines and deal stages
  const { data: pipelines = [] } = useGetPipelinesQuery({
    page: 1,
    pageSize: -1,
    search: ''
  });
  const { data: dealStages = [] } = useGetLeadStagesQuery({
    page: 1,
    pageSize: -1,
    search: ''
  });
  const [deleteDeal, { isLoading: isDeleting }] = useDeleteDealMutation();
  const { data: dataaa, isLoading, error } = useGetDealsQuery({
    page: 1,
    pageSize: -1,
    search: ''
  });

  const dataa = dataaa?.data;

  const idd = useParams();
  const id = idd.accountId;

  const data = dataa?.filter((deal) => deal.company_id === id);

  // Filter deals based on search text
  const filteredDeals = React.useMemo(() => {
    if (!data) return [];
    if (!searchText) return data;

    const searchLower = searchText.toLowerCase();
    return data.filter(
      (deal) =>
        deal.dealTitle?.toLowerCase().includes(searchLower) ||
        deal.company_name?.toLowerCase().includes(searchLower)
    );
  }, [data, searchText]);

  const handleDealClick = (deal) => {
    navigate(`/dashboard/crm/deals/${deal.id}`);
  };

  const handleCreate = () => {
    setSelectedDeal(null);
    setIsModalOpen(true);
  };

  const handleEdit = (deal) => {
    setSelectedDeal(deal);
    setIsEditModalOpen(true);
  };

  const handleDelete = (deal) => {
    Modal.confirm({
      title: "Delete Deal",
      content:
        "Are you sure you want to delete this deal? This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          await deleteDeal(deal.id).unwrap();
          message.success("Deal deleted successfully");
        } catch (error) {
          console.error("Delete Error:", error);
          message.error(error?.data?.message || "Failed to delete deal");
        }
      },
    });
  };

  const handleView = (deal) => {
    setSelectedDeal(deal);
  };

  return (
    <div className="deal-page">
      {/* <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Deal</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="header-left">
          <h2>Deals</h2>
          <Text className="subtitle">Manage your deals</Text>
        </div>

        <div className="header-right">
          <Input
            prefix={<FiSearch style={{ color: "#9CA3AF" }} />}
            placeholder="Search deals..."
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <div className="view-buttons">
            <div className="view-toggle">
              <Button
                type={viewMode === "table" ? "primary" : "default"}
                icon={<FiList />}
                onClick={() => setViewMode("table")}
              />
              <Button
                type={viewMode === "card" ? "primary" : "default"}
                icon={<FiGrid />}
                onClick={() => setViewMode("card")}
              />
            </div>
          </div>
          <Dropdown menu={exportMenu} trigger={["click"]}>
            <Button>
              <FiDownload /> Export <FiChevronDown />
            </Button>
          </Dropdown>
          <Button type="primary" icon={<FiPlus />} onClick={handleCreate}>
            Add Deal
          </Button>
        </div>
      </div> */}

      <Card className="deal-content">
        {viewMode === "card" ? (
          <DealCard
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onDealClick={handleDealClick}
            deals={filteredDeals}
          />
        ) : (
          <DealList
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onDealClick={handleDealClick}
            deals={filteredDeals}
            searchText={searchText}
          />
        )}
      </Card>

      {/* <CreateDeal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        pipelines={pipelines}
        dealStages={dealStages}
      /> */}

      <EditDeal
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedDeal(null);
        }}
        initialValues={selectedDeal}
        pipelines={pipelines}
        dealStages={dealStages}
      />

      {/* <CompanyDealList
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onDealClick={handleDealClick}
                deleteDeal={deleteDeal}
            /> */}
    </div>
  );
};

export default CompanyDealList;

// import React from "react";
// import { Table, Avatar, Dropdown, Button, message, Tag, Typography, Space, Tooltip } from "antd";
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
//   FiArrowRight,
//   FiDollarSign,
//   FiBriefcase,
//   FiX
// } from "react-icons/fi";

// import { useGetLeadStagesQuery } from "../../../crmsystem/leadstage/services/leadStageApi";
// import { useGetPipelinesQuery } from "../../../crmsystem/pipeline/services/pipelineApi";
// import { useGetLabelsQuery, useGetSourcesQuery } from "../../../crmsystem/souce/services/SourceApi";
// import { useSelector } from "react-redux";
// import { selectCurrentUser } from "../../../../../../auth/services/authSlice";
// import { useGetAllCurrenciesQuery } from '../../../../../module/settings/services/settingsApi';
// import { useGetDealsQuery } from "../../../deal/services/dealApi";
// import { useNavigate } from "react-router-dom";

// const { Text } = Typography;

// const CompanyDealList = ({ onEdit, deleteDeal, company }) => {
//   const loggedInUser = useSelector(selectCurrentUser);
//   const { data: dealStages = [] } = useGetLeadStagesQuery();
//   const { data: pipelines = [] } = useGetPipelinesQuery();
//   const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
//   const { data: labelsData } = useGetLabelsQuery(loggedInUser?.id);
//   const [filterStatus, setFilterStatus] = React.useState('all');
//   const { data: currencies = [] } = useGetAllCurrenciesQuery();
//   const { data: dealdata, isLoading, error } = useGetDealsQuery();
//   const navigate = useNavigate();

//   const sources = sourcesData?.data || [];
//   const labels = labelsData?.data || [];

//   // Get all deals and filter by company_id
//   const allDeals = Array.isArray(dealdata) ? dealdata : [];
//   const deals = allDeals.filter(deal => deal.company_id === company?.id);

//   // Calculate won deals count based on is_won flag for filtered deals
//   const wonDealsCount = deals.filter(deal => deal.is_won).length;

//   const filterButtons = [
//     { id: 'all', name: 'All Deals', count: deals.length },
//     {
//       id: 'pending',
//       name: 'Pending',
//       count: deals.filter(deal => deal.is_won === null).length,
//       icon: <FiTarget />
//     },
//     {
//       id: 'won',
//       name: 'Won',
//       count: deals.filter(deal => deal.is_won === true).length,
//       icon: <FiTarget />
//     },
//     {
//       id: 'lost',
//       name: 'Lost',
//       count: deals.filter(deal => deal.is_won === false).length,
//       icon: <FiTarget />
//     }
//   ];

//   // Filter deals based on status and is_won
//   const filteredDeals = React.useMemo(() => {
//     const companyDeals = deals.filter(deal => deal.company_id === company?.id);

//     switch (filterStatus) {
//       case 'won':
//         return companyDeals.filter(deal => deal.is_won === true);
//       case 'lost':
//         return companyDeals.filter(deal => deal.is_won === false);
//       case 'pending':
//         return companyDeals.filter(deal => deal.is_won === null);
//       default:
//         return companyDeals;
//     }
//   }, [deals, filterStatus, company]);

//   const handleDelete = async (record) => {
//     try {
//       await deleteDeal(record.id).unwrap();
//       message.success("Deal deleted successfully");
//     } catch (error) {
//       message.error("Failed to delete deal: " + (error.data?.message || "Unknown error"));
//     }
//   };

//   const getStatusColor = (status, is_won) => {
//     // First check is_won flag
//     if (is_won === true) {
//         return {
//             bg: '#dcfce7',
//             color: '#15803d',
//             icon: <FiTarget />,
//             text: 'Won'
//         };
//     } else if (is_won === false) {
//         return {
//             bg: '#fee2e2',
//             color: '#b91c1c',
//             icon: <FiTarget />,
//             text: 'Lost'
//         };
//     }

//     // Default to pending if is_won is null
//     return {
//         bg: '#dbeafe',
//         color: '#1e40af',
//         icon: <FiTarget />,
//         text: 'Pending'
//     };
//   };

//   const handleDealClick = (deal) => {
//     navigate(`/dashboard/crm/deals/${deal.id}`);
// };

//   const formatCurrency = (value, currencyId) => {
//     const currencyDetails = currencies.find(c => c.id === currencyId);
//     if (!currencyDetails) return `${value}`;

//     return new Intl.NumberFormat('en-US', {
//       style: 'decimal',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(value).replace(/^/, currencyDetails.currencyIcon + ' ');
//   };

//   const getDropdownItems = (record) => ({
//     items: [
//       {
//         key: "view",
//         icon: <FiEye style={{ color: '#1890ff' }} />,
//         label: (
//           <Text style={{ color: '#1890ff', fontWeight: '500' }}>
//             Overview
//           </Text>
//         ),
//         onClick: () => handleDealClick(record),
//       },
//       {
//         key: "edit",
//         icon: <FiEdit2 style={{ color: '#52c41a' }} />,
//         label: (
//           <Text style={{ color: '#52c41a', fontWeight: '500' }}>
//             Edit Deal
//           </Text>
//         ),
//         onClick: () => onEdit(record),
//       },
//       {
//         key: "delete",
//         icon: <FiTrash2 style={{ color: '#ff4d4f' }} />,
//         label: (
//           <Text style={{ color: '#ff4d4f', fontWeight: '500' }}>
//             Delete Deal
//           </Text>
//         ),
//         onClick: () => handleDelete(record),
//       }
//     ],
//   });

//   const columns = [
//     {
//       title: "Deal Name",
//       dataIndex: "dealTitle",
//       key: "dealTitle",
//       render: (text, record) => (
//         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//           <Avatar style={{
//             backgroundColor: record.status?.toLowerCase() === 'won' ? '#52c41a' : '#1890ff',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center'
//           }}>
//             {text?.[0]?.toUpperCase() || 'D'}
//           </Avatar>
//           <div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//               <Text strong style={{ fontSize: '14px' }}>
//                 {text || 'Untitled Deal'}
//               </Text>
//               {record.status?.toLowerCase() === 'won' && (
//                 <FiCheck style={{ color: '#52c41a', fontSize: '16px' }} />
//               )}
//             </div>
//             <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
//               {record.company_name || ''}
//             </Text>
//           </div>
//         </div>
//       ),
//       width: '25%',
//     },
//     {
//       title: "Source",
//       dataIndex: "source",
//       key: "source",
//       render: (sourceId) => {
//         const source = sources.find(s => s.id === sourceId) || {};
//         const className = `source-${source.name?.toLowerCase().replace(/\s+/g, '')}`;
//         return (
//           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//             <FiLink style={{
//               fontSize: '14px',
//               color: source.color || '#64748b'
//             }} />
//             <Text style={{
//               fontSize: '13px',
//               fontWeight: '500',
//               color: source.color || '#64748b'
//             }}>
//               {source.name || 'Unknown Source'}
//             </Text>
//           </div>
//         );
//       },
//     },
//     {
//       title: "Stage",
//       dataIndex: "stage",
//       key: "stage",
//       render: (stageId) => {
//         const stage = dealStages.find(s => s.id === stageId);
//         return (
//           <Tag style={{
//             textTransform: 'capitalize',
//             padding: '4px 12px',
//             borderRadius: '4px',
//             fontSize: '13px',
//             fontWeight: '500',
//             color: 'white',
//             background: stage?.color || '#1890ff'
//           }}>
//             {stage?.stageName || 'Unknown Stage'}
//           </Tag>
//         );
//       },
//     },
//     {
//       title: "Value",
//       key: "value",
//       render: (_, record) => (
//         <Text strong style={{
//           fontSize: '14px',
//           color: '#52c41a'
//         }}>
//           {formatCurrency(record.value || 0, record.currency)}
//         </Text>
//       ),
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//       render: (status, record) => {
//         const statusConfig = getStatusColor(status, record.is_won);
//         return (
//           <Tag style={{
//             margin: 0,
//             padding: '4px 11px',
//             fontSize: '13px',
//             borderRadius: '12px',
//             background: statusConfig.bg,
//             color: statusConfig.color,
//             border: 'none',
//           }}>
//             {statusConfig.text}
//           </Tag>
//         );
//       },
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       width: 80,
//       align: "center",
//       render: (_, record) => (
//         <div onClick={e => e.stopPropagation()}>
//           <Dropdown
//             menu={getDropdownItems(record)}
//             trigger={["click"]}
//             placement="bottomRight"
//           >
//             <Button
//               type="text"
//               icon={<FiMoreVertical style={{ fontSize: '16px' }} />}
//               className="action-btn"
//               onClick={e => e.stopPropagation()}
//             />
//           </Dropdown>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <>
//       <div style={{
//         marginBottom: '8px',
//         display: 'flex',
//         gap: '8px',
//         alignItems: 'center',
//         padding: '0 12px'
//       }}>
//         <Text strong style={{ fontSize: '13px', color: '#374151' }}>View:</Text>
//         <div style={{
//           display: 'flex',
//           gap: '6px'
//         }}>
//           {filterButtons.map(filter => (
//             <Button
//               key={filter.id}
//               type={filterStatus === filter.id ? "primary" : "default"}
//               onClick={() => setFilterStatus(filter.id)}
//               style={{
//                 borderRadius: '4px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '4px',
//                 padding: '3px 10px',
//                 height: '28px',
//                 fontSize: '12px'
//               }}
//             >
//               {filter.icon}
//               {filter.name} ({filter.count})
//             </Button>
//           ))}
//         </div>
//       </div>

//       <Table
//         columns={columns}
//         dataSource={filteredDeals}
//         rowKey="id"
//         // loading={isLoading}
//         pagination={{
//           pageSize: 10,
//           showSizeChanger: true,
//           showTotal: (total) => `Total ${total} deals`,
//         }}
//         className="colorful-table"
//         onRow={(record) => ({
//             onClick: () => handleDealClick(record),
//           style: { cursor: 'pointer' }
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

//         // Source colors
//         .source-social { color: #1890ff !important; }
//         .source-partner { color: #52c41a !important; }
//         .source-referral { color: #722ed1 !important; }
//         .source-website { color: #13c2c2 !important; }
//         .source-event { color: #fa8c16 !important; }

//         .action-btn {
//           width: 32px;
//           height: 32px;
//           padding: 0;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border-radius: 6px;
//           color: #6B7280;
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

// export default CompanyDealList;
