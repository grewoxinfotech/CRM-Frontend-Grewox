import React from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Typography,
  Modal,
  message,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiBox,
} from "react-icons/fi";
import { useDeleteProductMutation } from "./services/productApi";

const { Text } = Typography;

const ProductList = ({
  onEdit,
  data,
  loading,
  pagination,
  onChange,
  currenciesData
}) => {
  const [deleteProduct] = useDeleteProductMutation();

  const getCurrencyIcon = (currencyId) => {
    const currency = currenciesData?.find((c) => c.id === currencyId);
    return currency?.currencyIcon || "₹";
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await deleteProduct(id).unwrap();
          message.success('Deleted successfully');
        } catch (error) {
          message.error('Failed to delete');
        }
      },
    });
  };

  const columns = [
    {
      title: "Product Details",
      key: "name",
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="icon-wrapper" style={{ 
            width: '24px', 
            height: '24px', 
            borderRadius: '6px', 
            background: '#f1f5f9', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#64748b'
          }}>
            <FiBox size={14} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ color: '#1e293b' }}>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>SKU: {record.sku || 'N/A'}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat) => cat ? <Tag style={{ borderRadius: '4px', border: 'none' }}>{cat}</Tag> : '-'
    },
    {
      title: "Stock Status",
      key: "stock",
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text style={{ fontSize: '13px' }}>{record.stock_quantity} units</Text>
          <Tag color={record.stock_status === 'in_stock' ? 'success' : 'warning'} style={{ borderRadius: '4px', border: 'none', width: 'fit-content', fontSize: '10px', height: '18px', padding: '0 4px', lineHeight: '18px' }}>
            {record.stock_status?.replace('_', ' ').toUpperCase()}
          </Tag>
        </div>
      ),
    },
    {
      title: "Price Info",
      key: "price",
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text strong style={{ fontSize: '13px', color: '#0f172a' }}>{getCurrencyIcon(record.currency)} {record.selling_price}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>Cost: {getCurrencyIcon(record.currency)} {record.buying_price}</Text>
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
    <div className="product-list-container">
      <Table
        columns={columns}
        dataSource={data?.data}
        rowKey="id"
        size="small"
        loading={loading}
        className="compact-table"
        pagination={{
            ...pagination,
            total: data?.pagination?.total,
            showTotal: (total) => `Total ${total} items`
        }}
        onChange={onChange}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default ProductList;
