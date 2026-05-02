import React, { useState } from "react";
import { Table, Button, Dropdown, Typography, Tag } from "antd";
import { FiMoreVertical, FiTrash2, FiFileText, FiCalendar } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useGetBillingsQuery } from "../billing/services/billingApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import dayjs from "dayjs";

const { Text } = Typography;

const getCompanyId = (state) => {
  const user = state.auth.user;
  return user?.companyId || user?.company_id || user?.id;
};

const DebitNoteList = ({
  onDelete,
  loading,
  debitNotes = [],
  pagination,
  onChange
}) => {
  const companyId = useSelector(getCompanyId);
  const { data: billingss } = useGetBillingsQuery({
    page: 1,
    pageSize: -1,
    search: ''
  }, {
    skip: !companyId
  });
  const { data: currenciesData } = useGetAllCurrenciesQuery();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const billings = billingss?.message;
  
  const getBillNumber = (billId) => {
    const foundBill = billings?.data?.find((bill) => bill.id === billId);
    return foundBill?.billNumber || "N/A";
  };

  const getCurrencySymbol = (currencyId) => {
    const currency = currenciesData?.find((curr) => curr.id === currencyId);
    return currency?.currencyIcon || "₹";
  };

  const columns = [
    {
      title: "Bill Details",
      dataIndex: "bill",
      key: "bill",
      width: 250,
      render: (billId, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '6px', 
            background: '#fee2e2', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#dc2626'
          }}>
            <FiFileText size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ color: '#1e293b' }}>{getBillNumber(billId)}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{dayjs(record.date).format('DD MMM YYYY')}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      render: (amount, record) => (
        <Text strong style={{ color: '#dc2626' }}>
            {getCurrencySymbol(record.currency)} {parseFloat(amount || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 300,
      render: (text) => <Text type="secondary" style={{ fontSize: '13px' }}>{text || 'N/A'}</Text>
    },
    {
      title: "Actions",
      key: "actions",
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => onDelete(record) }
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
    <div className="debitnote-list-container">
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        dataSource={debitNotes}
        rowKey={record => record.id || record._id}
        size="small"
        loading={loading}
        className="compact-table"
        pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} debit notes`,
        }}
        onChange={onChange}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default DebitNoteList;
