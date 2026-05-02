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
  Popover,
  Pagination,
  DatePicker,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiDownload,
  FiGrid,
  FiList,
  FiHome,
  FiFilter,
  FiZap,
} from "react-icons/fi";
import "./Lead.scss";
import CreateLead from "./CreateLead";
import LeadCard from "./LeadCard";
import LeadList from "./LeadList";
import { Link, useNavigate, useLocation } from "react-router-dom";
import EditLead from "./EditLead";
import PageHeader from "../../../../components/PageHeader";
import { useDeleteLeadMutation, useGetLeadsQuery } from "./services/LeadApi";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import {
  useGetAllCountriesQuery,
  useGetAllCurrenciesQuery,
} from "../../settings/services/settingsApi";
import {
  useGetCategoriesQuery,
  useGetSourcesQuery,
  useGetStatusesQuery,
} from "../crmsystem/souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import { Switch } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

const Lead = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const loggedInUser = useSelector(selectCurrentUser);
  const [deleteLead, { isLoading: isDeleteLoading }] = useDeleteLeadMutation();
  const [dateRange, setDateRange] = useState(null);
  const { data: leads, isLoading } = useGetLeadsQuery({
    page: pagination.current,
    pageSize: viewMode === "card" ? 100 : pagination.pageSize,
    search: searchText || undefined,
    ...(dateRange?.[0] && { startDate: dateRange[0].format('YYYY-MM-DD') }),
    ...(dateRange?.[1] && { endDate: dateRange[1].format('YYYY-MM-DD') }),
  });
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: currencies = [] } = useGetAllCurrenciesQuery();
  const { data: countries = [] } = useGetAllCountriesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
  const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);
  const { data: stagesData } = useGetLeadStagesQuery();
  const [initialFormData, setInitialFormData] = useState(null);
  const [isQuickMode, setIsQuickMode] = useState(true);
  const [loading, setLoading] = useState(false);


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
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page on search
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleLeadClick = (lead) => {
    navigate(`/dashboard/crm/leads/${lead.id}`);
  };

  const handleCreate = () => {
    setSelectedLead(null);
    setInitialFormData(null); // Reset form data
    setIsModalOpen(true);
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

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = leads.data.map((lead) => ({
        "Lead Title": lead.leadTitle,
        Company: lead.company_name,
        Source:
          sourcesData?.data?.find((s) => s.id === lead.source)?.name ||
          lead.source,
        Status:
          statusesData?.data?.find((s) => s.id === lead.status)?.name ||
          lead.status,
        "Interest Level": lead.interest_level,
        "Lead Value": `${currencies?.find((c) => c.id === lead.currency)?.currencyIcon || ""
          } ${lead.leadValue || 0}`,
        "Created Date": moment(lead.createdAt).format("DD-MM-YYYY"),
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "leads_export");
          break;
        case "excel":
          exportToExcel(data, "leads_export");
          break;
        case "pdf":
          exportToPDF(data, "leads_export");
          break;
        default:
          break;
      }
      message.success(`Successfully exported as ${type.toUpperCase()}`);
    } catch (error) {
      message.error(`Failed to export: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const csvContent = [
      Object.keys(data[0]).join(","),
      ...data.map((item) =>
        Object.values(item)
          .map((value) => `"${value?.toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = (data, filename) => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.autoTable({
      head: [Object.keys(data[0])],
      body: data.map((item) => Object.values(item)),
      margin: { top: 20 },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 100 }, // Lead Title
        1: { cellWidth: 120 }, // Company
        2: { cellWidth: 80 }, // Source
        3: { cellWidth: 80 }, // Status
        4: { cellWidth: 100 }, // Interest Level
        5: { cellWidth: 80 }, // Lead Value
        6: { cellWidth: 80 }, // Created Date
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
      },
    });
    doc.save(`${filename}.pdf`);
  };


  // Add debug log for initialFormData changes
  useEffect(() => {
    console.log("Initial form data updated:", initialFormData);
  }, [initialFormData]);

  const searchContent = (
    <div className="search-popup">
      <Input
        prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
        placeholder="Search leads..."
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        value={searchText}
        className="search-input"
        autoFocus
      />
    </div>
  );

  return (
    <div className="lead-page">
      <PageHeader
        title="All Leads"
        count={leads?.pagination?.total || 0}
        subtitle={<span style={{ fontSize: '14px' }}>Manage all leads in the system</span>}
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
            title: `All Leads (${leads?.pagination?.total || 0})`,
          },
        ]}
        searchText={searchText}
        onSearch={handleSearch}
        searchPlaceholder="Search leads..."
        viewMode={viewMode}
        onViewChange={setViewMode}
        onAdd={handleCreate}
        addText="Add Lead"
        isQuickMode={isQuickMode}
        onQuickModeToggle={setIsQuickMode}
        showQuickMode={true}
        mobileSearchContent={searchContent}
        isSearchVisible={isSearchVisible}
        onSearchVisibleChange={setIsSearchVisible}
        exportMenu={{
          items: [
            {
              key: 'csv',
              label: 'Export as CSV',
              icon: <FiDownload />,
              onClick: () => handleExport('csv'),
            },
            {
              key: 'excel',
              label: 'Export as Excel',
              icon: <FiDownload />,
              onClick: () => handleExport('excel'),
            },
            {
              key: 'pdf',
              label: 'Export as PDF',
              icon: <FiDownload />,
              onClick: () => handleExport('pdf'),
            },
          ]
        }}
        extraActions={
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            style={{
              borderRadius: '8px',
              height: '30px',
              width: '260px'
            }}
          />
        }
      />

      <Card className="lead-content">
        {viewMode === "table" ? (
          <LeadList
            leads={leads}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onLeadClick={handleLeadClick}
            loading={isLoading}
            pagination={pagination}
            onTableChange={handleTableChange}
          />
        ) : (
          <>
            <LeadCard
              leads={leads}
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
              loading={isLoading}
              pagination={pagination}
              onTableChange={handleTableChange}
            />
            {leads?.pagination?.total > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '6px 0',
              }}>
                <Pagination
                  current={pagination.current}
                  pageSize={viewMode === "card" ? 100 : pagination.pageSize}
                  total={leads?.pagination?.total || 0}
                  onChange={(page, pageSize) => handleTableChange({ current: page, pageSize })}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <CreateLead
        open={isModalOpen}
        pipelines={pipelines}
        currencies={currencies}
        countries={countries}
        sourcesData={sourcesData}
        statusesData={statusesData}
        categoriesData={categoriesData}
        isQuickMode={isQuickMode}
        onCancel={() => {
          setIsModalOpen(false);
          setInitialFormData(null);
        }}
        initialValues={initialFormData}
      />
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

export default Lead;
