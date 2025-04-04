import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Tooltip,
  Typography,
  Modal,
  message,
  Input,
  Space,
} from "antd";
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
  FiSearch,
  FiPlus,
  FiDownload,
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

const { Text } = Typography;
const { Search } = Input;

const ProductList = ({ onEdit, onView, searchText = "", currenciesData }) => {
  const { data: productsData = [], isLoading } = useGetProductsQuery();
  const products = productsData.data;
  const [deleteProduct] = useDeleteProductMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  const currentUser = useSelector(selectCurrentUser);
  const { data: categoriesData } = useGetCategoriesQuery(currentUser?.id);
  const categories = categoriesData?.data?.filter(item => item.lableType === "category") || [];

  // Function to get currency details
  const getCurrencyDetails = (currencyId) => {
    if (!currenciesData) return { currencyIcon: "₹", currencyCode: "INR" };
    const currency = currenciesData.find(c => c.id === currencyId);
    return currency || { currencyIcon: "₹", currencyCode: "INR" }; // Default to INR if not found
  };

  // Function to format price with currency
  const formatPrice = (amount, currencyId) => {
    const { currencyIcon } = getCurrencyDetails(currencyId);
    return `${currencyIcon} ${amount?.toLocaleString() || 0}`;
  };

  const filteredProducts = React.useMemo(() => {
    return products?.filter((product) => {
      const searchLower = searchValue.toLowerCase();
      const name = product?.name?.toLowerCase() || "";
      const category = product?.category?.toLowerCase() || "";
      const sku = product?.sku?.toLowerCase() || "";
      const description = product?.description?.toLowerCase() || "";

      return (
        !searchValue ||
        name.includes(searchLower) ||
        category.includes(searchLower) ||
        sku.includes(searchLower) ||
        description.includes(searchLower)
      );
    });
  }, [products, searchValue]);

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure you want to delete this product?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: {
        padding: '20px',
      },
      onOk: async () => {
        try {
          await deleteProduct(id).unwrap();
          message.success('Product deleted successfully');
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete product');
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedProduct(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedProduct(null);
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: 'view',
        icon: <FiEye />,
        label: 'View Details',
        onClick: () => onView(record),
      },
      {
        key: 'edit',
        icon: <FiEdit2 />,
        label: 'Edit',
        onClick: () => handleEdit(record),
      },
      {
        key: 'delete',
        icon: <FiTrash2 />,
        label: 'Delete',
        onClick: () => handleDelete(record.id),
        danger: true,
      },
    ],
  });

  const columns = [
    {
      title: "Product Details",
      dataIndex: "name",
      key: "name",
      width: '25%',
      sorter: (a, b) => (a?.name || "").localeCompare(b?.name || ""),
      render: (name, record) => (
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          {record.image && (
            <img 
              src={record.image} 
              alt={name} 
              style={{ 
                width: "40px", 
                height: "40px", 
                objectFit: "cover", 
                borderRadius: "4px" 
              }} 
            />
          )}
          <div>
            <Text strong style={{ display: "block", fontSize: "14px" }}>{name}</Text>
            {record.sku && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                SKU: {record.sku}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Stock Info",
      key: "stock",
      width: '20%',
      sorter: (a, b) => a.stock_quantity - b.stock_quantity,  
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: "4px" }}>
            <Tag color={
              record.stock_status === 'in_stock' ? 'success' :
              record.stock_status === 'low_stock' ? 'warning' : 'error'
            }>
              {record.stock_status === 'in_stock' ? 'In Stock' :
               record.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
            </Tag>
          </div>
          <Text type="secondary" style={{ fontSize: "12px", display: "block" }}>
            <FiPackage style={{ marginRight: "4px" }} />
            Quantity: {record.stock_quantity}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Min: {record.min_stock_level} | Max: {record.max_stock_level || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: "Pricing",
      key: "pricing",
      width: '20%',
      sorter: (a, b) => a.selling_price - b.selling_price,
      render: (_, record) => (
        <div>
          <Text strong style={{ display: "block", color: "#52c41a" }}>
            <FiDollarSign style={{ marginRight: "4px" }} />
            Selling: {formatPrice(record.selling_price, record.currency)}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px", display: "block" }}>
            Buying: {formatPrice(record.buying_price, record.currency)}
          </Text>
          {record.tax && (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Tax: {record.tax}%
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Profit Metrics",
      key: "profit",
      width: '20%',
      sorter: (a, b) => a.profit_margin - b.profit_margin,
      render: (_, record) => {
        const profit_margin = record.selling_price - record.buying_price;
        const profit_percentage = record.buying_price > 0 ? ((profit_margin / record.buying_price) * 100).toFixed(2) : 0;
        
        return (
          <div>
            <Text strong style={{ display: "block", color: "#1890ff" }}>
              <FiTrendingUp style={{ marginRight: "4px" }} />
              Margin: {formatPrice(profit_margin, record.currency)}
            </Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              <FiPercent style={{ marginRight: "4px" }} />
              {profit_percentage}%
            </Text>
          </div>
        );
      },
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: '15%',
      sorter: (a, b) => {
        const categoryA = categories.find(c => c.id === a.category)?.name || "";
        const categoryB = categories.find(c => c.id === b.category)?.name || "";
        return categoryA.localeCompare(categoryB);
      },
      render: (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return (
          <Tag
            color={category?.color || "blue"}
            style={{
              borderRadius: "4px",
              padding: "2px 8px",
              fontSize: "13px",
              textTransform: "capitalize"
            }}
          >
            {category?.name || "Uncategorized"}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "actions",
      width: '5%',
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={getDropdownItems(record)}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="product-actions-dropdown"
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-dropdown-button"
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <div className="product-list">
        <Table
          columns={columns}
          dataSource={filteredProducts}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} products`,
          }}
          className="product-table"
          scroll={{ x: true }}
        />
      </div>

      <EditProduct
        open={editModalVisible}
        onCancel={handleEditModalClose}
        initialValues={selectedProduct}
      />
    </>
  );
};

export default ProductList;
