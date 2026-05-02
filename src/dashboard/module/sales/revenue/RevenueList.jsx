import React, { useMemo } from "react";
import {
  Table,
  Button,
  Dropdown,
  Typography,
  Modal,
  Tag,
  Row,
  Col,
} from "antd";
import {
  FiTrash2,
  FiMoreVertical,
  FiDollarSign,
  FiTrendingUp,
  FiPercent,
  FiPackage,
  FiArrowUpRight,
  FiArrowDownRight,
} from "react-icons/fi";
import dayjs from "dayjs";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import { useGetCustomersQuery } from "../customer/services/custApi";

const { Text } = Typography;

const RevenueList = ({
  onDelete,
  data = [],
  loading,
  pagination = {}
}) => {
  const { data: currencies } = useGetAllCurrenciesQuery();
  const { data: customersData } = useGetCustomersQuery();

  const getCurrencyIcon = (currencyId) => {
    const currency = currencies?.find((c) => c.id === currencyId);
    return currency?.currencyIcon || "₹";
  };

  const getCustomerName = (customerId) => {
    const customer = customersData?.data?.find(c => c.id === customerId);
    return customer?.name || "N/A";
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Entry',
      content: 'Are you sure?',
      onOk: () => onDelete(id),
    });
  };

  const stats = useMemo(() => {
    const totalRev = data.reduce((sum, rev) => sum + (Number(rev.amount) || 0), 0);
    const totalProf = data.reduce((sum, rev) => sum + (Number(rev.profit) || 0), 0);
    const avgMargin = data.length > 0 ? data.reduce((sum, rev) => sum + (Number(rev.profit_margin_percentage) || 0), 0) / data.length : 0;
    return { totalRev, totalProf, avgMargin };
  }, [data]);

  const columns = [
    {
      title: "Revenue Details",
      key: "details",
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <FiTrendingUp size={14} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ color: '#1e293b' }}>{record.description || `Invoice #${record.salesInvoiceNumber}`}</Text>
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text strong style={{ fontSize: '13px', color: '#0f172a' }}>{getCurrencyIcon(record.currency)} {Number(record.amount).toLocaleString()}</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Profit: {getCurrencyIcon(record.currency)} {Number(record.profit).toLocaleString()}</Text>
            <Tag color={record.profit >= 0 ? 'success' : 'error'} style={{ fontSize: '9px', height: '16px', padding: '0 4px', margin: 0, border: 'none', borderRadius: '4px' }}>
              {record.profit >= 0 ? <FiArrowUpRight size={8} /> : <FiArrowDownRight size={8} />}
              {Math.abs(record.profit_margin_percentage || 0).toFixed(1)}%
            </Tag>
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
          menu={{
            items: [
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
    <div className="revenue-list-container">
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {[
          { label: 'TOTAL REVENUE', value: stats.totalRev, icon: <FiDollarSign />, color: '#0284c7', bg: '#e0f2fe' },
          { label: 'TOTAL PROFIT', value: stats.totalProf, icon: <FiTrendingUp />, color: '#059669', bg: '#d1fae5' },
          { label: 'AVG MARGIN', value: `${stats.avgMargin.toFixed(1)}%`, icon: <FiPercent />, color: '#d97706', bg: '#fef3c7' },
          { label: 'TOTAL ITEMS', value: data.length, icon: <FiPackage />, color: '#7c3aed', bg: '#ede9fe' },
        ].map((stat, i) => (
          <Col xs={12} md={6} key={i}>
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                {stat.icon}
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.05em' }}>{stat.label}</Text>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                  {typeof stat.value === 'number' ? `₹${stat.value.toLocaleString()}` : stat.value}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        size="small"
        loading={loading}
        className="compact-table"
        pagination={{
            ...pagination,
            showTotal: (total) => `Total ${total} entries`
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default RevenueList;
