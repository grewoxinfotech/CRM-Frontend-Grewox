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
  Tabs,
  Badge,
  Drawer,
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
import ImportLeadsModal from "./import/ImportLeadsModal";
import PageHeader from "../../../../components/PageHeader";
import { useDeleteLeadMutation, useGetLeadsQuery, useGetMetaFilterValuesQuery } from "./services/LeadApi";
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
import { useGetUsersQuery } from "../../user-management/users/services/userApi";
import { useFeatureAccess } from "../../../../hooks/useFeatureAccess";

const { Title, Text } = Typography;
const { Option } = Select;

const Lead = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const loggedInUser = useSelector(selectCurrentUser);
  const [deleteLead, { isLoading: isDeleteLoading }] = useDeleteLeadMutation();
  const [dateRange, setDateRange] = useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const { data: leads, isLoading } = useGetLeadsQuery({
    page: 1,
    pageSize: 1000, // Fetch more for frontend filtering
    search: searchText || undefined,
    ...(dateRange?.[0] && { startDate: dateRange[0].format('YYYY-MM-DD') }),
    ...(dateRange?.[1] && { endDate: dateRange[1].format('YYYY-MM-DD') }),
  });

  const allLeads = leads?.data || [];

  const filteredLeads = allLeads.filter(lead => {
    const leadDate = moment(lead.createdAt).startOf('day');
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');

    let matchesTab = true;
    if (activeTab === 'today') {
      matchesTab = leadDate.isSame(today, 'day');
    } else if (activeTab === 'yesterday') {
      matchesTab = leadDate.isSame(yesterday, 'day');
    } else if (activeTab === 'converted') {
      matchesTab = lead.is_converted === true;
    }

    if (!matchesTab) return false;

    // Advanced filters
    if (advancedFilters.source && lead.source !== advancedFilters.source) return false;
    if (advancedFilters.status && lead.status !== advancedFilters.status) return false;
    if (advancedFilters.interest_level && lead.interest_level !== advancedFilters.interest_level) return false;
    if (advancedFilters.campaign_name && !lead.campaign_name?.toLowerCase().includes(advancedFilters.campaign_name.toLowerCase())) return false;
    if (advancedFilters.adset_name && !lead.adset_name?.toLowerCase().includes(advancedFilters.adset_name.toLowerCase())) return false;
    if (advancedFilters.ad_name && !lead.ad_name?.toLowerCase().includes(advancedFilters.ad_name.toLowerCase())) return false;
    if (advancedFilters.owner && lead.Creator?.id !== advancedFilters.owner) return false;
    if (advancedFilters.assignee) {
        let assignedIds = [];
        try {
          let parsed = lead.lead_members;
          if (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
              if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            } catch (e) { parsed = []; }
          }
          assignedIds = parsed?.lead_members || parsed?.assignedusers || (Array.isArray(parsed) ? parsed : []);
        } catch (e) { assignedIds = []; }
        if (!assignedIds.includes(advancedFilters.assignee)) return false;
    }

    return true;
  });
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: currencies = [] } = useGetAllCurrenciesQuery();
  const { data: countries = [] } = useGetAllCountriesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
  const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);
  const { data: stagesData } = useGetLeadStagesQuery();
  const { data: usersResponse } = useGetUsersQuery();
  const { data: metaFilters } = useGetMetaFilterValuesQuery();
  const [initialFormData, setInitialFormData] = useState(null);
  const [isQuickMode, setIsQuickMode] = useState(true);
  const [loading, setLoading] = useState(false);


  // Handle automatic form opening
  useEffect(() => {
    if (location.state?.openCreateForm) {
      const submissionData = location.state.submissionData || {};
      
      // Smart helper to find values by keywords OR value patterns
      const extractValue = (keywords, pattern = null) => {
        // 1. Try keyword matching on keys
        const key = Object.keys(submissionData).find(k => 
          keywords.some(kw => k.toLowerCase().includes(kw.toLowerCase()))
        );
        if (key && submissionData[key]) return submissionData[key];

        // 2. If pattern provided, try matching values
        if (pattern) {
          const value = Object.values(submissionData).find(v => 
            v && typeof v === 'string' && pattern.test(v.trim())
          );
          if (value) return value;
        }
        return null;
      };

      // Patterns
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)\d{10}\s*,?$/;

      const fullName = extractValue(['full name', 'first name', 'name', 'participant', 'customer', 'naam', 'user', 'title', 'lead']);
      const email = extractValue(['email', 'mail'], emailPattern);
      const phone = extractValue(['phone', 'mobile', 'contact', 'whatsapp', 'number', 'tele'], phonePattern);

      // Split name if possible
      let firstName = fullName;
      let lastName = '';
      if (fullName && typeof fullName === 'string') {
        const parts = fullName.trim().split(/\s+/);
        if (parts.length > 1) {
          firstName = parts[0];
          lastName = parts.slice(1).join(' ');
        }
      }

      // Pre-fill the form data
      const formData = {
        inquiry_id: location.state.formSubmissionId,
        leadTitle: fullName || `Lead from Form #${location.state.formSubmissionId}`,
        firstName: firstName,
        lastName: lastName,
        email: email,
        telephone: phone,
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
      if (!filteredLeads || filteredLeads.length === 0) {
        message.warning("No leads available to export with current filters.");
        setLoading(false);
        return;
      }

      const data = filteredLeads.map((lead) => ({
        "Lead Title": lead.leadTitle,
        Company: lead.Company?.company_name || lead.company_name || "N/A",
        Source:
          sourcesData?.data?.find((s) => s.id === lead.source)?.name ||
          lead.source || "N/A",
        Status:
          statusesData?.data?.find((s) => s.id === lead.status)?.name ||
          lead.status || "N/A",
        "Interest Level": lead.interest_level || "N/A",
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

  const { hasFeature } = useFeatureAccess();

  return (
    <div className="lead-page">
      <PageHeader
        title="All Leads"
        count={filteredLeads.length}
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
        addText="Create Lead"
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
          <Space size={12}>
            <Button
              icon={hasFeature('bulk_operations') ? <FiDownload style={{ transform: 'rotate(180deg)' }} /> : <span style={{ marginRight: '4px' }}>🔒</span>}
              onClick={() => {
                if (hasFeature('bulk_operations')) {
                  setIsImportModalOpen(true);
                } else {
                  message.info("Upgrade your plan to unlock the Bulk Import feature!");
                }
              }}
              style={{ 
                borderRadius: '8px', 
                height: '30px',
                opacity: hasFeature('bulk_operations') ? 1 : 0.7,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Import
            </Button>
          </Space>
        }
      />

      <Card className="lead-content">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: '16px', padding: '0 16px' }}
          tabBarExtraContent={
            <Button
              icon={<FiFilter />}
              onClick={() => setIsFilterDrawerOpen(true)}
              style={{ borderRadius: '8px', height: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
              type={Object.keys(advancedFilters).filter(k => advancedFilters[k]).length > 0 ? "primary" : "default"}
            >
              Filter {Object.keys(advancedFilters).filter(k => advancedFilters[k]).length > 0 && `(${Object.keys(advancedFilters).filter(k => advancedFilters[k]).length})`}
            </Button>
          }
          items={[
            {
              key: 'all',
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>All</span>
                  <Badge count={allLeads.length} style={{ backgroundColor: '#d9d9d9' }} />
                </div>
              ),
            },
            {
              key: 'today',
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Today</span>
                  <Badge count={allLeads.filter(l => moment(l.createdAt).isSame(moment(), 'day')).length} style={{ backgroundColor: '#1890ff' }} />
                </div>
              ),
            },
            {
              key: 'yesterday',
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Yesterday</span>
                  <Badge count={allLeads.filter(l => moment(l.createdAt).isSame(moment().subtract(1, 'day'), 'day')).length} style={{ backgroundColor: '#faad14' }} />
                </div>
              ),
            },
            {
              key: 'converted',
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Converted</span>
                  <Badge count={allLeads.filter(l => l.is_converted === true).length} style={{ backgroundColor: '#52c41a' }} />
                </div>
              ),
            },
          ]}
        />
        {viewMode === "table" ? (
          <LeadList
            leads={{ ...leads, data: filteredLeads, pagination: { ...leads?.pagination, total: filteredLeads.length } }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onLeadClick={handleLeadClick}
            loading={isLoading}
            pagination={pagination}
            onTableChange={handleTableChange}
            users={usersResponse?.data || []}
          />
        ) : (
          <>
            <LeadCard
              leads={{ ...leads, data: filteredLeads }}
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
              users={usersResponse?.data || []}
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

      <ImportLeadsModal
        open={isImportModalOpen}
        onCancel={() => setIsImportModalOpen(false)}
      />

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

      <Drawer
        title="Advanced Filters"
        placement="right"
        onClose={() => setIsFilterDrawerOpen(false)}
        open={isFilterDrawerOpen}
        extra={
          <Button onClick={() => setAdvancedFilters({})}>Clear All</Button>
        }
      >
        <Form layout="vertical">
          <Form.Item label="Date Range">
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates);
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="Lead Source">
            <Select
              allowClear
              placeholder="Select Source"
              value={advancedFilters.source}
              onChange={(val) => setAdvancedFilters(prev => ({ ...prev, source: val }))}
            >
              {sourcesData?.data?.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Status">
            <Select
              allowClear
              placeholder="Select Status"
              value={advancedFilters.status}
              onChange={(val) => setAdvancedFilters(prev => ({ ...prev, status: val }))}
            >
              {statusesData?.data?.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Interest Level">
            <Select
              allowClear
              placeholder="Select Interest Level"
              value={advancedFilters.interest_level}
              onChange={(val) => setAdvancedFilters(prev => ({ ...prev, interest_level: val }))}
            >
              <Option value="high">High Interest</Option>
              <Option value="medium">Medium Interest</Option>
              <Option value="low">Low Interest</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Lead Owner">
            <Select
              allowClear
              placeholder="Select Owner"
              value={advancedFilters.owner}
              onChange={(val) => setAdvancedFilters(prev => ({ ...prev, owner: val }))}
            >
              {usersResponse?.data?.map(u => <Option key={u.id} value={u.id}>{`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Assignee">
            <Select
              allowClear
              placeholder="Select Assignee"
              value={advancedFilters.assignee}
              onChange={(val) => setAdvancedFilters(prev => ({ ...prev, assignee: val }))}
            >
              {usersResponse?.data?.map(u => <Option key={u.id} value={u.id}>{`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item label="Campaign Name">
            <Select 
              allowClear
              placeholder="Select Campaign" 
              value={advancedFilters.campaign_name}
              onChange={(val) => setAdvancedFilters(prev => ({ ...prev, campaign_name: val }))}
            >
              {metaFilters?.message?.campaigns?.map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Ad Set Name">
            <Select 
              allowClear
              placeholder="Select Ad Set" 
              value={advancedFilters.adset_name}
              onChange={(val) => setAdvancedFilters(prev => ({ ...prev, adset_name: val }))}
            >
              {metaFilters?.message?.adsets?.map(a => <Option key={a} value={a}>{a}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Ad Name">
            <Select 
              allowClear
              placeholder="Select Ad" 
              value={advancedFilters.ad_name}
              onChange={(val) => setAdvancedFilters(prev => ({ ...prev, ad_name: val }))}
            >
              {metaFilters?.message?.ads?.map(a => <Option key={a} value={a}>{a}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Lead;
