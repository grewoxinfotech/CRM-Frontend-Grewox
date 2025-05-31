import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Dropdown,
  Menu,
  Tag,
  Modal,
  Input,
  Space,
  DatePicker,
  Typography,
} from "antd";
import {
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCalendar,
  FiFileText,
  FiDollarSign,
  FiUser,
} from "react-icons/fi";
import { useGetVendorsQuery } from "./services/billingApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import ViewBilling from "./ViewBilling";
import dayjs from "dayjs";

const { Text } = Typography;

const BillingList = ({
  onEdit,
  onDelete,
  onView,
  searchText,
  loading,
  billings = [],
  pagination,
  onChange
}) => {
  // Fetch vendors data
  const { data: vendorsData } = useGetVendorsQuery();
  const { data: currenciesData } = useGetAllCurrenciesQuery({});

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create a map of vendor IDs to vendor names
  const vendorMap = React.useMemo(() => {
    if (!vendorsData?.data) return {};
    return vendorsData.data.reduce((acc, vendor) => {
      acc[vendor.id] = vendor.name;
      return acc;
    }, {});
  }, [vendorsData]);

  const statuses = [
    { id: "paid", name: "Paid" },
    { id: "pending", name: "Pending" },
    { id: "partially_paid", name: "Partially Paid" },
    { id: "unpaid", name: "Unpaid" },
  ];

  // Create a map of currency IDs/codes to currency icons
  const currencyMap = React.useMemo(() => {
    if (!currenciesData) return {};
    return currenciesData.reduce((acc, currency) => {
      acc[currency.id] = currency.currencyIcon;
      acc[currency.currencyCode] = currency.currencyIcon; // Also map by code
      return acc;
    }, {});
  }, [currenciesData]);

  const getStatusTags = (status, billStatus) => {
    const tags = [];

    // Payment Status Tag
    if (status) {
      tags.push(
        <Tag key="payment" className={`billing-status-tag ${status.toLowerCase()}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      );
    }

    // Bill Status Tag
    if (billStatus && billStatus.toLowerCase() !== 'draft') {
      tags.push(
        <Tag key="bill" className={`billing-status-tag ${billStatus.toLowerCase()}`}>
          {billStatus.charAt(0).toUpperCase() + billStatus.slice(1)}
        </Tag>
      );
    }

    return <div style={{ display: 'flex', gap: '8px' }}>{tags}</div>;
  };

  // Clear selections when billings data changes
  useEffect(() => {
    setSelectedRowKeys([]);
  }, [billings]);

  const handleChange = (newPagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
    if (pagination?.onChange) {
      pagination.onChange(newPagination, filters, sorter);
    }
  };

  const clearFilters = () => {
    setFilteredInfo({});
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  // Row selection config
  // const rowSelection = {
  //   selectedRowKeys,
  //   onChange: (newSelectedRowKeys) => {
  //     setSelectedRowKeys(newSelectedRowKeys);
  //   }
  // };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    await onDelete(selectedRowKeys);
    setSelectedRowKeys([]); // Clear selections after delete
  };

  // Bulk actions component
  const BulkActions = () => (
    <div className="bulk-actions" style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
      {selectedRowKeys.length > 0 && (
        <Button
          type="primary"
          danger
          icon={<FiTrash2 size={16} />}
          onClick={handleBulkDelete}
        >
          Delete Selected ({selectedRowKeys.length})
        </Button>
      )}
    </div>
  );

  const getActionItems = (record) => [
    {
      key: 'view',
      icon: <FiEye style={{ fontSize: '16px' }} />,
      label: 'View',
      onClick: () => handleViewBilling(record)
    },
    {
      key: 'edit',
      icon: <FiEdit2 style={{ fontSize: '16px' }} />,
      label: 'Edit',
      onClick: () => onEdit(record)
    },
    {
      key: 'delete',
      icon: <FiTrash2 style={{ fontSize: '16px', color: '#ff4d4f' }} />,
      label: 'Delete',
      danger: true,
      onClick: () => onDelete(record)
    }
  ];

  const handleViewBilling = (record) => {
    // Ensure we have valid data
    if (record) {
      let items = [];
      try {
        // Parse items if it's a string
        if (typeof record.items === "string") {
          items = JSON.parse(record.items);
        } else if (Array.isArray(record.items)) {
          items = record.items;
        }

        // Format items to ensure consistent structure
        items = items.map((item) => ({
          itemName: item.itemName || item.name || item.description,
          hsnSac: item.hsnSac || item.hsn_sac || item.hsn_code,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          tax: item.tax || "", // Keep the tax ID as is
          taxAmount: Number(item.taxAmount) || 0,
          discount: Number(item.discount) || 0,
          discountAmount: Number(item.discountAmount) || 0,
          amount: Number(item.amount) || 0,
          currencyIcon: item.currencyIcon || '₹',
          discount_type: item.discount_type || 'fixed'
        }));

        setSelectedBilling({
          ...record,
          items: items,
          discount: Number(record.discount) || 0,
          tax: Number(record.tax) || 0, // Add overall tax
          overallTax: record.overallTax || "", // Add overall tax ID
          overallTaxAmount: Number(record.overallTaxAmount) || 0 // Add overall tax amount
        });

        setIsViewModalOpen(true);
      } catch (error) {
        console.error("Error parsing billing items:", error);
        message.error("Error loading billing details");
      }
    }
  };

  const columns = [
    {
      title: "Bill Number",
      dataIndex: "billNumber",
      key: "billNumber",
      width: 150,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search bill number"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
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
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.billNumber?.toLowerCase().includes(value.toLowerCase()),
      render: (billNumber, record) => (
        <div className="item-wrapper" style={{ cursor: 'pointer' }} onClick={() => handleViewBilling(record)}>
          <div className="item-content">
            <div className="icon-wrapper bill-icon">
              <FiFileText className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name">{billNumber || "N/A"}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      render: (amount, record) => {
        const items = typeof record.items === 'string' ? JSON.parse(record.items) : record.items;
        const currencyIcon = items?.[0]?.currencyIcon || '₹';
        return (
          <div className="item-wrapper">
            <div className="item-content">
              <div className="icon-wrapper amount-icon">
                <Text>{currencyIcon}</Text>
              </div>
              <Text>{amount?.toFixed(2) || "0.00"}</Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "Bill Date",
      dataIndex: "billDate",
      key: "billDate",
      width: 150,
      render: (date) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper date-icon">
              <FiCalendar className="item-icon" />
            </div>
            <Text>{dayjs(date).format('DD MMM, YYYY')}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "discription",
      key: "discription",
      width: 150,
      render: (description) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="info-wrapper">
              <div className="name">{description || "N/A"}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 150,
      render: (_, record) => getStatusTags(record.status, record.bill_status),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              {getActionItems(record).map(item => (
                <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick} danger={item.danger}>
                  {item.label}
                </Menu.Item>
              ))}
            </Menu>
          }
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<FiMoreVertical size={16} />}
            className="action-button"
          />
        </Dropdown>
      ),
    },
  ];

  // Filter billings based on search text
  const filteredBillings = billings.filter(billing =>
    billing.billNumber?.toLowerCase().includes(searchText?.toLowerCase()) ||
    billing.discription?.toLowerCase().includes(searchText?.toLowerCase()) ||
    billing.status?.toLowerCase().includes(searchText?.toLowerCase()) ||
    billing.bill_status?.toLowerCase().includes(searchText?.toLowerCase())
  );

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  // Use only numbers for mobile/tablet, and AntD default for desktop
  const paginationConfig = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} vendors`,
    pageSizeOptions: isMobile ? ["5", "10", "15", "20", "25"] : ["10", "20", "50", "100"],
    locale: {
      items_per_page: isMobile ? "" : "/ page",
    },
  };

  return (
    <div className="billing-list-container">
      <BulkActions />
      <Table
        // className="custom-table"
        columns={columns}
        dataSource={billings}
        rowSelection={rowSelection}
        rowKey="id"
        loading={loading}
        onChange={handleChange}
        scroll={{ x: "max-content", y: "100%" }}
        pagination={pagination || {
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          ...paginationConfig
        }}
        locale={{
          emptyText: 'No billings found',
        }}
      />

      {isViewModalOpen && selectedBilling && (
        <ViewBilling
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          data={selectedBilling}
        />
      )}
    </div>
  );
};

export default BillingList;
