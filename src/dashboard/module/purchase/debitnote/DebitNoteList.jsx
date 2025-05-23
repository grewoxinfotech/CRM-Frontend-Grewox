import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Dropdown,
  Typography,
  Spin,
  Alert,
  Menu,
  Input,
  Space,
  DatePicker,
  Tag,
  Modal,
} from "antd";
import {
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiFileText,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi";
import { useGetDebitNotesQuery } from "./services/debitnoteApi";
import { useSelector } from "react-redux";
import { useGetBillingsQuery } from "../billing/services/billingApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import dayjs from "dayjs";
import "./debitnote.scss";

const { Text } = Typography;

const getCompanyId = (state) => {
  const user = state.auth.user;
  return user?.companyId || user?.company_id || user?.id;
};

const DebitNoteList = ({
  onEdit,
  onDelete,
  onView,
  searchText,
  loading,
  debitNotes = [],
  pagination,
  onChange
}) => {
  const companyId = useSelector(getCompanyId);
  const { data: billings } = useGetBillingsQuery({
    page: 1,
    pageSize: -1,
    search: ''
  }, {
    skip: !companyId
  });
  const { data: currenciesData } = useGetAllCurrenciesQuery();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getBillNumber = (billId) => {
    const foundBill = billings?.data?.find((bill) => bill.id === billId);
    return foundBill?.billNumber || "N/A";
  };

  const getCurrencySymbol = (currencyId) => {
    const currency = currenciesData?.find((curr) => curr.id === currencyId);
    return currency?.currencyIcon || "₹";
  };

  const handleBulkDelete = () => {
    const idsToDelete = selectedRowKeys.map(key => {
      const debitNote = debitNotes?.find(note => note._id === key || note.id === key);
      return debitNote?.id || debitNote?._id;
    }).filter(id => id); // Remove any undefined/null values

    if (idsToDelete.length > 0) {
      onDelete(idsToDelete);
      setSelectedRowKeys([]);
    }
  };

  const getActionItems = (record) => [
    // {
    //   key: 'view',
    //   icon: <FiEye style={{ fontSize: '16px' }} />,
    //   label: 'View',
    //   onClick: () => onView(record)
    // },
    // {
    //   key: 'edit',
    //   icon: <FiEdit2 style={{ fontSize: '16px' }} />,
    //   label: 'Edit',
    //   onClick: () => onEdit(record)
    // },
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
      dataIndex: "bill",
      key: "bill",
      render: (billId) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper bill-icon">
              <FiFileText className="item-icon" size={16} />
            </div>
            <div className="info-wrapper">
              <div className="name">{getBillNumber(billId)}</div>
              <div className="meta">Bill ID</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper date-icon">
              <FiCalendar className="item-icon" size={16} />
            </div>
            <Text>{dayjs(date).format("DD MMM, YYYY")}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper amount-icon">
              <Text className="item-icon">{getCurrencySymbol(record.currency)}</Text>
            </div>
            <Text>{Number(amount).toLocaleString()}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
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
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: 'right',
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

  // Remove local filtering since it's now handled by the server
  const filteredDebitNotes = debitNotes;

  // Update pagination configuration
  const paginationConfig = {
    ...pagination,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `Total ${total} debit notes`,
    pageSizeOptions: ["10", "20", "50", "100"]
  };

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  return (
    <div className="debitnote-list-container">
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
        dataSource={filteredDebitNotes}
        rowSelection={rowSelection}
        rowKey={record => record.id || record._id}
        loading={loading}
        // scroll={{ x: 1200 }}
        scroll={{ x: 'max-content', y: '100%' }}

        pagination={paginationConfig}
        onChange={onChange}
        locale={{
          emptyText: 'No debit notes found',
        }}
        
      />
    </div>
  );
};

export default DebitNoteList;
