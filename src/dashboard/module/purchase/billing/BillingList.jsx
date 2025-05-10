import React, { useState } from "react";
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
import { useGetBillingsQuery, useDeleteBillingMutation } from './services/billingApi';

const { Text } = Typography;

const BillingList = ({ onEdit, onDelete, onView, searchText, loading }) => {
  // Fetch vendors data
  const { data: vendorsData } = useGetVendorsQuery();

  const { data: currenciesData } = useGetAllCurrenciesQuery({});

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { data, isError } = useGetBillingsQuery();
  const [deleteBilling] = useDeleteBillingMutation();

  const billings = data?.data || [];

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

  const handleBulkDelete = () => {
    const idsToDelete = selectedRowKeys.map(key => {
      const bill = billings.find(bill => bill._id === key || bill.id === key);
      return bill?.id || bill?._id;
    }).filter(id => id); // Remove any undefined/null values

    if (idsToDelete.length > 0) {
      onDelete(idsToDelete);
      setSelectedRowKeys([]);
    }
  };

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

  const columns = [
    {
      title: "Bill Number",
      dataIndex: "billNumber",
      key: "billNumber",
      render: (billNumber) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper bill-icon">
              <FiFileText className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name">{billNumber || "N/A"}</div>
              <div className="meta">Bill ID</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
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
      render: (_, record) => getStatusTags(record.status, record.bill_status),
    },
    {
      title: "Actions",
      key: "actions",
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

  const handleViewBilling = (record) => {
    setSelectedBill(record);
    setIsModalVisible(true);
  };

  return (
    <div className="billing-list-container">
      {selectedRowKeys.length > 0 && (
        <div className="bulk-actions">
          <Button
            type="primary"
            danger
            icon={<FiTrash2 />}
            onClick={handleBulkDelete}
          >
            Delete Selected ({selectedRowKeys.length})
          </Button>
        </div>
      )}
      <Table
        className="custom-table"
        columns={columns}
        dataSource={filteredBillings}
        rowSelection={rowSelection}
        rowKey={record => record.id || record._id}
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} bills`,
        }}
        locale={{
          emptyText: ' ',
        }}
      />

      {isModalVisible && (
        <ViewBilling
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          bill={selectedBill}
        />
      )}
    </div>
  );
};

export default BillingList;
