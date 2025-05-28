import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Menu,
  Typography,
  Modal,
  message,
  Input,
  Space,
  Avatar,
} from "antd";
import "./ProductList.scss";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
  FiBox,
  FiTag,
  FiPackage,
  FiTrendingUp,
  FiPercent,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "./services/productApi";
import EditProduct from "./EditProduct";
import { useGetCategoriesQuery } from "../../crm/crmsystem/souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const ProductList = ({
  onEdit,
  onView,
  searchText = "",
  selectedCategory = null,
  onProductRevenueClick,
  currenciesData,
  data,
  loading,
  pagination,
  onChange
}) => {
  const currentUser = useSelector(selectCurrentUser);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const navigate = useNavigate();

  const { data: productsData = [], isLoading } = useGetProductsQuery(
    currentUser?.id
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const products = data?.data || [];
  const [deleteProduct] = useDeleteProductMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: categoriesData } = useGetCategoriesQuery(currentUser?.id);
  const categories =
    categoriesData?.data?.filter((item) => item.lableType === "category") || [];

  const categoryMap = React.useMemo(() => {
    if (!categories) return {};
    return categories.reduce((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {});
  }, [categories]);

  const getCurrencyDetails = (currencyId) => {
    if (!currenciesData) return { currencyIcon: "₹", currencyCode: "INR" };
    const currency = currenciesData.find((c) => c.id === currencyId);
    return currency || { currencyIcon: "₹", currencyCode: "INR" };
  };

  const formatPrice = (amount, currencyId) => {
    const { currencyIcon } = getCurrencyDetails(currencyId);
    return `${currencyIcon} ${amount?.toLocaleString() || 0}`;
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map(id => deleteProduct(id).unwrap()));
      message.success(`Successfully deleted ${selectedRowKeys.length} products`);
      setSelectedRowKeys([]);
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Failed to delete selected products");
    }
  };

  const handleDelete = (recordOrIds) => {
    const isMultiple = Array.isArray(recordOrIds);
    const title = isMultiple ? 'Delete Products' : 'Delete Product';
    const content = isMultiple
      ? `Are you sure you want to delete ${recordOrIds.length} selected products? This action cannot be undone.`
      : 'Are you sure you want to delete this product?';

    Modal.confirm({
      title,
      content,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      bodyStyle: { padding: "20px" },
      onOk: async () => {
        try {
          if (isMultiple) {
            await Promise.all(recordOrIds.map(id => deleteProduct(id).unwrap()));
            message.success(`${recordOrIds.length} products deleted successfully`);
            setSelectedRowKeys([]);
          } else {
            await deleteProduct(recordOrIds).unwrap();
            message.success('Product deleted successfully');
          }
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete product(s)');
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedProduct(record);
    setEditModalVisible(true);
  };

  const handleRowClick = (record, event) => {
    // Check if the click is from action buttons
    if (event.target.closest('.action-button') || event.target.closest('.ant-dropdown')) {
      return;
    }
    navigate('/dashboard/sales/revenue', {
      state: { selectedProduct: record }
    });
  };

  const columns = [
    {
      title: "Product Details",
      dataIndex: "name",
      key: "name",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search product name"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>Filter</Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>Reset</Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
      render: (name, record) => (
        <div className="item-wrapper" onClick={(e) => handleRowClick(record, e)} style={{ cursor: 'pointer' }}>
          <div className="item-content">
            <div className="icon-wrapper product-icon">
              {record.image ? (
                <Avatar src={record.image} size={40} className="product-image" />
              ) : (
                <FiBox className="item-icon" />
              )}
            </div>
            <div className="info-wrapper">
              <div className="name">{name}</div>
              <div className="meta">
                {categoryMap[record.category] || "Uncategorized"}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Stock Info",
      key: "stock",
      filters: [
        { text: 'In Stock', value: 'in_stock' },
        { text: 'Low Stock', value: 'low_stock' },
        { text: 'Out of Stock', value: 'out_of_stock' },
      ],
      onFilter: (value, record) => record.stock_status === value,
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper stock-icon">
              <FiPackage className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="main-info">
                <Tag className={`status-tag ${record.stock_status}`}>
                  {record.stock_status === "in_stock"
                    ? "In Stock"
                    : record.stock_status === "low_stock"
                      ? "Low Stock"
                      : "Out of Stock"}
                </Tag>
                <Text>{record.stock_quantity} units</Text>
              </div>
              <Text type="secondary" className="sub-info">Min: {record.min_stock_level} · Max: {record.max_stock_level}</Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Price Info",
      key: "price",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="Min Price"
              type="number"
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value, selectedKeys[1]] : ['', selectedKeys[1]])}
              style={{ width: 188, marginBottom: 8 }}
            />
            <Input
              placeholder="Max Price"
              type="number"
              value={selectedKeys[1]}
              onChange={e => setSelectedKeys([selectedKeys[0], e.target.value ? e.target.value : ''])}
              style={{ width: 188, marginBottom: 8 }}
            />
            <Space>
              <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>Filter</Button>
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>Reset</Button>
            </Space>
          </Space>
        </div>
      ),
      onFilter: (value, record) => {
        const [minPrice, maxPrice] = value;
        const price = record.selling_price;
        if (minPrice && maxPrice) {
          return price >= Number(minPrice) && price <= Number(maxPrice);
        }
        if (minPrice) {
          return price >= Number(minPrice);
        }
        if (maxPrice) {
          return price <= Number(maxPrice);
        }
        return true;
      },
      render: (_, record) => {
        const { currencyIcon } = getCurrencyDetails(record.currency);
        return (
          <div className="item-wrapper">
            <div className="item-content">
              <div className="info-wrapper price-info">
                <Text strong className="selling-price">₹ {record.selling_price}</Text>
                <Text type="secondary" className="cost-price">Cost: ₹ {record.buying_price}</Text>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Profit",
      key: "profit",
      sorter: (a, b) => {
        const profitA = a.selling_price - a.buying_price;
        const profitB = b.selling_price - b.buying_price;
        return profitA - profitB;
      },
      render: (_, record) => {
        const profit = record.selling_price - record.buying_price;
        const margin = record.buying_price > 0
          ? ((profit / record.buying_price) * 100).toFixed(1)
          : 0;

        return (
          <div className="item-wrapper">
            <div className="item-content">
              <div className="icon-wrapper profit-icon">
                <FiTrendingUp className="item-icon" />
              </div>
              <div className="info-wrapper">
                <div className="name">{formatPrice(profit, record.currency)}</div>
                <div className="meta">{margin}% margin</div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: 'right',
      render: (_, record) => {
        const items = [
          {
            key: 'edit',
            icon: <FiEdit2 style={{ fontSize: '16px' }} />,
            label: 'Edit',
            onClick: () => {
              handleEdit(record);
            }
          },
          {
            key: 'delete',
            icon: <FiTrash2 style={{ fontSize: '16px', color: '#ff4d4f' }} />,
            label: 'Delete',
            danger: true,
            onClick: () => {
              handleDelete(record.id);
            }
          }
        ];

        return (
          <Dropdown
            menu={{ items }}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="action-dropdown"
          >
            <Button
              type="text"
              icon={<FiMoreVertical size={16} />}
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </Dropdown>
        );
      }
    },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update pagination configuration to use server-side pagination
  const paginationConfig = {
    ...pagination,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `Total ${total} items`,
    pageSizeOptions: isMobile ? ["5", "10", "15", "20", "25"] : ["10", "20", "50", "100"],
    locale: {
      items_per_page: isMobile ? "" : "/ page",
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  // Filter products based on search text and category
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const searchLower = searchText.toLowerCase();
      const name = product?.name?.toLowerCase() || "";
      const category = categoryMap[product?.category]?.toLowerCase() || "";
      const sku = product?.sku?.toLowerCase() || "";
      const description = product?.description?.toLowerCase() || "";

      const matchesSearch =
        name.includes(searchLower) ||
        category.includes(searchLower) ||
        sku.includes(searchLower) ||
        description.includes(searchLower);

      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchText, categoryMap, selectedCategory]);

  return (
    <div className="product-list-container">
      {selectedRowKeys.length > 0 && (
        <div className="bulk-actions">
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
        dataSource={filteredProducts}
        rowKey="id"
        scroll={{ x: 1000, y: '' }}
        // className="custom-table"
        pagination={paginationConfig}
        onChange={onChange}
        loading={isLoading}    
        onRow={(record) => ({
          onClick: (e) => handleRowClick(record, e),
          style: { cursor: 'pointer' }
        })}
      />

      <EditProduct
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedProduct(null);
        }}
        initialValues={selectedProduct}
        currenciesData={currenciesData}
      />
    </div>
  );
};

export default ProductList;
