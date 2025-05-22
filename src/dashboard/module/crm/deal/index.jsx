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
  Row,
  Col,
  Popover,
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
import { Link, useNavigate } from "react-router-dom";
import "./Deal.scss";
import CreateDeal from "./CreateDeal";
import DealCard from "./DealCard";
import DealList from "./DealList";
import EditDeal from "./EditDeal";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useDeleteDealMutation, useGetDealsQuery } from "./services/DealApi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

const { Title, Text } = Typography;

const Deal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const navigate = useNavigate();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: dealStages = [] } = useGetLeadStagesQuery();
  const [deleteDeal] = useDeleteDealMutation();
  const { data: deals, isLoading } = useGetDealsQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    search: searchText,
  });

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

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleEdit = (deal) => {
    setSelectedDeal(deal);
    setIsEditModalOpen(true);
  };

  const handleDelete = (deal) => {
    Modal.confirm({
      title: "Delete Deal",
      content: "Are you sure you want to delete this deal?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteDeal(deal.id).unwrap();
          message.success("Deal deleted successfully");
        } catch (error) {
          message.error("Failed to delete deal");
        }
      },
    });
  };

  const handleDealClick = (deal) => {
    navigate(`/dashboard/crm/deals/${deal.id}`);
  };

  const handleView = (deal) => {
    setSelectedDeal(deal);
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = deals?.data?.map((deal) => ({
        "Deal Name": deal.dealTitle,
        Company: deal.company_name,
        Source:
          sourcesData?.data?.find((s) => s.id === deal.source)?.name ||
          deal.source,
        Stage:
          dealStages?.find((s) => s.id === deal.stage)?.stageName || deal.stage,
        Value: `${currencies?.find((c) => c.id === deal.currency)?.currencyIcon || ""
          } ${deal.value || 0}`,
        Status:
          deal.is_won === true
            ? "Won"
            : deal.is_won === false
              ? "Lost"
              : "Pending",
        "Created Date": moment(deal.createdAt).format("DD-MM-YYYY"),
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "deals_export");
          break;
        case "excel":
          exportToExcel(data, "deals_export");
          break;
        case "pdf":
          exportToPDF(data, "deals_export");
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
    XLSX.utils.book_append_sheet(wb, ws, "Deals");
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
        0: { cellWidth: 100 }, // Deal Name
        1: { cellWidth: 120 }, // Company
        2: { cellWidth: 80 }, // Source
        3: { cellWidth: 80 }, // Stage
        4: { cellWidth: 80 }, // Value
        5: { cellWidth: 60 }, // Status
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

  const exportMenu = (
    <Menu>
      <Menu.Item
        key="csv"
        icon={<FiDownload />}
        onClick={() => handleExport("csv")}
      >
        Export as CSV
      </Menu.Item>
      <Menu.Item
        key="excel"
        icon={<FiDownload />}
        onClick={() => handleExport("excel")}
      >
        Export as Excel
      </Menu.Item>
      <Menu.Item
        key="pdf"
        icon={<FiDownload />}
        onClick={() => handleExport("pdf")}
      >
        Export as PDF
      </Menu.Item>
    </Menu>
  );

  const searchContent = (
    <div className="search-popup">
      <Input
        prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
        placeholder="Search deals..."
        allowClear
        onChange={(e) => handleSearch(e.target.value)}
        value={searchText}
        className="search-input"
        autoFocus
      />
    </div>
  );

  return (
    <div className="deal-page">
      <div className="page-breadcrumb" style={{ paddingTop: "0px" }}>
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
        <div className="header-content">
          <div className="page-title">
            <div className="title-row">
              <div className="page-title-content">
                <Title level={2}>Deals</Title>
                <Text type="secondary">Manage all deals in the system</Text>
              </div>
              <div className="header-actions">
                <div className="desktop-actions">
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
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="search-container">
                      <Input
                        prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
                        placeholder="Search deals..."
                        allowClear
                        onChange={(e) => handleSearch(e.target.value)}
                        value={searchText}
                        className="search-input"
                      />
                      <Popover
                        content={searchContent}
                        trigger="click"
                        open={isSearchVisible}
                        onOpenChange={setIsSearchVisible}
                        placement="bottomRight"
                        className="mobile-search-popover"
                      >
                        <Button
                          className="search-icon-button"
                          icon={<FiSearch size={16} />}
                        />
                      </Popover>
                    </div>
                    <Dropdown overlay={exportMenu} trigger={["click"]}>
                      <Button className="export-button">
                        <FiDownload size={16} />
                        <span className="button-text">Export</span>
                      </Button>
                    </Dropdown>
                    <Button
                      type="primary"
                      icon={<FiPlus size={16} />}
                      onClick={handleCreate}
                      className="add-button"
                    >
                      <span className="button-text">Add Deal</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="deal-content">
        {viewMode === "table" ? (
          <DealList
            deals={deals?.data || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onDealClick={handleDealClick}
            loading={isLoading}
            pagination={deals?.pagination}
            onTableChange={handleTableChange}
          />
        ) : (
          <DealCard
            deals={deals?.data || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onDealClick={handleDealClick}
            loading={isLoading}
            pagination={deals?.pagination}
            onTableChange={handleTableChange}
          />
        )}
      </Card>

      <CreateDeal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        pipelines={pipelines}
        dealStages={dealStages}
      />

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

export default Deal;
