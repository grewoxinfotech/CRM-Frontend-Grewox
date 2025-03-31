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
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
  FiBox,
  FiTag,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "./services/productApi";
import EditProduct from "./EditProduct";

const { Text } = Typography;

const ProductList = ({ onEdit, onView, searchText = "" }) => {
  const { data: productsData = [], isLoading } = useGetProductsQuery();
  const products = productsData.data;
  const [deleteProduct] = useDeleteProductMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = React.useMemo(() => {
    return products?.filter((product) => {
      const searchLower = searchText.toLowerCase();
      const name = product?.name?.toLowerCase() || "";
      const category = product?.category?.toLowerCase() || "";
      const price = product?.price?.toString().toLowerCase() || "";
      const sku = product?.sku?.toLowerCase() || "";
      const description = product?.description?.toLowerCase() || "";

      return (
        !searchText ||
        name.includes(searchLower) ||
        category.includes(searchLower) ||
        price.includes(searchLower) ||
        sku.includes(searchLower) ||
        description.includes(searchLower)
      );
    });
  }, [products, searchText]);

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
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => (a?.name || "").localeCompare(b?.name || ""),
      render: (name) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#1890ff",
            fontWeight: 500,
          }}
        >
          <FiBox style={{ color: "#1890ff", fontSize: "16px" }} />
          <Text strong>{name}</Text>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => (a?.category || "").localeCompare(b?.category || ""),
      render: (category) => (
        <Tag
          color="blue"
          style={{
            borderRadius: "4px",
            padding: "2px 8px",
            fontSize: "13px",
          }}
        >
          {category}
        </Tag>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#1890ff",
            fontWeight: 500,
          }}
        >
          {/* <FiDollarSign style={{ color: "#1890ff", fontSize: "16px" }} /> */}
          <Text strong>
            $
            {typeof price === "number"
              ? price.toFixed(2)
              : Number(price).toFixed(2) || "0.00"}
          </Text>
        </div>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#595959",
          }}
        >
          <FiTag style={{ color: "#1890ff", fontSize: "16px" }} />
          <Text>{sku}</Text>
        </div>
      ),
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
      sorter: (a, b) =>
        (a?.created_by || "").localeCompare(b?.created_by || ""),
      render: (created_by) => (
        <Text style={{ color: "#262626" }}>{created_by}</Text>
      ),
    },
    {
      title: "Action",
      key: "actions",
      width: 80,
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
            defaultPageSize: 10,
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
