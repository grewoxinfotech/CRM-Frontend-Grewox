import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Typography,
  Modal,
  message,
  Input,
  Space,
  DatePicker,
  Menu,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
  FiCalendar,
  FiFileText,
  FiCreditCard,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetCreditNotesQuery,
  useDeleteCreditNoteMutation,
} from "./services/creditNoteApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import EditCreditNotes from "./EditCreditNotes";
import { useGetInvoicesQuery } from "../invoice/services/invoiceApi";
import { useGetCustomersQuery } from "../customer/services/custApi";

const { Text } = Typography;

const CreditNotesList = ({ onEdit, onView, searchText = "", data }) => {
  const { data: credtdata = [], isLoading } = useGetCreditNotesQuery();
  const creditNotes = credtdata.data;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleteCreditNote] = useDeleteCreditNoteMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] = useState(null);
  const { data: currenciesData } = useGetAllCurrenciesQuery();
  const { data: customersData } = useGetCustomersQuery();
  const { data: invdata } = useGetInvoicesQuery();
  const invoices = invdata?.data;

  const getCurrencyIcon = (currencyId) => {
    const currency = currenciesData?.find((curr) => curr.id === currencyId);
    return currency?.currencyIcon || "₹";
  };

  const getCustomerName = (customerId) => {
    if (!customerId || !customersData?.data) return "N/A";
    const customer = customersData.data.find(c => c.id === customerId);
    return customer?.name || customer?.companyName || "N/A";
  };

  const getInvoiceNumber = (invoiceId) => {
    if (!invoiceId || !invoices) return "N/A";
    const invoice = invoices.find(inv => inv.id === invoiceId);
    return invoice?.salesInvoiceNumber || "N/A";
  };

  const filteredCreditNotes = React.useMemo(() => {
    return creditNotes?.filter((creditNote) => {
      const searchLower = searchText.toLowerCase();
      const amount = creditNote?.amount?.toString().toLowerCase() || "";
      const category = creditNote?.category?.toLowerCase() || "";
      const description = creditNote?.description?.toLowerCase() || "";
      const status = creditNote?.status?.toLowerCase() || "";

      return (
        !searchText ||
        amount.includes(searchLower) ||
        category.includes(searchLower) ||
        description.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [creditNotes, searchText]);

  const handleDelete = (recordOrIds) => {
    const isMultiple = Array.isArray(recordOrIds);
    const title = isMultiple ? 'Delete Credit Notes' : 'Delete Credit Note';
    const content = isMultiple
      ? `Are you sure you want to delete ${recordOrIds.length} selected credit notes? This action cannot be undone.`
      : 'Are you sure you want to delete this credit note?';

    Modal.confirm({
      title,
      content,
      okText: "Delete",
      okType: "danger",
      cancelText: "No",
      bodyStyle: { padding: "20px" },
      onOk: async () => {
        try {
          if (isMultiple) {
            await Promise.all(recordOrIds.map(id => deleteCreditNote(id).unwrap()));
            message.success(`${recordOrIds.length} credit notes deleted successfully`);
            setSelectedRowKeys([]);
          } else {
            await deleteCreditNote(recordOrIds).unwrap();
            message.success("Credit note deleted successfully");
          }
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete credit note(s)");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedCreditNote(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedCreditNote(null);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columns = [
    {
      title: "Credit Note Details",
      key: "details",
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <FiCreditCard className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name">
                {record.creditNoteNumber || `CN-${record.id?.slice(-6)}`}
              </div>
              <div className="meta" style={{ color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>
                  <FiFileText style={{ marginRight: '4px', fontSize: '12px' }} />
                  {getInvoiceNumber(record.invoice)}
                </span>
                •
                <span>{getCustomerName(record.customer)}</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Date",
      key: "date",
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <FiCalendar className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="main-info">
                <Text>{dayjs(record.date).format('DD MMM YYYY')}</Text>
              </div>
              <div className="meta" style={{ color: '#6b7280', fontSize: '13px' }}>
                Created {dayjs(record.createdAt).format('DD MMM YYYY')}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="info-wrapper" style={{ padding: '8px 0' }}>
              <div className="name" style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                {getCurrencyIcon(record.currency)} {Number(record.amount).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              {/* <Menu.Item key="view" icon={<FiEye style={{ fontSize: "14px" }} />} onClick={() => onView?.(record)}>
                View Details
              </Menu.Item>
              <Menu.Item key="edit" icon={<FiEdit2 style={{ fontSize: "14px" }} />} onClick={() => handleEdit(record)}>
                Edit Credit Note
              </Menu.Item> */}
              <Menu.Item key="delete" icon={<FiTrash2 />} danger onClick={() => handleDelete(record.id)}>
                Delete Credit Note
              </Menu.Item>
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

  return (
    <div className="credit-notes-container">
      {selectedRowKeys.length > 0 && (
        <div className="bulk-actions" style={{ marginBottom: '16px' }}>
          <Button
            type="primary"
            danger
            icon={<FiTrash2 />}
            onClick={() => handleDelete(selectedRowKeys)}
          >
            Delete Selected ({selectedRowKeys.length})
          </Button>
        </div>
      )}

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredCreditNotes}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} credit notes`,
        }}
        className="credit-notes-table"
      />

      <EditCreditNotes
        visible={editModalVisible}
        onCancel={handleEditModalClose}
        creditNote={selectedCreditNote}
      />
    </div>
  );
};

export default CreditNotesList;
