import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  message,
  Input,
  Dropdown,
  Menu,
  Breadcrumb,
  Alert,
  DatePicker,
  Popover,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiHome,
  FiChevronDown,
  FiCalendar,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import BillingList from "./BillingList";
import CreateBilling from "./CreateBilling";
import EditBilling from "./EditBilling";
import "./billing.scss";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import {
  useGetBillingsQuery,
  useDeleteBillingMutation,
  useCreateBillingMutation,
} from "./services/billingApi";
import { useGetVendorsQuery } from "./services/billingApi";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const getCompanyId = (state) => {
  const user = state.auth.user;
  return user?.companyId || user?.company_id || user?.id;
};

const Billing = () => {
  const entireState = useSelector((state) => state);
  const loggedInUser = useSelector((state) => state.auth.user);
  const companyId = useSelector(getCompanyId);

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [createBilling] = useCreateBillingMutation();
  const [deleteBilling] = useDeleteBillingMutation();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exportLoading, setExportLoading] = useState(false);
  const searchInputRef = useRef(null);

  const { data: billingsData, isLoading, error } = useGetBillingsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchText,
    ...(dateRange?.length === 2 && {
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD')
    })
  });

  // console.log("billingsData", billingsData);
  const { data: vendorsData } = useGetVendorsQuery();

  // Create a map of vendor IDs to vendor names
  const vendorMap = React.useMemo(() => {
    if (!vendorsData?.data) return {};
    return vendorsData.data.reduce((acc, vendor) => {
      acc[vendor.id] = vendor.name;
      return acc;
    }, {});
  }, [vendorsData]);

  // Update pagination when data changes
  useEffect(() => {
    if (billingsData?.pagination) {
      setPagination(prev => ({
        ...prev,
        total: billingsData.pagination.total
      }));
    }
  }, [billingsData]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, dateRange]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  useEffect(() => {
    if (!companyId) {
      console.warn("No company ID found in user data");
    }
  }, [companyId]);

  const handleEdit = (record) => {
    setSelectedBilling(record);
    setIsEditModalVisible(true);
  };

  const handleView = (record) => {
    console.log("View billing:", record);
  };

  const handleDelete = async (recordOrIds) => {
    try {
      const ids = Array.isArray(recordOrIds) ? recordOrIds : [recordOrIds.id || recordOrIds._id];

      if (!ids.length || ids.some(id => !id)) {
        throw new Error("Invalid bill ID(s)");
      }

      Modal.confirm({
        title: `Are you sure you want to delete ${ids.length > 1 ? 'these bills' : 'this bill'}?`,
        content: "This action cannot be undone.",
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            const promises = ids.map(id => deleteBilling(id).unwrap());
            await Promise.all(promises);
            message.success(`Successfully deleted ${ids.length} bill${ids.length > 1 ? 's' : ''}`);
            billingsData.refetch();
          } catch (error) {
            console.error("Delete Error:", error);
            message.error(error.data?.message || error.message || "Failed to delete bill(s)");
          }
        },
      });
    } catch (error) {
      console.error("Delete Error:", error);
      message.error(error.message || "Failed to delete bill(s)");
    }
  };

  const handleExport = async (type) => {
    try {
      setExportLoading(true);
      const data =
        billingsData?.data?.map((billing) => {
          // Parse items to get tax name
          const items =
            typeof billing.items === "string"
              ? JSON.parse(billing.items)
              : billing.items;
          const taxName = items?.[0]?.taxName || "";

          return {
            "Bill Number": billing.billNumber,
            Vendor: vendorMap[billing.vendor] || billing.vendor,
            "Bill Date": billing.billDate,
            Total: billing.total,
            Status: billing.status,
            Description: billing.discription,
            "Sub Total": billing.subTotal,
            Discount: billing.discount,
            Tax: taxName
              ? `${taxName} (${billing.tax}%)`
              : billing.tax
                ? `${billing.tax}%`
                : "0%",
          };
        }) || [];

      // Remove any empty or null values and ensure proper order
      const orderedData = data.map((row) => ({
        "Bill Number": row["Bill Number"] || "",
        Vendor: row["Vendor"] || "",
        "Bill Date": row["Bill Date"] || "",
        Total: row["Total"] || "",
        Status: row["Status"] || "",
        Description: row["Description"] || "",
        "Sub Total": row["Sub Total"] || "",
        Discount: row["Discount"] || "",
        Tax: row["Tax"] || "0%",
      }));

      switch (type) {
        case "csv":
          exportToCSV(orderedData, "billing_export");
          break;
        case "excel":
          exportToExcel(orderedData, "billing_export");
          break;
        case "pdf":
          exportToPDF(orderedData, "billing_export");
          break;
        default:
          break;
      }
      message.success(`Successfully exported as ${type.toUpperCase()}`);
    } catch (error) {
      message.error(`Failed to export: ${error.message}`);
    } finally {
      setExportLoading(false);
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
    XLSX.utils.book_append_sheet(wb, ws, "Billings");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = (data, filename) => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.autoTable({
      head: [Object.keys(data[0])],
      body: data.map((item) => Object.values(item)),
      margin: { top: 20 },
      styles: { fontSize: 8 },
    });
    doc.save(`${filename}.pdf`);
  };

  const exportMenu = (
    <Menu>
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

  const handleCreateBilling = async (formData) => {
    try {
      if (!companyId) {
        message.error("Company ID not found");
        return;
      }

      const response = await createBilling({
        id: companyId,
        data: formData,
      });

      if (response.data?.success) {
        setIsCreateModalVisible(false);
        billingsData.refetch();
      } else {
        message.error(response.error?.data?.message || "Failed to create bill");
      }
    } catch (error) {
      message.error("Failed to create bill");
      console.error("Create billing error:", error);
    }
  };

  const searchContent = (
    <div className="search-popup">
      <Input
        prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
        placeholder="Search billings..."
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        value={searchText}
        className="search-input"
        autoFocus
      />
    </div>
  );

  return (
    <div className="billing-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/dashboard/purchase">Purchase</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Billings</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Billing</Title>
          <Text type="secondary">Manage all billings in the organization</Text>
        </div>
        <div className="header-actions">
          <div className="desktop-actions">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="search-container">
              <Input
              prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
              placeholder="Search billings..."
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
              value={searchText}
              ref={searchInputRef}
              className="search-input"
              // style={{ width: '300px' }}
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
                onClick={() => setIsCreateModalVisible(true)}
                className="add-button"
                icon={<FiPlus size={16} />}
              >
                <span className="button-text">Create Billing</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {!companyId && (
        <Alert
          message="Warning"
          description="Company ID not found. Some features may not work properly."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card className="billing-list-container">
        <BillingList
          billings={billingsData?.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: billingsData?.total || 0,
            onChange: handleTableChange
          }}
        />
      </Card>

      <CreateBilling
        open={isCreateModalVisible}
        billings={billingsData?.data || []}
        onCancel={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateBilling}
      />

      <EditBilling
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedBilling(null);
        }}
        initialData={selectedBilling}
      />
    </div>
  );
};

export default Billing;
