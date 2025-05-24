import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  message,
  Input,
  Dropdown,
  Breadcrumb,
  DatePicker,
  Space,
  Popover,
  Menu,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiHome,
  FiChevronDown,
  FiFilter,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import CreateLeave from "./CreateLeave";
import LeaveList from "./LeaveList";
import EditLeave from "./Editleave";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import { useGetLeaveQuery } from "./services/LeaveApi";
import "./leave.scss";
import dayjs from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const Leave = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const { data: response = {}, isLoading: isLeaveLoading } = useGetLeaveQuery({
    page: currentPage,
    pageSize,
    search: searchText,
    ...filters
  });

  const { data: leaves = [], pagination = {} } = response;

  const handleCreate = () => {
    setSelectedLeave(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedLeave(record);
    setIsEditModalOpen(true);
  };

  const handleView = (record) => {
    console.log("View leave request:", record);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#faad14", fontSize: "22px" }}>⚠</span>
          Delete Leave Request
        </div>
      ),
      content: "Are you sure you want to delete this leave request?",
      okText: "Yes",
      cancelText: "No",
      centered: true,
      className: "custom-delete-modal",
      icon: null,
      maskClosable: true,
      okButtonProps: {
        danger: true,
        size: "middle",
      },
      cancelButtonProps: {
        size: "middle",
      },
      onOk: () => {
        message.success("Leave request deleted successfully");
      },
    });
  };

  const handleDateRangeChange = (dates) => {
    setFilters(prev => ({
      ...prev,
      dateRange: dates ? [dates[0].startOf('day'), dates[1].endOf('day')] : []
    }));
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = leaves?.map((leave) => ({
        'Employee Name': leave.employeeName || '-',
        'Leave Type': leave.leaveType || '-',
        'Start Date': leave.startDate ? moment(leave.startDate).format('DD-MM-YYYY') : '-',
        'End Date': leave.endDate ? moment(leave.endDate).format('DD-MM-YYYY') : '-',
        'Status': leave.status || '-',
        'Reason': leave.reason || '-',
        'Created At': leave.createdAt ? moment(leave.createdAt).format('DD-MM-YYYY') : '-',
        'Department': leave.department || '-',
        'Total Days': dayjs(leave.endDate).diff(dayjs(leave.startDate), 'days') + 1 || '-'
      })) || [];

      if (data.length === 0) {
        message.warning('No data available to export');
        return;
      }

      const fileName = `leave_requests_${moment().format('DD-MM-YYYY')}`;

      switch (type) {
        case 'csv':
          const csvContent = [
            Object.keys(data[0]).join(','),
            ...data.map(item =>
              Object.values(item)
                .map(value => `"${value?.toString().replace(/"/g, '""')}"`)
                .join(',')
            )
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `${fileName}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          message.success('Successfully exported as CSV');
          break;

        case 'excel':
          const ws = XLSX.utils.json_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Leave Requests');
          XLSX.writeFile(wb, `${fileName}.xlsx`);
          message.success('Successfully exported as Excel');
          break;

        case 'pdf':
          const doc = new jsPDF('l', 'pt', 'a4');
          doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: {
              fontSize: 8,
              cellPadding: 2
            },
            theme: 'grid'
          });
          doc.save(`${fileName}.pdf`);
          message.success('Successfully exported as PDF');
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const exportMenu = (
    <Menu>
      <Menu.Item key="csv" icon={<FiDownload />} onClick={() => handleExport('csv')}>
        Export as CSV
      </Menu.Item>
      <Menu.Item key="excel" icon={<FiDownload />} onClick={() => handleExport('excel')}>
        Export as Excel
      </Menu.Item>
      <Menu.Item key="pdf" icon={<FiDownload />} onClick={() => handleExport('pdf')}>
        Export as PDF
      </Menu.Item>
    </Menu>
  );

  const filterMenu = (
    <Menu className="filter-menu">
      <Menu.Item key="date" className="filter-menu-item">
        <div className="filter-section">
          <RangePicker
            onChange={handleDateRangeChange}
            value={filters.dateRange}
            allowClear
            placeholder={['Start Date', 'End Date']}
          />
        </div>
      </Menu.Item>
      <Menu.Item key="export" className="filter-menu-item">
        <div className="filter-section">
          <Dropdown overlay={exportMenu} trigger={["click"]}>
            <Button className="export-button">
              <FiDownload size={16} />
              Export
            </Button>
          </Dropdown>
        </div>
      </Menu.Item>
    </Menu>
  );

  const searchContent = (
    <div className="search-popup">
      <Input
        prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
        placeholder="Search leave requests..."
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        value={searchText}
        className="search-input"
        autoFocus
      />
    </div>
  );

  return (
    <div className="leave-page">
      <div className="page-breadcrumb">
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/dashboard">
                  <FiHome /> Home
                </Link>
              ),
            },
            {
              title: "HRM",
            },
            {
              title: "Leave Management",
            },
          ]}
        />
      </div>

      <div className="page-header">
        <div className="header-content">
          <div className="page-title">
            <div className="title-row">
              <div className="title-column">
                <h2>Leave Management</h2>
                <Text type="secondary">Manage employee leave requests</Text>
              </div>
              <div className="mobile-actions">
                <Button
                  type="primary"
                  icon={<FiPlus size={18} />}
                  onClick={handleCreate}
                  className="mobile-add-button"
                />
                <Popover
                  content={searchContent}
                  trigger="click"
                  visible={isSearchVisible}
                  onVisibleChange={setIsSearchVisible}
                  placement="bottomRight"
                  overlayClassName="search-popover"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Button
                    icon={<FiSearch size={18} />}
                    className="mobile-search-button"
                  />
                </Popover>
                <Dropdown
                  overlay={filterMenu}
                  trigger={["click"]}
                  visible={isFilterVisible}
                  onVisibleChange={setIsFilterVisible}
                  placement="bottomRight"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Button
                    icon={<FiFilter size={18} />}
                    className="mobile-filter-button"
                  />
                </Dropdown>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <div className="desktop-actions">
              <Input
                prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
                placeholder="Search leave requests..."
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                className="search-input"
              />
              <RangePicker
                onChange={handleDateRangeChange}
                value={filters.dateRange}
                allowClear
                placeholder={['Start Date', 'End Date']}
                style={{ width: '70%' }}
              />
              <Dropdown overlay={exportMenu} trigger={["click"]}>
                <Button className="export-button" loading={loading}>
                  <FiDownload size={16} />
                  Export
                </Button>
              </Dropdown>
              <Button
                type="primary"
                icon={<FiPlus size={16} />}
                onClick={handleCreate}
                className="add-button"
              >
                New Leave Request
              </Button>
            </div>
          </div>
        </div>
      </div>

      <LeaveList
        loading={isLeaveLoading}
        leaves={leaves}
        pagination={pagination}
        onEdit={handleEdit}
        onView={handleView}
        searchText={searchText}
        filters={filters}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <CreateLeave
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      {isEditModalOpen && selectedLeave && (
        <EditLeave
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          initialValues={selectedLeave}
        />
      )}
    </div>
  );
};

export default Leave;
