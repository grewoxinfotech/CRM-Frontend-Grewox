import React from "react";
import {
  Table,
  Button,
  Dropdown,
  Typography,
  Modal,
  message,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiCreditCard,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useDeleteCreditNoteMutation,
} from "./services/creditNoteApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import { useGetCustomersQuery } from "../customer/services/custApi";

const { Text } = Typography;

const CreditNotesList = ({
  onEdit,
  data = [],
  loading,
  pagination = {},
}) => {
  const [deleteCreditNote] = useDeleteCreditNoteMutation();
  const { data: currenciesData } = useGetAllCurrenciesQuery();
  const { data: customersData } = useGetCustomersQuery();

  const getCurrencyIcon = (currencyId) => {
    const currency = currenciesData?.find((curr) => curr.id === currencyId);
    return currency?.currencyIcon || "₹";
  };

  const getCustomerName = (customerId) => {
    const customer = customersData?.data?.find(c => c.id === customerId);
    return customer?.name || "N/A";
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Credit Note',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await deleteCreditNote(id).unwrap();
          message.success("Deleted successfully");
        } catch (error) {
          message.error("Failed to delete");
        }
      },
    });
  };

  const columns = [
    {
      title: "Credit Note Details",
      key: "details",
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <FiCreditCard size={14} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ color: '#1e293b' }}>{record.creditNoteNumber || `CN-${record.id?.slice(-6)}`}</Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>{getCustomerName(record.customer)}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => <Text style={{ fontSize: '13px' }}>{dayjs(date).format('DD MMM YYYY')}</Text>
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) => (
        <Text strong style={{ fontSize: '13px', color: '#0f172a' }}>
          {getCurrencyIcon(record.currency)} {Number(record.amount).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (reason) => <Text type="secondary" style={{ fontSize: '12px' }}>{reason || '-'}</Text>
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit(record) },
              { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => handleDelete(record.id) }
            ]
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="credit-notes-container">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        size="small"
        loading={loading}
        className="compact-table"
        pagination={{
            ...pagination,
            showTotal: (total) => `Total ${total} credit notes`
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default CreditNotesList;
